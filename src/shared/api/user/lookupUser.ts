import { supabase } from "../../../supabaseClient";
import { type User } from "../auth";

export const lookupUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error looking up users:", error.message);
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.username,
    email: row.email,
    role: row.role as "super_admin" | "admin" | "editor",
    createdAt: row.created_at,
  }));
};
