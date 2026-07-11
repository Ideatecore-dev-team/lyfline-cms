import { supabase } from "../../../supabaseClient";
import { type Doctor } from "../doctor";
import { mapDoctorRow } from "./lookupDoctor";
import { uploadImage } from "../media";

const BUCKET_NAME = "Lyfline Files";
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
  const { error: getError } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", id)
    .single();

  if (getError) {
    console.error("Error fetching doctor for edit:", getError.message);
    throw new Error(getError.message);
  }

  // Find existing images in storage
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(DOCTORS_FOLDER, { search: id });

  const oldImages = files ? files.filter((f) => f.name.startsWith(`${id}.`)) : [];
  const pathsToDelete = oldImages.map((f) => `${DOCTORS_FOLDER}/${f.name}`);

  let finalImageUrl: string | null = null;
  if (oldImages.length > 0) {
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${DOCTORS_FOLDER}/${oldImages[0].name}`);
    finalImageUrl = urlData.publicUrl;
  }

  // 2. Handle Image Changes
  if (imageFile) {
    // Delete old images first to ensure we don't have conflicting extensions
    if (pathsToDelete.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
    }

    finalImageUrl = await uploadImage(imageFile, DOCTORS_FOLDER, `${id}.webp`);
  } else if (imageRemoved) {
    if (pathsToDelete.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
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

  return mapDoctorRow(data, finalImageUrl);
};
