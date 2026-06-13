export const parseCSV = (str) => {
  const arr = [];
  let quote = false;
  let row = [];
  let col = '';
  for (let c = 0; c < str.length; c++) {
    const cc = str[c];
    const nc = str[c + 1];
    if (cc === '"' && nc === '"') { col += '"'; c++; continue; }
    if (cc === '"') {
      if (!quote && col === '') quote = true;
      else if (quote && (nc === ',' || nc === '\r' || nc === '\n' || !nc)) quote = false;
      else col += cc;
      continue;
    }
    if (cc === ',') {
      if (quote) col += cc;
      else { row.push(col.trim()); col = ''; }
      continue;
    }
    if (cc === '\r' || cc === '\n') {
      if (quote) col += cc;
      else {
        row.push(col.trim());
        col = '';
        arr.push(row);
        row = [];
        if (cc === '\r' && nc === '\n') c++;
      }
      continue;
    }
    col += cc;
  }
  if (col || row.length > 0) { row.push(col.trim()); arr.push(row); }
  return arr;
};

export const downloadCSV = (rows, filename) => {
  const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
