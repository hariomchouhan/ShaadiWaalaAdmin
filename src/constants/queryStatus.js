export const QUERIES_PAGE_SIZE = 20;

export const QUERY_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'reject', label: 'Reject' },
  { value: 'approve', label: 'Approve' },
  { value: 'insystem', label: 'In System' },
];

export const QUERY_STATUS_LABELS = Object.fromEntries(
  QUERY_STATUSES.map(({ value, label }) => [value, label])
);

const STATUS_ALIASES = {
  new: 'new',
  'in progress': 'in-progress',
  'in-progress': 'in-progress',
  inprogress: 'in-progress',
  'follow-up': 'follow-up',
  'follow up': 'follow-up',
  followup: 'follow-up',
  reject: 'reject',
  rejected: 'reject',
  approve: 'approve',
  approved: 'approve',
  'in system': 'insystem',
  'in-system': 'insystem',
  insystem: 'insystem',
};

export function normalizeQueryStatus(status) {
  if (!status) return 'new';
  const key = String(status).toLowerCase().trim();
  if (STATUS_ALIASES[key]) return STATUS_ALIASES[key];
  const found = QUERY_STATUSES.find((s) => s.value === key);
  return found ? found.value : key;
}
