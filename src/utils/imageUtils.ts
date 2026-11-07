/**
 * Reusable utility for handling client-side image files,
 * drag-and-drop, downsampling large pictures for performance,
 * and generating data URLs.
 */

export interface ProcessedImage {
  name: string;
  url: string;
  size?: number;
  width?: number;
  height?: number;
}

export const processImageFile = (file: File, maxDim = 1200): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If the image is excessively large, resize on canvas to prevent memory & localStorage quota issues
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const isPng = file.type === 'image/png';
            const optimizedUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.88);
            resolve({
              name: file.name,
              url: optimizedUrl,
              size: file.size,
              width,
              height,
            });
            return;
          }
        }

        resolve({
          name: file.name,
          url: rawUrl,
          size: file.size,
          width,
          height,
        });
      };

      img.onerror = () => {
        resolve({
          name: file.name,
          url: rawUrl,
          size: file.size,
        });
      };

      img.src = rawUrl;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
