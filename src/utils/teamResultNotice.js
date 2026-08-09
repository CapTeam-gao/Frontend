// 팀 배정 결과 공지의 content(마크다운)에서 관리자가 수정 가능한 텍스트 조각을 뽑아낸다.
// AdminNoticeService.TeamAssignmentNoticeService.buildContent()가 만드는 형식(제목 문단 →
// 설명 문단 → "## 확인 사항" 문단 → --- → 팀 목록 → 마지막 문단이 안내 문구)을 그대로 가정한다.
// 관리자가 이 구조를 벗어나게 편집하면 null을 반환해 호출부가 일반 마크다운으로 대체 렌더링하게 한다.
export const parseTeamResultNoticeContent = (content) => {
    if (!content) return null;

    const paragraphs = content
        .trim()
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    let index = 0;
    if (paragraphs[index]?.startsWith("# ")) index++;

    const introLines = paragraphs[index]
        ?.split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    if (!introLines || introLines.length === 0) return null;
    index++;

    const heroTitle = introLines[0];
    const heroDescription = introLines.slice(1).join(" ");

    const guideParagraph = paragraphs[index];
    if (!guideParagraph?.startsWith("##")) return null;
    index++;

    const guideLines = guideParagraph.split("\n").map((line) => line.trim());
    const guideTitle = guideLines[0].replace(/^#+\s*/, "");
    const guideItems = guideLines
        .filter((line) => line.startsWith("- "))
        .map((line) => line.replace(/^-\s*/, ""));
    if (guideItems.length === 0) return null;

    const footerNote = paragraphs[paragraphs.length - 1];
    if (!footerNote || footerNote.startsWith("#")) return null;

    return { heroTitle, heroDescription, guideTitle, guideItems, footerNote };
};
