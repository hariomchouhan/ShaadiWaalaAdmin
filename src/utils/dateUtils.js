export const getAge = (dateString) => {
  if (!dateString) return '';
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
  return isNaN(age) ? '' : `${age} yrs`;
};

export const getAgeNumber = (dateString) => {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return isNaN(age) ? null : age;
};

export const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  const strictMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (strictMatch) return dateStr;
  const parts = dateStr.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (parts) {
    const d = parts[1].padStart(2, '0');
    const m = parts[2].padStart(2, '0');
    const y = parts[3];
    return `${y}-${m}-${d}`;
  }
  return '';
};

export const normalizeTime = (timeStr) => {
  if (!timeStr) return '';
  const lower = timeStr.toLowerCase();
  let [h, m] = lower.replace(/[a-z\s]/gi, '').split(/[:.]/);
  if (!h || !m) return '';
  let hour = parseInt(h, 10);
  const min = parseInt(m, 10);
  if (lower.includes('p') && hour < 12) hour += 12;
  if (lower.includes('a') && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
};

export const formatDate = (s) =>
  s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';

export const formatDateTime = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
