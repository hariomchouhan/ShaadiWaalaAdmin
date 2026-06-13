export const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const scale = 500 / img.width;
        elem.width = 500;
        elem.height = img.height * scale;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, elem.width, elem.height);
        resolve(elem.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};

export const base64ToBlob = async (b64) => {
  const res = await fetch(b64);
  return res.blob();
};
