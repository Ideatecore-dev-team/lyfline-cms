import { supabase } from "../../../supabaseClient";
import { type Doctor } from "../doctor";
import { mapDoctorRow } from "./lookupDoctor";
import { uploadImage, deleteImage } from "../media";

const DOCTORS_FOLDER = "Doctors";

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
  const doctorId = crypto.randomUUID();
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
    // Attempt clean up of any uploaded files on failure
    if (imageUrl) {
      await deleteImage(imageUrl);
    }
    throw err;
  }
};
