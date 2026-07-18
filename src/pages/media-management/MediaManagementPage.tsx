import { useState, useRef, useEffect, useMemo } from "react";
import { authApi } from "../../shared/api/auth";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import Notification from "../../component/notification";
import MediaCard from "../../component/mediaCard";
import Pagination from "../../component/pagination";
import DeleteConfirmationModal from "../../component/modal/deleteConfirmation";
import { uploadImage, deleteImage, processZipFile } from "../../shared/api/media";

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

export interface MediaItem {
    id: string;
    url: string;
    fileName: string;
    fileSize: string;
    uploadedAt: string;
}

const LOCAL_STORAGE_KEY = "lyfline_media_items";

export default function MediaManagementPage() {
    const [currentUser] = useState(() => authApi.getCurrentUser());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const batchInputRef = useRef<HTMLInputElement>(null);

    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadingBatch, setUploadingBatch] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const paginatedMediaList = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return mediaList.slice(startIndex, startIndex + itemsPerPage);
    }, [mediaList, currentPage, itemsPerPage]);

    const [notification, setNotification] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "default";
    }>({
        isOpen: false,
        message: "",
        type: "default",
    });

    const showNotif = (message: string, type: "success" | "error" | "default" = "default") => {
        setNotification({
            isOpen: true,
            message,
            type,
        });
    };

    // Load stored media items from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setMediaList(parsed);
                }
            }
        } catch (err) {
            console.error("Failed to load local media items:", err);
        }
    }, []);

    // Save media list to local storage
    const saveMediaList = (list: MediaItem[]) => {
        setMediaList(list);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        } catch (err) {
            console.error("Failed to save media items to localStorage:", err);
        }
    };

    const handleUploadClick = () => {
        if (uploading || uploadingBatch) return;
        fileInputRef.current?.click();
    };

    const handleBatchClick = () => {
        if (uploading || uploadingBatch) return;
        batchInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith("image/")) {
            showNotif("Please select a valid image file.", "error");
            return;
        }

        setUploading(true);
        showNotif(`Uploading "${file.name}"...`, "default");

        try {
            // Upload image to VPS via media API
            const uploadedUrl = await uploadImage(file, "media");

            const formattedSize = file.size > 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : `${Math.round(file.size / 1024)} KB`;

            const newMedia: MediaItem = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
                url: uploadedUrl,
                fileName: file.name,
                fileSize: formattedSize,
                uploadedAt: new Date().toISOString(),
            };

            const updated = [newMedia, ...mediaList];
            saveMediaList(updated);
            showNotif(`Image "${file.name}" uploaded successfully!`, "success");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Upload failed.";
            showNotif(`Upload failed: ${errorMsg}`, "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleBatchFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const zipFile = files[0];
        if (!zipFile.name.toLowerCase().endsWith(".zip")) {
            showNotif("Please select a valid .ZIP archive file.", "error");
            return;
        }

        setUploadingBatch(true);
        showNotif(`Processing ZIP archive "${zipFile.name}"...`, "default");

        try {
            const uploadedItems = await processZipFile(zipFile, "media", (progress) => {
                showNotif(`Uploading batch: ${progress.current}/${progress.total} (${progress.currentFileName})...`, "default");
            });

            const newMediaItems: MediaItem[] = uploadedItems.map((item, index) => ({
                id: `${Date.now()}_${index}_${Math.random().toString(36).substring(2, 5)}`,
                url: item.url,
                fileName: item.fileName,
                fileSize: item.fileSize,
                uploadedAt: new Date().toISOString(),
            }));

            const updated = [...newMediaItems, ...mediaList];
            saveMediaList(updated);
            showNotif(`Successfully uploaded ${newMediaItems.length} images from "${zipFile.name}"!`, "success");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Batch upload failed.";
            showNotif(`Batch upload failed: ${errorMsg}`, "error");
        } finally {
            setUploadingBatch(false);
            if (batchInputRef.current) {
                batchInputRef.current.value = "";
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!mediaToDelete) return;

        try {
            // Delete image from VPS storage
            await deleteImage(mediaToDelete.url);
            const updated = mediaList.filter((item) => item.id !== mediaToDelete.id);
            saveMediaList(updated);
            showNotif(`Image "${mediaToDelete.fileName}" deleted successfully!`, "success");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Delete failed.";
            showNotif(`Failed to delete image: ${errorMsg}`, "error");
        } finally {
            setMediaToDelete(null);
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
                        You do not have the required administrative permissions to manage media.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
            {/* Hidden Single Image File Input */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Hidden Batch ZIP File Input */}
            <input
                type="file"
                ref={batchInputRef}
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleBatchFileChange}
                className="hidden"
            />

            {/* Left Sidebar */}
            <div className="hidden lg:block shrink-0 sticky top-0 self-start z-10">
                <Sidebar minimal />
            </div>

            {/* Main Content Card */}
            <div className="flex-1 min-h-[820px] p-6 bg-white rounded-[32px] flex flex-col justify-start items-stretch gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
                {/* Header Block */}
                <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-primary text-3xl font-medium font-['Poppins']">
                            Manage Media
                        </div>
                        <div className="justify-start">
                            <span className="text-black text-sm font-normal font-['Poppins']">
                                Manage and migrate media assets on this page
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <Button
                            onClick={handleUploadClick}
                            text={uploading ? "Uploading..." : "Upload Image"}
                            leftIcon="Add"
                            disabled={uploading || uploadingBatch}
                            className="w-full sm:w-auto"
                        />
                        <Button
                            onClick={handleBatchClick}
                            text={uploadingBatch ? "Processing ZIP..." : "Upload Batch"}
                            leftIcon="Upload"
                            variant="outline-primary"
                            disabled={uploading || uploadingBatch}
                            className="w-full sm:w-auto"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />

                {/* Media Grid / Empty State */}
                {mediaList.length > 0 ? (
                    <>
                        <div className="w-full flex-1 overflow-y-auto overflow-x-visible p-2 pr-1">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-1">
                                {paginatedMediaList.map((media) => (
                                    <MediaCard
                                        key={media.id}
                                        imageUrl={media.url}
                                        fileName={media.fileName}
                                        fileSize={media.fileSize}
                                        onDelete={() => setMediaToDelete(media)}
                                        className="shadow-none! hover:shadow-none! hover:border-primary! hover:outline-1! hover:outline-primary! hover:-outline-offset-1!"
                                    />
                                ))}
                            </div>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={mediaList.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className="w-full flex-1 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                        <div className="size-16 rounded-full bg-indigo-50 flex items-center justify-center text-primary mb-4">
                            <Icon name="Image 2" className="size-8 bg-current" />
                        </div>
                        <p className="text-sm text-slate-500 max-w-md mt-1 font-sans">
                            Use <span className="text-primary font-semibold">Upload Image</span> or <span className="text-primary font-semibold">Upload Batch</span> above to begin migrating and organizing your media assets.
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!mediaToDelete}
                onClose={() => setMediaToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Remove Media Asset"
                message={mediaToDelete ? `Are you sure you want to delete "${mediaToDelete.fileName}"? This action cannot be undone.` : ""}
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
