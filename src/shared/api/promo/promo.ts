import { supabase } from "../../../supabaseClient";
import { uploadImage, deleteImage } from "../media";

const folderName = "Promo Image";

export const uploadPromoImage = async (file: File): Promise<string> => {
  return await uploadImage(file, folderName);
};

export const deletePromoImage = async (url: string): Promise<void> => {
  if (url) {
    await deleteImage(url);
  }
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
