import { supabase } from "../../../supabaseClient";
import { type Doctor } from "../doctor";



interface DoctorRow {
  id: string;
  doctor_name: string;
  doctor_title: string;
  doctor_specialty?: string[];
  doctor_qualification?: string[];
  doctor_language?: string[];
  hospital_id: string;
  created_at: string;
  description?: string;
  avatarUrl?: string | null;
  type?: string;
  partners?: {
    hospital_name?: string;
    country?: string;
  } | null;
}

// Helper to map DB row to Doctor type
export const mapDoctorRow = (row: DoctorRow): Doctor => ({
  id: row.id,
  doctorName: row.doctor_name,
  hospital: row.partners?.hospital_name || "Unknown Hospital",
  country: row.partners?.country || "Unknown Country",
  speciality: row.doctor_specialty?.[0] || row.doctor_title || "",
  specialities: row.doctor_specialty || [],
  qualifications: row.doctor_qualification || [],
  languages: row.doctor_language || [],
  imageUrl: row.avatarUrl || null,
  hospitalId: row.hospital_id,
  createdAt: row.created_at,
  description: row.description || "",
  type: row.type,
});

export interface PaginatedDoctorsResult {
  data: Doctor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getDoctors = async (options?: {
  doctorName?: string;
  hospital?: string;
  speciality?: string;
  country?: string;
  page?: number;
  limit?: number;
  all?: boolean;
}): Promise<PaginatedDoctorsResult> => {
  const isAll = options?.all === true;
  const page = options?.page ?? 1;
  const limit = isAll ? 10000 : (options?.limit ?? 10);

  const selectClause = (options?.hospital || options?.country) ? "*, partners!inner(*)" : "*, partners(*)";
  let query = supabase.from("doctors").select(selectClause, { count: "exact" });

  if (options?.doctorName?.trim()) {
    query = query.ilike("doctor_name", `%${options.doctorName.trim()}%`);
  }
  if (options?.hospital) {
    query = query.eq("partners.hospital_name", options.hospital);
  }
  if (options?.country) {
    query = query.eq("partners.country", options.country);
  }

  query = query.order("created_at", { ascending: false });

  if (!isAll) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error looking up doctors:", error.message);
    throw new Error(error.message);
  }

  let results = (data || []).map(mapDoctorRow);

  if (options?.speciality) {
    results = results.filter(
      (d) =>
        d.speciality.toLowerCase() === options.speciality!.toLowerCase() ||
        d.specialities?.some((s) => s.toLowerCase() === options.speciality!.toLowerCase())
    );
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: results,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getDoctorById = async (id: string): Promise<Doctor | null> => {
  const { data, error } = await supabase
    .from("doctors")
    .select("*, partners(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Error looking up doctor by id ${id}:`, error.message);
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapDoctorRow(data);
};

export const getConsistingHospitals = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("doctors")
    .select("partners(hospital_name)");

  if (error) {
    console.error("Error fetching unique hospitals:", error.message);
    throw new Error(error.message);
  }

  const hospitals = (data || [])
    .map((row) => (row.partners as { hospital_name?: string } | null)?.hospital_name)
    .filter(Boolean);
  return Array.from(new Set(hospitals as string[]));
};

export const getConsistingSpecialities = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("doctors")
    .select("doctor_specialty");

  if (error) {
    console.error("Error fetching unique specialities:", error.message);
    throw new Error(error.message);
  }

  const specialities: string[] = [];
  (data || []).forEach((row) => {
    const list = row.doctor_specialty as string[] | null;
    if (list && Array.isArray(list)) {
      specialities.push(...list);
    }
  });
  return Array.from(new Set(specialities.filter(Boolean)));
};

export const getConsistingCountries = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("doctors")
    .select("partners(country)");

  if (error) {
    console.error("Error fetching unique countries:", error.message);
    throw new Error(error.message);
  }

  const countries = (data || [])
    .map((row) => (row.partners as { country?: string } | null)?.country)
    .filter(Boolean);
  return Array.from(new Set(countries as string[]));
};
