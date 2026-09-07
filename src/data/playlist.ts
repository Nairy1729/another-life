export type ChapterId =
  | "before-we-met"
  | "when-we-were-us"
  | "when-you-left"
  | "somewhere-else";

export interface SongVisual {
  warmth: number;
  particleDensity: number;
  motion: number;
  glow: number;
  colorShift: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumOrFilm: string;
  youtubeId: string; // "" = not yet filled — player will skip it
  chapter: ChapterId;
  mood: string;
  visual: SongVisual;
}

export const CHAPTERS: { id: ChapterId; numeral: string; title: string }[] = [
  { id: "before-we-met",   numeral: "I",   title: "BEFORE WE MET" },
  { id: "when-we-were-us", numeral: "II",  title: "WHEN WE WERE US" },
  { id: "when-you-left",   numeral: "III", title: "WHEN YOU LEFT" },
  { id: "somewhere-else",  numeral: "IV",  title: "SOMEWHERE ELSE" },
];

/* chapter mood baselines — individual songs get deterministic variation */
const CHAPTER_VISUAL: Record<ChapterId, SongVisual> = {
  "before-we-met":   { warmth: 0.34, particleDensity: 0.5,  motion: 0.4,  glow: 0.42, colorShift: 0.12 },
  "when-we-were-us": { warmth: 0.74, particleDensity: 0.55, motion: 0.3,  glow: 0.68, colorShift: 0.28 },
  "when-you-left":   { warmth: 0.2,  particleDensity: 0.32, motion: 0.16, glow: 0.32, colorShift: 0.44 },
  "somewhere-else":  { warmth: 0.55, particleDensity: 0.52, motion: 0.4,  glow: 0.55, colorShift: 0.65 },
};

/* one-line song factory — visuals derived from chapter + a stable per-song variation */
function song(
  id: string, title: string, artist: string, albumOrFilm: string,
  chapter: ChapterId, mood: string, youtubeId = ""
): Song {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  const v = (h / 1000 - 0.5) * 0.14; // ±0.07 deterministic drift
  const base = CHAPTER_VISUAL[chapter];
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  return {
    id, title, artist, albumOrFilm, youtubeId, chapter, mood,
    visual: {
      warmth: clamp(base.warmth + v),
      particleDensity: clamp(base.particleDensity + v * 0.5),
      motion: clamp(base.motion + v * 0.7),
      glow: clamp(base.glow + v),
      colorShift: clamp(base.colorShift + v * 0.5),
    },
  };
}

/* ─────────────────────────────────────────────────────────────
   50 SONGS — paste each YouTube ID as the last argument.
   Empty ID = song shows in the list but auto-skips on play.
   Test every ID first at:  youtube.com/embed/<ID>
   ───────────────────────────────────────────────────────────── */
export const PLAYLIST: Song[] = [

  /* I — BEFORE WE MET · wondering, searching, restless */
  song("iktara", "Iktara", "Kavita Seth", "Wake Up Sid", "before-we-met", "wondering", "fSS_R91Nimw"),
  song("khaabon-ke-parinday", "Khaabon Ke Parinday", "Mohit Chauhan", "Zindagi Na Milegi Dobara", "before-we-met", "drifting", "R0XjwtP_iTY"),
  song("ilahi", "Ilahi", "Arijit Singh", "Yeh Jawaani Hai Deewani", "before-we-met", "searching", "AicKz1ISNjU"),
  song("safarnama", "Safarnama", "Lucky Ali", "Tamasha", "before-we-met", "wandering", "sOhESxhibAM"),
  song("phir-se-ud-chala", "Phir Se Ud Chala", "Mohit Chauhan", "Rockstar", "before-we-met", "untethered", "-3gQ6HIkRys"),
  song("yeh-honsla", "Yeh Honsla", "Shafqat Amanat Ali", "Dor", "before-we-met", "quiet hope", "d8me1GXijJA"),
  song("o-re-piya", "O Re Piya", "Rahat Fateh Ali Khan", "Aaja Nachle", "before-we-met", "yearning", "iv7lcUkFVSc"),
  song("kahin-to-hogi", "Kahin To Hogi Woh", "Rashid Ali, Vasundhara Das", "Jaane Tu... Ya Jaane Na", "before-we-met", "someone, somewhere", "QGinK1vaK5M"),
  song("kya-mujhe-pyaar-hai", "Kya Mujhe Pyaar Hai", "KK", "Woh Lamhe", "before-we-met", "wondering", "Gg6NMU4ivXM"),
  song("aankhon-mein-teri", "Aankhon Mein Teri", "KK", "Om Shanti Om", "before-we-met", "glimpse", "7KKVb0_IdD4"),
  song("khuda-jaane", "Khuda Jaane", "KK, Shilpa Rao", "Bachna Ae Haseeno", "before-we-met", "almost knowing", "5e25BAAjoY4"),

  /* II — WHEN WE WERE US · warmth, closeness, gravity */
  song("agar-tum-saath-ho", "Agar Tum Saath Ho", "Alka Yagnik, Arijit Singh", "Tamasha", "when-we-were-us", "longing", "sK7riqg2mr4"),
  song("raabta", "Raabta", "Arijit Singh", "Agent Vinod", "when-we-were-us", "gravity", "zlt38OOqwDc"),
  song("tum-se-hi", "Tum Se Hi", "Mohit Chauhan", "Jab We Met", "when-we-were-us", "everywhere you", "Cb6wuzOurPc"),
  song("tum-hi-ho", "Tum Hi Ho", "Arijit Singh", "Aashiqui 2", "when-we-were-us", "devotion", "Umqb9KENgmk"),
  song("pee-loon", "Pee Loon", "Mohit Chauhan", "Once Upon a Time in Mumbaai", "when-we-were-us", "intoxication", "Nbr_KJT0TIc"),
  song("saibo", "Saibo", "Shreya Ghoshal, Tochi Raina", "Shor in the City", "when-we-were-us", "tenderness", "9Bmh6vaQt0s"),
  song("tu-hi-meri-shab", "Tu Hi Meri Shab Hai", "KK", "Gangster", "when-we-were-us", "you are my night", "cGNcjqXe87U"),
  song("bheegi-bheegi", "Bheegi Bheegi", "James", "Gangster", "when-we-were-us", "rain", "_RZwGzElnIs"),
  song("zara-zara", "Zara Zara", "Bombay Jayashri", "Rehnaa Hai Terre Dil Mein", "when-we-were-us", "wanting", "RkWHSzK4SUw"),
  song("chupke-se", "Chupke Se", "Sadhana Sargam", "Saathiya", "when-we-were-us", "secretly", "zKnbBXdanGc"),
  song("hasi", "Hasi", "Ami Mishra", "Hamari Adhuri Kahani", "when-we-were-us", "your smile", "-Xqw2SIJF2E"),
  song("janam-janam", "Janam Janam", "Arijit Singh", "Dilwale", "when-we-were-us", "every lifetime", "pIBoAh4OXhQ"),
  song("aaj-din-chadheya", "Aaj Din Chadheya", "Rahat Fateh Ali Khan", "Love Aaj Kal", "when-we-were-us", "prayer", "ehqN6oTpmb8"),

  /* III — WHEN YOU LEFT · ache, absence, the unsaid */
  song("channa-mereya", "Channa Mereya", "Arijit Singh", "Ae Dil Hai Mushkil", "when-you-left", "ache", "bzSTpdcs-EI"),
  song("tune-jo-na-kaha", "Tune Jo Na Kaha", "Mohit Chauhan", "New York", "when-you-left", "unsaid", "dTu5dTEzVM4"),
  song("judaai", "Judaai", "Rekha Bhardwaj, Arijit Singh", "Badlapur", "when-you-left", "separation", "t2VaF0ZX65w"),
  song("hamdard", "Hamdard", "Arijit Singh", "Ek Villain", "when-you-left", "wound", "7tElHNHLSKY"),
  song("bhula-dena", "Bhula Dena", "Mustafa Zahid", "Aashiqui 2", "when-you-left", "forget me", "s0ksvPulHt8"),
  song("sun-raha-hai", "Sun Raha Hai", "Ankit Tiwari", "Aashiqui 2", "when-you-left", "are you listening", "z3UHfi9vpbc"),
  song("woh-lamhe", "Woh Lamhe", "Atif Aslam", "Zeher", "when-you-left", "those moments", "1DBhic8SSKs"),
  song("aadat", "Aadat", "Atif Aslam", "Kalyug", "when-you-left", "habit of you", "tjsckg5t1k8"),
  song("kal-ho-naa-ho", "Kal Ho Naa Ho", "Sonu Nigam", "Kal Ho Naa Ho", "when-you-left", "borrowed time", "oq5Ocx_rEv8"),
  song("abhi-mujh-mein-kahin", "Abhi Mujh Mein Kahin", "Sonu Nigam", "Agneepath", "when-you-left", "what remains", "usSA3mPzOJY"),
  song("tujhe-bhula-diya", "Tujhe Bhula Diya", "Mohit Chauhan", "Anjaana Anjaani", "when-you-left", "tried to forget", "Gh5wHtqW9Ek"),
  song("phir-mohabbat", "Phir Mohabbat", "Arijit Singh, Mohd. Irfan, Saim Bhat", "Murder 2", "when-you-left", "again, foolishly", "BOo2jy21jTU"),
  song("bekhayali", "Bekhayali", "Sachet Tandon", "Kabir Singh", "when-you-left", "obsession", "HTQ2pSM49dc"),

  /* IV — SOMEWHERE ELSE · acceptance, distance, restrained hope */
  song("kabira", "Kabira", "Tochi Raina, Rekha Bhardwaj", "Yeh Jawaani Hai Deewani", "somewhere-else", "acceptance", "jHNNMj5bNQw"),
  song("aaoge-jab-tum", "Aaoge Jab Tum", "Rashid Khan", "Jab We Met", "somewhere-else", "hope", "CNZMIhckaA0"),
  song("kun-faya-kun", "Kun Faya Kun", "A.R. Rahman, Javed Ali, Mohit Chauhan", "Rockstar", "somewhere-else", "surrender", "T94PHkuydcw"),
  song("nadaan-parindey", "Nadaan Parindey", "A.R. Rahman, Mohit Chauhan", "Rockstar", "somewhere-else", "come home", "6MgsHSAcI9k"),
  song("tum-ho", "Tum Ho", "Mohit Chauhan", "Rockstar", "somewhere-else", "you exist, that's enough", "gkCKTuR-ECI"),
  song("shayad", "Shayad", "Arijit Singh", "Love Aaj Kal", "somewhere-else", "maybe", "9-LH8ABADdo"),
  song("tere-bin", "Tere Bin", "Atif Aslam", "Bas Ek Pal", "somewhere-else", "without you", "c6BuSdEE3kU"),
  song("jag-ghoomeya", "Jag Ghoomeya", "Rahat Fateh Ali Khan", "Sultan", "somewhere-else", "searched the world", "t10sQb0Zmjs"),
  song("khairiyat", "Khairiyat", "Arijit Singh", "Chhichhore", "somewhere-else", "are you well", "ugcfBQ_AUYg"),
  song("muskurane", "Muskurane", "Arijit Singh", "CityLights", "somewhere-else", "reasons to smile", "YHRJZPnw5YM"),
  song("humnava", "Humnava", "Papon", "Hamari Adhuri Kahani", "somewhere-else", "companion", "pP12RCC6Nss"),
  song("kalank", "Kalank (Title Track)", "Arijit Singh", "Kalank", "somewhere-else", "beautiful ruin", "Grr0FlC8SQA"),
  song("ae-dil-hai-mushkil", "Ae Dil Hai Mushkil", "Arijit Singh", "Ae Dil Hai Mushkil", "somewhere-else", "the heart persists", "6FURuLYrR_Q"),
];