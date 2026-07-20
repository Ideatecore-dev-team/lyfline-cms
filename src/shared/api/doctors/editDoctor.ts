import { supabase } from "../../../supabaseClient";
import { type Doctor } from "../doctor";
import { mapDoctorRow } from "./lookupDoctor";
import { uploadImage, deleteImage } from "../media";

const DOCTORS_FOLDER = "Doctors";

export const editDoctor = async (
  id: string,
  doctorData: {
    doctorName: string;
    doctorTitle: string;
    hospitalId: string;
    specialities: string[];
    qualifications: string[];
    languages: string[];
    description?: string;
  },
  imageFile?: File | null,
  imageRemoved?: boolean
): Promise<Doctor> => {
  // 1. Get current doctor details
  const { data: currentDoctor, error: getError } = await supabase
    .from("doctors")
    .select("avatarUrl")
    .eq("id", id)
    .single();

  if (getError) {
    console.error("Error fetching doctor for edit:", getError.message);
    throw new Error(getError.message);
  }

  let finalImageUrl: string | null = currentDoctor?.avatarUrl || null;

  // 2. Handle Image Changes
  if (imageFile) {
    if (finalImageUrl) {
      await deleteImage(finalImageUrl);
    }
    finalImageUrl = await uploadImage(imageFile, DOCTORS_FOLDER, `${id}.webp`);
  } else if (imageRemoved) {
    if (finalImageUrl) {
      await deleteImage(finalImageUrl);
    }
    finalImageUrl = null;
  }

  // 3. Update DB Row
  const { data, error: updateError } = await supabase
    .from("doctors")
    .update({
      hospital_id: doctorData.hospitalId,
      doctor_name: doctorData.doctorName,
      doctor_title: doctorData.doctorTitle,
      doctor_specialty: doctorData.specialities || [],
      doctor_qualification: doctorData.qualifications || [],
      doctor_language: doctorData.languages || [],
      description: doctorData.description || "",
      avatarUrl: finalImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, partners(*)")
    .single();

  if (updateError) {
    console.error("Error updating doctor row:", updateError.message);
    throw new Error(updateError.message);
  }

  return mapDoctorRow(data);
};
