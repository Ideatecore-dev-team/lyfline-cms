import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../shared/api/auth";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import InputBox from "../../component/inputbox";
import UploadFile from "../../component/uploadFile";
import Dropdown from "../../component/dropdown";
import Notification from "../../component/notification";
import { getPartners, type Partner } from "../../shared/api/partner";
import { addDoctor, editDoctor, getDoctorById } from "../../shared/api/doctor";

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
    const [hospitalId, setHospitalId] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);

    // Partnerships for dropdown lookup
    const [partners, setPartners] = useState<Partner[]>([]);

    const [specialities, setSpecialities] = useState<string[]>([]);
    const [qualifications, setQualifications] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "default";
    }>({
        isOpen: false,
        message: "",
        type: "default",
    });

    const showNotif = (message: string, type: "success" | "error" | "default" = "success") => {
        setNotification({
            isOpen: true,
            message,
            type,
        });
    };

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

    // Load existing doctor info if in edit mode
    useEffect(() => {
        if (!id) return;

        const loadDoctor = async () => {
            setLoading(true);
            try {
                const doctor = await getDoctorById(id);
                if (doctor) {
                    setDoctorName(doctor.doctorName);
                    setDoctorTitle(doctor.speciality); // Map speciality in the model to doctorTitle
                    setHospitalId(doctor.hospitalId || "");
                    setImageUrl(doctor.imageUrl || null);
                    setSpecialities(doctor.specialities || []);
                    setQualifications(doctor.qualifications || []);
                    setLanguages(doctor.languages || []);
                } else {
                    showNotif("Doctor not found.", "error");
                }
            } catch (err: any) {
                showNotif(err.message || "Failed to load doctor details.", "error");
            } finally {
                setLoading(false);
            }
        };

        loadDoctor();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!doctorName.trim() || !doctorTitle.trim() || !hospitalId) {
            showNotif("Please fill out all required fields.", "error");
            return;
        }

        if (!imageUrl && !imageFile) {
            showNotif("Doctor Image is required.", "error");
            return;
        }

        setSubmitting(true);
        try {
            console.log("Submitting Doctor to Supabase:", {
                doctorName,
                doctorTitle,
                hospitalId,
                imageUrl,
                imageFile,
                imageRemoved,
                specialities,
                qualifications,
                languages,
            });

            const doctorData = {
                doctorName,
                doctorTitle,
                hospitalId,
                specialities,
                qualifications,
                languages,
            };

            const msg = id
                ? `Doctor "${doctorName.trim()}" updated successfully!`
                : `Doctor "${doctorName.trim()}" added successfully!`;

            if (id) {
                await editDoctor(id, doctorData, imageFile, imageRemoved);
            } else {
                await addDoctor(doctorData, imageFile);
            }

            navigate("/cms/doctors", { state: { successMessage: msg } });
        } catch (err: any) {
            showNotif(err.message || "Failed to save doctor.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (currentUser && currentUser.role !== "super_admin" && currentUser.role !== "admin") {
        return (
            <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
                <div className="hidden lg:block shrink-0">
                    <Sidebar minimal />
                </div>
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
            <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
                <div className="hidden lg:block shrink-0">
                    <Sidebar minimal />
                </div>
                <div className="flex-1 p-8 bg-white rounded-[32px] flex flex-col items-center justify-center min-h-[400px] border border-gray-100 shadow-sm text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <div className="hidden lg:block shrink-0">
                <Sidebar minimal />
            </div>

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
                                descriptionValue="(270px * 148px)"
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
                                    value: p.id,
                                    label: p.hospitalName,
                                }))}
                                value={hospitalId}
                                onChange={(val) => setHospitalId(val)}
                                multiple={false}
                                containerClassName="max-w-none"
                            />
                        </div>

                        <div className="self-stretch h-px bg-slate-100" />

                        <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
                            Doctor Details
                        </div>

                        {/* Speciality */}
                        <div className="flex flex-col gap-3 w-full">
                            <div className="self-stretch px-2.5 py-2.5 bg-primary/10 rounded-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                                <div className="w-full sm:w-[486px] flex justify-start items-center gap-3">
                                    <Icon name="Nurse" className="size-5 bg-primary" />
                                    <div className="justify-start">
                                        <span className="text-primary text-base font-medium font-sans">Speciality</span>
                                        <span className="text-[#9EB7DA] text-base font-medium font-sans"> (Can be multiple)</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSpecialities([...specialities, ""])}
                                    className="h-9 w-full sm:w-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg outline-1 -outline-offset-1 outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95 shrink-0"
                                    title="Add Speciality"
                                >
                                    <Icon name="Add" className="size-5 bg-slate-500" />
                                </button>
                            </div>
                            
                            {specialities.length === 0 ? (
                                <div className="self-stretch text-slate-400 text-sm font-normal font-sans pl-8 py-2">
                                    To add Speciality click on <span className="text-primary font-medium">Plus</span> Icon Button
                                </div>
                            ) : (
                                specialities.map((spec, index) => (
                                    <div key={index} className="self-stretch flex flex-row items-end gap-4 w-full pl-8 animate-in fade-in-50 duration-200">
                                        <InputBox
                                            label={`Speciality ${index + 1}`}
                                            placeholder="Enter speciality..."
                                            value={spec}
                                            onChange={(e) => {
                                                const updated = [...specialities];
                                                updated[index] = e.target.value;
                                                setSpecialities(updated);
                                            }}
                                            containerClassName="flex-1 max-w-none"
                                        />
                                        <div className="h-12 flex items-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSpecialities(specialities.filter((_, i) => i !== index));
                                                }}
                                                className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                                title="Delete Speciality"
                                            >
                                                <Icon name="Delete 2" className="size-5 bg-current" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Qualification */}
                        <div className="flex flex-col gap-3 w-full">
                            <div className="self-stretch px-2.5 py-2.5 bg-primary/10 rounded-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                                <div className="w-full sm:w-[486px] flex justify-start items-center gap-3">
                                    <Icon name="Document Align Left 5" className="size-5 bg-primary" />
                                    <div className="justify-start">
                                        <span className="text-primary text-base font-medium font-sans">Qualification</span>
                                        <span className="text-[#9EB7DA] text-base font-medium font-sans"> (Can be multiple)</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setQualifications([...qualifications, ""])}
                                    className="h-9 w-full sm:w-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg outline-1 -outline-offset-1 outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95 shrink-0"
                                    title="Add Qualification"
                                >
                                    <Icon name="Add" className="size-5 bg-slate-500" />
                                </button>
                            </div>

                            {qualifications.length === 0 ? (
                                <div className="self-stretch text-slate-400 text-sm font-normal font-sans pl-8 py-2">
                                    To add Qualification click on <span className="text-primary font-medium">Plus</span> Icon Button
                                </div>
                            ) : (
                                qualifications.map((qual, index) => (
                                    <div key={index} className="self-stretch flex flex-row items-end gap-4 w-full pl-8 animate-in fade-in-50 duration-200">
                                        <InputBox
                                            label={`Qualification ${index + 1}`}
                                            placeholder="Enter qualification..."
                                            value={qual}
                                            onChange={(e) => {
                                                const updated = [...qualifications];
                                                updated[index] = e.target.value;
                                                setQualifications(updated);
                                            }}
                                            containerClassName="flex-1 max-w-none"
                                        />
                                        <div className="h-12 flex items-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQualifications(qualifications.filter((_, i) => i !== index));
                                                }}
                                                className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                                title="Delete Qualification"
                                            >
                                                <Icon name="Delete 2" className="size-5 bg-current" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Languages */}
                        <div className="flex flex-col gap-3 w-full">
                            <div className="self-stretch px-2.5 py-2.5 bg-primary/10 rounded-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                                <div className="w-full sm:w-[486px] flex justify-start items-center gap-3">
                                    <Icon name="Message 18" className="size-5 bg-primary" />
                                    <div className="justify-start">
                                        <span className="text-primary text-base font-medium font-sans">Languages</span>
                                        <span className="text-[#9EB7DA] text-base font-medium font-sans"> (Can be multiple)</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setLanguages([...languages, ""])}
                                    className="h-9 w-full sm:w-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg outline-1 -outline-offset-1 outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95 shrink-0"
                                    title="Add Languages"
                                >
                                    <Icon name="Add" className="size-5 bg-slate-500" />
                                </button>
                            </div>

                            {languages.length === 0 ? (
                                <div className="self-stretch text-slate-400 text-sm font-normal font-sans pl-8 py-2">
                                    To add Language click on <span className="text-primary font-medium">Plus</span> Icon Button
                                </div>
                            ) : (
                                languages.map((lang, index) => (
                                    <div key={index} className="self-stretch flex flex-row items-end gap-4 w-full pl-8 animate-in fade-in-50 duration-200">
                                        <InputBox
                                            label={`Language ${index + 1}`}
                                            placeholder="Enter language..."
                                            value={lang}
                                            onChange={(e) => {
                                                const updated = [...languages];
                                                updated[index] = e.target.value;
                                                setLanguages(updated);
                                            }}
                                            containerClassName="flex-1 max-w-none"
                                        />
                                        <div className="h-12 flex items-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLanguages(languages.filter((_, i) => i !== index));
                                                }}
                                                className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                                title="Delete Language"
                                            >
                                                <Icon name="Delete 2" className="size-5 bg-current" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="self-stretch h-px bg-slate-100" />

                        {/* Action Buttons */}
                        <div className="self-stretch flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 w-full">
                            <Button
                                type="button"
                                onClick={() => navigate("/cms/doctors")}
                                text="Cancel"
                                variant="outline-primary"
                                className="w-full sm:w-36"
                            />
                            <Button
                                type="submit"
                                disabled={submitting}
                                text={submitting ? "Saving..." : "Save Doctor"}
                                variant="primary"
                                className="w-full sm:w-40"
                            />
                        </div>
                    </form>
                </div>
            </div>

            <Notification
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
