import { supabase } from "../../../supabaseClient";

const BUCKET_NAME = "Lyfline Files";

// Helper to extract bucket file path from full public URL
const getPathFromUrl = (url: string): string | null => {
  try {
    const decodeUrl = decodeURIComponent(url);
    const searchString = `/public/${BUCKET_NAME}/`;
    const index = decodeUrl.indexOf(searchString);
    if (index !== -1) {
      return decodeUrl.substring(index + searchString.length);
    }
  } catch (err) {
    console.error("Failed to parse URL for deletion:", err);
  }
  return null;
};

export const deletePartner = async (id: string): Promise<void> => {
  // 1. Get partner info to retrieve logo and image URLs
  const { data: partner, error: getError } = await supabase
    .from("partners")
    .select("hospital_logo, hospital_images")
    .eq("id", id)
    .maybeSingle();

  if (getError) {
    console.error("Error fetching partner details for deletion:", getError.message);
    throw new Error(getError.message);
  }

  // 2. Prepare list of storage paths to delete
  const pathsToDelete: string[] = [];

  if (partner) {
    if (partner.hospital_logo) {
      const logoPath = getPathFromUrl(partner.hospital_logo);
      if (logoPath) pathsToDelete.push(logoPath);
    }

    if (partner.hospital_images && Array.isArray(partner.hospital_images)) {
      partner.hospital_images.forEach((imgUrl: string) => {
        const imgPath = getPathFromUrl(imgUrl);
        if (imgPath) pathsToDelete.push(imgPath);
      });
    }
  }

  // 3. Remove files from storage
  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(pathsToDelete);

    if (storageError) {
      console.warn("Could not delete some storage files:", storageError.message);
    }
  }

  // 4. Delete DB Row
  const { error } = await supabase
    .from("partners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting partner row:", error.message);
    throw new Error(error.message);
  }
};
