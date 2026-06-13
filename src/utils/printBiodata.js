import { BRAND } from '../config/brand';
import { THEME } from '../config/theme';
import { formatDate } from './dateUtils.js';

export function printBiodata(profile) {
  const w = window.open('', '_blank');
  if (!w) return alert('Allow popups to print.');

  const p = { ...profile };
  const sections = {
    'Personal Details': [
      { label: 'Date of Birth', val: formatDate(p.dob) },
      { label: 'Time of Birth', val: p.timeOfBirth },
      { label: 'Place of Birth', val: p.placeOfBirth },
      { label: 'Height', val: p.height },
      { label: 'Complexion', val: p.complexion },
      { label: 'Religion / Caste', val: p.community },
      { label: 'Marital Status', val: p.maritalStatus },
      { label: 'Diet', val: p.eating },
      {
        label: 'Habits',
        val: [p.drinking === 'Yes' ? 'Drinking' : '', p.smoking === 'Yes' ? 'Smoking' : ''].filter(Boolean).join(', ')
          || (p.drinking === 'No' && p.smoking === 'No' ? 'Non-Smoker, Non-Drinker' : null),
      },
    ],
    'Education & Career': [
      { label: 'Education', val: p.educationLevel },
      { label: 'Education Details', val: p.educationDetails, fullWidth: true },
      { label: 'Occupation', val: p.occupation },
      { label: 'Annual Income', val: p.annualIncome },
      { label: 'Job Details', val: p.occupationDetails, fullWidth: true },
    ],
    'Family Background': [
      { label: 'Grandfather', val: p.grandfatherName },
      { label: 'Father', val: [p.fatherName, p.fatherOccupation].filter(Boolean).join(' - ') },
      { label: 'Mother', val: [p.motherName, p.motherOccupation].filter(Boolean).join(' - ') },
      {
        label: 'Siblings',
        val: (p.brothers || p.sisters) ? `${p.brothers || 0} Brother(s), ${p.sisters || 0} Sister(s)` : null,
      },
      { label: 'Sibling Details', val: [p.brotherDetails, p.sisterDetails].filter(Boolean).join('; '), fullWidth: true },
      { label: 'Family Income', val: p.familyIncome },
      { label: 'Residence', val: [p.residenceType, p.location, p.state].filter(Boolean).join(', ') },
    ],
  };

  const renderSection = (title, fields) => {
    const validFields = fields.filter((f) => f.val && f.val !== '0' && f.val !== 'No');
    if (validFields.length === 0) return '';
    return `<div class="section"><div class="section-title">${title}</div><div class="grid">${validFields.map((f) => `<div class="field ${f.fullWidth ? 'full-width' : ''}"><span class="label">${f.label}</span><span class="value">${f.val}</span></div>`).join('')}</div></div>`;
  };

  let galleryHtml = '';
  if (p.gallery?.length > 0) {
    galleryHtml = `<div class="gallery-section"><div class="section-title" style="text-align:center;">Additional Photos</div><div class="gallery-grid">${p.gallery.map((img) => `<div class="gallery-item"><img src="${img}" /></div>`).join('')}</div></div>`;
  }

  const brandColor = THEME.brown;
  const goldColor = THEME.gold;

  w.document.write(`<html><head><title>Biodata - ${p.fullName}</title><style>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@700&display=swap');
body { font-family: 'Lato', sans-serif; padding: 30px 40px; color: #222; line-height: 1.4; max-width: 850px; margin: 0 auto; background: #fff; }
.header { text-align: center; border-bottom: 2px solid ${brandColor}; padding-bottom: 15px; margin-bottom: 25px; }
.brand-name { font-family: 'Playfair Display', serif; font-size: 32px; color: ${brandColor}; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
.brand-domain { font-size: 13px; color: ${goldColor}; margin-top: 4px; font-weight: 700; letter-spacing: 1px; }
.intro { display: flex; gap: 25px; margin-bottom: 25px; align-items: flex-start; }
.main-photo { width: 180px; height: 230px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.08); }
.intro-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.intro-content h2 { font-family: 'Playfair Display', serif; font-size: 26px; margin: 0 0 12px 0; color: #111; border-bottom: 1px dashed #ccc; padding-bottom: 8px; display: inline-block; }
.bio { background: ${THEME.surface}; padding: 12px; border-left: 3px solid ${goldColor}; color: #444; font-style: italic; border-radius: 0 6px 6px 0; font-size: 13px; margin-bottom: 10px; }
.pref-box { font-size: 13px; color: #555; }
.section { margin-bottom: 20px; break-inside: avoid; }
.section-title { font-size: 15px; font-weight: 800; color: ${brandColor}; text-transform: uppercase; border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 3px; letter-spacing: 0.5px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 30px; }
.field { display: flex; flex-direction: column; }
.field.full-width { grid-column: span 2; margin-top: 4px; }
.label { font-size: 10px; text-transform: uppercase; color: #777; font-weight: 700; margin-bottom: 1px; }
.value { font-size: 14px; font-weight: 600; color: #000; }
.gallery-section { page-break-before: always; margin-top: 30px; }
.gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
.gallery-item img { width: 100%; border-radius: 6px; border: 1px solid #eee; }
@media print { body { padding: 0; margin: 0; } .header, .section-title, .bio { -webkit-print-color-adjust: exact; } @page { margin: 1cm; } }
</style></head><body>
<div class="header">
  <div class="brand-name">${BRAND.name}</div>
  <div class="brand-domain">${BRAND.domain}</div>
</div>
<div class="intro">
  ${p.avatar ? `<img src="${p.avatar}" class="main-photo" />` : ''}
  <div class="intro-content">
    <h2>${p.fullName}</h2>
    ${p.aboutCandidate ? `<div class="bio">"${p.aboutCandidate}"</div>` : ''}
    ${p.preference ? `<div class="pref-box"><span class="label" style="color:${brandColor};">Partner Preference</span><div style="font-weight:500;">${p.preference}</div></div>` : ''}
  </div>
</div>
${renderSection('Personal Details', sections['Personal Details'])}
${renderSection('Education & Career', sections['Education & Career'])}
${renderSection('Family Background', sections['Family Background'])}
${galleryHtml}
<script>setTimeout(() => { window.print(); }, 500);</script>
</body></html>`);
  w.document.close();
}
