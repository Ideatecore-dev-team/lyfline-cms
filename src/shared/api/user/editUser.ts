import bcrypt from "bcryptjs";
import { supabase } from "../../../supabaseClient";
import { type User } from "../auth";

export const editUser = async (
  id: string,
  name: string,
  email: string,
  password?: string
): Promise<User> => {
  const updateData: Record<string, any> = {
    username: name,
    email: email,
    role: "admin", // Always "admin" when pushed to the database
    updated_at: new Date().toISOString(),
  };

  if (password) {
    updateData.password_hash = bcrypt.hashSync(password, 10);
  }

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error editing user:", error.message);
    if (error.message.includes("users_email_key")) {
      throw new Error("A user with this email already exists.");
    }
    if (error.message.includes("users_username_key")) {
      throw new Error("A user with this username already exists.");
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Failed to update user.");
  }

  return {
    id: data.id,
    name: data.username,
    email: data.email,
    role: data.role as "super_admin" | "admin" | "editor",
    createdAt: data.created_at,
  };
};
