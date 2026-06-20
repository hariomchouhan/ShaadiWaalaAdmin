import { Crown, User, Calendar, Users, Phone, MapPin, ExternalLink, StickyNote } from 'lucide-react';
import {
  RELIGIONS, MARITAL_STATUS, COMPLEXION, HEIGHTS, WEIGHTS, DIET,
  HABIT_YES_NO, YES_NO, RESIDENCE_TYPE, OWN_RESIDENCE_KIND, PLANS, PAYMENT_MODES,
  STATES_INDIA, OCCUPATIONS, EDUCATION_LEVELS,
} from './options';

export const PROFILE_SCHEMA = [
  { key: 'refId', label: 'Ref ID', type: 'number', width: 'w-24', listPriority: 1, required: true, section: 'Core' },
  { key: 'planName', label: 'Plan Name', type: 'select', options: PLANS, width: 'w-1/3', icon: Crown, csvHeader: 'Plan Name', section: 'Subscription & Office' },
  { key: 'advanceReceived', label: 'Advance Received', type: 'text', width: 'w-1/3', csvHeader: 'Advance Received', section: 'Subscription & Office' },
  { key: 'paymentMode', label: 'Payment Mode', type: 'select', options: PAYMENT_MODES, width: 'w-1/3', csvHeader: 'Payment Mode', section: 'Subscription & Office' },
  { key: 'reference', label: 'Reference', type: 'text', width: 'w-full', listPriority: 3, csvHeader: 'Reference', section: 'Subscription & Office' },
  { key: 'nri', label: 'NRI', type: 'select', options: YES_NO, width: 'w-1/6', csvHeader: 'NRI', section: 'Basic Details' },
  { key: 'fullName', label: 'Full Name', type: 'text', required: true, width: 'w-2/6', listPriority: 1, icon: User, csvHeader: 'Name', section: 'Basic Details' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], width: 'w-1/6', listPriority: 2, csvHeader: 'Gender', required: true, section: 'Basic Details' },
  { key: 'maritalStatus', label: 'Marital Status', type: 'select', options: MARITAL_STATUS, width: 'w-2/6', csvHeader: 'Marital Status', section: 'Basic Details' },
  { key: 'dob', label: 'Date of Birth', type: 'date', width: 'w-1/3', listPriority: 2, icon: Calendar, csvHeader: 'DOB', section: 'Basic Details' },
  { key: 'timeOfBirth', label: 'Time of Birth', type: 'time', width: 'w-1/3', csvHeader: 'Time of Birth', section: 'Basic Details' },
  { key: 'placeOfBirth', label: 'Place of Birth', type: 'text', width: 'w-1/3', csvHeader: 'Place of Birth', section: 'Basic Details' },
  { key: 'community', label: 'Religion', type: 'select', options: RELIGIONS, width: 'w-1/2', listPriority: 1, icon: Users, csvHeader: 'Community', section: 'Basic Details' },
  { key: 'height', label: 'Height', type: 'select', options: HEIGHTS, width: 'w-1/4', csvHeader: 'Height', section: 'Physical & Habits' },
  { key: 'weight', label: 'Weight', type: 'select', options: WEIGHTS, width: 'w-1/4', csvHeader: 'Weight', section: 'Physical & Habits' },
  { key: 'complexion', label: 'Complexion', type: 'select', options: COMPLEXION, width: 'w-1/4', csvHeader: 'Complexion', section: 'Physical & Habits' },
  { key: 'disability', label: 'Any Disability', type: 'select', options: YES_NO, width: 'w-1/4', csvHeader: 'Any Disability', section: 'Physical & Habits' },
  { key: 'eating', label: 'Diet', type: 'select', options: DIET, width: 'w-1/4', csvHeader: 'Diet', section: 'Physical & Habits' },
  { key: 'drinking', label: 'Drinking', type: 'select', options: HABIT_YES_NO, width: 'w-1/4', csvHeader: 'Drinking', section: 'Physical & Habits' },
  { key: 'smoking', label: 'Smoking', type: 'select', options: HABIT_YES_NO, width: 'w-1/4', csvHeader: 'Smoking', section: 'Physical & Habits' },
  { key: 'educationLevel', label: 'Higher Education', type: 'select', options: EDUCATION_LEVELS, width: 'w-1/2', csvHeader: 'Higher Education', section: 'Education & Career' },
  { key: 'occupation', label: 'Occupation', type: 'select', options: OCCUPATIONS, width: 'w-1/2', csvHeader: 'Occupation', section: 'Education & Career' },
  { key: 'educationDetails', label: 'Education Details', type: 'text', width: 'w-full', placeholder: 'School/College/Degrees', csvHeader: 'Education Details', section: 'Education & Career' },
  { key: 'occupationDetails', label: 'Occupation Details', type: 'text', width: 'w-2/3', placeholder: 'Designation/Company', csvHeader: 'Occupation Details', section: 'Education & Career' },
  { key: 'annualIncome', label: 'Annual Income', type: 'text', width: 'w-1/3', placeholder: 'e.g. 10 Lakh', csvHeader: 'Annual Income', section: 'Education & Career' },
  { key: 'grandfatherName', label: "Grandfather's Name", type: 'text', width: 'w-full', csvHeader: "Grandfather's Name", section: 'Family Background' },
  { key: 'fatherName', label: "Father's Name", type: 'text', width: 'w-1/3', csvHeader: "Father's Name", section: 'Family Background' },
  { key: 'fatherOccupation', label: "Father's Occ.", type: 'select', options: OCCUPATIONS, width: 'w-1/3', csvHeader: "Father's Occ.", section: 'Family Background' },
  { key: 'fatherMobile', label: "Father's Mobile", type: 'tel', width: 'w-1/3', csvHeader: "Father's Mobile", section: 'Family Background' },
  { key: 'fatherOccDetails', label: "Father's Occ. Details", type: 'text', width: 'w-full', csvHeader: "Father's Occ. Details", section: 'Family Background' },
  { key: 'motherName', label: "Mother's Name", type: 'text', width: 'w-1/3', csvHeader: "Mother's Name", section: 'Family Background' },
  { key: 'motherOccupation', label: "Mother's Occ.", type: 'select', options: OCCUPATIONS, width: 'w-1/3', csvHeader: "Mother's Occ.", section: 'Family Background' },
  { key: 'motherMobile', label: "Mother's Mobile", type: 'tel', width: 'w-1/3', csvHeader: "Mother's Mobile", section: 'Family Background' },
  { key: 'motherOccDetails', label: "Mother's Occ. Details", type: 'text', width: 'w-full', csvHeader: "Mother's Occ. Details", section: 'Family Background' },
  { key: 'gotra', label: 'Gotra', type: 'text', width: 'w-full', csvHeader: 'Gotra', section: 'Family Background' },
  { key: 'familyIncome', label: 'Family Annual Income', type: 'text', width: 'w-full', csvHeader: 'Family Annual Income', section: 'Family Background' },
  { key: 'brothers', label: "Brother's Count", type: 'number', width: 'w-1/4', csvHeader: "Brother's Count", section: 'Siblings' },
  { key: 'brotherDetails', label: "Brother's Details", type: 'text', width: 'w-3/4', placeholder: 'Married/Unmarried, Profession', csvHeader: "Brother's Details", section: 'Siblings' },
  { key: 'sisters', label: "Sister's Count", type: 'number', width: 'w-1/4', csvHeader: "Sister's Count", section: 'Siblings' },
  { key: 'sisterDetails', label: "Sister's Details", type: 'text', width: 'w-3/4', placeholder: 'Married/Unmarried, Profession', csvHeader: "Sister's Details", section: 'Siblings' },
  { key: 'phone', label: 'Candidate Mobile', type: 'tel', width: 'w-1/2', listPriority: 1, icon: Phone, csvHeader: 'Phone', section: 'Contact Info' },
  { key: 'email', label: 'Email ID', type: 'email', width: 'w-1/2', csvHeader: 'Email ID', section: 'Contact Info' },
  { key: 'residenceType', label: 'Residence Type', type: 'select', options: RESIDENCE_TYPE, width: 'w-1/4', csvHeader: 'Residence Type', section: 'Contact Info' },
  { key: 'ownResidenceKind', label: 'Type of Residence', type: 'select', options: OWN_RESIDENCE_KIND, width: 'w-1/4', csvHeader: 'Own Residence Type', section: 'Contact Info', showWhen: { key: 'residenceType', equals: 'Own' } },
  { key: 'location', label: 'City', type: 'text', width: 'w-1/4', listPriority: 2, icon: MapPin, csvHeader: 'Address', section: 'Contact Info' },
  { key: 'state', label: 'State', type: 'select', options: STATES_INDIA, width: 'w-1/4', csvHeader: 'State', section: 'Contact Info' },
  { key: 'pincode', label: 'Pin Code', type: 'text', width: 'w-1/4', csvHeader: 'Pin Code', section: 'Contact Info' },
  { key: 'address', label: 'Full Address', type: 'textarea', width: 'w-full', csvHeader: 'Full Address', section: 'Contact Info' },
  { key: 'aboutCandidate', label: 'About Candidate', type: 'textarea', width: 'w-full', csvHeader: 'About Candidate', section: 'Preferences & Bio' },
  { key: 'preference', label: 'Partner Preference', type: 'textarea', width: 'w-full', csvHeader: 'Partner Preference', section: 'Preferences & Bio' },
  { key: 'resumeLink', label: 'Biodata Link (PDF)', type: 'url', placeholder: 'Paste Drive Link', width: 'w-full', icon: ExternalLink, csvHeader: 'Biodata Link (PDF)', section: 'Attachments' },
  { key: 'notes', label: 'Office Notes', type: 'textarea', width: 'w-full', icon: StickyNote, csvHeader: 'Office Notes', section: 'Office Use' },
];

export const SEARCH_FIELDS = [
  'fullName', 'community', 'phone', 'refId', 'reference',
  'occupation', 'occupationDetails', 'location', 'notes', 'email',
];

export const ITEMS_PER_PAGE = 50;

/** Hide conditional fields (e.g. own residence kind when not Own). */
export function isProfileFieldVisible(field, data) {
  if (!field.showWhen) return true;
  return data?.[field.showWhen.key] === field.showWhen.equals;
}
