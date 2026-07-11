import { supabase } from "../../../supabaseClient";
import { uploadImage } from "../media";

const bucketName = "Lyfline Files";
const folderName = "Promo Image";

export const uploadPromoImage = async (file: File): Promise<string> => {
  // 1. List and remove previous files to keep storage clear
  const { data: existingFiles, error: listError } = await supabase.storage
    .from(bucketName)
    .list(folderName);

  if (!listError && existingFiles && existingFiles.length > 0) {
    const filesToRemove = existingFiles
      .filter((f) => f.id !== null && f.name !== ".emptyFolderPlaceholder")
      .map((f) => `${folderName}/${f.name}`);
    
    if (filesToRemove.length > 0) {
      await supabase.storage.from(bucketName).remove(filesToRemove);
    }
  }

  // 2. Upload new file via server-side WebP compression endpoint
  return await uploadImage(file, folderName);
};

export const deletePromoImage = async (fileNameOrUrl: string): Promise<void> => {
  let path = fileNameOrUrl;

  // Extract path if a full URL is passed
  if (fileNameOrUrl.includes("http")) {
    try {
      const decodeUrl = decodeURIComponent(fileNameOrUrl);
      const searchString = `/public/${bucketName}/`;
      const index = decodeUrl.indexOf(searchString);
      if (index !== -1) {
        path = decodeUrl.substring(index + searchString.length);
      }
    } catch (err) {
      console.error("Failed to parse URL for deletion:", err);
    }
  } else if (!fileNameOrUrl.startsWith(`${folderName}/`)) {
    path = `${folderName}/${fileNameOrUrl}`;
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    console.error("Error deleting promo image:", error.message);
    throw new Error(error.message);
  }
};

export const getPromoImage = async (): Promise<string | null> => {
  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list(folderName);

  if (error || !files || files.length === 0) {
    return null;
  }

  // Filter out placeholder files and subfolders
  const activeFiles = files.filter(
    (f) => f.id !== null && f.name !== ".emptyFolderPlaceholder"
  );
  if (activeFiles.length === 0) return null;

  // Sort by created_at descending and take the newest file
  const sorted = activeFiles.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
  const fileName = sorted[0].name;

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(`${folderName}/${fileName}`);

  return urlData.publicUrl;
};

export const getPromoSettings = async (): Promise<{ imageUrl: string | null; destinationLink: string | null }> => {
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["promo_image_url", "promo_destination_link"]);

  if (error) {
    console.error("Error fetching promo settings:", error.message);
    throw new Error(error.message);
  }

  const result = { imageUrl: null as string | null, destinationLink: null as string | null };
  if (data) {
    data.forEach((row) => {
      if (row.key === "promo_image_url") {
        result.imageUrl = row.value || null;
      } else if (row.key === "promo_destination_link") {
        result.destinationLink = row.value || "";
      }
    });
  }
  return result;
};

export const savePromoSettings = async (
  imageUrl: string | null,
  destinationLink: string
): Promise<void> => {
  const { error } = await supabase
    .from("settings")
    .upsert([
      { key: "promo_image_url", value: imageUrl || "" },
      { key: "promo_destination_link", value: destinationLink },
    ]);

  if (error) {
    console.error("Error saving promo settings:", error.message);
    throw new Error(error.message);
  }
};
