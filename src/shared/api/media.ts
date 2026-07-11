import { compressImage } from "../utils/imageCompressor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const uploadImage = async (file: File | Blob, folder: string, filename?: string): Promise<string> => {
  let fileToUpload = file;

  if (file instanceof File) {
    try {
      fileToUpload = await compressImage(file);
    } catch (err) {
      console.error("Client-side compression failed, trying to upload original file:", err);
    }
  }

  const formData = new FormData();
  if (filename) {
    // If the file extension changed due to webp compression, update filename suffix if present
    let finalName = filename;
    if (fileToUpload.type === "image/webp" && !filename.endsWith(".webp")) {
      const originalNameWithoutExt = filename.substring(0, filename.lastIndexOf(".")) || filename;
      finalName = `${originalNameWithoutExt}.webp`;
    }
    formData.append("image", fileToUpload, finalName);
  } else {
    formData.append("image", fileToUpload);
  }

  const response = await fetch(`${API_URL}/api/media/upload?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body: formData,
  });

  if (response.status === 413) {
    throw new Error("Ukuran berkas gambar terlalu besar untuk server. Batas maksimal server adalah 1MB (setelah kompresi).");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.url) {
    throw new Error("Invalid server response: missing URL");
  }

  return data.url;
};

export const getStoragePathFromUrl = (url: string, bucketName: string): string | null => {
  try {
    const decodeUrl = decodeURIComponent(url);
    const searchString = `/public/${bucketName}/`;
    const index = decodeUrl.indexOf(searchString);
    if (index !== -1) {
      return decodeUrl.substring(index + searchString.length);
    }
  } catch (err) {
    console.error("Failed to parse URL:", err);
  }
  return null;
};
