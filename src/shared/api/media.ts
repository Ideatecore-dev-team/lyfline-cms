import JSZip from "jszip";
import { compressImage } from "../utils/imageCompressor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const uploadImage = async (
  file: File | Blob,
  folder: string,
  filename?: string,
  preserveName: boolean = false
): Promise<string> => {
  let fileToUpload = file;

  if (file instanceof File) {
    try {
      fileToUpload = await compressImage(file);
    } catch (err) {
      console.error("Client-side compression failed, trying to upload original file:", err);
    }
  }

  const formData = new FormData();
  let finalName = filename;

  if (filename) {
    // If the file extension changed due to webp compression, update filename suffix if present
    if (fileToUpload.type === "image/webp" && !filename.endsWith(".webp")) {
      const originalNameWithoutExt = filename.substring(0, filename.lastIndexOf(".")) || filename;
      finalName = `${originalNameWithoutExt}.webp`;
    }
    formData.append("image", fileToUpload, finalName);
  } else {
    formData.append("image", fileToUpload);
  }

  if (preserveName && finalName) {
    formData.append("preserveName", "true");
    formData.append("keepOriginalName", "true");
    formData.append("filename", finalName);
    formData.append("exactName", "true");
    formData.append("timestamp", "false");
  }

  let queryUrl = `${API_URL}/api/media/upload?folder=${encodeURIComponent(folder)}`;
  if (preserveName && finalName) {
    queryUrl += `&preserveName=true&keepOriginalName=true&filename=${encodeURIComponent(finalName)}&timestamp=false&exact=true`;
  }

  const headers: Record<string, string> = {
    "x-upload-api-key": import.meta.env.VITE_UPLOAD_API_KEY || "",
  };

  if (preserveName && finalName) {
    headers["x-preserve-name"] = "true";
    headers["x-keep-original-name"] = "true";
    headers["x-filename"] = encodeURIComponent(finalName);
  }

  const response = await fetch(queryUrl, {
    method: "POST",
    headers,
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

export interface FetchMediaOptions {
  folder?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface MediaItemResponse {
  id: string;
  url: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}

export interface PaginatedMediaResponse {
  data: MediaItemResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const fetchMediaList = async (
  folderOrOptions: string | FetchMediaOptions = "media"
): Promise<MediaItemResponse[] | PaginatedMediaResponse> => {
  const options: FetchMediaOptions =
    typeof folderOrOptions === "string"
      ? { folder: folderOrOptions }
      : folderOrOptions;

  const folder = options.folder || "media";
  const params = new URLSearchParams({ folder });
  if (options.page !== undefined) params.set("page", options.page.toString());
  if (options.limit !== undefined) params.set("limit", options.limit.toString());
  if (options.search !== undefined && options.search.trim()) params.set("search", options.search.trim());

  try {
    const response = await fetch(`${API_URL}/api/media?${params.toString()}`, {
      method: "GET",
      headers: {
        "x-upload-api-key": import.meta.env.VITE_UPLOAD_API_KEY || "",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.files)
        ? data.files
        : null;

      if (rawList) {
        const formattedList: MediaItemResponse[] = rawList.map(
          (item: Record<string, unknown> | string, idx: number) => {
            if (typeof item === "string") {
              return {
                id: `${idx}_${Date.now()}`,
                url: item,
                fileName: item.split("/").pop() || item,
                fileSize: "Unknown",
                uploadedAt: new Date().toISOString(),
              };
            }
            return {
              id: (item.id as string) || `${idx}_${Date.now()}`,
              url: (item.url as string) || (item.path as string) || "",
              fileName:
                (item.fileName as string) ||
                (item.filename as string) ||
                (item.name as string) ||
                "image.webp",
              fileSize:
                (item.fileSize as string | number) ||
                (item.size as string | number) ||
                "Unknown",
              uploadedAt:
                (item.uploadedAt as string) ||
                (item.createdAt as string) ||
                new Date().toISOString(),
            };
          }
        );

        if (data.meta) {
          return {
            data: formattedList,
            meta: data.meta,
          };
        }

        return formattedList;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote media list from server, using local storage fallback:", err);
  }

  // Fallback to local storage
  try {
    const stored = localStorage.getItem("lyfline_media_items");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Failed to parse local storage media items:", err);
  }

  return [];
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
  const nameCountMap = new Map<string, number>();

  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    const entryName = entry.name.split("/").pop() || entry.name;
    // Replace em-dash —, en-dash –, and non-standard dashes with standard '-'
    const rawFileName = entryName.replace(/[\u2013\u2014]/g, "-");

    // Generate unique name if duplicates exist in batch: abc.webp -> abc.webp, 2nd abc.webp -> abc-1.webp
    const extIndex = rawFileName.lastIndexOf(".");
    const baseName = extIndex !== -1 ? rawFileName.substring(0, extIndex) : rawFileName;
    const ext = extIndex !== -1 ? rawFileName.substring(extIndex) : "";

    const count = nameCountMap.get(baseName.toLowerCase()) || 0;
    nameCountMap.set(baseName.toLowerCase(), count + 1);

    const cleanFileName = count === 0 ? rawFileName : `${baseName}-${count}${ext}`;

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: imageEntries.length,
        currentFileName: cleanFileName,
      });
    }

    const blob = await entry.file.async("blob");
    const extractedFile = new File([blob], cleanFileName, { type: blob.type || "image/jpeg" });

    const uploadedUrl = await uploadImage(extractedFile, folder, cleanFileName, true);

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
