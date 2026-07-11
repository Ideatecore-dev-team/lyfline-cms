import { supabase } from "../../../supabaseClient";
import { type Doctor } from "../doctor";
import { mapDoctorRow } from "./lookupDoctor";

const BUCKET_NAME = "Lyfline Files";
const DOCTORS_FOLDER = "Doctors";

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const addDoctor = async (
  doctorData: {
    doctorName: string;
    doctorTitle: string;
    hospitalId: string;
    specialities: string[];
    qualifications: string[];
    languages: string[];
    description?: string;
  },
  imageFile?: File | null
): Promise<Doctor> => {
  const doctorId = generateUUID();
  let imageUrl: string | null = null;

  try {
    // 1. Upload Doctor Image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${doctorId}.${fileExt}`;
      const filePath = `${DOCTORS_FOLDER}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Doctor image upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    // 2. Insert Doctor row into Supabase Database
    const { data, error } = await supabase
      .from("doctors")
      .insert([
        {
          id: doctorId,
          hospital_id: doctorData.hospitalId,
          doctor_name: doctorData.doctorName,
          doctor_title: doctorData.doctorTitle,
          doctor_specialty: doctorData.specialities || [],
          doctor_qualification: doctorData.qualifications || [],
          doctor_language: doctorData.languages || [],
          description: doctorData.description || "",
        },
      ])
      .select("*, partners(*)")
      .single();

    if (error) {
      console.error("Error inserting doctor row:", error.message);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Failed to create doctor.");
    }

    return mapDoctorRow(data, imageUrl);
  } catch (err) {
    // Attempt clean up of any uploaded files in storage on failure
    if (imageUrl) {
      const path = imageUrl.split(`/public/${encodeURIComponent(BUCKET_NAME)}/`)[1];
      if (path) {
        await supabase.storage.from(BUCKET_NAME).remove([decodeURIComponent(path)]);
      }
    }
    throw err;
  }
};
