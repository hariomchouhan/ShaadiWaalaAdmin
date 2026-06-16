import {
  DEFAULT_MEMBER_FILTERS,
  applyMemberFilters,
  getMemberFilterSummary,
  hasActiveMemberFilters,
  pickMemberFilters,
} from './memberFilters';

export const DEFAULT_REPORT_FILTERS = {
  ...DEFAULT_MEMBER_FILTERS,
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

  const memberFilters = pickMemberFilters(filters);
  memberFilters.nri = '';
  let filteredReport = applyMemberFilters(profiles, memberFilters);

  const s = parseInt(startYear, 10);
  const e = parseInt(endYear, 10);

  filteredReport = filteredReport.filter((p) => {
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
  const memberSummary = getMemberFilterSummary(pickMemberFilters(filters));
  const reportParts = [];
  reportParts.push(filters.nriFilter === 'Yes' ? 'NRI Only' : 'Indian');
  if (filters.isMasterList) {
    reportParts.push('Master List');
    if (filters.splitGender) reportParts.push('Boys/Girls split');
  } else if (filters.startYear && filters.endYear) {
    reportParts.push(`${filters.startYear}–${filters.endYear}`);
  }
  reportParts.push(filters.printLayout === 'portrait' ? 'Portrait' : 'Landscape');

  const combined = [memberSummary, reportParts.join(' · ')].filter(Boolean);
  return combined.join(' · ');
}

export function hasActiveReportMemberFilters(filters) {
  const memberFilters = pickMemberFilters(filters);
  memberFilters.nri = '';
  return hasActiveMemberFilters(memberFilters);
}
