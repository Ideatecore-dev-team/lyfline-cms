import { supabase } from "../../../supabaseClient";
import { type Partner } from "../partner";
import { mapPartnerRow } from "./lookupPartners";
import { uploadImage, getStoragePathFromUrl } from "../media";

const BUCKET_NAME = "Lyfline Files";
const LOGO_FOLDER = "Partners/Logo";
const IMAGES_FOLDER = "Partners/Hospital Images";

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const addPartner = async (
  partnerData: Omit<Partner, "id" | "createdAt" | "updatedAt">,
  logoFile?: File | null,
  imageFiles?: File[]
): Promise<Partner> => {
  const partnerId = generateUUID();
  let logoUrl: string | null = null;
  const imageUrls: string[] = [];

  try {
    // 1. Upload Logo if provided
    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${partnerId}_logo_${Date.now()}.${fileExt}`;

      logoUrl = await uploadImage(logoFile, LOGO_FOLDER, fileName);
    }

    // 2. Upload Hospital Images if provided
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${partnerId}_img_${i}_${Date.now()}.${fileExt}`;

        const publicUrl = await uploadImage(file, IMAGES_FOLDER, fileName);
        imageUrls.push(publicUrl);
      }
    }

    // 3. Insert Partner row into Supabase Database
    const { data, error } = await supabase
      .from("partners")
      .insert([
        {
          id: partnerId,
          hospital_name: partnerData.hospitalName,
          city: partnerData.city,
          country: partnerData.country,
          description: partnerData.description || null,
          contact: partnerData.contact || null,
          email: partnerData.email || null,
          address: partnerData.address,
          hospital_logo: logoUrl,
          hospital_images: imageUrls,
          google_maps_link: partnerData.googleMapsLink || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting partner row:", error.message);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Failed to create partner.");
    }

    return mapPartnerRow(data);
  } catch (err) {
    // Attempt clean up of any uploaded files in storage on failure
    if (logoUrl) {
      const path = getStoragePathFromUrl(logoUrl, BUCKET_NAME);
      if (path) {
        await supabase.storage.from(BUCKET_NAME).remove([path]);
      }
    }
    if (imageUrls.length > 0) {
      const pathsToDelete = imageUrls.map(
        (url) => getStoragePathFromUrl(url, BUCKET_NAME)
      ).filter(Boolean) as string[];
      
      if (pathsToDelete.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
      }
    }
    throw err;
  }
};
