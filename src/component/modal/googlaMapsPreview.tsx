import { useEffect, useState } from "react";
import Button from "../button";

interface GooglaMapsPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl?: string;
}

const convertToEmbeddable = (url: string): string | null => {
    // If already embeddable, return it
    if (url.includes("google.com/maps/embed") || url.includes("output=embed")) {
        return url;
    }

    // Try place match: /maps/place/Place+Name
    const placeMatch = url.match(/maps\/place\/([^/]+)/);
    if (placeMatch && placeMatch[1]) {
        const place = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
    }

    // Try search match: /maps/search/Search+Query
    const searchMatch = url.match(/maps\/search\/([^/]+)/);
    if (searchMatch && searchMatch[1]) {
        const search = decodeURIComponent(searchMatch[1].replace(/\+/g, " "));
        return `https://maps.google.com/maps?q=${encodeURIComponent(search)}&output=embed`;
    }

    // Try coordinates match: @latitude,longitude
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
    }

    // Try general query parameter
    if (url.startsWith("http")) {
        try {
            const urlObj = new URL(url);
            const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("query");
            if (q) {
                return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
            }
        } catch {
            // ignore malformed URLs
        }
    }

    return null;
};

export default function GooglaMapsPreviewModal({
    isOpen,
    onClose,
    embedUrl,
}: GooglaMapsPreviewModalProps) {
    const [resolvedUrl, setResolvedUrl] = useState<string>("");
    const [resolving, setResolving] = useState<boolean>(false);
    const [resolveError, setResolveError] = useState<string>("");

    useEffect(() => {
        if (!isOpen) return;

        let active = true;
        const clean = embedUrl?.trim() || "";

        if (!clean) {
            setResolvedUrl("");
            setResolveError("");
            setResolving(false);
            return;
        }

        // 1. If it's an iframe code, extract src first
        let urlToProcess = clean;
        if (urlToProcess.startsWith("<iframe")) {
            const match = urlToProcess.match(/src="([^"]+)"/);
            if (match && match[1]) {
                urlToProcess = match[1];
            }
        }

        // 2. If it's already an embed URL, use directly
        if (urlToProcess.includes("google.com/maps/embed") || urlToProcess.includes("output=embed")) {
            setResolvedUrl(urlToProcess);
            setResolveError("");
            setResolving(false);
            return;
        }

        // 3. If it's a shortened URL (maps.app.goo.gl or goo.gl/maps), resolve it using CORS proxy
        if (urlToProcess.includes("maps.app.goo.gl") || urlToProcess.includes("goo.gl/maps")) {
            setResolving(true);
            setResolveError("");
            setResolvedUrl("");

            fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlToProcess)}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to reach unshortening service");
                    return res.json();
                })
                .then((data) => {
                    if (!active) return;
                    const destination = data.status?.url;
                    if (destination && destination.includes("google.com/maps")) {
                        const embeddable = convertToEmbeddable(destination);
                        if (embeddable) {
                            setResolvedUrl(embeddable);
                            setResolveError("");
                        } else {
                            setResolveError("Could not extract a valid location from the resolved link.");
                        }
                    } else {
                        setResolveError("Could not resolve short link to a valid Google Maps address.");
                    }
                    setResolving(false);
                })
                .catch((err) => {
                    if (!active) return;
                    console.error("Unshorten error:", err);
                    setResolveError("Failed to unshorten maps link due to a network connection error.");
                    setResolving(false);
                });
        } else {
            // 4. Convert normal maps link directly
            const embeddable = convertToEmbeddable(urlToProcess);
            if (embeddable) {
                setResolvedUrl(embeddable);
                setResolveError("");
            } else {
                setResolveError("Invalid Google Maps link format.");
            }
            setResolving(false);
        }

        return () => {
            active = false;
        };
    }, [isOpen, embedUrl]);

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[600px] p-6 bg-white rounded-[32px] outline -outline-offset-1 outline-slate-200 inline-flex flex-col justify-start items-start gap-6 shadow-2xl animate-scale-in"
            >
                {/* Title Bar */}
                <div className="self-stretch inline-flex justify-between items-start">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-[#9EB7DA] text-sm font-normal font-sans tracking-wider uppercase">
                            GOOGLE MAPS PREVIEW
                        </div>
                        <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
                            Maps Location
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-[#9EB7DA] hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center"
                        title="Close"
                    >
                        <span
                            style={{
                                maskImage: 'url("/icons/Close.svg")',
                                WebkitMaskImage: 'url("/icons/Close.svg")',
                            }}
                            className="size-6 bg-slate-500 mask-contain mask-no-repeat mask-center shrink-0"
                            aria-hidden="true"
                        />
                    </button>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-200" />

                {/* Preview Content */}
                <div className="self-stretch flex flex-col items-center justify-center min-h-[350px] bg-indigo-50/50 rounded-2xl border border-slate-100 p-2 overflow-hidden relative">
                    {resolving ? (
                        <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <div className="text-slate-600 text-sm font-medium font-sans animate-pulse">
                                Resolving short maps link...
                            </div>
                        </div>
                    ) : resolveError ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                            <span
                                style={{
                                    maskImage: 'url("/icons/Danger Circle.svg")',
                                    WebkitMaskImage: 'url("/icons/Danger Circle.svg")',
                                }}
                                className="size-16 bg-red-500/80 mask-contain mask-no-repeat mask-center"
                                aria-hidden="true"
                            />
                            <div className="text-slate-600 text-sm font-medium font-sans max-w-[280px]">
                                {resolveError}
                            </div>
                        </div>
                    ) : resolvedUrl ? (
                        <iframe
                            src={resolvedUrl}
                            width="100%"
                            height="350"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="rounded-2xl"
                            title="Google Maps Embed Preview"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                            <span
                                style={{
                                    maskImage: 'url("/icons/Map.svg")',
                                    WebkitMaskImage: 'url("/icons/Map.svg")',
                                }}
                                className="size-16 bg-primary/60 mask-contain mask-no-repeat mask-center"
                                aria-hidden="true"
                            />
                            <div className="text-slate-600 text-sm font-medium font-sans max-w-[280px]">
                                Please input an embed URL to see the preview
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-200" />

                {/* Close button at bottom */}
                <div className="self-stretch flex justify-end">
                    <Button
                        type="button"
                        onClick={onClose}
                        text="Close"
                        variant="primary"
                        className="w-full px-6 py-2.5 h-11 text-sm rounded-full cursor-pointer active:scale-95"
                    />
                </div>
            </div>
        </div>
    );
}
