import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Partner, getPartners, deletePartner, getConsistingCountries } from "../../shared/api/partner";
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

function PartnersManagementPage() {
    const navigate = useNavigate();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [currentUser] = useState(() => authApi.getCurrentUser());
    const [loading, setLoading] = useState(true);

    // Filter states
    const [filterName, setFilterName] = useState("");
    const [filterCountry, setFilterCountry] = useState("");

    // Form states
    const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

    const fetchPartners = async (nameFilter = filterName, countryFilter = filterCountry) => {
        setLoading(true);
        try {
            const data = await getPartners({
                hospitalName: nameFilter,
                country: countryFilter,
            });
            setPartners(data);
        } catch (err) {
            console.error("Error loading partners", err);
        } finally {
            setLoading(false);
        }
    };

    const loadCountries = async () => {
        try {
            const countriesList = await getConsistingCountries();
            setCountries(countriesList);
        } catch (err) {
            console.error("Error loading countries list", err);
        }
    };

    useEffect(() => {
        loadCountries();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPartners(filterName, filterCountry);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [filterName, filterCountry]);

    const handleDeleteClick = (partner: Partner) => {
        setPartnerToDelete(partner);
    };

    const handleConfirmDelete = async () => {
        if (!partnerToDelete) return;
        try {
            await deletePartner(partnerToDelete.id);
            // Refresh list and countries list
            const countriesList = await getConsistingCountries();
            setCountries(countriesList);
            fetchPartners(filterName, filterCountry);
        } catch (err: any) {
            alert("Failed to delete partner: " + (err.message || err));
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
                        You do not have the required administrative permissions to manage partners.
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
                            Manage Partners
                        </div>
                        <div className="justify-start">
                            <span className="text-black text-sm font-normal font-['Poppins']">
                                Manage partners or hospital on this page
                            </span>
                        </div>
                    </div>
                    {/* Add Partner Button */}
                    <Button
                        onClick={() => {
                            navigate("/cms/partners/add");
                        }}
                        text="Add Partner"
                        leftIcon="Add"
                    />
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />

                {/* Filters */}
                <div className="self-stretch flex flex-row items-end gap-4 w-full">
                    <InputBox
                        label="Hospital Name"
                        placeholder="Search hospital name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        containerClassName="max-w-xs"
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
                                    Hospital Name
                                </div>
                            </div>
                        </div>
                        <div className="w-64 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    City
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
                        <div className="w-28 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
                            <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                    Action
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    {loading && partners.length === 0 ? (
                        <div className="self-stretch p-12 text-center text-slate-400 font-sans">
                            Loading partners...
                        </div>
                    ) : partners.length === 0 ? (
                        <div className="self-stretch p-12 text-center text-slate-400 font-sans">
                            No partners found.
                        </div>
                    ) : (
                        partners.map((partner, index) => (
                            <div
                                key={partner.id}
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
                                            {partner.hospitalName}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-64 self-stretch inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                        <div className="self-stretch justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                            {partner.city}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-44 self-stretch inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                                        <div className="self-stretch justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                            {partner.country}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-28 px-3 flex justify-start items-center gap-4 py-2">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => navigate(`/cms/partners/edit/${partner.id}`)}
                                        className="size-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg outline -outline-offset-1 outline-slate-300 hover:outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                        title="Edit Partner"
                                    >
                                        <Icon name="Pen" className="size-5 bg-current" />
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteClick(partner)}
                                        className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                        title="Delete Partner"
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
                isOpen={!!partnerToDelete}
                onClose={() => setPartnerToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Remove Partner"
                message={partnerToDelete ? `Are you sure you want to remove partner "${partnerToDelete.hospitalName}"? This action cannot be undone.` : ""}
            />
        </div>
    );
}

export default PartnersManagementPage;
