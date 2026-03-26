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
  "abuse", "domestic violence", "child abuse", "neglect",
  "fraud", "embezzlement", "theft",
  "inmate", "prison", "jail",
  "victim", "suspect", "perpetrator",
  "police chase", "standoff", "swat",
  "fire department", "structure fire", "house fire",
  "drowning", "drowned",
  "skull fracture", "brain bleed", "brain injury",
  "malpractice", "wrongful death",
  "dismember", "mutilat",
  "infant death", "sids",
  "lawsuit", "sued", "suing",
  "dui", "dwi", "impaired driving",
  "gun violence", "firearms charge",
  "trafficking", "carjacking", "kidnap",
  "explosion", "electrocut", "hazmat",
  "tornado damage", "hurricane damage",
  // Political protest / national-movement stories (poor fit for a local community guide)
  "protest", "protests", "protester", "protesters",
  "demonstration", "demonstrations", "demonstrator", "demonstrators",
];

/** Multi-word matches (lowercased text must include the phrase). */
const BLOCKED_PHRASES = [
  "no kings",
  "no king's",
  "civil disobedience",
  "mass protest",
  "planned protest",
  "protests planned",
];

const BLOCKED_CATEGORIES = [
  "crime", "police", "courts", "obituaries", "obituary",
  "public safety", "police blotter", "arrests",
  "crime & public safety", "breaking news",
];

export function isContentClean(title: string, description: string, categories: string[]): boolean {
  const text = `${title} ${description}`.toLowerCase();

  for (const phrase of BLOCKED_PHRASES) {
    if (text.includes(phrase)) return false;
  }

  for (const keyword of BLOCKED_KEYWORDS) {
    if (text.includes(keyword)) return false;
  }

  for (const cat of categories) {
    const lower = cat.toLowerCase().trim();
    if (BLOCKED_CATEGORIES.some((bc) => lower.includes(bc))) return false;
  }

  return true;
}
