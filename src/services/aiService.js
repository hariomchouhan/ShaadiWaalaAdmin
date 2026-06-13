import {
  RELIGIONS, MARITAL_STATUS, HEIGHTS, OCCUPATIONS,
  EDUCATION_LEVELS, COMPLEXION, DIET,
} from '../constants/options';
import { normalizeDate, normalizeTime } from '../utils/dateUtils';
import { fuzzyMatch } from '../utils/fuzzyMatch';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function extractProfileFromText(aiInputText) {
  if (!aiInputText.trim()) throw new Error('Please paste biodata text first.');
  if (!apiKey) throw new Error('Gemini API key not configured.');

  const prompt = `Act as a Data Entry Expert. Extract data into a Strict JSON Object. TEXT: "${aiInputText}" LISTS: - Religions: [${RELIGIONS.join(', ')}] - Marital Status: [${MARITAL_STATUS.join(', ')}] - Heights: [${HEIGHTS.join(', ')}] - Occupations: [${OCCUPATIONS.join(', ')}] - Education: [${EDUCATION_LEVELS.join(', ')}] - Complexion: [${COMPLEXION.join(', ')}] - Diet: [${DIET.join(', ')}] TARGET JSON: { "fullName": "String", "dob": "YYYY-MM-DD", "timeOfBirth": "HH:mm (24-hour format, e.g. 14:30)", "placeOfBirth": "String", "gender": "Male/Female", "community": "Match List", "maritalStatus": "Match List", "height": "Match List (e.g. 5'06)", "complexion": "Match List", "eating": "Match List", "drinking": "No/Yes", "smoking": "No/Yes", "educationLevel": "Match List", "educationDetails": "String", "occupation": "Match List", "occupationDetails": "String", "annualIncome": "String", "fatherName": "String", "fatherOccupation": "String", "motherName": "String", "motherOccupation": "String", "brothers": "Number", "brotherDetails": "String", "sisters": "Number", "sisterDetails": "String", "location": "String", "phone": "String", "email": "String", "preference": "String", "notes": "String" }`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Google API Error:', errText);
    throw new Error(`API Error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from AI');

  const rawText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  const rawJson = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

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
