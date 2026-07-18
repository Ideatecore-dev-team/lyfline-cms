import { supabase } from "../../../supabaseClient";
import { deleteImage } from "../media";

export const deleteDoctor = async (id: string): Promise<void> => {
  // 1. Get doctor details to retrieve avatarUrl
  const { data: doctor, error: getError } = await supabase
    .from("doctors")
    .select("avatarUrl")
    .eq("id", id)
    .maybeSingle();

  if (getError) {
    console.error("Error fetching doctor details for deletion:", getError.message);
    throw new Error(getError.message);
  }

  // 2. Remove file from VPS
  if (doctor && doctor.avatarUrl) {
    await deleteImage(doctor.avatarUrl);
  }

  // 3. Delete DB row
  const { error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting doctor row:", error.message);
    throw new Error(error.message);
  }
};
