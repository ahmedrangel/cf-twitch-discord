export const regionRoutes = {
  lan: "la1", las: "la2", na: "na1",
  euw: "euw1", eune: "eun1", br: "br1",
  kr: "kr", jp: "jp1", oce: "oc1",
  tr: "tr1", ru: "ru", ph: "ph2",
  th: "th2", tw: "tw2", vn: "vn2"
};

export const regionClusters = {
  americas: ["na", "br", "lan", "las"],
  europe: ["euw", "eune", "tr", "ru"],
  asia: ["kr", "jp"],
  sea: ["oce", "ph", "vn", "sg", "th", "tw"]
};

export const tiers = {
  "IRON": { short: "I", full: "Hierro" },
  "BRONZE": { short: "B", full: "Bronce" },
  "SILVER": { short: "S", full: "Plata" },
  "GOLD": { short: "G", full: "Oro" },
  "PLATINUM": { short: "P", full: "Platino" },
  "EMERALD": { short: "E", full: "Esmeralda" },
  "DIAMOND": { short: "D", full: "Diamante" },
  "MASTER": { short: "M", full: "Maestro" },
  "GRANDMASTER": { short: "GM", full: "Gran Maestro" },
  "CHALLENGER": { short: "CH", full: "Retador" },
};

export const specialTiers = [tiers.MASTER.short, tiers.GRANDMASTER.short, tiers.GRANDMASTER.short, "UN"];

export const ranks = {
  "I": "1",
  "II": "2",
  "III": "3",
  "IV": "4"
};

export const queueOptions = {
  "soloq": 420,
  "flex": 440,
  "aram": 450,
  "normal": 400,
  "quickplay": 490
};

export const queueMap = {
  0: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "CUSTOM", full_name: "Custom", short_name: "Custom" },
  420: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "SOLO/DUO-R", full_name: "Solo/Duo", short_name: "SoloQ" },
  440: { profile_rank_type: "RANKED_FLEX_SR", queue_name: "FLEX-R", full_name: "Flexible", short_name: "Flex" },
  450: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "ARAM", full_name: "ARAM", short_name: "ARAM" },
  400: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "NORMAL", full_name: "Normal", short_name: "Normal" },
  430: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "NORMAL", full_name: "Normal", short_name: "Normal" },
  490: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "NORMAL (QUICK)", full_name: "Normal (Quickplay)", short_name: "Normal (Q)" },
  700: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "CLASH", full_name: "Clash", short_name: "Clash" },
  720: { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "ARAM CLASH", full_name: "ARAM Clash", short_name: "ARAM Clash" },
  900: { profile_rank_type: "RANKED_SOLO_5x5", queue: "ARURF", full_name: "All Random URF", short_name: "ARURF" },
  1020: { profile_rank_type: "RANKED_SOLO_5x5", queue: "ONE FOR ALL", full_name: "Uno Para Todos", short_name: "One4All" },
  1300: { profile_rank_type: "RANKED_SOLO_5x5", queue: "FRENESÍ", full_name: "Frenesí en el Nexo", short_name: "Frenesí" },
  1700: { profile_rank_type: "RANKED_SOLO_5x5", queue: "ARENA", full_name: "Arena", short_name: "Arena" }
};

export const eloValues = {
  "IRON IV": 1,
  "IRON III": 2,
  "IRON II": 3,
  "IRON I": 4,
  "BRONZE IV": 5,
  "BRONZE III": 6,
  "BRONZE II": 7,
  "BRONZE I": 8,
  "SILVER IV": 9,
  "SILVER III": 10,
  "SILVER II": 11,
  "SILVER I": 12,
  "GOLD IV": 13,
  "GOLD III": 14,
  "GOLD II": 15,
  "GOLD I": 16,
  "PLATINUM IV": 17,
  "PLATINUM III": 18,
  "PLATINUM II": 19,
  "PLATINUM I": 20,
  "EMERALD IV": 21,
  "EMERALD III": 22,
  "EMERALD II": 23,
  "EMERALD I": 24,
  "DIAMOND IV": 25,
  "DIAMOND III": 26,
  "DIAMOND II": 27,
  "DIAMOND I": 28,
  "MASTER I": 29,
  "GRANDMASTER I": 30,
  "CHALLENGER I": 31
};
