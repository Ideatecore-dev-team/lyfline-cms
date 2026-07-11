import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { type Doctor, getDoctors, deleteDoctor, getConsistingHospitals, getConsistingCountries } from "../../shared/api/doctor";
import { authApi } from "../../shared/api/auth";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import DeleteConfirmationModal from "../../component/modal/deleteConfirmation";
import InputBox from "../../component/inputbox";
import Dropdown from "../../component/dropdown";
import Notification from "../../component/notification";
import Pagination from "../../component/pagination";

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
    const location = useLocation();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [hospitals, setHospitals] = useState<string[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [currentUser] = useState(() => authApi.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Filter states
    const [filterName, setFilterName] = useState("");
    const [filterHospital, setFilterHospital] = useState("");
    const [filterCountry, setFilterCountry] = useState("");

    // Form states
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

    const fetchDoctors = useCallback(async (nameFilter = filterName, hospitalFilter = filterHospital, countryFilter = filterCountry) => {
        setLoading(true);
        try {
            const data = await getDoctors({
                doctorName: nameFilter,
                hospital: hospitalFilter,
                country: countryFilter,
            });
            setDoctors(data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error loading doctors", err);
        } finally {
            setLoading(false);
        }
    }, [filterName, filterHospital, filterCountry]);

    const loadFilterOptions = async () => {
        try {
            const [hospitalsList, countriesList] = await Promise.all([
                getConsistingHospitals(),
                getConsistingCountries(),
            ]);
            setHospitals(hospitalsList);
            setCountries(countriesList);
        } catch (err) {
            console.error("Error loading filters list", err);
        }
    };

    useEffect(() => {
        loadFilterOptions();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDoctors(filterName, filterHospital, filterCountry);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [filterName, filterHospital, filterCountry, fetchDoctors]);

    useEffect(() => {
        if (location.state?.successMessage) {
            showNotif(location.state.successMessage, "success");
            // Clear history state to prevent re-triggering on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleDeleteClick = (doctor: Doctor) => {
        setDoctorToDelete(doctor);
    };

    const handleConfirmDelete = async () => {
        if (!doctorToDelete) return;
        try {
            await deleteDoctor(doctorToDelete.id);
            showNotif(`Doctor "${doctorToDelete.doctorName}" deleted successfully!`, "success");
            // Refresh list and dropdowns
            loadFilterOptions();
            fetchDoctors(filterName, filterHospital, filterCountry);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            showNotif("Failed to delete doctor: " + errorMessage, "error");
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
        <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <div className="hidden lg:block shrink-0">
                <Sidebar minimal />
            </div>

            {/* Main Content Card */}
            <div className="flex-1 h-[820px] p-6 bg-white rounded-[32px] flex flex-col justify-start items-stretch gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
                {/* Header Block */}
                <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-4 sm:gap-6">
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
                    <div className="shrink-0 w-full sm:w-auto">
                        <Button
                            onClick={() => {
                                navigate("/cms/doctors/add");
                            }}
                            text="Add Doctor"
                            leftIcon="Add"
                            className="w-full sm:w-auto"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />

                {/* Filters */}
                <div className="self-stretch flex flex-col md:flex-row md:items-end items-stretch gap-4 w-full">
                    <InputBox
                        label="Doctor Name"
                        placeholder="Search doctor name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        containerClassName="w-full max-w-none md:w-1/4 md:min-w-[240px]"
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
                        containerClassName="w-full max-w-none md:flex-1 md:min-w-[280px]"
                    />
                    <Dropdown
                        label="Country"
                        placeholder="All Countries"
                        options={[
                            { value: "", label: "All Countries" },
                            ...countries.map((c) => ({ value: c, label: c }))
                        ]}
                        value={filterCountry}
                        onChange={(val) => setFilterCountry(val)}
                        multiple={false}
                        containerClassName="w-full max-w-none md:flex-1 md:min-w-[280px]"
                    />
                </div>

                {/* Table Container */}
                <div className="w-full flex-1 bg-white flex flex-col justify-start items-stretch gap-0 overflow-hidden">
                    <div className="w-full flex-1 overflow-x-auto">
                        <div className="min-w-[800px] flex flex-col items-stretch gap-0">
                            {/* Table Header */}
                            <div className="w-full h-9 rounded-sm flex justify-start items-stretch overflow-hidden bg-indigo-50">
                                <div className="w-16 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            No.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center items-start">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Doctor Name
                                        </div>
                                    </div>
                                </div>
                                <div className="w-64 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Hospital
                                        </div>
                                    </div>
                                </div>
                                <div className="w-44 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Country
                                        </div>
                                    </div>
                                </div>
                                <div className="w-28 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Action
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Body */}
                            {loading && doctors.length === 0 ? (
                                <div className="w-full p-12 text-center text-slate-400 font-sans">
                                    Loading doctors...
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="w-full p-12 text-center text-slate-400 font-sans">
                                    No doctors found.
                                </div>
                            ) : (
                                doctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doctor, index) => (
                                    <div
                                        key={doctor.id}
                                        className="w-full bg-white/0 flex justify-start items-stretch overflow-hidden border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                                    >
                                        <div className="w-16 flex flex-col justify-center items-start shrink-0">
                                            <div className="w-full p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <div className="w-full justify-start text-black/90 text-sm font-normal font-['Poppins']">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center items-start">
                                            <div className="w-full flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <div className="w-full justify-start text-black/90 text-sm font-normal font-['Poppins']">
                                                    {doctor.doctorName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-64 flex flex-col justify-center items-start shrink-0">
                                            <div className="w-full flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <div className="w-full justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                                    {doctor.hospital}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-44 flex flex-col justify-center items-start shrink-0">
                                            <div className="w-full flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <div className="w-full justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                                    {doctor.country}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-28 px-3 flex justify-start items-center gap-4 py-2 shrink-0">
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
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={doctors.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!doctorToDelete}
                onClose={() => setDoctorToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Remove Doctor"
                message={doctorToDelete ? `Are you sure you want to remove doctor "${doctorToDelete.doctorName}"? This action cannot be undone.` : ""}
            />

            <Notification
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default DoctorManagementPage;
