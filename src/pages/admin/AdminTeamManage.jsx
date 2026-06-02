// import { Link } from "react-router-dom";
// import Header from "../../components/common/Header";
// import { initialTeams } from "../../data/teamDummy";
// import styles from "./AdminTeamManage.module.css";

// const MemberRow = ({ member }) => {
//     return (
//         <li className={styles.memberItem}>
//             <strong className={styles.memberName}>
//                 {member.number} {member.name}
//             </strong>
//             <span className={styles.positionBadge}>{member.position}</span>
//             {member.leader && <span className={styles.leaderBadge}>팀장</span>}
//             <span className={styles.stackText}>{member.stack}</span>
//             <span className={styles.gradeText}>중</span>
//         </li>
//     );
// };

// const TeamCard = ({ team }) => {
//     return (
//         <article className={styles.teamCard}>
//             <header className={styles.teamHeader}>
//                 <h2 className={styles.teamName}>{team.name}</h2>
//                 <p className={styles.teamSummary}>{team.summary}</p>
//             </header>

//             <ul className={styles.memberList}>
//                 {team.members.map((member) => (
//                     <MemberRow key={member.id} member={member} />
//                 ))}
//             </ul>
//         </article>
//     );
// };

// const AdminTeamManage = () => {
//     return (
//         <div className={styles.page}>
//             <p className={styles.pageTitle}>팀 수정 및 승인 페이지(어드민)</p>

//             <section className={styles.panel}>
//                 <Header />

//                 <main className={styles.content}>
//                     <Link to="/admin/team-create" className={styles.backLink}>
//                         ← 처음으로
//                     </Link>

//                     <div className={styles.titleArea}>
//                         <div>
//                             <h1 className={styles.title}>
//                                 팀 구성 검토 및 수정
//                             </h1>
//                             <p className={styles.tipText}>
//                                 팁: 수정 화면에서 학생을 클릭하면 다른 팀
//                                 학생과 변경할 수 있습니다
//                             </p>
//                         </div>

//                         <div className={styles.actionArea}>
//                             <Link
//                                 to="/admin/team-create/loading"
//                                 className={styles.secondaryButton}
//                             >
//                                 재생성
//                             </Link>
//                             <Link
//                                 to="/admin/team-edit"
//                                 className={styles.editButton}
//                             >
//                                 팀 수정하기
//                             </Link>
//                             <button
//                                 type="button"
//                                 className={styles.primaryButton}
//                             >
//                                 팀 구성 승인
//                             </button>
//                         </div>
//                     </div>

//                     <div className={styles.teamGrid}>
//                         {initialTeams.map((team) => (
//                             <TeamCard key={team.id} team={team} />
//                         ))}
//                     </div>
//                 </main>
//             </section>
//         </div>
//     );
// };

// export default AdminTeamManage;
