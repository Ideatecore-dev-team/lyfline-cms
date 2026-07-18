import { supabase } from "../../../supabaseClient";
import { type Partner } from "../partner";
import { mapPartnerRow } from "./lookupPartners";
import { uploadImage, deleteImage } from "../media";

const LOGO_FOLDER = "Partners/Logo";
const IMAGES_FOLDER = "Partners/Hospital Images";

export const editPartner = async (
  id: string,
  partnerData: Omit<Partner, "id" | "createdAt" | "updatedAt">,
  logoFile?: File | null,
  logoRemoved?: boolean,
  newImageFiles?: File[],
  keptImageUrls?: string[]
): Promise<Partner> => {
  // 1. Get current partner details to know what to delete
  const { data: currentPartner, error: getError } = await supabase
    .from("partners")
    .select("*")
    .eq("id", id)
    .single();

  if (getError) {
    console.error("Error fetching partner for edit:", getError.message);
    throw new Error(getError.message);
  }

  let finalLogoUrl = currentPartner.hospital_logo;
  const oldUrlsToDelete: string[] = [];

  // 2. Handle Logo Changes
  if (logoFile) {
    // A new logo file was uploaded
    const fileExt = logoFile.name.split(".").pop() || "jpg";
    const fileName = `${id}_logo_${Date.now()}.${fileExt}`;

    finalLogoUrl = await uploadImage(logoFile, LOGO_FOLDER, fileName);

    // Mark old logo for deletion if it exists
    if (currentPartner.hospital_logo) {
      oldUrlsToDelete.push(currentPartner.hospital_logo);
    }
  } else if (logoRemoved) {
    // Logo was removed
    if (currentPartner.hospital_logo) {
      oldUrlsToDelete.push(currentPartner.hospital_logo);
    }
    finalLogoUrl = null;
  }

  // 3. Handle Hospital Images Changes
  const finalImageUrls: string[] = keptImageUrls ? [...keptImageUrls] : [];

  // Identify images that were removed
  const currentImages: string[] = currentPartner.hospital_images || [];
  currentImages.forEach((imgUrl) => {
    if (!finalImageUrls.includes(imgUrl)) {
      oldUrlsToDelete.push(imgUrl);
    }
  });

  // Upload new image files
  if (newImageFiles && newImageFiles.length > 0) {
    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i];
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${id}_img_${i}_${Date.now()}.${fileExt}`;

      const publicUrl = await uploadImage(file, IMAGES_FOLDER, fileName);
      finalImageUrls.push(publicUrl);
    }
  }

  // 4. Update the DB row
  const { data, error: updateError } = await supabase
    .from("partners")
    .update({
      hospital_name: partnerData.hospitalName,
      city: partnerData.city,
      country: partnerData.country,
      description: partnerData.description || null,
      contact: partnerData.contact || null,
      email: partnerData.email || null,
      address: partnerData.address,
      hospital_logo: finalLogoUrl,
      hospital_images: finalImageUrls,
      google_maps_link: partnerData.googleMapsLink || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating partner row:", updateError.message);
    throw new Error(updateError.message);
  }

  // 5. Clean up old storage files after successful DB update
  if (oldUrlsToDelete.length > 0) {
    for (const url of oldUrlsToDelete) {
      await deleteImage(url);
    }
  }

  return mapPartnerRow(data);
};
