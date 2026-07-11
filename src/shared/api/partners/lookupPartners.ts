import { supabase } from "../../../supabaseClient";
import { type Partner } from "../partner";

interface PartnerRow {
  id: string;
  hospital_name: string;
  city: string;
  country: string;
  description?: string | null;
  contact?: string | null;
  email?: string | null;
  address: string;
  hospital_logo?: string | null;
  hospital_images?: string[];
  google_maps_link?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to map DB row to Partner type
export const mapPartnerRow = (row: PartnerRow): Partner => ({
  id: row.id,
  hospitalName: row.hospital_name,
  city: row.city,
  country: row.country,
  description: row.description || undefined,
  contact: row.contact || undefined,
  email: row.email || undefined,
  address: row.address,
  hospitalLogo: row.hospital_logo || undefined,
  hospitalImages: row.hospital_images || [],
  googleMapsLink: row.google_maps_link || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getPartners = async (filters?: { hospitalName?: string; country?: string }): Promise<Partner[]> => {
  let query = supabase.from("partners").select("*");

  if (filters?.hospitalName?.trim()) {
    query = query.ilike("hospital_name", `%${filters.hospitalName.trim()}%`);
  }
  if (filters?.country) {
    query = query.eq("country", filters.country);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error looking up partners:", error.message);
    throw new Error(error.message);
  }

  return (data || []).map(mapPartnerRow);
};

export const getConsistingCountries = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("partners")
    .select("country");

  if (error) {
    console.error("Error fetching unique countries:", error.message);
    throw new Error(error.message);
  }

  const countries = (data || []).map((row) => row.country).filter(Boolean);
  return Array.from(new Set(countries));
};

export const getPartnerById = async (id: string): Promise<Partner | null> => {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Error looking up partner by id ${id}:`, error.message);
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapPartnerRow(data);
};
