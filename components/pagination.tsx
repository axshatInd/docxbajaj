"use client"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []

    // Always show first page
    pageNumbers.push(1)

    // Calculate range around current page
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("...")
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...")
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        aria-label="Previous page"
      >
        &laquo;
      </button>

      {pageNumbers.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded border ${
              currentPage === page ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2">
            {page}
          </span>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        aria-label="Next page"
      >
        &raquo;
      </button>
    </div>
  )
}
