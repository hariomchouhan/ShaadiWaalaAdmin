import { HEIGHTS, WEIGHTS } from '../constants/options';
import { getAgeNumber } from './dateUtils';

export function parseWeightKg(value) {
  if (value == null || value === '') return null;
  const n = parseInt(String(value).replace(/\D/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}

export const DEFAULT_MEMBER_FILTERS = {
  nameOrRefId: '',
  parentName: '',
  parentPhone: '',
  lookingFor: '',
  state: '',
  nri: '',
  maritalStatus: [],
  minAge: '',
  maxAge: '',
  minHeight: '',
  maxHeight: '',
  minWeight: '',
  maxWeight: '',
  complexion: [],
  eating: [],
  plans: [],
  education: [],
  occupation: [],
  religion: '',
};

function includesText(value, term) {
  if (!term) return true;
  return String(value ?? '').toLowerCase().includes(term.toLowerCase());
}

function normalizePhone(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function heightIndex(h) {
  if (!h) return -1;
  return HEIGHTS.indexOf(h);
}

function matchesMultiSelect(selected, value) {
  if (!selected?.length) return true;
  return selected.includes(value);
}

export function applyMemberFilters(profiles, filters) {
  if (!filters || !hasActiveMemberFilters(filters)) return profiles;

  const phoneTerm = normalizePhone(filters.parentPhone);

  return profiles.filter((p) => {
    if (filters.nameOrRefId) {
      const term = filters.nameOrRefId.toLowerCase();
      const nameMatch = includesText(p.fullName, term);
      const refMatch = String(p.refId ?? '').includes(term);
      if (!nameMatch && !refMatch) return false;
    }

    if (filters.parentName) {
      const term = filters.parentName.toLowerCase();
      if (!includesText(p.fatherName, term) && !includesText(p.motherName, term)) return false;
    }

    if (phoneTerm) {
      const phones = [p.fatherMobile, p.motherMobile, p.phone].map(normalizePhone).join('');
      if (!phones.includes(phoneTerm)) return false;
    }

    if (filters.lookingFor && p.gender !== filters.lookingFor) return false;
    if (filters.state && p.state !== filters.state) return false;
    if (filters.nri && p.nri !== filters.nri) return false;
    if (filters.religion && p.community !== filters.religion) return false;

    if (filters.maritalStatus.length) {
      const status = p.maritalStatus || 'Unmarried';
      if (!filters.maritalStatus.includes(status)) return false;
    }

    const age = getAgeNumber(p.dob);
    if (filters.minAge && (age === null || age < parseInt(filters.minAge, 10))) return false;
    if (filters.maxAge && (age === null || age > parseInt(filters.maxAge, 10))) return false;

    if (filters.minHeight || filters.maxHeight) {
      const idx = heightIndex(p.height);
      if (idx === -1) return false;
      const minIdx = filters.minHeight ? heightIndex(filters.minHeight) : 0;
      const maxIdx = filters.maxHeight ? heightIndex(filters.maxHeight) : HEIGHTS.length - 1;
      if (idx < minIdx || idx > maxIdx) return false;
    }

    const weightKg = parseWeightKg(p.weight);
    if (filters.minWeight || filters.maxWeight) {
      if (weightKg === null) return false;
      const minW = filters.minWeight ? parseWeightKg(filters.minWeight) : 0;
      const maxW = filters.maxWeight ? parseWeightKg(filters.maxWeight) : 999;
      if (weightKg < minW || weightKg > maxW) return false;
    }

    if (!matchesMultiSelect(filters.complexion, p.complexion)) return false;
    if (!matchesMultiSelect(filters.eating, p.eating)) return false;
    if (!matchesMultiSelect(filters.plans, p.planName)) return false;

    if (filters.education.length) {
      const level = p.educationLevel || '';
      const details = p.educationDetails || '';
      const eduMatch = filters.education.some(
        (e) => level === e || details.toLowerCase().includes(e.toLowerCase())
      );
      if (!eduMatch) return false;
    }

    if (filters.occupation.length) {
      const occ = p.occupation || '';
      const occDetails = p.occupationDetails || '';
      const occMatch = filters.occupation.some(
        (o) => occ === o || occDetails.toLowerCase().includes(o.toLowerCase())
      );
      if (!occMatch) return false;
    }

    return true;
  });
}

export function hasActiveMemberFilters(filters) {
  if (!filters) return false;
  return Boolean(
    filters.nameOrRefId ||
    filters.parentName ||
    filters.parentPhone ||
    filters.lookingFor ||
    filters.state ||
    filters.nri ||
    filters.religion ||
    filters.minAge ||
    filters.maxAge ||
    filters.minHeight ||
    filters.maxHeight ||
    filters.minWeight ||
    filters.maxWeight ||
    filters.maritalStatus?.length ||
    filters.complexion?.length ||
    filters.eating?.length ||
    filters.plans?.length ||
    filters.education?.length ||
    filters.occupation?.length
  );
}

export function getMemberFilterSummary(filters) {
  if (!filters) return '';
  const parts = [];
  if (filters.nameOrRefId) parts.push(`Name/ID: ${filters.nameOrRefId}`);
  if (filters.lookingFor) parts.push(filters.lookingFor === 'Male' ? 'Groom' : 'Bride');
  if (filters.religion) parts.push(filters.religion);
  if (filters.state) parts.push(filters.state);
  if (filters.nri) parts.push(filters.nri === 'Yes' ? 'NRI' : 'Indian');
  if (filters.minAge || filters.maxAge) parts.push(`Age ${filters.minAge || '?'}-${filters.maxAge || '?'}`);
  if (filters.minWeight || filters.maxWeight) parts.push(`Weight ${filters.minWeight || '?'}-${filters.maxWeight || '?'}`);
  const multiCount =
    (filters.maritalStatus?.length || 0) +
    (filters.complexion?.length || 0) +
    (filters.eating?.length || 0) +
    (filters.plans?.length || 0) +
    (filters.education?.length || 0) +
    (filters.occupation?.length || 0);
  if (multiCount) parts.push(`${multiCount} more`);
  return parts.slice(0, 4).join(' · ');
}
