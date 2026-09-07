import { readFileSync } from "fs";
import { execSync } from "child_process";

const src = readFileSync("src/data/playlist.ts", "utf8");
const lines = src.split("\n");

const songs = [];
for (const line of lines) {
  const t = line.trim();
  if (!t.startsWith("song(")) continue;
  const tokens = [...t.matchAll(/"([^"]*)"/g)].map((x) => x[1]);
  if (tokens.length >= 6) {
    songs.push({ id: tokens[0], title: tokens[1], artist: tokens[2], film: tokens[3], ytid: tokens[6] ?? "" });
  }
}

console.log("DEBUG first parsed:", JSON.stringify(songs[0] ?? null));
const missing = songs.filter((s) => !s.ytid);
console.log("Found " + songs.length + " songs, fetching " + missing.length + " missing IDs...\n");

for (const s of missing) {
  const query = (s.title + " " + s.artist + " " + s.film + " full audio").replace(/"/g, "");
  try {
    const out = execSync(
      'python -m yt_dlp "ytsearch1:' + query + '" --print "%(id)s|%(title)s" --skip-download --no-warnings',
      { encoding: "utf8", timeout: 60000 }
    ).trim();
    const sep = out.indexOf("|");
    console.log(s.id.padEnd(24) + ' "' + out.slice(0, sep) + '"   // matched: ' + out.slice(sep + 1));
  } catch {
    console.log(s.id.padEnd(24) + " FAILED - search this one manually");
  }
}

console.log("\nPaste each ID as the LAST argument of its song(...) line in playlist.ts.");