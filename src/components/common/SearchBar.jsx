// 검색창 컴포넌트
// 인풋이 있어야하고 내부에 글귀는 페이지마다 다름

import styles from "./SearchBar.module.css";

const SearchBar = ({
    placeholder = "이름 또는 팀을 입력하세요",
    value,
    onChange,
    onSubmit,
}) => {
    const inputProps = value === undefined ? {} : { value };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(e);
    };

    return (
        <form className={styles.searchBar} onSubmit={handleSubmit}>
            <input
                className={styles.input}
                type="search"
                placeholder={placeholder}
                onChange={onChange}
                {...inputProps}
            />
            <button
                className={styles.searchButton}
                type="submit"
                aria-label="검색"
            >
                <span className={styles.searchIcon} aria-hidden="true" />
            </button>
        </form>
    );
};

export default SearchBar;
