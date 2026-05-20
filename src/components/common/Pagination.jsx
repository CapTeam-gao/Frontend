import styles from "./Pagination.module.css";

const Pagination = ({ currentPage, totalPage, onPageChange }) => {
    if (totalPage <= 1) return null;

    return (
        <div className={styles.pagination}>
            {Array.from({ length: totalPage }, (_, index) => {
                const pageNumber = index + 1;
                const isActive = currentPage === pageNumber;

                return (
                    <button
                        key={pageNumber}
                        className={`${styles.pageButton} ${
                            isActive ? styles.activePage : ""
                        }`}
                        type="button"
                        aria-label={`${pageNumber}페이지로 이동`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                );
            })}
        </div>
    );
};

export default Pagination;
