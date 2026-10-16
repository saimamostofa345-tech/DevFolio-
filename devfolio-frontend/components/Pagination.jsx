export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    function goToPage(page) {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange?.(page);
    }

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
            >
                ← Previous
            </button>

            <div className="pagination__pages">
                {pages.map((page) => (
                    <button
                        type="button"
                        key={page}
                        onClick={() => goToPage(page)}
                        className={page === currentPage ? "pagination__active" : ""}
                        aria-current={page === currentPage ? "page" : undefined}
                        aria-label={`Page ${page}`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
            >
                Next →
            </button>
        </nav>
    );
}
