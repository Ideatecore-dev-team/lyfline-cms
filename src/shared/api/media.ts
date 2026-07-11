const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const uploadImage = async (file: File | Blob, folder: string, filename?: string): Promise<string> => {
  const formData = new FormData();
  if (filename) {
    formData.append("image", file, filename);
  } else {
    formData.append("image", file);
  }

  const response = await fetch(`${API_URL}/api/media/upload?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type header. The browser will set it automatically
    // with the boundary string when passing a FormData object.
  });

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
