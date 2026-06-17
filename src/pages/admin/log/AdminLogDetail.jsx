import { Link, useParams } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import styles from "./AdminLogDetail.module.css";

const logDetails = [
    {
        id: 1,
        teamName: "팀 Gao",
        writer: "허재원",
        members: "양원우 김성현 박진욱 유채민",
        date: "2026.04.08",
        status: "submitted",
    },
    {
        id: 2,
        teamName: "팀 Linker",
        writer: "",
        members: "",
        date: "2026.04.22",
        status: "pending",
    },
    {
        id: 3,
        teamName: "팀 Orbit",
        writer: "김성현",
        members: "허재원 양원우 박진욱 유채민",
        date: "2026.04.22",
        status: "submitted",
    },
    {
        id: 4,
        teamName: "팀 Bridge",
        writer: "",
        members: "",
        date: "2026.04.22",
        status: "pending",
    },
    {
        id: 5,
        teamName: "팀 Nova",
        writer: "유채민",
        members: "허재원 양원우 김성현 박진욱",
        date: "2026.04.22",
        status: "submitted",
    },
];

const memberEntries = [
    {
        id: 1,
        name: "허재원",
        content:
            "디자인에 대해서 너무 많은 고민이 생겼고 전체적으로 사이드바를 헤더 바로 변경하는 디자인 전환 아이디어를 냈으며 기능적 부족에 대해서 추가할 기능을 회의하느라 멈췄던 디자인을 다시 수정하고 계속해서 작업을 이어나가고 있습니다.",
    },
    {
        id: 2,
        name: "양원우",
        content:
            "공지 API와 팀 관리 조회 흐름을 점검하고, 관리자 페이지에서 필요한 응답값을 맞추기 위해 DTO 구조를 정리했습니다.",
    },
    {
        id: 3,
        name: "김성현",
        content:
            "설문 데이터를 기반으로 학생 분석 결과를 확인하고 팀 추천 결과에서 누락되는 값이 없는지 검증했습니다.",
    },
    {
        id: 4,
        name: "박진욱",
        content:
            "앱 화면에서 프로젝트 기획서 입력 흐름을 정리하고 팀 단위로 공유되어야 하는 정보 구조를 점검했습니다.",
    },
    {
        id: 5,
        name: "유채민",
        content:
            "서비스 화면의 주요 사용자 흐름을 다시 확인하고 발표 자료에 들어갈 UI 캡처 기준을 정리했습니다.",
    },
];

const getMemberNames = (members) => {
    if (!members) return [];

    return members.split(" ").filter(Boolean);
};

const AdminLogDetail = () => {
    const { id } = useParams();
    const log = logDetails.find((item) => String(item.id) === id);
    const memberNames = getMemberNames(log?.members);

    if (!log) {
        return (
            <div className={styles.page}>
                <Header />

                <main className={styles.body}>
                    <Link to="/admin/log" className={styles.backLink}>
                        ← 목록으로
                    </Link>

                    <section className={styles.emptyBox}>
                        <h1>일지를 찾을 수 없습니다.</h1>
                        <p>목록에서 다시 확인해주세요.</p>
                    </section>
                </main>
            </div>
        );
    }

    if (log.status === "pending") {
        return (
            <div className={styles.page}>
                <Header />

                <main className={styles.body}>
                    <Link to="/admin/log" className={styles.backLink}>
                        ← 목록으로
                    </Link>

                    <section className={styles.emptyBox}>
                        <h1>{log.teamName}</h1>
                        <p>일지 작성이 완료되지 않았습니다.</p>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <Link to="/admin/log" className={styles.backLink}>
                    ← 목록으로
                </Link>

                <article className={styles.detailCard}>
                    <header className={styles.detailHeader}>
                        <div className={styles.headerMain}>
                            <div className={styles.titleGroup}>
                                <h1>{log.teamName}</h1>
                                <span className={styles.statusBadge}>
                                    제출완료
                                </span>
                            </div>
                            <p>
                                팀별 캡스톤 진행 상황과 다음 작업 계획을 확인하는
                                상세 일지입니다.
                            </p>
                        </div>

                        <div className={styles.headerMeta}>
                            <div>
                                <span>작성자</span>
                                <strong>{log.writer}</strong>
                            </div>
                            <div>
                                <span>작성일</span>
                                <time>{log.date}</time>
                            </div>
                        </div>
                    </header>

                    <section className={styles.memberPanel}>
                        <div>
                            <span>팀원</span>
                            <strong>{memberNames.length}명</strong>
                        </div>
                        <ul>
                            {memberNames.map((member) => (
                                <li key={member}>{member}</li>
                            ))}
                        </ul>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>01</span>
                            <h2>팀원별 활동 내용</h2>
                        </div>
                        <div className={styles.entryList}>
                            {memberEntries.map((entry) => (
                                <div key={entry.id} className={styles.entryBox}>
                                    <strong>{entry.name}</strong>
                                    <p>{entry.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>02</span>
                            <h2>오늘 방과후 프로젝트 진행 상황</h2>
                        </div>
                        <div className={styles.summaryBox}>
                            <p>
                                이번 캡스톤 시간에 백엔드는 API 명세서를 재구성
                                하였고, 로그인율 90% 구현하였습니다. AI는 출력
                                데이터의 형식을 다듬고 Structured Outputs를
                                공부하고 직접 코드에 넣으며 분석 결과의 질을
                                높였습니다. 또한 FastAPI로 서버를 구축하기 위해
                                공부하였습니다. 프론트엔드는 같은 항목 협업이
                                참여하지 못하여 이번 시간에 진행하지
                                못하였습니다.
                            </p>
                        </div>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>03</span>
                            <h2>다음 캡스톤 시간까지 팀원별 진행할 내용</h2>
                        </div>
                        <div className={styles.entryList}>
                            {memberEntries.map((entry) => (
                                <div
                                    key={`next-${entry.id}`}
                                    className={styles.entryBox}
                                >
                                    <strong>{entry.name}</strong>
                                    <p>
                                        담당 기능의 남은 구현 범위를 정리하고,
                                        다음 회의 전까지 화면 또는 API 연결 가능
                                        상태까지 작업을 진행합니다.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>04</span>
                            <h2>오늘 프로젝트 수행 만족도 및 자기 반성</h2>
                        </div>
                        <div className={styles.entryList}>
                            {memberEntries.map((entry) => (
                                <div
                                    key={`reflection-${entry.id}`}
                                    className={styles.entryBox}
                                >
                                    <strong>{entry.name}</strong>
                                    <p>
                                        맡은 작업을 진행하면서 부족한 부분을
                                        확인했고, 다음 시간에는 구현 범위를 더
                                        작게 나누어 완성도를 높일 예정입니다.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </article>
            </main>
        </div>
    );
};

export default AdminLogDetail;
