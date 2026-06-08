export interface Doctor {
  id: string;
  doctorName: string;
  hospital: string;
  country: string;
  speciality: string;
  createdAt: string;
}

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    doctorName: "Dr. Albert Einstein",
    hospital: "Mayo Clinic",
    country: "USA",
    speciality: "Cardiology",
    createdAt: "2026-01-10T09:00:00Z"
  },
  {
    id: "doc-2",
    doctorName: "Dr. Marie Curie",
    hospital: "Singapore General Hospital",
    country: "Singapore",
    speciality: "Oncology",
    createdAt: "2026-02-12T11:30:00Z"
  },
  {
    id: "doc-3",
    doctorName: "Dr. Alexander Fleming",
    hospital: "Mayo Clinic",
    country: "USA",
    speciality: "Immunology",
    createdAt: "2026-03-01T15:20:00Z"
  },
  {
    id: "doc-4",
    doctorName: "Dr. Rosalind Franklin",
    hospital: "Charité - Universitätsmedizin Berlin",
    country: "Germany",
    speciality: "Genetics",
    createdAt: "2026-03-18T10:10:00Z"
  },
  {
    id: "doc-5",
    doctorName: "Dr. Louis Pasteur",
    hospital: "Singapore General Hospital",
    country: "Singapore",
    speciality: "Microbiology",
    createdAt: "2026-04-05T08:45:00Z"
  }
];

const initializeDoctorsDB = () => {
  if (!localStorage.getItem("lyfline_doctors")) {
    localStorage.setItem("lyfline_doctors", JSON.stringify(DEFAULT_DOCTORS));
  }
};

initializeDoctorsDB();

export const getDoctors = async (filters?: {
  doctorName?: string;
  hospital?: string;
  speciality?: string;
}): Promise<Doctor[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const data = localStorage.getItem("lyfline_doctors");
  let doctors: Doctor[] = data ? JSON.parse(data) : [];

  if (filters?.doctorName?.trim()) {
    const term = filters.doctorName.trim().toLowerCase();
    doctors = doctors.filter((d) => d.doctorName.toLowerCase().includes(term));
  }
  if (filters?.hospital) {
    doctors = doctors.filter((d) => d.hospital === filters.hospital);
  }
  if (filters?.speciality) {
    doctors = doctors.filter((d) => d.speciality === filters.speciality);
  }

  // Sort by createdAt descending
  return doctors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getConsistingHospitals = async (): Promise<string[]> => {
  const data = localStorage.getItem("lyfline_doctors");
  const doctors: Doctor[] = data ? JSON.parse(data) : [];
  const hospitals = doctors.map((d) => d.hospital).filter(Boolean);
  return Array.from(new Set(hospitals));
};

export const getConsistingSpecialities = async (): Promise<string[]> => {
  const data = localStorage.getItem("lyfline_doctors");
  const doctors: Doctor[] = data ? JSON.parse(data) : [];
  const specialities = doctors.map((d) => d.speciality).filter(Boolean);
  return Array.from(new Set(specialities));
};

export const deleteDoctor = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const data = localStorage.getItem("lyfline_doctors");
  const doctors: Doctor[] = data ? JSON.parse(data) : [];
  const filtered = doctors.filter((d) => d.id !== id);
  localStorage.setItem("lyfline_doctors", JSON.stringify(filtered));
};
