import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../shared/api/auth";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import InputBox from "../../component/inputbox";
import UploadFile from "../../component/uploadFile";
import Dropdown from "../../component/dropdown";
import DescriptionBox from "../../component/descriptionBox";
import { addPartner, editPartner, getPartnerById } from "../../shared/api/partner";

const Icon = ({ name, className = "size-5 bg-current" }: { name: string; className?: string }) => (
    <span
        style={{
            maskImage: `url("/icons/${name}.svg")`,
            WebkitMaskImage: `url("/icons/${name}.svg")`,
        }}
        className={`mask-contain mask-no-repeat mask-center shrink-0 inline-block ${className}`}
        aria-hidden="true"
    />
);

export default function ManagePartnersForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [currentUser] = useState(() => authApi.getCurrentUser());

    const [partnerName, setPartnerName] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoRemoved, setLogoRemoved] = useState(false);
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("Indonesia");
    const [description, setDescription] = useState("");
    const [hospitalContact, setHospitalContact] = useState("");
    const [hospitalEmail, setHospitalEmail] = useState("");
    const [hospitalAddress, setHospitalAddress] = useState("");
    const [googleMapsUrl, setGoogleMapsUrl] = useState("");
    const [existingHospitalImages, setExistingHospitalImages] = useState<string[]>([]);
    const [newHospitalImageFiles, setNewHospitalImageFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const loadPartner = async () => {
            setLoading(true);
            try {
                const partner = await getPartnerById(id);
                if (partner) {
                    setPartnerName(partner.hospitalName);
                    setCity(partner.city);
                    setCountry(partner.country);
                    setDescription(partner.description || "");
                    setHospitalContact(partner.contact || "");
                    setHospitalEmail(partner.email || "");
                    setHospitalAddress(partner.address);
                    setGoogleMapsUrl(partner.googleMapsLink || "");
                    setLogoUrl(partner.hospitalLogo || null);
                    setExistingHospitalImages(partner.hospitalImages || []);
                } else {
                    setError("Partner not found.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load partner details.");
            } finally {
                setLoading(false);
            }
        };

        loadPartner();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (
            !partnerName.trim() ||
            !city.trim() ||
            !country ||
            !hospitalContact.trim() ||
            !hospitalEmail.trim() ||
            !hospitalAddress.trim()
        ) {
            setError("Please fill out all required fields.");
            return;
        }

        if (!logoUrl && !logoFile) {
            setError("Partner Logo is required.");
            return;
        }

        if (existingHospitalImages.length === 0 && newHospitalImageFiles.length === 0) {
            setError("At least one Hospital Image is required.");
            return;
        }

        setSubmitting(true);
        try {
            const partnerData = {
                hospitalName: partnerName.trim(),
                city: city.trim(),
                country,
                description: description.trim(),
                contact: hospitalContact.trim(),
                email: hospitalEmail.trim(),
                address: hospitalAddress.trim(),
                googleMapsLink: googleMapsUrl.trim(),
            };

            if (id) {
                await editPartner(id, partnerData, logoFile, logoRemoved, newHospitalImageFiles, existingHospitalImages);
            } else {
                await addPartner(partnerData, logoFile, newHospitalImageFiles);
            }

            navigate("/cms/partners");
        } catch (err: any) {
            setError(err.message || "Failed to save partner.");
        } finally {
            setSubmitting(false);
        }
    };

    if (currentUser && currentUser.role !== "super_admin" && currentUser.role !== "admin") {
        return (
            <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 overflow-hidden">
                <Sidebar minimal />
                <div className="flex-1 p-8 bg-white rounded-[32px] flex flex-col items-center justify-center min-h-[400px] border border-gray-100 shadow-sm text-center">
                    <div className="p-4 bg-red-50 rounded-full text-red-500 mb-4">
                        <Icon name="Danger Circle" className="size-12 bg-current" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 font-sans">Access Denied</h2>
                    <p className="text-sm text-slate-500 max-w-sm mt-2 font-sans">
                        You do not have the required administrative permissions to manage partners.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 bg-background">
                <Sidebar minimal />
                <div className="flex-1 p-8 bg-white rounded-[32px] flex flex-col items-center justify-center min-h-[400px] border border-gray-100 shadow-sm text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <Sidebar minimal />

            {/* Main Content Card */}
            <div className="flex-1 p-6 bg-white rounded-[32px] inline-flex flex-col justify-start items-start gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
                {/* Back Button */}
                <Button
                    onClick={() => navigate("/cms/partners")}
                    text="Back"
                    leftIcon="Left 1"
                    variant="ghost-black"
                />

                {/* Header Block */}
                <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-[#9EB7DA] text-sm font-normal font-sans tracking-wider uppercase">
                            PARTNER FORM
                        </div>
                        <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
                            Partner Information
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />

                {error && (
                    <div className="self-stretch p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                        <Icon name="Danger Circle" className="size-5 bg-current" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Content Area - Full Width */}
                <div className="self-stretch">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                        <div className="flex flex-col gap-4">
                            {/* Partner Logo Upload */}
                            <UploadFile
                                label={
                                    <span>
                                        Partner Logo <span className="text-red-500">*</span>
                                    </span>
                                }
                                descriptionPrefix="Preferable Size"
                                descriptionValue="(270px * 148px)"
                                multiple={false}
                                defaultImageUrl={logoUrl || undefined}
                                defaultImageLabel="Current Hospital Logo"
                                onRemoveDefaultImage={() => {
                                    setLogoUrl(null);
                                    setLogoFile(null);
                                    setLogoRemoved(true);
                                }}
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        setLogoFile(files[0]);
                                        setLogoUrl(URL.createObjectURL(files[0]));
                                        setLogoRemoved(false);
                                    } else {
                                        setLogoFile(null);
                                        setLogoUrl(null);
                                        setLogoRemoved(true);
                                    }
                                }}
                            />

                            {/* Partner Name Input */}
                            <InputBox
                                label={
                                    <span>
                                        Hospital Name <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. Mayo Clinic"
                                value={partnerName}
                                onChange={(e) => setPartnerName(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* City Input */}
                            <InputBox
                                label={
                                    <span>
                                        City <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. Singapore"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Country Dropdown */}
                            <Dropdown
                                label={
                                    <span>
                                        Country <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="Select country..."
                                options={[{ value: "Indonesia", label: "Indonesia" }]}
                                value={country}
                                onChange={(val) => setCountry(val)}
                                multiple={false}
                                containerClassName="max-w-none"
                            />

                            {/* Partner Description */}
                            <DescriptionBox
                                label="Partner Description"
                                placeholder="Write something about the partner..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                containerClassName="max-w-none"
                            />
                        </div>

                        <div className="self-stretch h-px bg-slate-100" />

                        <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
                            Partner Details
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            {/* Hospital Contact */}
                            <InputBox
                                label={
                                    <span>
                                        Hospital Contact <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. +62 812-3456-7890"
                                value={hospitalContact}
                                onChange={(e) => setHospitalContact(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Hospital Email */}
                            <InputBox
                                label={
                                    <span>
                                        Hospital Email <span className="text-red-500">*</span>
                                    </span>
                                }
                                type="email"
                                placeholder="e.g. contact@hospital.com"
                                value={hospitalEmail}
                                onChange={(e) => setHospitalEmail(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Hospital Address */}
                            <InputBox
                                label={
                                    <span>
                                        Hospital Address <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. Jl. Jend. Sudirman No. 1..."
                                value={hospitalAddress}
                                onChange={(e) => setHospitalAddress(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Google Maps Embed URL */}
                            <InputBox
                                label="Google Maps Embed URL"
                                placeholder="e.g. https://www.google.com/maps/embed?pb=..."
                                value={googleMapsUrl}
                                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                containerClassName="max-w-none"
                            />

                            {/* Hospital Image */}
                            <UploadFile
                                label={
                                    <span>
                                        Hospital Image <span className="text-red-500">*</span>
                                    </span>
                                }
                                descriptionPrefix="Preferable Size"
                                descriptionValue="(490px * 296px) - Maximum 4 images"
                                multiple={true}
                                maxFiles={4}
                                existingImageUrls={existingHospitalImages}
                                onRemoveExistingImage={(url) => {
                                    setExistingHospitalImages((prev) => prev.filter((img) => img !== url));
                                }}
                                onChange={(files) => {
                                    setNewHospitalImageFiles(files);
                                }}
                            />
                        </div>

                        <div className="self-stretch h-px bg-slate-100" />

                        {/* Action Buttons */}
                        <div className="self-stretch flex justify-end gap-4 pt-2 w-full">
                            <Button
                                type="button"
                                onClick={() => navigate("/cms/partners")}
                                text="Cancel"
                                variant="outline-primary"
                                className="w-36"
                            />
                            <Button
                                type="submit"
                                disabled={submitting}
                                text={submitting ? "Saving..." : "Save Partner"}
                                variant="primary"
                                className="w-40"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
