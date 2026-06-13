export const DEFAULT_REPORT_FILTERS = {
  startYear: '',
  endYear: '',
  exclusiveRange: true,
  nriFilter: 'No',
  isMasterList: false,
  splitGender: false,
  printLayout: 'landscape',
  showBlankRows: true,
  blankRowCount: 5,
};

export function buildReportData(profiles, filters) {
  const {
    startYear, endYear, exclusiveRange, nriFilter,
    isMasterList, splitGender,
  } = filters;

  if (!isMasterList && (!startYear || !endYear)) {
    return { filteredReport: [], groupedReports: {} };
  }

  const s = parseInt(startYear, 10);
  const e = parseInt(endYear, 10);

  let filteredReport = profiles.filter((p) => {
    if (nriFilter === 'Yes' && p.nri !== 'Yes') return false;
    if (nriFilter === 'No' && p.nri === 'Yes') return false;
    if (isMasterList) return true;
    if (!p.dob) return false;
    const year = new Date(p.dob).getFullYear();
    if (exclusiveRange) return year >= s && year < e;
    return year >= s && year <= e;
  });

  if (isMasterList) {
    filteredReport.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
  } else {
    filteredReport.sort((a, b) => {
      const cA = a.community || 'Z';
      const cB = b.community || 'Z';
      if (cA !== cB) return cA.localeCompare(cB);
      return (a.gender || 'Z').localeCompare(b.gender || 'Z');
    });
  }

  let groupedReports = {};
  if (isMasterList) {
    if (splitGender) {
      groupedReports = {
        'Boys (Male)': filteredReport.filter((p) => p.gender === 'Male'),
        'Girls (Female)': filteredReport.filter((p) => p.gender === 'Female'),
      };
    } else {
      groupedReports = { 'Master List': filteredReport };
    }
  } else {
    filteredReport.forEach((p) => {
      const caste = p.community || 'Other';
      if (!groupedReports[caste]) groupedReports[caste] = [];
      groupedReports[caste].push(p);
    });
  }

  return { filteredReport, groupedReports };
}

export function getReportFilterSummary(filters) {
  const parts = [];
  parts.push(filters.nriFilter === 'Yes' ? 'NRI Only' : 'Indian');
  if (filters.isMasterList) {
    parts.push('Master List');
    if (filters.splitGender) parts.push('Boys/Girls split');
  } else if (filters.startYear && filters.endYear) {
    parts.push(`${filters.startYear}–${filters.endYear}`);
  }
  parts.push(filters.printLayout === 'portrait' ? 'Portrait' : 'Landscape');
  return parts.join(' · ');
}
