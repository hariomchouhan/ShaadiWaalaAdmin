const SKIP_KEYS = new Set(['id', 'avatar', 'gallery', 'createdAt', 'updatedAt']);

function flattenValue(value) {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return Object.values(item).map(flattenValue).filter(Boolean).join(' ');
        }
        return flattenValue(item);
      })
      .filter(Boolean)
      .join(' ');
  }
  const str = String(value).trim();
  if (!str) return '';
  if (str.startsWith('data:image')) return '';
  if (str.startsWith('http') && str.length > 120) return '';
  if (str.length > 800) return str.slice(0, 800);
  return str;
}

export function buildProfileSearchText(profile) {
  return Object.entries(profile)
    .filter(([key]) => !SKIP_KEYS.has(key))
    .map(([, value]) => flattenValue(value))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Match if every typed word appears anywhere in the profile. */
export function profileMatchesSearch(profile, term) {
  const tokens = term.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = buildProfileSearchText(profile);
  return tokens.every((token) => haystack.includes(token));
}
