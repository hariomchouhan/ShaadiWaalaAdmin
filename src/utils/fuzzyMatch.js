export const fuzzyMatch = (value, options) => {
  if (!value) return '';
  const lowerVal = value.toLowerCase();
  const exact = options.find((o) => o.toLowerCase() === lowerVal);
  if (exact) return exact;
  const partial = options.find((o) => lowerVal.includes(o.toLowerCase()));
  return partial || '';
};
