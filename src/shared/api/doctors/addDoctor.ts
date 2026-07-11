import { supabase } from "../../../supabaseClient";
import { type Doctor } from "../doctor";
import { mapDoctorRow } from "./lookupDoctor";
import { uploadImage, getStoragePathFromUrl } from "../media";

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
    // 1. Upload Doctor Image if provided via server-side WebP compression endpoint
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, DOCTORS_FOLDER, `${doctorId}.webp`);
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
          avatarUrl: imageUrl,
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
      const path = getStoragePathFromUrl(imageUrl, BUCKET_NAME);
      if (path) {
        await supabase.storage.from(BUCKET_NAME).remove([path]);
      }
    }
    throw err;
  }
};
