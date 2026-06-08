import { supabase } from "../../../supabaseClient";

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting user:", error.message);
    throw new Error(error.message);
  }
};
