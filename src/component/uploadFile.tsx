import { useState, useRef, type DragEvent, type ChangeEvent, type ReactNode } from "react";
import Button from "./button";
import Notification from "./notification";

interface UploadFileProps {
    label: ReactNode;
    descriptionPrefix?: string;
    descriptionValue?: string;
    multiple?: boolean;
    onChange?: (files: File[]) => void;
    accept?: string;
    className?: string;
    defaultImageUrl?: string;
    onRemoveDefaultImage?: () => void;
    defaultImageLabel?: string;
    existingImageUrls?: string[];
    onRemoveExistingImage?: (url: string) => void;
    maxFiles?: number;
}

export default function UploadFile({
    label,
    descriptionPrefix = "Preferable Size",
    descriptionValue = "(736px * 448px)",
    multiple = false,
    onChange,
    accept = "image/*",
    className = "",
    defaultImageUrl,
    onRemoveDefaultImage,
    defaultImageLabel = "Current Promo Banner",
    existingImageUrls = [],
    onRemoveExistingImage,
    maxFiles,
}: UploadFileProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        let updatedFiles = multiple ? [...selectedFiles, ...newFiles] : [newFiles[0]];

        // Enforce max files limit
        const totalExisting = existingImageUrls.length;
        if (maxFiles && (updatedFiles.length + totalExisting) > maxFiles) {
            showNotif(`You can only upload a maximum of ${maxFiles} files (including already saved files).`, "error");
            updatedFiles = updatedFiles.slice(0, maxFiles - totalExisting);
        }

        setSelectedFiles(updatedFiles);

        // Generate previews for images
        const newPreviews: string[] = [];
        updatedFiles.forEach((file) => {
            if (file.type.startsWith("image/")) {
                newPreviews.push(URL.createObjectURL(file));
            }
        });
        setPreviews(newPreviews);

        if (onChange) {
            onChange(updatedFiles);
        }
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const triggerBrowse = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);

        // Clean up object URLs
        if (previews[index]) {
            URL.revokeObjectURL(previews[index]);
        }
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);

        if (onChange) {
            onChange(updatedFiles);
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const getFileNameFromUrl = (url?: string) => {
        if (!url) return "";
        try {
            const decoded = decodeURIComponent(url);
            const segments = decoded.split("/");
            return segments[segments.length - 1] || "";
        } catch {
            return "";
        }
    };

    return (
        <div className={`w-full inline-flex flex-col justify-start items-start gap-3 ${className}`}>
            {/* Label */}
            <div className="self-stretch justify-start text-black text-sm font-normal font-['Poppins']">
                {label}
            </div>

            {/* Hidden input element (always rendered so ref remains valid) */}
            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Upload Area */}
            <div className="self-stretch bg-white flex flex-col justify-start items-center gap-4 overflow-hidden">
                {selectedFiles.length === 0 && !defaultImageUrl && existingImageUrls.length === 0 && (
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={triggerBrowse}
                        className={`self-stretch py-14 rounded-[32px] outline-1 -outline-offset-1 transition-all cursor-pointer flex flex-col justify-start items-center gap-2.5 overflow-hidden ${dragActive
                            ? "outline-primary bg-indigo-50/30 scale-[0.99] outline-dashed"
                            : "outline-[#9EB7DA] hover:bg-slate-100/70"
                            }`}
                    >

                        <div className="flex flex-col justify-start items-center gap-4">
                            {/* Custom Upload Icon */}
                            <div className="size-10 flex items-center justify-center text-[#9EB7DA]">
                                <span
                                    style={{
                                        maskImage: 'url("/icons/Image 2.svg")',
                                        WebkitMaskImage: 'url("/icons/Image 2.svg")',
                                    }}
                                    className="size-8 bg-current mask-contain mask-no-repeat mask-center shrink-0"
                                    aria-hidden="true"
                                />
                            </div>

                            {/* Description Text */}
                            <div className="flex flex-col justify-start items-center">
                                <div className="text-center justify-start text-black text-sm font-medium font-['Poppins']">
                                    Drag & Drop here
                                </div>
                                <div className="text-center justify-start text-black text-sm font-medium font-['Poppins']">
                                    or
                                </div>
                                <div className="text-center justify-start text-primary hover:text-primary-hover text-sm font-semibold font-['Poppins'] transition-all">
                                    Browse
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* File list preview */}
                {(selectedFiles.length > 0 || defaultImageUrl || existingImageUrls.length > 0) && (
                    <div className="self-stretch flex flex-col gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-xs font-semibold text-[#9EB7DA] uppercase tracking-wider mb-1 font-sans">
                            Selected Files ({multiple 
                                ? (selectedFiles.length + existingImageUrls.length + (defaultImageUrl ? 1 : 0))
                                : (selectedFiles.length > 0 ? selectedFiles.length : (defaultImageUrl ? 1 : 0))
                            })
                        </div>

                        {/* Render existing database images */}
                        {existingImageUrls.map((url, idx) => (
                            <div
                                key={`existing-${idx}`}
                                className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.02)]"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <img
                                        src={url}
                                        alt={`Saved Image ${idx + 1}`}
                                        className="size-10 rounded-lg object-cover border border-slate-200"
                                    />
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate max-w-[400px] font-sans">
                                            Saved Hospital Image
                                        </div>
                                        <div className="text-xs text-primary font-sans truncate max-w-[400px]">
                                            {getFileNameFromUrl(url)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onRemoveExistingImage) {
                                            onRemoveExistingImage(url);
                                        }
                                    }}
                                    className="p-1 rounded-md text-[#9EB7DA] hover:text-red-500 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                    title="Remove saved image"
                                >
                                    <span
                                        style={{
                                            maskImage: 'url("/icons/Close.svg")',
                                            WebkitMaskImage: 'url("/icons/Close.svg")',
                                        }}
                                        className="size-5 bg-slate-500 mask-contain mask-no-repeat mask-center shrink-0"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        ))}

                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.02)]"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {/* Thumbnail if image, file icon otherwise */}
                                    {file.type.startsWith("image/") && previews[index] ? (
                                        <img
                                            src={previews[index]}
                                            alt={file.name}
                                            className="size-10 rounded-lg object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <div className="size-10 rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center border border-indigo-100">
                                            <span
                                                style={{
                                                    maskImage: 'url("/icons/Attachment.svg")',
                                                    WebkitMaskImage: 'url("/icons/Attachment.svg")',
                                                }}
                                                className="size-5 bg-current mask-contain mask-no-repeat mask-center shrink-0"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate max-w-[400px] font-sans">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-primary font-sans">
                                            {formatBytes(file.size)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    className="p-1 rounded-md text-[#9EB7DA] hover:text-red-500 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                    title="Remove file"
                                >
                                    <span
                                        style={{
                                            maskImage: 'url("/icons/Close.svg")',
                                            WebkitMaskImage: 'url("/icons/Close.svg")',
                                        }}
                                        className="size-5 bg-slate-500 mask-contain mask-no-repeat mask-center shrink-0"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        ))}

                        {/* Render active banner file preview */}
                        {selectedFiles.length === 0 && defaultImageUrl && (
                            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <img
                                        src={defaultImageUrl}
                                        alt={defaultImageLabel}
                                        className="size-10 rounded-lg object-cover border border-slate-200"
                                    />
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate max-w-[400px] font-sans">
                                            {defaultImageLabel}
                                        </div>
                                        <div className="text-xs text-primary font-sans truncate max-w-[400px]">
                                            {getFileNameFromUrl(defaultImageUrl)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onRemoveDefaultImage) {
                                            onRemoveDefaultImage();
                                        }
                                    }}
                                    className="p-1 rounded-md text-[#9EB7DA] hover:text-red-500 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                    title="Remove active banner"
                                >
                                    <span
                                        style={{
                                            maskImage: 'url("/icons/Close.svg")',
                                            WebkitMaskImage: 'url("/icons/Close.svg")',
                                        }}
                                        className="size-5 bg-slate-500 mask-contain mask-no-repeat mask-center shrink-0"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Upload Button */}
                <Button
                    type="button"
                    onClick={triggerBrowse}
                    disabled={maxFiles ? (selectedFiles.length + existingImageUrls.length) >= maxFiles : false}
                    text="Upload Image"
                    variant="outline-primary"
                    className="w-full self-stretch"
                />

                {/* Description and Info */}
                {descriptionValue && (
                    <div className="justify-start">
                        <span className="text-black text-sm font-medium font-['Poppins']">
                            {descriptionPrefix}{" "}
                        </span>
                        <span className="text-primary text-sm font-medium font-['Poppins']">
                            {descriptionValue}
                        </span>
                    </div>
                )}
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
