import { BRAND } from '../config/brand';
import { THEME } from '../config/theme';
import { formatDate, getAge } from './dateUtils.js';
import logoUrl from '../assets/logo.png';

function esc(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printBiodata(profile) {
  const w = window.open('', '_blank');
  if (!w) return alert('Allow popups to print.');

  const p = { ...profile };
  const sections = {
    'Personal Details': [
      { label: 'Date of Birth', val: formatDate(p.dob) },
      { label: 'Age', val: getAge(p.dob) || null },
      { label: 'Time of Birth', val: p.timeOfBirth },
      { label: 'Place of Birth', val: p.placeOfBirth },
      { label: 'Gender', val: p.gender },
      { label: 'Height', val: p.height },
      { label: 'Weight', val: p.weight },
      { label: 'Complexion', val: p.complexion },
      { label: 'Religion / Caste', val: p.community },
      { label: 'Marital Status', val: p.maritalStatus },
      { label: 'NRI', val: p.nri === 'Yes' ? 'Yes' : null },
      { label: 'Diet', val: p.eating },
      {
        label: 'Habits',
        val: [p.drinking === 'Yes' ? 'Drinking' : '', p.smoking === 'Yes' ? 'Smoking' : ''].filter(Boolean).join(', ')
          || (p.drinking === 'No' && p.smoking === 'No' ? 'Non-Smoker, Non-Drinker' : null),
      },
      { label: 'Disability', val: p.disability === 'Yes' ? p.disability : null },
    ],
    'Education & Career': [
      { label: 'Education', val: p.educationLevel },
      { label: 'Education Details', val: p.educationDetails, fullWidth: true },
      { label: 'Occupation', val: p.occupation },
      { label: 'Annual Income', val: p.annualIncome },
      { label: 'Job Details', val: p.occupationDetails, fullWidth: true },
    ],
    'Family Background': [
      { label: 'Grandfather', val: p.grandfatherName, fullWidth: true },
      { label: 'Gotra', val: p.gotra },
      { label: 'Father', val: [p.fatherName, p.fatherOccupation].filter(Boolean).join(' — ') },
      { label: "Father's Mobile", val: p.fatherMobile },
      { label: 'Mother', val: [p.motherName, p.motherOccupation].filter(Boolean).join(' — ') },
      { label: "Mother's Mobile", val: p.motherMobile },
      {
        label: 'Siblings',
        val: (p.brothers || p.sisters) ? `${p.brothers || 0} Brother(s), ${p.sisters || 0} Sister(s)` : null,
      },
      { label: 'Sibling Details', val: [p.brotherDetails, p.sisterDetails].filter(Boolean).join('; '), fullWidth: true },
      { label: 'Family Income', val: p.familyIncome },
      {
        label: 'Residence',
        val: [
          p.residenceType,
          p.residenceType === 'Own' && p.ownResidenceKind ? p.ownResidenceKind : null,
          p.location,
          p.state,
          p.pincode,
        ].filter(Boolean).join(', '),
        fullWidth: true,
      },
      { label: 'Full Address', val: p.address, fullWidth: true },
    ],
  };

  const renderSection = (title, fields) => {
    const validFields = fields.filter((f) => f.val && f.val !== '0' && f.val !== 'No');
    if (validFields.length === 0) return '';
    return `
      <div class="section">
        <div class="section-head">
          <span class="section-bar"></span>
          <h3 class="section-title">${esc(title)}</h3>
        </div>
        <div class="grid">
          ${validFields.map((f) => `
            <div class="field ${f.fullWidth ? 'full-width' : ''}">
              <span class="label">${esc(f.label)}</span>
              <span class="value">${esc(f.val)}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  };

  let galleryHtml = '';
  if (p.gallery?.length > 0) {
    galleryHtml = `
      <div class="gallery-section">
        <div class="section-head">
          <span class="section-bar"></span>
          <h3 class="section-title">Additional Photos</h3>
        </div>
        <div class="gallery-grid">
          ${p.gallery.map((img) => `<div class="gallery-item"><img src="${esc(img)}" alt="Gallery" /></div>`).join('')}
        </div>
      </div>`;
  }

  const metaChips = [
    p.refId ? `Ref #${p.refId}` : null,
    p.community,
    getAge(p.dob),
    p.gender,
    p.nri === 'Yes' ? 'NRI' : null,
  ].filter(Boolean);

  const { gold, goldLight, goldDark, brown, surface, text, textMuted } = THEME;

  w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Biodata — ${esc(p.fullName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      color: ${text};
      background: #fff;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      position: relative;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .watermark-screen {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .watermark-screen img {
      width: min(62vw, 340px);
      height: auto;
      transform: rotate(-28deg);
      opacity: 0.13;
      filter: grayscale(20%) sepia(30%);
    }
    .page-content {
      position: relative;
      z-index: 1;
      max-width: 820px;
      margin: 0 auto;
      padding: 28px 36px 32px;
      background: transparent;
      border: 1px solid rgba(197, 160, 89, 0.25);
      border-radius: 14px;
    }

    .top-brand {
      text-align: center;
      padding-bottom: 16px;
      margin-bottom: 20px;
      border-bottom: 2px solid ${gold};
    }
    .compact-brand-logo {
      height: 46px;
      margin-bottom: 6px;
    }

    .header {
      text-align: center;
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 2px solid ${gold};
      position: relative;
    }
    .header::after {
      content: '';
      display: block;
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, transparent, ${goldLight}, transparent);
      margin: 14px auto 0;
    }
    .brand-logo {
      height: 52px;
      width: auto;
      max-width: 280px;
      object-fit: contain;
      display: block;
      margin: 0 auto 8px;
    }
    .brand-tagline {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: ${goldDark};
    }
    .brand-domain {
      font-size: 11px;
      color: ${textMuted};
      margin-top: 4px;
      letter-spacing: 0.06em;
    }

    .hero {
      display: flex;
      gap: 28px;
      align-items: flex-start;
      margin-bottom: 22px;
      padding: 18px;
      background: rgba(250, 247, 242, 0.55);
      border: 1px solid rgba(197, 160, 89, 0.2);
      border-radius: 12px;
    }
    .photo-wrap {
      flex-shrink: 0;
      padding: 4px;
      background: linear-gradient(145deg, ${gold} 0%, ${goldDark} 100%);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(74, 55, 40, 0.12);
    }
    .main-photo {
      width: 168px;
      height: 210px;
      object-fit: cover;
      object-position: top center;
      border-radius: 7px;
      display: block;
      background: ${surface};
    }
    .photo-placeholder {
      width: 168px;
      height: 210px;
      border-radius: 7px;
      background: ${surface};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: ${textMuted};
    }
    .hero-body { flex: 1; min-width: 0; }
    .candidate-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      color: ${brown};
      line-height: 1.2;
      margin-bottom: 10px;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }
    .chip {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(197, 160, 89, 0.1);
      color: ${brown};
      border: 1px solid rgba(197, 160, 89, 0.25);
    }
    .chip.gold {
      background: rgba(197, 160, 89, 0.88);
      color: #fff;
      border-color: ${gold};
    }
    .quote-box {
      font-style: italic;
      font-size: 13px;
      color: ${textMuted};
      padding: 12px 14px;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.55);
      border-left: 3px solid ${gold};
      border-radius: 0 8px 8px 0;
      line-height: 1.55;
    }
    .pref-card {
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(197, 160, 89, 0.2);
      border-radius: 8px;
      padding: 12px 14px;
    }
    .pref-card .label {
      margin-bottom: 4px;
    }

    .section {
      margin-bottom: 22px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .section-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .section-bar {
      width: 4px;
      height: 22px;
      background: linear-gradient(180deg, ${gold} 0%, ${goldDark} 100%);
      border-radius: 2px;
      flex-shrink: 0;
    }
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      font-weight: 700;
      color: ${brown};
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .field {
      padding: 10px 12px;
      background: rgba(250, 247, 242, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(197, 160, 89, 0.1);
    }
    .field.full-width { grid-column: span 2; }
    .label {
      display: block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${goldDark};
      margin-bottom: 3px;
    }
    .value {
      font-size: 13px;
      font-weight: 600;
      color: ${text};
      word-break: break-word;
    }

    .gallery-section {
      page-break-before: always;
      margin-top: 8px;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-top: 4px;
    }
    .gallery-item {
      padding: 3px;
      background: linear-gradient(145deg, ${goldLight}, ${gold});
      border-radius: 8px;
    }
    .gallery-item img {
      width: 100%;
      border-radius: 6px;
      display: block;
    }

    .footer {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid rgba(197, 160, 89, 0.25);
      text-align: center;
      font-size: 10px;
      color: ${textMuted};
      letter-spacing: 0.05em;
    }
    .footer strong { color: ${goldDark}; }

    @media print {
      body { padding: 0; background: #fff; }
      @page { margin: 10mm; size: A4; }
      .watermark-screen img {
        opacity: 0.16;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-content {
        max-width: 100%;
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 0;
        background: transparent;
      }
      .hero, .field, .chip, .section-bar, .photo-wrap, .gallery-item, .quote-box, .pref-card {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="watermark-screen" aria-hidden="true">
    <img src="${logoUrl}" alt="" />
  </div>
  <div class="page-content">
  <div class="top-brand">
    <img src="${logoUrl}" alt="${esc(BRAND.name)}" class="brand-logo compact-brand-logo" />
    <div class="brand-tagline">Elite &amp; NRI Matrimony</div>
  </div>

  <div class="hero">
    ${p.avatar
      ? `<div class="photo-wrap"><img src="${esc(p.avatar)}" class="main-photo" alt="${esc(p.fullName)}" /></div>`
      : `<div class="photo-wrap"><div class="photo-placeholder">No Photo</div></div>`}
    <div class="hero-body">
      <h1 class="candidate-name">${esc(p.fullName)}</h1>
      ${metaChips.length ? `<div class="meta-row">${metaChips.map((c, i) => `<span class="chip${i === 0 && p.refId ? ' gold' : ''}">${esc(c)}</span>`).join('')}</div>` : ''}
      ${p.aboutCandidate ? `<div class="quote-box">"${esc(p.aboutCandidate)}"</div>` : ''}
      ${p.preference ? `
        <div class="pref-card">
          <span class="label">Partner Preference</span>
          <div class="value" style="font-weight:500;font-size:13px;">${esc(p.preference)}</div>
        </div>` : ''}
    </div>
  </div>

  ${renderSection('Personal Details', sections['Personal Details'])}
  ${renderSection('Education & Career', sections['Education & Career'])}
  ${renderSection('Family Background', sections['Family Background'])}
  ${galleryHtml}

  <footer class="footer">
    <strong>${esc(BRAND.name)}</strong> · Confidential matrimonial biodata · ${esc(BRAND.domain)}
  </footer>
  </div>

  <script>setTimeout(function() { window.print(); }, 600);</script>
</body>
</html>`);
  w.document.close();
}
