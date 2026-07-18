import { useState } from "react";

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

export interface MediaCardProps {
  imageUrl: string;
  fileName: string;
  fileSize?: string;
  onDelete?: () => void;
  onClick?: () => void;
  layout?: "grid" | "list";
  className?: string;
}

export default function MediaCard({
  imageUrl,
  fileName,
  fileSize,
  onDelete,
  onClick,
  layout = "grid",
  className = "",
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);

  if (layout === "list") {
    return (
      <div
        onClick={onClick}
        className={`w-full p-3 bg-white rounded-2xl border border-slate-100 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-200 transition-all flex items-center justify-between gap-4 group ${
          onClick ? "cursor-pointer" : ""
        } ${className}`}
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
          <div className="size-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={fileName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon name="Image 2" className="size-6 text-slate-400" />
            )}
          </div>
          <div className="flex flex-col overflow-hidden min-w-0 flex-1">
            <span
              className="text-sm font-medium text-slate-800 truncate font-['Poppins']"
              title={fileName}
            >
              {fileName}
            </span>
            {fileSize && (
              <span className="text-xs text-slate-400 font-sans truncate">
                {fileSize}
              </span>
            )}
          </div>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="size-9 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer shrink-0"
            title="Delete Media"
          >
            <Icon name="Delete 2" className="size-5 bg-current" />
          </button>
        )}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div
      onClick={onClick}
      className={`w-full p-3 bg-white rounded-2xl border border-slate-100 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-200 transition-all flex flex-col gap-3 group relative overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Image Preview Box */}
      <div className="w-full aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 relative flex items-center justify-center group-hover:opacity-95 transition-opacity">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={fileName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name="Image 2" className="size-10 text-slate-300" />
        )}

        {/* Floating Delete button overlay */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer active:scale-95 z-10"
            title="Delete Media"
          >
            <Icon name="Delete 2" className="size-5 bg-current" />
          </button>
        )}
      </div>

      {/* Info & Delete Button Footer */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="text-xs sm:text-sm font-medium text-slate-800 truncate font-['Poppins']"
            title={fileName}
          >
            {fileName}
          </span>
          {fileSize && (
            <span className="text-[11px] text-slate-400 font-sans truncate">
              {fileSize}
            </span>
          )}
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="size-8 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer shrink-0 active:scale-95 sm:hidden"
            title="Delete Media"
          >
            <Icon name="Delete 2" className="size-4 bg-current" />
          </button>
        )}
      </div>
    </div>
  );
}
