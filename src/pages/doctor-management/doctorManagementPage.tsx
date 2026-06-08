import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Doctor, getDoctors, deleteDoctor, getConsistingHospitals, getConsistingSpecialities } from "../../shared/api/doctor";
import { authApi } from "../../shared/api/auth";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import DeleteConfirmationModal from "../../component/modal/deleteConfirmation";
import InputBox from "../../component/inputbox";
import Dropdown from "../../component/dropdown";

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

function DoctorManagementPage() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [hospitals, setHospitals] = useState<string[]>([]);
    const [specialities, setSpecialities] = useState<string[]>([]);
    const [currentUser] = useState(() => authApi.getCurrentUser());
    const [loading, setLoading] = useState(true);

    // Filter states
    const [filterName, setFilterName] = useState("");
    const [filterHospital, setFilterHospital] = useState("");
    const [filterSpeciality, setFilterSpeciality] = useState("");

    // Form states
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

    const fetchDoctors = async (nameFilter = filterName, hospitalFilter = filterHospital, specialityFilter = filterSpeciality) => {
        setLoading(true);
        try {
            const data = await getDoctors({
                doctorName: nameFilter,
                hospital: hospitalFilter,
                speciality: specialityFilter,
            });
            setDoctors(data);
        } catch (err) {
            console.error("Error loading doctors", err);
        } finally {
            setLoading(false);
        }
    };

    const loadFilterOptions = async () => {
        try {
            const [hospitalsList, specialitiesList] = await Promise.all([
                getConsistingHospitals(),
                getConsistingSpecialities(),
            ]);
            setHospitals(hospitalsList);
            setSpecialities(specialitiesList);
        } catch (err) {
            console.error("Error loading filters list", err);
        }
    };

    useEffect(() => {
        loadFilterOptions();
    }, []);

    // Debounced automatic filtering
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDoctors(filterName, filterHospital, filterSpeciality);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [filterName, filterHospital, filterSpeciality]);

    const handleDeleteClick = (doctor: Doctor) => {
        setDoctorToDelete(doctor);
    };

    const handleConfirmDelete = async () => {
        if (!doctorToDelete) return;
        try {
            await deleteDoctor(doctorToDelete.id);
            // Refresh list and dropdowns
            loadFilterOptions();
            fetchDoctors(filterName, filterHospital, filterSpeciality);
        } catch (err: any) {
            alert("Failed to delete doctor: " + (err.message || err));
        }
    };

    if (currentUser && currentUser.role !== "super_admin" && currentUser.role !== "admin") {
        return (
            <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 overflow-hidden">
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

    return (
        <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <Sidebar minimal />

            {/* Main Content Card */}
            <div className="flex-1 p-6 bg-white rounded-[32px] inline-flex flex-col justify-start items-start gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
                {/* Header Block */}
                <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-primary text-3xl font-medium font-['Poppins']">
                            Manage Doctors
                        </div>
                        <div className="justify-start">
                            <span className="text-black text-sm font-normal font-['Poppins']">
                                Manage doctors and specialities on this page
                            </span>
                        </div>
                    </div>
                    {/* Add Doctor Button */}
                    <Button
                        onClick={() => {
                            navigate("/cms/doctors/add");
                        }}
                        text="Add Doctor"
                        leftIcon="Add"
                    />
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />

                {/* Filters */}
                <div className="self-stretch flex flex-row items-end gap-4 w-full">
                    <InputBox
                        label="Doctor Name"
                        placeholder="Search doctor name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        containerClassName="max-w-xs"
                    />
                    <Dropdown
                        label="Hospital"
                        placeholder="All Hospitals"
                        options={[
                            { value: "", label: "All Hospitals" },
                            ...hospitals.map((h) => ({ value: h, label: h }))
                        ]}
                        value={filterHospital}
                        onChange={(val) => setFilterHospital(val)}
                        multiple={false}
                        containerClassName="max-w-xs"
                    />
                    <Dropdown
                        label="Speciality"
                        placeholder="All Specialities"
                        options={[
                            { value: "", label: "All Specialities" },
                            ...specialities.map((s) => ({ value: s, label: s }))
                        ]}
                        value={filterSpeciality}
                        onChange={(val) => setFilterSpeciality(val)}
                        multiple={false}
                        containerClassName="max-w-xs"
                    />
                </div>

                {/* Table Container */}
                <div className="self-stretch bg-white flex flex-col justify-start items-start gap-2 overflow-hidden">
                    {/* Table Header */}
                    <div className="self-stretch h-9 rounded-sm inline-flex justify-start items-start overflow-hidden">
                        <div className="w-16 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    No.
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    Doctor Name
                                </div>
                            </div>
                        </div>
                        <div className="w-64 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    Hospital
                                </div>
                            </div>
                        </div>
                        <div className="w-44 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    Country
                                </div>
                            </div>
                        </div>
                        <div className="w-56 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    Speciality
                                </div>
                            </div>
                        </div>
                        <div className="w-28 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    Action
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    {loading && doctors.length === 0 ? (
                        <div className="self-stretch p-12 text-center text-slate-400 font-sans">
                            Loading doctors...
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="self-stretch p-12 text-center text-slate-400 font-sans">
                            No doctors found.
                        </div>
                    ) : (
                        doctors.map((doctor, index) => (
                            <div
                                key={doctor.id}
                                className="self-stretch bg-white/0 inline-flex justify-start items-center overflow-hidden border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                            >
                                <div className="w-16 self-stretch inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch p-3 flex flex-col justify-center items-start overflow-hidden">
                                        <div className="self-stretch justify-start text-black/90 text-sm font-normal font-['Poppins']">
                                            {index + 1}.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                        <div className="self-stretch justify-start text-black/90 text-sm font-normal font-['Poppins']">
                                            {doctor.doctorName}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-64 self-stretch inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                        <div className="self-stretch justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                            {doctor.hospital}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-44 self-stretch inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                        <div className="self-stretch justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                            {doctor.country}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-56 self-stretch inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                        <div className="self-stretch justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                            {doctor.speciality}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-28 px-3 flex justify-start items-center gap-4 py-2">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => navigate(`/cms/doctors/edit/${doctor.id}`)}
                                        className="size-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg outline -outline-offset-1 outline-slate-300 hover:outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                        title="Edit Doctor"
                                    >
                                        <Icon name="Pen" className="size-5 bg-current" />
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteClick(doctor)}
                                        className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                        title="Delete Doctor"
                                    >
                                        <Icon name="Delete 2" className="size-5 bg-current" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!doctorToDelete}
                onClose={() => setDoctorToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Remove Doctor"
                message={doctorToDelete ? `Are you sure you want to remove doctor "${doctorToDelete.doctorName}"? This action cannot be undone.` : ""}
            />
        </div>
    );
}

export default DoctorManagementPage;
