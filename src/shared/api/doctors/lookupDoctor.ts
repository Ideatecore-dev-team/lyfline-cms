import { supabase } from "../../../supabaseClient";
import { type Doctor } from "../doctor";

const BUCKET_NAME = "Lyfline Files";
const DOCTORS_FOLDER = "Doctors";

// Helper to map DB row to Doctor type
export const mapDoctorRow = (row: any, imageUrl: string | null): Doctor => ({
  id: row.id,
  doctorName: row.doctor_name,
  hospital: row.partners?.hospital_name || "Unknown Hospital",
  country: row.partners?.country || "Unknown Country",
  speciality: row.doctor_specialty?.[0] || row.doctor_title || "",
  specialities: row.doctor_specialty || [],
  qualifications: row.doctor_qualification || [],
  languages: row.doctor_language || [],
  imageUrl: imageUrl || null,
  hospitalId: row.hospital_id,
  createdAt: row.created_at,
  description: row.description || "",
});

export const getDoctors = async (filters?: {
  doctorName?: string;
  hospital?: string;
  speciality?: string;
  country?: string;
}): Promise<Doctor[]> => {
  let query = supabase.from("doctors").select("*, partners(*)");

  if (filters?.doctorName?.trim()) {
    query = query.ilike("doctor_name", `%${filters.doctorName.trim()}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error looking up doctors:", error.message);
    throw new Error(error.message);
  }

  // Fetch all file listings in storage to resolve images in one pass
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(DOCTORS_FOLDER);

  const imageMap: Record<string, string> = {};
  if (files) {
    files.forEach((file) => {
      const dotIndex = file.name.indexOf(".");
      const doctorId = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      if (doctorId && doctorId !== ".emptyFolderPlaceholder") {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${DOCTORS_FOLDER}/${file.name}`);
        imageMap[doctorId] = urlData.publicUrl;
      }
    });
  }

  let results = (data || []).map((row) => mapDoctorRow(row, imageMap[row.id] || null));

  // Apply filters that require joined fields (if filters are set)
  if (filters?.hospital) {
    results = results.filter((d) => d.hospital === filters.hospital);
  }
  if (filters?.country) {
    results = results.filter((d) => d.country === filters.country);
  }
  if (filters?.speciality) {
    results = results.filter(
      (d) =>
        d.speciality.toLowerCase() === filters.speciality!.toLowerCase() ||
        d.specialities?.some((s) => s.toLowerCase() === filters.speciality!.toLowerCase())
    );
  }

  return results;
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

  // Resolve image for this single doctor
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(DOCTORS_FOLDER, { search: id });

  let imageUrl: string | null = null;
  if (files && files.length > 0) {
    const matchingFile = files.find((f) => f.name.startsWith(`${id}.`));
    if (matchingFile) {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${DOCTORS_FOLDER}/${matchingFile.name}`);
      imageUrl = urlData.publicUrl;
    }
  }

  return mapDoctorRow(data, imageUrl);
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
    .map((row: any) => row.partners?.hospital_name)
    .filter(Boolean);
  return Array.from(new Set(hospitals));
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
  (data || []).forEach((row: any) => {
    if (row.doctor_specialty && Array.isArray(row.doctor_specialty)) {
      specialities.push(...row.doctor_specialty);
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
    .map((row: any) => row.partners?.country)
    .filter(Boolean);
  return Array.from(new Set(countries));
};
