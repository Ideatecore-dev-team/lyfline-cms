import { supabase } from "../../../supabaseClient";
import { deleteImage } from "../media";

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

  // 2. Remove files from VPS
  if (partner) {
    if (partner.hospital_logo) {
      await deleteImage(partner.hospital_logo);
    }

    if (partner.hospital_images && Array.isArray(partner.hospital_images)) {
      for (const imgUrl of partner.hospital_images) {
        await deleteImage(imgUrl);
      }
    }
  }

  // 3. Delete DB Row
  const { error } = await supabase
    .from("partners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting partner row:", error.message);
    throw new Error(error.message);
  }
};
