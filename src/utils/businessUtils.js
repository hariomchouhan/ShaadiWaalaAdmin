export function normalizeBusinesses(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      name: String(item?.name ?? '').trim(),
      description: String(item?.description ?? '').trim(),
    }))
    .filter((item) => item.name || item.description);
}

export function cleanBusinessesForSave(value) {
  return normalizeBusinesses(value);
}

export function formatBusinessesForDisplay(businesses) {
  const list = normalizeBusinesses(businesses);
  if (!list.length) return '';
  return list
    .map((b, i) => {
      const parts = [b.name, b.description].filter(Boolean);
      return parts.length ? `${i + 1}. ${parts.join(' — ')}` : '';
    })
    .filter(Boolean)
    .join('\n');
}
