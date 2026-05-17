// 검색창 컴포넌트
// 인풋이 있어야하고 내부에 글귀는 페이지마다 다름

import styles from "./SearchBar.module.css";

const SearchBar = ({ placeholder, searchText, setSearchText }) => {
    const onChange = (e) => {
        setSearchText(e.target.value);
    };
    return (
        <input
            className={styles.input}
            type="search"
            value={searchText}
            // placeholder={placeholder}
            placeholder="이름 또는 팀을 입력하세요"
            onChange={onChange}
        />
    );
};

export default SearchBar;
