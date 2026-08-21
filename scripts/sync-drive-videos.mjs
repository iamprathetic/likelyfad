#!/usr/bin/env node
/* ============================================================================
   sync-drive-videos — pull the reel clips out of Google Drive into public/.

   Drive is the SOURCE OF TRUTH; it is never the delivery path. Hot-linking
   drive.google.com from a <video> tag breaks in production: the download URL
   302s through an HTML virus-scan interstitial, per-file daily quotas start
   returning errors once a clip gets traffic, and none of it is edge-cached for
   your visitors. So we fetch once, re-encode small, and let the site serve the
   files from its own CDN like any other static asset.

   USAGE
     npm run sync:videos

   ENV (put these in .env.local — it is gitignored)
     DRIVE_REELS_FOLDER_ID   folder id, or just paste the folder URL
     and ONE of:
       GOOGLE_DRIVE_API_KEY          for a folder shared "anyone with the link"
       GOOGLE_SERVICE_ACCOUNT_JSON   the full service-account JSON, for a
                                     private folder shared with that account

   Run this LOCALLY and commit the result. The output is ~300KB a clip, and
   Vercel's build image has no ffmpeg, so syncing during a deploy would ship
   whatever raw 4K master happens to sit in the folder.
   ========================================================================== */

import { createWriteStream } from "node:fs";
import { mkdir, copyFile, readFile, writeFile, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createSign } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "videos");
const CACHE_FILE = path.join(ROOT, ".drive-sync.json");
const GENERATED = path.join(ROOT, "src", "lib", "reels.generated.ts");

/* Sized for a ~170px-wide tile on a 2x screen. Anything larger is bytes the
   viewer downloads and never sees. No audio track at all — the wall is muted. */
const TARGET_HEIGHT = 640;
const CRF = 30;
const FPS = 24;

/* The wall is a loop of glimpses, not a player — a 10s cut carries the same
   impression as the full minute at a sixth of the bytes, and encodes ~6x
   faster. CLIP_START skips the first beat, where clips often open on a fade.
   Masters shorter than CLIP_START + CLIP_LEN are simply used in full. */
const CLIP_START = 1;
const CLIP_LEN = 10;

const log = (...a) => console.log("[drive]", ...a);
const warn = (...a) => console.warn("[drive] !", ...a);

/* -------------------------------------------------------------- env / auth */

function folderId() {
  const raw = (process.env.DRIVE_REELS_FOLDER_ID || "").trim();
  if (!raw) return null;
  // Accept a pasted folder URL as well as a bare id.
  const m = raw.match(/\/folders\/([\w-]+)/) || raw.match(/[?&]id=([\w-]+)/);
  return m ? m[1] : raw;
}

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/* Mint a short-lived access token from a service-account key. Avoids pulling in
   googleapis (a ~40MB dependency) for what is three lines of RS256. */
async function serviceAccountToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(sa.private_key))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function auth() {
  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (saRaw) {
    const token = await serviceAccountToken(JSON.parse(saRaw));
    log("authenticated as service account");
    return { headers: { Authorization: `Bearer ${token}` }, query: "" };
  }
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  if (key) {
    log("authenticated with API key");
    return { headers: {}, query: `key=${encodeURIComponent(key)}` };
  }
  return null;
}

/* ------------------------------------------------------------------- drive */

/* Drive reports macOS AppleDouble sidecars ("._clip.mp4", a few KB of resource
   fork) as video/mp4, so they arrive in the listing looking like real clips and
   then fail to decode. Anything that small is not a reel either way. */
const JUNK_MIN_BYTES = 512 * 1024;
const isJunk = (f) =>
  path.basename(f.name).startsWith("._") || Number(f.size || 0) < JUNK_MIN_BYTES;

async function listVideos(id, a) {
  const q = `'${id}' in parents and trashed = false and mimeType contains 'video/'`;
  const files = [];
  let pageToken = "";
  do {
    const url =
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}` +
      `&fields=nextPageToken,files(id,name,mimeType,md5Checksum,size,videoMediaMetadata(durationMillis))` +
      `&orderBy=name&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true` +
      (pageToken ? `&pageToken=${pageToken}` : "") +
      (a.query ? `&${a.query}` : "");
    const res = await fetch(url, { headers: a.headers });
    if (!res.ok) throw new Error(`list failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    files.push(...(json.files || []));
    pageToken = json.nextPageToken || "";
  } while (pageToken);

  const junk = files.filter(isJunk);
  if (junk.length) log(`ignoring ${junk.length} sidecar/undersized file(s)`);
  return files.filter((f) => !isJunk(f));
}

/* Raw bytes of a file. alt=media on the API endpoint never serves the HTML
   interstitial that /uc?export does, and it honours Range requests — which is
   what lets ffmpeg read the trim window without pulling the whole master. */
const mediaUrl = (fileId, a) =>
  `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true` +
  (a.query ? `&${a.query}` : "");

/* alt=media on the API endpoint returns raw bytes — unlike the /uc?export path
   it never serves the interstitial HTML page. */
async function download(fileId, dest, a) {
  const url =
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true` +
    (a.query ? `&${a.query}` : "");
  const res = await fetch(url, { headers: a.headers });
  if (!res.ok) throw new Error(`download failed: ${res.status} ${await res.text()}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

/* ------------------------------------------------------------------ encode */

const hasFfmpeg = () => spawnSync("ffmpeg", ["-version"]).status === 0;

function run(args) {
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
  if (r.status !== 0) {
    // Media URLs carry the API key in the query string; never echo it.
    const key = process.env.GOOGLE_DRIVE_API_KEY;
    let err = r.stderr?.toString().slice(-400) || "";
    if (key) err = err.split(key).join("<key>");
    throw new Error(`ffmpeg: ${err}`);
  }
}

/* `src` is a Drive media URL, not a local file. ffmpeg range-requests only the
   bytes the trim window needs, so a 900MB master costs a few MB and a few
   seconds instead of a full download. `auth` supplies the Bearer header when
   running as a service account (the API-key path carries the key in the URL). */
function encode(src, dest, start, auth) {
  const input = [];
  if (/^https?:/i.test(src)) {
    if (auth?.headers?.Authorization) {
      input.push("-headers", `Authorization: ${auth.headers.Authorization}\r\n`);
    }
    // Drive occasionally drops a long-lived connection mid-read.
    input.push("-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "5");
  }
  run([
    // -ss ahead of -i is the fast seek; re-encoding makes it frame-exact anyway.
    "-y", ...input, "-ss", String(start), "-i", src, "-t", String(CLIP_LEN),
    "-vf", `scale=-2:${TARGET_HEIGHT},fps=${FPS}`,
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", String(CRF), "-preset", "slow",
    "-an",                       // the wall is muted; an audio track is dead weight
    "-movflags", "+faststart",   // moov atom first, so playback starts on first bytes
    dest,
  ]);
}

function poster(src, dest) {
  run(["-y", "-ss", "0.4", "-i", src, "-frames:v", "1", "-c:v", "libwebp", "-quality", "72", dest]);
}

/* Only skip the opening beat when the master is provably long enough. Drive
   hands us the duration in the listing, so this costs nothing; when it's
   missing (Drive hasn't finished probing the file) we take the clip from 0. */
function startFor(f) {
  const ms = Number(f.videoMediaMetadata?.durationMillis);
  return Number.isFinite(ms) && ms / 1000 >= CLIP_START + CLIP_LEN ? CLIP_START : 0;
}

/* ------------------------------------------------------------------- utils */

const slug = (name) =>
  path.parse(name).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reel";

const kb = (n) => `${Math.round(n / 1024)}KB`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Drive throttles a burst of media reads with a 403 anti-abuse page rather than
   a clean quota error, so a whole sync can die on one clip. Back off and retry
   instead — the gate is transient. */
async function withRetry(label, fn, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      return fn();
    } catch (err) {
      if (attempt >= tries) throw err;
      const wait = 4000 * 2 ** (attempt - 1);
      warn(`  ${label} failed (attempt ${attempt}/${tries}); retrying in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

const readJson = async (f, fallback) => {
  try {
    return JSON.parse(await readFile(f, "utf8"));
  } catch {
    return fallback;
  }
};

async function writeGenerated(entries) {
  const body = entries
    .map((e) => `  { src: "${e.src}", poster: ${e.poster ? `"${e.poster}"` : "null"} },`)
    .join("\n");
  await writeFile(
    GENERATED,
    `/* AUTO-GENERATED by scripts/sync-drive-videos.mjs — do not edit by hand.\n` +
      `   Run \`npm run sync:videos\` to refresh from the Drive folder. */\n\n` +
      `export type Reel = { src: string; poster: string | null };\n\n` +
      `export const reelVideos: Reel[] = [\n${body}\n];\n`,
    "utf8"
  );
}

/* -------------------------------------------------------------------- main */

async function main() {
  const id = folderId();
  const a = id ? await auth() : null;

  if (!id || !a) {
    warn(
      !id
        ? "DRIVE_REELS_FOLDER_ID is not set."
        : "no credentials — set GOOGLE_DRIVE_API_KEY or GOOGLE_SERVICE_ACCOUNT_JSON."
    );
    warn("nothing synced; keeping the clips already in public/videos.");
    return;
  }

  const ffmpeg = hasFfmpeg();
  if (!ffmpeg) {
    warn("ffmpeg not found — clips will be copied at their original size.");
    warn("install ffmpeg and re-run before committing, or the site ships the masters.");
  }

  await mkdir(OUT_DIR, { recursive: true });
  const cache = await readJson(CACHE_FILE, {});
  const next = {};
  const entries = [];

  const files = await listVideos(id, a);
  if (!files.length) {
    warn("folder has no video files; leaving public/videos untouched.");
    return;
  }
  log(`found ${files.length} clip(s)`);

  const tmp = path.join(OUT_DIR, ".tmp-download");
  const seen = new Set();

  for (const [i, f] of files.entries()) {
    // Stable, collision-free public path.
    let base = slug(f.name);
    while (seen.has(base)) base = `${slug(f.name)}-${i}`;
    seen.add(base);

    const outFile = path.join(OUT_DIR, `${base}.mp4`);
    const posterFile = path.join(OUT_DIR, `${base}.webp`);
    // The trim window is part of the stamp — without it, changing CLIP_START or
    // CLIP_LEN would leave every already-synced clip cached at the old cut.
    const recipe = `${TARGET_HEIGHT}/${CRF}/${FPS}/${CLIP_START}+${CLIP_LEN}`;
    const stamp = `${f.md5Checksum || f.size}:${ffmpeg ? recipe : "raw"}`;

    const fresh =
      cache[f.id]?.stamp === stamp &&
      cache[f.id]?.base === base &&
      (await stat(outFile).catch(() => null));

    if (fresh) {
      log(`· ${f.name} — unchanged`);
    } else if (ffmpeg) {
      // Stream the trim window straight out of Drive. The master never touches
      // disk — only the ~10s we keep crosses the wire.
      const start = startFor(f);
      log(`✂ ${f.name} (${kb(Number(f.size || 0))} master)`);
      await withRetry(f.name, () => encode(mediaUrl(f.id, a), outFile, start, a));
      try {
        poster(outFile, posterFile);
      } catch {
        warn(`  no poster frame for ${f.name}`);
      }
      const { size } = await stat(outFile);
      log(`  → ${base}.mp4 ${kb(size)} (${CLIP_LEN}s from ${start}s)`);
    } else {
      // No ffmpeg: nothing to trim with, so the whole master has to come down.
      log(`↓ ${f.name} (${kb(Number(f.size || 0))})`);
      await download(f.id, tmp, a);
      await copyFile(tmp, outFile);
      await rm(tmp, { force: true });
      const { size } = await stat(outFile);
      log(`  → ${base}.mp4 ${kb(size)} (not re-encoded)`);
    }

    next[f.id] = { stamp, base };
    entries.push({
      src: `/videos/${base}.mp4`,
      poster: (await stat(posterFile).catch(() => null)) ? `/videos/${base}.webp` : null,
    });
  }

  // Drop clips that were synced before but have left the Drive folder. Only
  // ever touches files this script created — anything else in public/videos
  // is left alone.
  for (const [fileId, meta] of Object.entries(cache)) {
    if (next[fileId] || !meta?.base) continue;
    if (files.some((f) => slug(f.name) === meta.base)) continue;
    log(`✗ removing ${meta.base} (gone from Drive)`);
    await rm(path.join(OUT_DIR, `${meta.base}.mp4`), { force: true });
    await rm(path.join(OUT_DIR, `${meta.base}.webp`), { force: true });
    await rm(path.join(OUT_DIR, `${meta.base}.jpg`), { force: true }); // pre-WebP leftovers
  }

  await writeFile(CACHE_FILE, JSON.stringify(next, null, 2), "utf8");
  await writeGenerated(entries);
  log(`wrote ${path.relative(ROOT, GENERATED)} with ${entries.length} clip(s)`);
}

main().catch((err) => {
  console.error("[drive] sync failed:", err.message);
  process.exitCode = 1;
});
