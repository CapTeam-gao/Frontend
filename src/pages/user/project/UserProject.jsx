import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Header from "../../../components/common/header/Header";
import UserPlanForm from "../../../components/user/project/UserPlanForm";
import {
    requestSaveUserProjectPlan,
    requestUserProjectPlan,
} from "../../../api/projectApi";
import {
    emptyProjectPlan,
    getMainFeaturesText,
    hasEmptyProjectPlanField,
    normalizeProjectPlan,
} from "../../../utils/projectPlan";
import styles from "./UserProject.module.css";

const contentVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 260, damping: 28 },
    },
};

const UserProject = () => {
    const navigate = useNavigate();
    const [projectPlan, setProjectPlan] = useState(emptyProjectPlan);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const hasSavedPlan = Boolean(projectPlan.projectId);

    useEffect(() => {
        const getProjectPlan = async () => {
            try {
                const data = await requestUserProjectPlan();
                setProjectPlan(normalizeProjectPlan(data));
            } catch {
                setError("저장된 기획서를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getProjectPlan();
    }, []);

    const updateField = (field, value) => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            [field]: value,
        }));
        setError("");
    };

    const addCoreFeature = () => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            coreFeatures: [
                ...prevPlan.coreFeatures,
                {
                    id: Date.now(),
                    value: "",
                },
            ],
        }));
    };

    const updateCoreFeature = (id, value) => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            coreFeatures: prevPlan.coreFeatures.map((feature) =>
                feature.id === id ? { ...feature, value } : feature
            ),
        }));
    };

    const removeCoreFeature = (id) => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            coreFeatures: prevPlan.coreFeatures.filter(
                (feature) => feature.id !== id
            ),
        }));
    };

    const scrollToSection = (event, sectionId) => {
        event.preventDefault();

        document.getElementById(sectionId)?.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            block: "start",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (hasEmptyProjectPlanField(projectPlan)) {
            setError("모든 항목을 작성해야 저장할 수 있습니다.");
            return;
        }

        try {
            setIsSubmitting(true);
            const savedPlan = await requestSaveUserProjectPlan({
                ...projectPlan,
                coreFeatures: getMainFeaturesText(projectPlan.coreFeatures),
            });
            setProjectPlan(normalizeProjectPlan(savedPlan));
            navigate("/user/dashboard");
        } catch {
            setError("기획서를 저장하지 못했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <div className={styles.inner}>
                    <motion.section
                        className={styles.pageHead}
                        initial={shouldReduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={contentVariants}
                    >
                        <h1 className={styles.headline}>프로젝트 기획서</h1>
                    </motion.section>

                    <motion.div
                        className={styles.workspace}
                        initial={shouldReduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={contentVariants}
                    >
                        <aside className={styles.guide} aria-label="기획서 항목">
                            <p className={styles.guideLabel}>작성 항목</p>
                            <nav className={styles.guideNav}>
                                <a
                                    href="#project-basic"
                                    onClick={(event) =>
                                        scrollToSection(event, "project-basic")
                                    }
                                >
                                    <span>01</span> 기본 정보
                                </a>
                                <a
                                    href="#project-intro"
                                    onClick={(event) =>
                                        scrollToSection(event, "project-intro")
                                    }
                                >
                                    <span>02</span> 서비스 소개
                                </a>
                                <a
                                    href="#project-features"
                                    onClick={(event) =>
                                        scrollToSection(event, "project-features")
                                    }
                                >
                                    <span>03</span> 주요 기능
                                </a>
                            </nav>
                        </aside>

                        <div className={styles.formArea}>
                            <UserPlanForm
                                projectPlan={projectPlan}
                                hasSavedPlan={hasSavedPlan}
                                error={error}
                                isLoading={isLoading}
                                isSubmitting={isSubmitting}
                                onSubmit={handleSubmit}
                                onFieldChange={updateField}
                                onAddFeature={addCoreFeature}
                                onFeatureChange={updateCoreFeature}
                                onRemoveFeature={removeCoreFeature}
                            />
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default UserProject;
