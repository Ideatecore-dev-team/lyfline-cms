export interface Partner {
  id: string;
  hospitalName: string;
  city: string;
  country: string;
  description?: string;
  contact?: string;
  email?: string;
  address: string;
  hospitalLogo?: string;
  hospitalImages?: string[];
  googleMapsLink?: string;
  createdAt: string;
  updatedAt?: string;
}

export { addPartner } from "./partners/addPartners";
export { editPartner } from "./partners/editPartners";
export { getPartners, getPartnerById, getConsistingCountries } from "./partners/lookupPartners";
export { deletePartner } from "./partners/deletePartners";
