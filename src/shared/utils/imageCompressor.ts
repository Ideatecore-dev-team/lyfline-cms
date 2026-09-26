/**
 * Utility to compress images in the browser using the Canvas API.
 * Compresses image before uploading. Uses WebP if supported, falls back to JPEG.
 * Server (Sharp) will always convert the final output to WebP regardless of format.
 */

/**
 * Detects if the current browser supports WebP encoding via Canvas API.
 * Safari <= 15 does NOT support canvas.toBlob("image/webp").
 */
const supportsWebPEncoding = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
};

export const compressImage = (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.75
): Promise<File | Blob> => {
  return new Promise((resolve) => {
    // Only compress image files
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    // Determine the output format based on browser capability
    const webpSupported = supportsWebPEncoding();
    const outputMimeType = webpSupported ? "image/webp" : "image/jpeg";
    const outputExtension = webpSupported ? ".webp" : ".jpg";

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob (WebP or JPEG)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            // Construct a new file name with matching extension
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const compressedFile = new File([blob], `${originalNameWithoutExt}${outputExtension}`, {
              type: outputMimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputMimeType,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

