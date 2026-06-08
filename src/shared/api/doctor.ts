export interface Doctor {
  id: string;
  doctorName: string;
  hospital: string;
  country: string;
  speciality: string;
  specialities?: string[];
  qualifications?: string[];
  languages?: string[];
  imageUrl?: string | null;
  hospitalId?: string;
  createdAt: string;
}

export {
  getDoctors,
  getDoctorById,
  getConsistingHospitals,
  getConsistingSpecialities,
  getConsistingCountries
} from "./doctors/lookupDoctor";

export { addDoctor } from "./doctors/addDoctor";
export { editDoctor } from "./doctors/editDoctor";
export { deleteDoctor } from "./doctors/deleteDoctor";
