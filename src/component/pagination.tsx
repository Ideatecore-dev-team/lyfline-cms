import { useMemo } from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

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

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="self-stretch flex flex-row items-center justify-between py-2 w-full font-sans border-t border-slate-100 pt-4 mt-auto">
      {/* Items Range Info */}
      <div className="text-slate-500 text-sm font-['Poppins']">
        Showing <span className="font-semibold text-slate-800">{startIndex}</span> to{" "}
        <span className="font-semibold text-slate-800">{endIndex}</span> of{" "}
        <span className="font-semibold text-slate-800">{totalItems}</span> entries
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5 font-['Poppins']">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="size-9 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:pointer-events-none"
          title="Previous Page"
        >
          <Icon name="Left 1" className="size-4 bg-current" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`size-9 rounded-lg border text-sm font-medium transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
              page === currentPage
                ? "border-primary bg-linear-to-r from-primary to-primary-hover text-white shadow-sm"
                : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="size-9 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:pointer-events-none"
          title="Next Page"
        >
          <Icon name="Right 1" className="size-4 bg-current" />
        </button>
      </div>
    </div>
  );
}
