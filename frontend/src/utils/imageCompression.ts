const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;
// Imagens já abaixo de ~250 KB em data URL não precisam ser recomprimidas
const MAX_DATA_URL_LENGTH = 350_000;

const readFileAsDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler imagem.'));
    reader.readAsDataURL(file);
  });

export const compressDataUrlImage = (
  dataUrl: string,
  maxDimension = MAX_DIMENSION,
  quality = JPEG_QUALITY,
): Promise<string> => {
  if (
    !dataUrl ||
    !dataUrl.startsWith('data:image/') ||
    dataUrl.length <= MAX_DATA_URL_LENGTH ||
    typeof document === 'undefined'
  ) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Fundo branco para imagens com transparência convertidas em JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(
          compressed && compressed.length < dataUrl.length
            ? compressed
            : dataUrl,
        );
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const compressImageFile = async (file: File): Promise<string> => {
  const rawDataUrl = await readFileAsDataUrl(file);
  return compressDataUrlImage(rawDataUrl);
};

export const compressImagesList = async (
  images?: string[],
): Promise<string[]> => {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }
  return Promise.all(images.map((img) => compressDataUrlImage(img)));
};

