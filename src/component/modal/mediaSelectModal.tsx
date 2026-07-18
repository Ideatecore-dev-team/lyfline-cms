import { useState, useEffect, useMemo } from "react";
import MediaCard from "../mediaCard";
import Pagination from "../pagination";

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

export interface MediaSelectModalItem {
  id: string;
  url: string;
  fileName: string;
  fileSize?: string;
}

interface MediaSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaSelectModalItem) => void;
}

const LOCAL_STORAGE_KEY = "lyfline_media_items";

export default function MediaSelectModal({
  isOpen,
  onClose,
  onSelect,
}: MediaSelectModalProps) {
  const [mediaList, setMediaList] = useState<MediaSelectModalItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setMediaList(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load media library items:", err);
      }
      setCurrentPage(1);
    }
  }, [isOpen]);

  const paginatedMediaList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return mediaList.slice(startIndex, startIndex + itemsPerPage);
  }, [mediaList, currentPage, itemsPerPage]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl p-6 bg-white rounded-[32px] border border-slate-100/50 flex flex-col justify-start items-start gap-6 shadow-2xl max-h-[85vh] overflow-hidden animate-scale-in"
      >
        {/* Title Bar */}
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-[#9EB7DA] text-sm font-normal font-sans tracking-wider uppercase">
              MEDIA LIBRARY
            </div>
            <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
              Pick From Media Library
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
        <div className="self-stretch h-px bg-slate-100" />

        {/* Media Grid Container */}
        {mediaList.length > 0 ? (
          <>
            <div className="w-full flex-1 overflow-y-auto overflow-x-visible p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                {paginatedMediaList.map((media) => (
                  <MediaCard
                    key={media.id}
                    imageUrl={media.url}
                    fileName={media.fileName}
                    fileSize={media.fileSize}
                    onClick={() => {
                      onSelect(media);
                      onClose();
                    }}
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
          <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="size-14 rounded-full bg-indigo-50 flex items-center justify-center text-primary mb-3">
              <Icon name="Image 2" className="size-7 bg-current" />
            </div>
            <h4 className="text-base font-medium text-black font-['Poppins']">
              No Media Assets Found
            </h4>
            <p className="text-sm text-gray-400 max-w-xs mt-1 font-sans">
              Upload images on the <span className="text-primary font-medium">Manage Media</span> page to select them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
