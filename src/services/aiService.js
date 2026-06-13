import {
  RELIGIONS, MARITAL_STATUS, HEIGHTS, OCCUPATIONS,
  EDUCATION_LEVELS, COMPLEXION, DIET,
} from '../constants/options';
import { normalizeDate, normalizeTime } from '../utils/dateUtils';
import { fuzzyMatch } from '../utils/fuzzyMatch';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MIME_BY_EXT = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function buildExtractionPrompt(extraContext = '') {
  const contextLine = extraContext ? `\nAdditional context: ${extraContext}` : '';
  return `Act as a Data Entry Expert. Extract matrimonial biodata into a Strict JSON Object.${contextLine}

LISTS:
- Religions: [${RELIGIONS.join(', ')}]
- Marital Status: [${MARITAL_STATUS.join(', ')}]
- Heights: [${HEIGHTS.join(', ')}]
- Occupations: [${OCCUPATIONS.join(', ')}]
- Education: [${EDUCATION_LEVELS.join(', ')}]
- Complexion: [${COMPLEXION.join(', ')}]
- Diet: [${DIET.join(', ')}]

TARGET JSON (use empty string or 0 if not found):
{
  "fullName": "String",
  "dob": "YYYY-MM-DD",
  "timeOfBirth": "HH:mm (24-hour format, e.g. 14:30)",
  "placeOfBirth": "String",
  "gender": "Male/Female",
  "community": "Match List",
  "maritalStatus": "Match List",
  "height": "Match List (e.g. 5'06)",
  "complexion": "Match List",
  "eating": "Match List",
  "drinking": "No/Yes",
  "smoking": "No/Yes",
  "educationLevel": "Match List",
  "educationDetails": "String",
  "occupation": "Match List",
  "occupationDetails": "String",
  "annualIncome": "String",
  "fatherName": "String",
  "fatherOccupation": "String",
  "motherName": "String",
  "motherOccupation": "String",
  "brothers": "Number",
  "brotherDetails": "String",
  "sisters": "Number",
  "sisterDetails": "String",
  "location": "String",
  "phone": "String",
  "email": "String",
  "preference": "String",
  "notes": "String"
}

Return ONLY valid JSON. No markdown fences.`;
}

function getMimeType(file) {
  if (file.type && ALLOWED_MIME.has(file.type)) return file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return MIME_BY_EXT[ext] || null;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cleanExtractedProfile(rawJson) {
  const cleaned = { ...rawJson };
  if (cleaned.dob) cleaned.dob = normalizeDate(cleaned.dob);
  if (cleaned.timeOfBirth) cleaned.timeOfBirth = normalizeTime(cleaned.timeOfBirth);
  if (cleaned.community) cleaned.community = fuzzyMatch(cleaned.community, RELIGIONS);
  if (cleaned.maritalStatus) cleaned.maritalStatus = fuzzyMatch(cleaned.maritalStatus, MARITAL_STATUS);
  if (cleaned.height) {
    let hMatch = HEIGHTS.find((h) => h === cleaned.height);
    if (!hMatch) hMatch = fuzzyMatch(cleaned.height, HEIGHTS);
    cleaned.height = hMatch || '';
  }
  if (cleaned.educationLevel) cleaned.educationLevel = fuzzyMatch(cleaned.educationLevel, EDUCATION_LEVELS);
  if (cleaned.occupation) cleaned.occupation = fuzzyMatch(cleaned.occupation, OCCUPATIONS);
  if (cleaned.complexion) cleaned.complexion = fuzzyMatch(cleaned.complexion, COMPLEXION);
  if (cleaned.eating) cleaned.eating = fuzzyMatch(cleaned.eating, DIET);
  if (cleaned.brothers) cleaned.brothers = parseInt(cleaned.brothers, 10) || 0;
  if (cleaned.sisters) cleaned.sisters = parseInt(cleaned.sisters, 10) || 0;
  return cleaned;
}

function parseGeminiJson(text) {
  const rawText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid JSON structure.');
  return JSON.parse(jsonMatch[0]);
}

async function callGemini(parts) {
  if (!apiKey) throw new Error('Gemini API key not configured.');

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Google API Error:', errText);
    throw new Error(`API Error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from AI');
  return cleanExtractedProfile(parseGeminiJson(text));
}

export async function extractProfileFromText(aiInputText) {
  if (!aiInputText.trim()) throw new Error('Please paste biodata text or upload a file.');
  const prompt = `${buildExtractionPrompt()}\n\nBIODATA TEXT:\n${aiInputText}`;
  return callGemini([{ text: prompt }]);
}

export async function extractProfileFromFile(file, supplementaryText = '') {
  const mimeType = getMimeType(file);
  if (!mimeType) throw new Error('Unsupported file. Upload PDF, JPG, PNG, or WEBP.');
  if (file.size > MAX_FILE_BYTES) throw new Error('File too large. Maximum size is 10MB.');

  const base64 = await fileToBase64(file);
  const parts = [
    { text: buildExtractionPrompt(supplementaryText.trim() || 'Read all text from the attached biodata document or image.') },
    { inline_data: { mime_type: mimeType, data: base64 } },
  ];
  return callGemini(parts);
}

export async function extractProfile({ text = '', file = null } = {}) {
  const hasText = text.trim().length > 0;
  if (file && hasText) return extractProfileFromFile(file, text);
  if (file) return extractProfileFromFile(file);
  if (hasText) return extractProfileFromText(text);
  throw new Error('Please paste biodata text or upload a PDF/image.');
}
