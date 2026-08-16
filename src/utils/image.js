// Logos are stored inline on the group document as base64 data URLs, and the
// whole group document has to fit inside Firestore's 1 MiB limit alongside
// every collection and expense record. A phone camera JPEG is several MB and
// base64 adds ~33% on top, so an untouched upload silently breaks cloud sync
// for the entire group. Everything is therefore downscaled before it is stored.
export const MAX_LOGO_DIMENSION = 256;

// Rough byte size of a base64 data URL, without allocating a copy of it.
export function dataUrlBytes(dataUrl) {
  if (!dataUrl) return 0;
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function drawScaled(img, maxDimension, preferPng) {
  const longestSide = Math.max(img.naturalWidth, img.naturalHeight) || 1;
  const scale = Math.min(1, maxDimension / longestSide);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process that image.');
  ctx.drawImage(img, 0, 0, width, height);

  // PNG sources keep PNG so logo transparency survives; anything else becomes
  // JPEG, which compresses photographs far more effectively.
  return canvas.toDataURL(preferPng ? 'image/png' : 'image/jpeg', 0.85);
}

const loadImage = (src, failureMessage) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onerror = () => reject(new Error(failureMessage));
  img.onload = () => resolve(img);
  img.src = src;
});

export function downscaleImageFile(file, maxDimension = MAX_LOGO_DIMENSION) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image file.'));
    reader.onload = async () => {
      try {
        const img = await loadImage(reader.result, 'That file does not look like a valid image.');
        resolve(drawScaled(img, maxDimension, /^image\/png$/i.test(file.type)));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

// Shrinks a logo that is ALREADY stored on a group. Needed to repair groups
// saved before uploads were downscaled, whose oversized logo blocks every
// cloud sync for that group.
export async function downscaleDataUrl(dataUrl, maxDimension = MAX_LOGO_DIMENSION) {
  const img = await loadImage(dataUrl, 'The saved logo could not be read.');
  return drawScaled(img, maxDimension, /^data:image\/png/i.test(dataUrl));
}
