import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../shared/api/auth";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import InputBox from "../../component/inputbox";
import UploadFile from "../../component/uploadFile";
import Dropdown from "../../component/dropdown";
import { getPartners, type Partner } from "../../shared/api/partner";

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

export default function ManageDoctorsForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [currentUser] = useState(() => authApi.getCurrentUser());

    const [doctorName, setDoctorName] = useState("");
    const [doctorTitle, setDoctorTitle] = useState("");
    const [hospital, setHospital] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    
    // Partnerships for dropdown lookup
    const [partners, setPartners] = useState<Partner[]>([]);
    
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load dynamic hospitals list from partners table
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getPartners();
                setPartners(data);
            } catch (err) {
                console.error("Error loading partners for hospitals dropdown:", err);
            }
        };
        loadInitialData();
    }, []);

    // Load existing doctor info if in edit mode (UI first placeholder)
    useEffect(() => {
        if (!id) return;

        const loadDoctor = async () => {
            setLoading(true);
            try {
                // UI first placeholder: we look up doctor from localStorage list
                const data = localStorage.getItem("lyfline_doctors");
                const doctorsList = data ? JSON.parse(data) : [];
                const doctor = doctorsList.find((d: any) => d.id === id);
                if (doctor) {
                    setDoctorName(doctor.doctorName);
                    setDoctorTitle(doctor.speciality); // Map speciality to doctor title in this UI
                    setHospital(doctor.hospital);
                    setImageUrl(doctor.imageUrl || null);
                } else {
                    setError("Doctor not found.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load doctor details.");
            } finally {
                setLoading(false);
            }
        };

        loadDoctor();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!doctorName.trim() || !doctorTitle.trim() || !hospital) {
            setError("Please fill out all required fields.");
            return;
        }

        if (!imageUrl && !imageFile) {
            setError("Doctor Image is required.");
            return;
        }

        setSubmitting(true);
        try {
            console.log("Submitting Doctor UI:", {
                doctorName,
                doctorTitle,
                hospital,
                imageUrl,
                imageFile,
                imageRemoved,
            });
            // Logic can be filled in here when database integration is requested
            navigate("/cms/doctors");
        } catch (err: any) {
            setError(err.message || "Failed to save doctor.");
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
                        You do not have the required administrative permissions to manage doctors.
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
                    onClick={() => navigate("/cms/doctors")}
                    text="Back"
                    leftIcon="Left 1"
                    variant="ghost-black"
                />

                {/* Header Block */}
                <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-[#9EB7DA] text-sm font-normal font-sans tracking-wider uppercase">
                            DOCTOR FORM
                        </div>
                        <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
                            Doctor Information
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
                            {/* Doctor Image Upload */}
                            <UploadFile
                                label={
                                    <span>
                                        Doctor Image <span className="text-red-500">*</span>
                                    </span>
                                }
                                descriptionPrefix="Preferable Size"
                                descriptionValue="(150px * 150px)"
                                multiple={false}
                                defaultImageUrl={imageUrl || undefined}
                                defaultImageLabel="Current Doctor Image"
                                onRemoveDefaultImage={() => {
                                    setImageUrl(null);
                                    setImageFile(null);
                                    setImageRemoved(true);
                                }}
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        setImageFile(files[0]);
                                        setImageUrl(URL.createObjectURL(files[0]));
                                        setImageRemoved(false);
                                    } else {
                                        setImageFile(null);
                                        setImageUrl(null);
                                        setImageRemoved(true);
                                    }
                                }}
                            />

                            {/* Doctor Name Input */}
                            <InputBox
                                label={
                                    <span>
                                        Doctor Name <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. Dr. John Doe"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Doctor Title Input */}
                            <InputBox
                                label={
                                    <span>
                                        Doctor Title <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. Cardiologist"
                                value={doctorTitle}
                                onChange={(e) => setDoctorTitle(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Hospital Dropdown */}
                            <Dropdown
                                label={
                                    <span>
                                        Hospital <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="Select hospital..."
                                options={partners.map((p) => ({
                                    value: p.hospitalName,
                                    label: p.hospitalName,
                                }))}
                                value={hospital}
                                onChange={(val) => setHospital(val)}
                                multiple={false}
                                containerClassName="max-w-none"
                            />
                        </div>

                        <div className="self-stretch h-px bg-slate-100" />

                        {/* Action Buttons */}
                        <div className="self-stretch flex justify-end gap-4 pt-2 w-full">
                            <Button
                                type="button"
                                onClick={() => navigate("/cms/doctors")}
                                text="Cancel"
                                variant="outline-primary"
                                className="w-36"
                            />
                            <Button
                                type="submit"
                                disabled={submitting}
                                text={submitting ? "Saving..." : "Save Doctor"}
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
