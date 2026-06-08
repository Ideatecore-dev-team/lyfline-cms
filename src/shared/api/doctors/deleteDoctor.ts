import { supabase } from "../../../supabaseClient";

const BUCKET_NAME = "Lyfline Files";
const DOCTORS_FOLDER = "Doctors";

export const deleteDoctor = async (id: string): Promise<void> => {
  // 1. Find and delete associated storage images
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(DOCTORS_FOLDER, { search: id });

  if (files && files.length > 0) {
    const pathsToDelete = files
      .filter((f) => f.name.startsWith(`${id}.`))
      .map((f) => `${DOCTORS_FOLDER}/${f.name}`);

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(pathsToDelete);

      if (storageError) {
        console.warn("Could not delete some storage files for doctor:", storageError.message);
      }
    }
  }

  // 2. Delete DB row
  const { error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting doctor row:", error.message);
    throw new Error(error.message);
  }
};
