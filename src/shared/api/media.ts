import JSZip from "jszip";
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
    headers: {
      "x-upload-api-key": import.meta.env.VITE_UPLOAD_API_KEY || "",
    },
    body: formData,
  });

  if (response.status === 413) {
    throw new Error("Ukuran berkas gambar terlalu besar untuk server. Batas maksimal server adalah 5MB (setelah kompresi).");
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

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/media`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-upload-api-key": import.meta.env.VITE_UPLOAD_API_KEY || "",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      if (response.status !== 404) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to delete image:", errorData.message || response.status);
      }
    }
  } catch (err) {
    console.error("Failed to delete image:", err);
  }
};

export interface BatchUploadProgress {
  current: number;
  total: number;
  currentFileName: string;
}

export interface BatchUploadResultItem {
  url: string;
  fileName: string;
  fileSize: string;
}

export const processZipFile = async (
  zipFile: File,
  folder: string = "media",
  onProgress?: (progress: BatchUploadProgress) => void
): Promise<BatchUploadResultItem[]> => {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);

  const imageEntries: { name: string; file: JSZip.JSZipObject }[] = [];
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"];

  zipContent.forEach((relativePath, file) => {
    if (file.dir) return;
    const lower = relativePath.toLowerCase();
    const isMacOsMeta = relativePath.includes("__MACOSX") || relativePath.startsWith(".");
    const hasValidExt = validExtensions.some((ext) => lower.endsWith(ext));
    if (!isMacOsMeta && hasValidExt) {
      imageEntries.push({ name: relativePath, file });
    }
  });

  if (imageEntries.length === 0) {
    throw new Error("No valid image files (.jpg, .png, .webp, .gif, .svg) found inside the ZIP file.");
  }

  const results: BatchUploadResultItem[] = [];

  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    const cleanFileName = entry.name.split("/").pop() || entry.name;

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: imageEntries.length,
        currentFileName: cleanFileName,
      });
    }

    const blob = await entry.file.async("blob");
    const extractedFile = new File([blob], cleanFileName, { type: blob.type || "image/jpeg" });

    const uploadedUrl = await uploadImage(extractedFile, folder, cleanFileName);

    const formattedSize = blob.size > 1024 * 1024
      ? `${(blob.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(blob.size / 1024)} KB`;

    results.push({
      url: uploadedUrl,
      fileName: cleanFileName,
      fileSize: formattedSize,
    });
  }

  return results;
};
