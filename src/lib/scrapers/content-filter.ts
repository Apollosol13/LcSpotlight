const BLOCKED_KEYWORDS = [
  "murder", "homicide", "killed", "killing", "fatal", "fatally",
  "shooting", "shot dead", "gunshot", "stabbing", "stabbed",
  "assault", "assaulted", "rape", "sexual assault",
  "suicide", "overdose", "drug bust",
  "arrest", "arrested", "charged with", "sentenced", "indicted",
  "manslaughter", "arson", "robbery", "burglary",
  "death toll", "dead body", "body found", "remains found",
  "obituary", "obituaries", "funeral",
  "accident", "crash", "wreck", "collision",
  "missing person", "amber alert",
  "abuse", "domestic violence",
  "fraud", "embezzlement", "theft",
  "inmate", "prison", "jail",
  "victim", "suspect", "perpetrator",
  "police chase", "standoff", "swat",
  "fire department", "structure fire", "house fire",
  "drowning", "drowned",
];

const BLOCKED_CATEGORIES = [
  "crime", "police", "courts", "obituaries", "obituary",
  "public safety", "police blotter", "arrests",
  "crime & public safety", "breaking news",
];

export function isContentClean(title: string, description: string, categories: string[]): boolean {
  const text = `${title} ${description}`.toLowerCase();

  for (const keyword of BLOCKED_KEYWORDS) {
    if (text.includes(keyword)) return false;
  }

  for (const cat of categories) {
    const lower = cat.toLowerCase().trim();
    if (BLOCKED_CATEGORIES.some((bc) => lower.includes(bc))) return false;
  }

  return true;
}
