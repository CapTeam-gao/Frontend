# 3학년 팀 생성 테스트용 SQL

아래 SQL은 3학년 학생 테스트 데이터용입니다.

- 계정 범위: `stu3101~stu3116`, `stu3201~stu3216`, `stu3301~stu3316`, `stu3401~stu3416`
- 비밀번호: 전부 `1234`
- 학년: 전부 `GRADE_3`
- 설문 완료: 전부 `true`
- 팀장 선호, 희망 직군, 선호 팀원 포함
- 기술 스택은 학생별로 2~5개 랜덤성 있게 구성
- 구현 경험은 학생별 3개 이상
- `user_analysis`는 AI가 직접 분석하도록 INSERT하지 않음

```sql
USE gao_db;

START TRANSACTION;

DELETE FROM user_preferred_teammates
WHERE user_user_id IN (
'stu3101','stu3102','stu3103','stu3104','stu3105','stu3106','stu3107','stu3108','stu3109','stu3110','stu3111','stu3112','stu3113','stu3114','stu3115','stu3116',
'stu3201','stu3202','stu3203','stu3204','stu3205','stu3206','stu3207','stu3208','stu3209','stu3210','stu3211','stu3212','stu3213','stu3214','stu3215','stu3216',
'stu3301','stu3302','stu3303','stu3304','stu3305','stu3306','stu3307','stu3308','stu3309','stu3310','stu3311','stu3312','stu3313','stu3314','stu3315','stu3316',
'stu3401','stu3402','stu3403','stu3404','stu3405','stu3406','stu3407','stu3408','stu3409','stu3410','stu3411','stu3412','stu3413','stu3414','stu3415','stu3416'
);

DELETE FROM user_experience
WHERE user_user_id IN (
'stu3101','stu3102','stu3103','stu3104','stu3105','stu3106','stu3107','stu3108','stu3109','stu3110','stu3111','stu3112','stu3113','stu3114','stu3115','stu3116',
'stu3201','stu3202','stu3203','stu3204','stu3205','stu3206','stu3207','stu3208','stu3209','stu3210','stu3211','stu3212','stu3213','stu3214','stu3215','stu3216',
'stu3301','stu3302','stu3303','stu3304','stu3305','stu3306','stu3307','stu3308','stu3309','stu3310','stu3311','stu3312','stu3313','stu3314','stu3315','stu3316',
'stu3401','stu3402','stu3403','stu3404','stu3405','stu3406','stu3407','stu3408','stu3409','stu3410','stu3411','stu3412','stu3413','stu3414','stu3415','stu3416'
);

DELETE FROM user_skill
WHERE user_user_id IN (
'stu3101','stu3102','stu3103','stu3104','stu3105','stu3106','stu3107','stu3108','stu3109','stu3110','stu3111','stu3112','stu3113','stu3114','stu3115','stu3116',
'stu3201','stu3202','stu3203','stu3204','stu3205','stu3206','stu3207','stu3208','stu3209','stu3210','stu3211','stu3212','stu3213','stu3214','stu3215','stu3216',
'stu3301','stu3302','stu3303','stu3304','stu3305','stu3306','stu3307','stu3308','stu3309','stu3310','stu3311','stu3312','stu3313','stu3314','stu3315','stu3316',
'stu3401','stu3402','stu3403','stu3404','stu3405','stu3406','stu3407','stu3408','stu3409','stu3410','stu3411','stu3412','stu3413','stu3414','stu3415','stu3416'
);

DELETE FROM user_analysis
WHERE user_id IN (
'stu3101','stu3102','stu3103','stu3104','stu3105','stu3106','stu3107','stu3108','stu3109','stu3110','stu3111','stu3112','stu3113','stu3114','stu3115','stu3116',
'stu3201','stu3202','stu3203','stu3204','stu3205','stu3206','stu3207','stu3208','stu3209','stu3210','stu3211','stu3212','stu3213','stu3214','stu3215','stu3216',
'stu3301','stu3302','stu3303','stu3304','stu3305','stu3306','stu3307','stu3308','stu3309','stu3310','stu3311','stu3312','stu3313','stu3314','stu3315','stu3316',
'stu3401','stu3402','stu3403','stu3404','stu3405','stu3406','stu3407','stu3408','stu3409','stu3410','stu3411','stu3412','stu3413','stu3414','stu3415','stu3416'
);

INSERT INTO users (
    user_id, name, password, password_encoded, account_role, grade,
    survey_completed, wants_leader, student_role,
    personality_communication, personality_responsibility, personality_collaboration,
    personality_flexibility, personality_emotional_stability,
    development_leadership, development_problem_solving, development_implementation,
    development_learning_ability, development_planning
)
VALUES
('stu3101','김현서','1234',false,'STUDENT','GRADE_3',true,true,'FRONTEND',4.5,4.0,4.5,4.0,4.0,4.0,4.5,4.5,4.0,4.0),
('stu3102','이도윤','1234',false,'STUDENT','GRADE_3',true,false,'BACKEND',3.5,4.5,4.0,3.5,3.5,3.5,4.5,4.0,4.0,4.0),
('stu3103','박서준','1234',false,'STUDENT','GRADE_3',true,false,'AI',4.0,3.5,4.0,4.0,3.5,3.0,4.0,3.5,4.5,3.5),
('stu3104','최유진','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.5,4.0,4.5,4.0,4.0,3.0,3.5,3.5,4.0,4.5),
('stu3105','정민재','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.5,4.0,3.5,4.0,3.5,3.0,4.0,4.0,4.0,3.5),
('stu3106','강태현','1234',false,'STUDENT','GRADE_3',true,true,'BACKEND',4.0,4.5,4.0,3.5,4.0,4.5,4.5,4.5,4.0,4.0),
('stu3107','조하윤','1234',false,'STUDENT','GRADE_3',true,false,'FRONTEND',3.5,3.5,4.0,4.5,3.5,3.0,3.5,4.0,4.0,3.5),
('stu3108','윤시우','1234',false,'STUDENT','GRADE_3',true,false,'AI',4.0,4.0,3.5,4.0,4.0,3.5,4.0,4.0,4.5,3.5),
('stu3109','한지민','1234',false,'STUDENT','GRADE_3',true,true,'DESIGN',4.5,4.0,4.5,4.5,4.0,4.0,3.5,4.0,4.0,4.5),
('stu3110','임준호','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.0,3.5,3.5,4.0,3.0,3.0,3.5,3.5,4.0,3.5),
('stu3111','서민규','1234',false,'STUDENT','GRADE_3',true,false,'DEVOPS',3.5,4.0,3.5,3.0,3.5,3.0,4.0,3.5,3.5,3.5),
('stu3112','오서연','1234',false,'STUDENT','GRADE_3',true,false,'SECURITY',4.0,3.5,4.0,4.0,3.5,3.5,3.5,4.0,4.0,3.5),
('stu3113','신지호','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.0,3.5,3.0,3.5,3.5,2.5,3.5,3.0,4.0,3.0),
('stu3114','배하린','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.0,3.5,4.0,4.0,4.0,3.0,3.0,3.5,3.5,4.0),
('stu3115','문도현','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.5,3.0,3.5,4.0,3.0,2.5,3.5,3.0,3.5,3.0),
('stu3116','권준서','1234',false,'STUDENT','GRADE_3',true,true,'BACKEND',4.0,4.5,4.0,3.5,4.0,4.0,4.5,4.0,4.0,4.0),

('stu3201','남유찬','1234',false,'STUDENT','GRADE_3',true,false,'FRONTEND',4.0,4.0,4.0,4.0,3.5,3.5,4.0,4.0,4.0,4.0),
('stu3202','송다현','1234',false,'STUDENT','GRADE_3',true,false,'BACKEND',3.5,4.5,4.0,3.5,4.0,3.5,4.0,4.5,4.0,4.0),
('stu3203','유준영','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.5,3.5,3.5,4.0,3.5,3.0,4.0,3.5,4.0,3.5),
('stu3204','장예은','1234',false,'STUDENT','GRADE_3',true,true,'DESIGN',4.5,4.0,4.5,4.0,4.0,4.0,3.5,4.0,4.5,4.5),
('stu3205','황지후','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.0,3.5,3.5,3.5,3.0,2.5,3.5,3.5,3.5,3.0),
('stu3206','백승민','1234',false,'STUDENT','GRADE_3',true,false,'BACKEND',4.0,4.0,3.5,3.5,3.5,3.5,4.0,4.0,3.5,3.5),
('stu3207','전서윤','1234',false,'STUDENT','GRADE_3',true,false,'FRONTEND',4.0,3.5,4.0,4.5,3.5,3.0,3.5,4.0,4.0,3.5),
('stu3208','고민준','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.5,4.0,3.5,4.0,4.0,3.0,4.5,3.5,4.5,3.5),
('stu3209','류하준','1234',false,'STUDENT','GRADE_3',true,true,'BACKEND',4.0,4.5,4.0,3.5,4.0,4.0,4.5,4.5,4.0,4.0),
('stu3210','차서아','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.0,3.5,4.5,4.5,4.0,3.0,3.5,3.5,4.0,4.0),
('stu3211','홍태민','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.5,3.5,3.5,4.0,3.5,3.0,3.5,4.0,4.0,3.5),
('stu3212','안채원','1234',false,'STUDENT','GRADE_3',true,false,'SECURITY',3.5,4.0,4.0,3.5,3.5,3.0,3.5,3.5,3.5,3.5),
('stu3213','노이준','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.0,3.5,3.0,4.0,3.5,2.5,3.5,3.0,4.0,3.0),
('stu3214','마도윤','1234',false,'STUDENT','GRADE_3',true,false,'DEVOPS',3.5,4.0,3.5,3.0,3.5,3.0,4.0,3.5,3.5,3.5),
('stu3215','표수아','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.0,3.5,4.0,4.0,4.0,3.0,3.0,3.5,3.5,4.0),
('stu3216','하민준','1234',false,'STUDENT','GRADE_3',true,true,'APP',4.0,4.0,4.0,4.0,3.5,4.0,4.0,4.5,4.0,4.0),

('stu3301','김서율','1234',false,'STUDENT','GRADE_3',true,true,'FRONTEND',4.5,4.0,4.5,3.5,4.0,4.0,4.0,4.5,4.0,4.5),
('stu3302','이태오','1234',false,'STUDENT','GRADE_3',true,false,'BACKEND',3.5,4.5,4.0,3.5,3.5,3.0,4.5,4.5,4.0,4.0),
('stu3303','박하준','1234',false,'STUDENT','GRADE_3',true,false,'AI',4.0,4.0,3.5,4.0,3.5,3.5,4.5,4.0,4.5,3.5),
('stu3304','최민서','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.5,4.0,4.5,4.5,4.0,3.0,3.5,3.5,4.0,4.5),
('stu3305','정시윤','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.5,4.0,4.0,4.0,3.5,3.0,4.0,4.0,4.5,3.5),
('stu3306','강예준','1234',false,'STUDENT','GRADE_3',true,true,'BACKEND',4.0,4.5,4.0,3.5,4.0,4.5,4.5,4.5,4.0,4.0),
('stu3307','조은서','1234',false,'STUDENT','GRADE_3',true,false,'APP',4.0,3.5,4.0,4.0,3.5,3.5,4.0,4.5,4.0,3.5),
('stu3308','윤지후','1234',false,'STUDENT','GRADE_3',true,true,'AI',4.0,4.0,4.0,4.5,3.5,4.0,4.5,4.0,4.5,4.0),
('stu3309','한민재','1234',false,'STUDENT','GRADE_3',true,true,'FRONTEND',4.0,4.5,4.5,4.0,4.0,4.0,4.0,4.5,4.0,4.5),
('stu3310','임하은','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',3.5,4.0,4.0,4.0,3.5,3.0,3.0,3.5,4.0,4.0),
('stu3311','서도윤','1234',false,'STUDENT','GRADE_3',true,false,'DEVOPS',3.0,3.5,3.5,3.0,3.5,2.5,3.5,3.0,3.5,3.0),
('stu3312','오지민','1234',false,'STUDENT','GRADE_3',true,false,'FRONTEND',3.5,3.5,4.0,4.0,3.5,3.0,3.5,3.5,4.0,3.5),
('stu3313','신하람','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.0,3.5,3.0,3.5,3.5,2.5,3.5,3.0,4.0,3.0),
('stu3314','배지윤','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.0,3.5,4.0,4.0,4.0,3.0,3.0,3.5,3.5,4.0),
('stu3315','문시온','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.5,3.0,3.5,4.0,3.0,2.5,3.5,3.0,3.5,3.0),
('stu3316','권서준','1234',false,'STUDENT','GRADE_3',true,true,'SECURITY',4.0,4.5,4.0,3.5,4.0,4.0,4.5,4.0,4.0,4.0),

('stu3401','남시현','1234',false,'STUDENT','GRADE_3',true,false,'FRONTEND',4.0,4.0,4.0,4.0,3.5,3.5,4.0,4.0,4.0,4.0),
('stu3402','송민서','1234',false,'STUDENT','GRADE_3',true,false,'BACKEND',3.5,4.5,4.0,3.5,4.0,3.5,4.0,4.5,4.0,4.0),
('stu3403','유하린','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.5,3.5,3.5,4.0,3.5,3.0,4.0,3.5,4.0,3.5),
('stu3404','장도현','1234',false,'STUDENT','GRADE_3',true,true,'DESIGN',4.5,4.0,4.5,4.0,4.0,4.0,3.5,4.0,4.5,4.5),
('stu3405','황유빈','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.0,3.5,3.5,3.5,3.0,2.5,3.5,3.5,3.5,3.0),
('stu3406','백서준','1234',false,'STUDENT','GRADE_3',true,false,'BACKEND',4.0,4.0,3.5,3.5,3.5,3.5,4.0,4.0,3.5,3.5),
('stu3407','전지안','1234',false,'STUDENT','GRADE_3',true,false,'FRONTEND',4.0,3.5,4.0,4.5,3.5,3.0,3.5,4.0,4.0,3.5),
('stu3408','고준우','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.5,4.0,3.5,4.0,4.0,3.0,4.5,3.5,4.5,3.5),
('stu3409','류지호','1234',false,'STUDENT','GRADE_3',true,true,'BACKEND',4.0,4.5,4.0,3.5,4.0,4.0,4.5,4.5,4.0,4.0),
('stu3410','차하윤','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.0,3.5,4.5,4.5,4.0,3.0,3.5,3.5,4.0,4.0),
('stu3411','홍서준','1234',false,'STUDENT','GRADE_3',true,false,'APP',3.5,3.5,3.5,4.0,3.5,3.0,3.5,4.0,4.0,3.5),
('stu3412','안예린','1234',false,'STUDENT','GRADE_3',true,false,'SECURITY',3.5,4.0,4.0,3.5,3.5,3.0,3.5,3.5,3.5,3.5),
('stu3413','노태윤','1234',false,'STUDENT','GRADE_3',true,false,'AI',3.0,3.5,3.0,4.0,3.5,2.5,3.5,3.0,4.0,3.0),
('stu3414','마지훈','1234',false,'STUDENT','GRADE_3',true,false,'DEVOPS',3.5,4.0,3.5,3.0,3.5,3.0,4.0,3.5,3.5,3.5),
('stu3415','표서연','1234',false,'STUDENT','GRADE_3',true,false,'DESIGN',4.0,3.5,4.0,4.0,4.0,3.0,3.0,3.5,3.5,4.0),
('stu3416','하태민','1234',false,'STUDENT','GRADE_3',true,true,'APP',4.0,4.0,4.0,4.0,3.5,4.0,4.0,4.5,4.0,4.0)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password = VALUES(password),
    password_encoded = VALUES(password_encoded),
    account_role = VALUES(account_role),
    grade = VALUES(grade),
    survey_completed = VALUES(survey_completed),
    wants_leader = VALUES(wants_leader),
    student_role = VALUES(student_role),
    personality_communication = VALUES(personality_communication),
    personality_responsibility = VALUES(personality_responsibility),
    personality_collaboration = VALUES(personality_collaboration),
    personality_flexibility = VALUES(personality_flexibility),
    personality_emotional_stability = VALUES(personality_emotional_stability),
    development_leadership = VALUES(development_leadership),
    development_problem_solving = VALUES(development_problem_solving),
    development_implementation = VALUES(development_implementation),
    development_learning_ability = VALUES(development_learning_ability),
    development_planning = VALUES(development_planning);

INSERT INTO user_skill (user_user_id, skill)
VALUES
('stu3101','React'),('stu3101','TypeScript'),('stu3101','Axios'),('stu3101','CSS Modules'),
('stu3102','Java'),('stu3102','Spring Boot'),('stu3102','MySQL'),('stu3102','JPA'),('stu3102','JWT'),
('stu3103','Python'),('stu3103','Pandas'),('stu3103','FastAPI'),
('stu3104','Figma'),('stu3104','Wireframe'),('stu3104','Prototype'),('stu3104','UI/UX'),
('stu3105','Flutter'),('stu3105','Dart'),('stu3105','Firebase'),
('stu3106','Java'),('stu3106','Spring Security'),('stu3106','Docker'),('stu3106','Redis'),('stu3106','AWS'),
('stu3107','React'),('stu3107','JavaScript'),('stu3107','React Router'),
('stu3108','Python'),('stu3108','LangChain'),('stu3108','Prompt Engineering'),('stu3108','FastAPI'),
('stu3109','Figma'),('stu3109','Design System'),('stu3109','User Flow'),('stu3109','Prototype'),
('stu3110','Kotlin'),('stu3110','Android'),('stu3110','REST API'),
('stu3111','Docker'),('stu3111','Nginx'),('stu3111','GitHub Actions'),('stu3111','Linux'),
('stu3112','Network'),('stu3112','Spring Security'),('stu3112','JWT'),('stu3112','OWASP'),
('stu3113','Python'),('stu3113','NumPy'),
('stu3114','Figma'),('stu3114','Canva'),('stu3114','Wireframe'),
('stu3115','Flutter'),('stu3115','Firebase'),
('stu3116','Java'),('stu3116','Spring Boot'),('stu3116','JPA'),('stu3116','MySQL'),

('stu3201','React'),('stu3201','Zustand'),('stu3201','Axios'),('stu3201','React Router'),
('stu3202','Java'),('stu3202','Spring Boot'),('stu3202','JPA'),('stu3202','Docker'),
('stu3203','Python'),('stu3203','FastAPI'),('stu3203','Pandas'),
('stu3204','Figma'),('stu3204','UI/UX'),('stu3204','Design System'),('stu3204','Prototype'),
('stu3205','Flutter'),('stu3205','Dart'),
('stu3206','Java'),('stu3206','Spring Boot'),('stu3206','MySQL'),('stu3206','JWT'),
('stu3207','React'),('stu3207','JavaScript'),('stu3207','CSS Modules'),
('stu3208','Python'),('stu3208','LangGraph'),('stu3208','LangSmith'),('stu3208','Upstage API'),
('stu3209','Java'),('stu3209','Spring Security'),('stu3209','Redis'),('stu3209','Docker'),('stu3209','AWS'),
('stu3210','Figma'),('stu3210','Wireframe'),('stu3210','User Research'),
('stu3211','React Native'),('stu3211','Firebase'),('stu3211','WebSocket'),
('stu3212','Linux'),('stu3212','Security'),('stu3212','JWT'),
('stu3213','Python'),('stu3213','Pandas'),('stu3213','Prompt Engineering'),
('stu3214','Docker'),('stu3214','Nginx'),('stu3214','AWS'),
('stu3215','Figma'),('stu3215','Prototype'),
('stu3216','Flutter'),('stu3216','Dart'),('stu3216','Provider'),('stu3216','REST API'),

('stu3301','React'),('stu3301','JavaScript'),('stu3301','Zustand'),('stu3301','Axios'),('stu3301','CSS Modules'),
('stu3302','Java'),('stu3302','Spring Boot'),('stu3302','JPA'),('stu3302','MySQL'),('stu3302','JWT'),
('stu3303','Python'),('stu3303','FastAPI'),('stu3303','Pandas'),('stu3303','LangChain'),
('stu3304','Figma'),('stu3304','Design System'),('stu3304','Wireframe'),('stu3304','Prototype'),('stu3304','UI/UX'),
('stu3305','Flutter'),('stu3305','Dart'),('stu3305','Firebase'),('stu3305','REST API'),
('stu3306','Java'),('stu3306','Spring Security'),('stu3306','Docker'),('stu3306','MySQL'),('stu3306','AWS'),
('stu3307','React Native'),('stu3307','Kotlin'),('stu3307','Firebase'),('stu3307','WebSocket'),
('stu3308','Python'),('stu3308','FastAPI'),('stu3308','LangGraph'),('stu3308','LangSmith'),('stu3308','Upstage API'),
('stu3309','React'),('stu3309','JavaScript'),('stu3309','React Router'),('stu3309','Axios'),('stu3309','Zustand'),
('stu3310','Figma'),('stu3310','User Flow'),('stu3310','Prototype'),
('stu3311','Docker'),('stu3311','GitHub Actions'),('stu3311','Linux'),
('stu3312','React'),('stu3312','HTML'),('stu3312','CSS'),
('stu3313','Python'),('stu3313','Pandas'),
('stu3314','Figma'),('stu3314','Canva'),('stu3314','Wireframe'),
('stu3315','Flutter'),('stu3315','Firebase'),
('stu3316','Spring Security'),('stu3316','JWT'),('stu3316','Network'),('stu3316','OWASP'),

('stu3401','React'),('stu3401','TypeScript'),('stu3401','React Query'),('stu3401','Axios'),
('stu3402','Java'),('stu3402','Spring Boot'),('stu3402','MySQL'),('stu3402','Docker'),
('stu3403','Python'),('stu3403','FastAPI'),('stu3403','Pandas'),
('stu3404','Figma'),('stu3404','UI/UX'),('stu3404','Design System'),('stu3404','Prototype'),
('stu3405','Flutter'),('stu3405','Dart'),
('stu3406','Java'),('stu3406','Spring Boot'),('stu3406','JPA'),('stu3406','JWT'),
('stu3407','React'),('stu3407','JavaScript'),('stu3407','CSS Modules'),('stu3407','Vite'),
('stu3408','Python'),('stu3408','LangChain'),('stu3408','Prompt Engineering'),('stu3408','FastAPI'),
('stu3409','Java'),('stu3409','Spring Security'),('stu3409','Redis'),('stu3409','AWS'),
('stu3410','Figma'),('stu3410','Wireframe'),('stu3410','User Research'),
('stu3411','React Native'),('stu3411','Firebase'),('stu3411','WebSocket'),
('stu3412','Network'),('stu3412','Security'),('stu3412','JWT'),
('stu3413','Python'),('stu3413','NumPy'),('stu3413','Pandas'),
('stu3414','Docker'),('stu3414','Nginx'),('stu3414','GitHub Actions'),
('stu3415','Figma'),('stu3415','Prototype'),
('stu3416','Flutter'),('stu3416','Dart'),('stu3416','Provider'),('stu3416','REST API');

INSERT INTO user_experience (user_user_id, experience)
VALUES
('stu3101','React로 관리자 대시보드 화면을 구현하고 API 응답값에 따라 팀 생성 전후 UI가 바뀌도록 조건부 렌더링을 적용했습니다.'),
('stu3101','Axios를 사용해 공지 목록 조회 API를 연결하고 Loading, Error, Empty 상태를 나누어 화면에 표시했습니다.'),
('stu3101','CSS Modules로 공통 카드 UI를 구성하고 반응형 화면에서도 버튼과 텍스트가 깨지지 않도록 스타일을 조정했습니다.'),
('stu3102','Spring Boot로 공지 CRUD REST API를 구현하고 Controller, Service, Repository 계층을 분리했습니다.'),
('stu3102','JWT 로그인 흐름을 구현하며 accessToken을 발급하고 Spring Security 필터에서 인증을 검증하도록 구성했습니다.'),
('stu3102','JPA 연관관계를 사용해 사용자와 팀 데이터를 저장하고 MySQL 기준으로 조회 쿼리를 테스트했습니다.'),
('stu3103','FastAPI로 학생 분석 요청을 받는 API를 만들고 설문 데이터를 기반으로 기술 점수와 역할 추천 결과를 반환했습니다.'),
('stu3103','Pandas로 학생별 기술 스택과 성향 점수를 정리하고 팀 매칭에 사용할 수 있도록 JSON 데이터 구조를 설계했습니다.'),
('stu3103','프롬프트를 수정해 LLM이 학생 이름을 임의로 만들지 않고 주어진 학생 목록 안에서만 결과를 생성하도록 제한했습니다.'),
('stu3104','Figma로 학생과 관리자 화면 흐름을 분리한 와이어프레임을 제작하고 공통 컴포넌트 기준을 정리했습니다.'),
('stu3104','공지 상세, 팀 관리, 학생 관리 모달 화면의 정보 우선순위를 정리해 사용자가 필요한 정보를 먼저 볼 수 있도록 디자인했습니다.'),
('stu3104','디자인 시스템 색상과 버튼 상태를 정리해 프론트엔드 CSS 변수로 옮기기 쉽게 구성했습니다.'),
('stu3105','Flutter로 로그인 화면과 설문 입력 화면을 구현하고 Provider를 사용해 입력 상태를 관리했습니다.'),
('stu3105','Firebase Cloud Messaging을 이용해 공지 알림을 받는 테스트 앱을 제작했습니다.'),
('stu3105','REST API 응답을 받아 모바일 리스트 화면에 렌더링하고 로딩 상태와 실패 상태를 분리했습니다.'),
('stu3106','Spring Security와 JWT를 사용해 관리자/학생 권한을 분리하고 Protected API 접근 흐름을 구현했습니다.'),
('stu3106','Docker Compose로 MySQL과 Spring Boot 서버 실행 환경을 구성하고 팀원이 같은 환경에서 실행할 수 있도록 정리했습니다.'),
('stu3106','AWS 배포 테스트를 진행하며 환경변수와 DB 연결 설정을 분리했습니다.'),
('stu3107','React로 검색 input과 필터 버튼을 만들고 useState를 사용해 조건에 맞는 리스트만 보여줬습니다.'),
('stu3107','React Router로 상세 페이지 이동을 구현하고 URL 파라미터를 읽어 상세 데이터를 찾는 흐름을 만들었습니다.'),
('stu3107','컴포넌트 props로 카드 제목과 설명을 전달해 재사용 가능한 목록 UI를 구성했습니다.'),
('stu3108','LangChain 예제를 활용해 입력 문장을 요약하는 간단한 프롬프트 체인을 구성했습니다.'),
('stu3108','FastAPI에서 분석 요청을 받아 LLM 호출 결과를 JSON으로 반환하는 테스트 API를 만들었습니다.'),
('stu3108','프롬프트 결과가 흔들리지 않도록 출력 형식을 고정하는 실험을 진행했습니다.'),
('stu3109','Figma에서 디자인 시스템 색상과 버튼 상태를 정리하고 팀원들이 같은 기준으로 화면을 만들 수 있게 했습니다.'),
('stu3109','사용자 흐름도를 작성해 학생과 관리자 기능이 어디서 분기되는지 정리했습니다.'),
('stu3109','모달 화면에서 정보가 너무 많아 보이지 않도록 섹션별 제목과 여백을 조정했습니다.'),
('stu3110','Kotlin으로 간단한 할 일 목록 앱을 만들고 RecyclerView로 데이터를 표시했습니다.'),
('stu3110','Android에서 Retrofit을 사용해 API 요청을 보내고 응답을 화면에 출력했습니다.'),
('stu3110','버튼 클릭 시 화면이 이동하는 Activity 전환 흐름을 구현했습니다.'),
('stu3111','Docker Compose로 백엔드와 DB 실행 환경을 맞추고 컨테이너 간 네트워크 연결을 테스트했습니다.'),
('stu3111','Nginx 설정 파일을 수정해 정적 파일을 배포하는 구조를 실습했습니다.'),
('stu3111','GitHub Actions로 main 브랜치 push 시 빌드가 실행되는 워크플로를 작성했습니다.'),
('stu3112','Spring Security 설정에서 인증이 필요한 API와 공개 API를 분리했습니다.'),
('stu3112','JWT 토큰 만료 상황을 테스트하고 인증 실패 시 적절한 에러가 반환되는지 확인했습니다.'),
('stu3112','OWASP 기준을 참고해 로그인 입력값 검증과 인증 흐름에서 주의할 부분을 정리했습니다.'),
('stu3113','Python으로 리스트와 딕셔너리를 사용해 학생 점수 데이터를 정리했습니다.'),
('stu3113','NumPy를 사용해 평균과 최대값을 계산하는 간단한 데이터 처리 실습을 했습니다.'),
('stu3113','분석 결과를 JSON 파일로 저장하고 다시 읽어오는 흐름을 구현했습니다.'),
('stu3114','Figma로 로그인 화면과 마이페이지 화면 초안을 만들고 버튼 위치를 정리했습니다.'),
('stu3114','Canva를 활용해 발표 자료에 들어갈 서비스 소개 이미지를 제작했습니다.'),
('stu3114','와이어프레임을 바탕으로 화면에 필요한 입력 항목과 안내 문구를 정리했습니다.'),
('stu3115','Flutter로 여러 개의 TextField를 가진 입력 화면을 만들고 입력값을 검증했습니다.'),
('stu3115','Firebase Realtime Database에 간단한 사용자 정보를 저장하고 불러오는 테스트를 했습니다.'),
('stu3115','화면 크기에 따라 위젯이 깨지지 않도록 Column과 Expanded를 사용해 레이아웃을 조정했습니다.'),
('stu3116','Spring Boot로 팀 목록 조회 API를 구현하고 DTO로 필요한 데이터만 반환했습니다.'),
('stu3116','JPA Repository 메서드 이름 기반 조회를 사용해 학년별 학생 목록을 가져왔습니다.'),
('stu3116','MySQL에서 외래키 관계를 가진 테이블에 데이터를 넣고 조회하는 테스트를 진행했습니다.');

INSERT INTO user_experience (user_user_id, experience)
SELECT REPLACE(user_id, 'stu31', 'stu32'), experience
FROM (
    SELECT 'stu3101' AS user_id, 'React로 관리자 카드 UI를 만들고 props 기반으로 반복 렌더링하는 구조를 구현했습니다.' AS experience UNION ALL
    SELECT 'stu3101', 'Axios 인터셉터를 사용해 API 요청마다 토큰을 붙이는 흐름을 학습하고 테스트했습니다.' UNION ALL
    SELECT 'stu3101', '반응형 CSS를 적용해 화면 폭이 줄어들어도 리스트 카드가 자연스럽게 내려가도록 조정했습니다.' UNION ALL
    SELECT 'stu3102', 'Spring Boot에서 공지 상세 조회 API를 만들고 존재하지 않는 ID에 대한 예외 처리를 구현했습니다.' UNION ALL
    SELECT 'stu3102', 'JPA로 페이징 조회를 구현하고 목록 응답에 필요한 값만 DTO로 변환했습니다.' UNION ALL
    SELECT 'stu3102', 'Docker로 MySQL 컨테이너를 실행하고 로컬 서버와 연결하는 환경을 구성했습니다.' UNION ALL
    SELECT 'stu3103', 'FastAPI로 학생 설문 데이터를 받아 점수 평균을 계산하는 API를 만들었습니다.' UNION ALL
    SELECT 'stu3103', 'Pandas로 기술 스택별 빈도를 계산하고 팀 매칭에 참고할 수 있는 요약 데이터를 만들었습니다.' UNION ALL
    SELECT 'stu3103', '프롬프트에 JSON 출력 예시를 넣어 LLM 응답 형식을 일정하게 유지하는 실험을 했습니다.' UNION ALL
    SELECT 'stu3104', 'Figma에서 학생 관리 페이지의 카드 구조와 상세 모달 레이아웃을 설계했습니다.' UNION ALL
    SELECT 'stu3104', '디자인 시스템 기준으로 기본 색상, 강조 색상, 상태 배지를 정리했습니다.' UNION ALL
    SELECT 'stu3104', '사용자가 한 화면에서 필요한 정보를 빠르게 찾을 수 있도록 정보 우선순위를 조정했습니다.' UNION ALL
    SELECT 'stu3105', 'Flutter로 공지 목록 화면을 만들고 서버에서 받은 데이터를 카드 형태로 표시했습니다.' UNION ALL
    SELECT 'stu3105', 'Dart 모델 클래스를 만들어 API 응답을 화면 데이터로 변환했습니다.' UNION ALL
    SELECT 'stu3105', 'Firebase를 사용해 로그인 유지 흐름을 테스트하고 로그아웃 기능을 구현했습니다.' UNION ALL
    SELECT 'stu3106', 'Spring Security 필터에서 JWT를 검증하고 SecurityContext에 사용자 정보를 저장했습니다.' UNION ALL
    SELECT 'stu3106', 'AWS EC2에 Spring Boot jar 파일을 배포하고 환경변수로 DB 정보를 분리했습니다.' UNION ALL
    SELECT 'stu3106', 'Redis를 활용해 refreshToken 저장 방식을 테스트했습니다.' UNION ALL
    SELECT 'stu3107', 'React에서 useMemo를 사용해 검색 결과를 계산하고 불필요한 반복 계산을 줄였습니다.' UNION ALL
    SELECT 'stu3107', 'TypeScript 인터페이스로 API 응답 타입을 정의하고 컴포넌트 props 타입을 맞췄습니다.' UNION ALL
    SELECT 'stu3107', 'React Router의 navigate를 사용해 등록 완료 후 목록 페이지로 이동하는 흐름을 구현했습니다.' UNION ALL
    SELECT 'stu3108', 'LangGraph로 분석 단계와 검증 단계를 나누는 워크플로를 구성했습니다.' UNION ALL
    SELECT 'stu3108', 'LangSmith 실행 로그를 확인하며 프롬프트 변경 전후 결과 차이를 비교했습니다.' UNION ALL
    SELECT 'stu3108', 'FastAPI에서 AI 서버 상태 확인용 health check API를 구현했습니다.' UNION ALL
    SELECT 'stu3109', 'Figma로 팀 관리 상세 모달을 설계하고 팀원 목록과 프로젝트 정보를 분리했습니다.' UNION ALL
    SELECT 'stu3109', '프로토타입을 통해 관리자 승인 흐름을 확인할 수 있도록 화면 연결을 구성했습니다.' UNION ALL
    SELECT 'stu3109', '디자인 시안 기준으로 버튼 hover, active 상태를 정리했습니다.' UNION ALL
    SELECT 'stu3110', 'Kotlin으로 채팅방 목록 화면을 만들고 클릭 시 상세 화면으로 이동하도록 구현했습니다.' UNION ALL
    SELECT 'stu3110', 'Retrofit 응답 실패 시 토스트 메시지를 띄우는 예외 처리를 추가했습니다.' UNION ALL
    SELECT 'stu3110', 'Android 화면에서 입력창과 버튼이 키보드에 가리지 않도록 레이아웃을 조정했습니다.' UNION ALL
    SELECT 'stu3111', 'GitHub Actions에서 빌드 실패 로그를 확인하고 원인을 분리하는 과정을 실습했습니다.' UNION ALL
    SELECT 'stu3111', 'Docker 이미지 빌드 후 컨테이너 실행 명령을 정리해 팀원이 같은 방식으로 실행할 수 있게 했습니다.' UNION ALL
    SELECT 'stu3111', 'Nginx reverse proxy 기본 구조를 학습하고 API 서버와 프론트 서버를 나누는 설정을 실험했습니다.' UNION ALL
    SELECT 'stu3112', '로그인 API에서 비밀번호가 틀렸을 때와 토큰이 만료됐을 때의 응답을 구분해 테스트했습니다.' UNION ALL
    SELECT 'stu3112', 'Spring Security 권한 설정을 확인하며 학생 API와 관리자 API 접근 범위를 나눴습니다.' UNION ALL
    SELECT 'stu3112', 'JWT payload에 들어가는 사용자 식별 정보와 권한 정보를 확인하는 테스트를 진행했습니다.' UNION ALL
    SELECT 'stu3113', 'Python으로 설문 점수 평균을 계산하는 함수를 만들고 테스트 데이터를 넣어 확인했습니다.' UNION ALL
    SELECT 'stu3113', '딕셔너리 구조로 학생별 기술 스택을 저장하고 역할별 개수를 계산했습니다.' UNION ALL
    SELECT 'stu3113', 'JSON 파일을 읽어 학생 목록을 만들고 조건에 맞게 정렬하는 실습을 했습니다.' UNION ALL
    SELECT 'stu3114', 'Figma에서 설문조사 페이지의 질문 영역과 선택 버튼 간격을 정리했습니다.' UNION ALL
    SELECT 'stu3114', '학생 대시보드 카드의 아이콘 크기와 제목 위치를 맞춰 화면 통일성을 높였습니다.' UNION ALL
    SELECT 'stu3114', '사용자가 현재 어떤 상태인지 알 수 있도록 배지와 안내 문구를 정리했습니다.' UNION ALL
    SELECT 'stu3115', 'Flutter에서 설문 입력값을 리스트로 관리하고 추가 버튼으로 입력 필드를 늘리는 기능을 만들었습니다.' UNION ALL
    SELECT 'stu3115', 'Firebase에 저장된 데이터를 가져와 화면에 다시 채우는 수정 화면 흐름을 구현했습니다.' UNION ALL
    SELECT 'stu3115', '간단한 상태 관리를 통해 저장 전과 저장 후 버튼 문구를 다르게 보여줬습니다.' UNION ALL
    SELECT 'stu3116', 'Spring Boot로 팀 상세 조회 API를 만들고 팀원 목록과 프로젝트 정보를 함께 반환했습니다.' UNION ALL
    SELECT 'stu3116', 'JPA 연관관계 지연 로딩 문제를 줄이기 위해 필요한 데이터를 DTO로 묶어 반환했습니다.' UNION ALL
    SELECT 'stu3116', '관리자 승인 시 추천 팀 데이터를 실제 팀 테이블로 옮기는 흐름을 테스트했습니다.'
) AS e;

INSERT INTO user_experience (user_user_id, experience)
SELECT REPLACE(user_id, 'stu31', 'stu33'), experience
FROM (
    SELECT 'stu3101' AS user_id, 'React Query를 사용해 서버 상태를 캐싱하고 목록 화면에서 새로고침 없이 데이터가 갱신되는 흐름을 테스트했습니다.' AS experience UNION ALL
    SELECT 'stu3101', 'TypeScript로 API 응답 타입을 정의하고 optional 값이 있을 때 화면이 깨지지 않도록 방어 코드를 작성했습니다.' UNION ALL
    SELECT 'stu3101', '관리자 팀 카드 컴포넌트를 분리하고 역할 분포 텍스트를 유틸 함수로 정리했습니다.' UNION ALL
    SELECT 'stu3102', 'Spring Boot에서 팀 관리 상세 API를 만들고 프로젝트 기획서와 팀원 목록을 함께 반환했습니다.' UNION ALL
    SELECT 'stu3102', 'Docker 환경에서 MySQL 연결 오류를 해결하기 위해 컨테이너 네트워크와 환경변수를 점검했습니다.' UNION ALL
    SELECT 'stu3102', '공지 읽음 처리 API를 구현하고 학생별 읽지 않은 공지 여부를 조회하는 로직을 작성했습니다.' UNION ALL
    SELECT 'stu3103', 'Python으로 설문 문항별 평균 점수를 계산하고 성향 기준별 점수 객체를 만드는 함수를 작성했습니다.' UNION ALL
    SELECT 'stu3103', 'FastAPI에서 팀 매칭 요청을 받아 추천 팀과 배정 이유를 반환하는 엔드포인트를 구현했습니다.' UNION ALL
    SELECT 'stu3103', 'Pandas로 학생 역할군 분포를 계산하고 팀별 역할 쏠림 여부를 확인했습니다.' UNION ALL
    SELECT 'stu3104', 'Figma에서 팀 관리 모달을 2단 그리드 구조로 재설계하고 프로젝트 정보와 팀원 정보를 분리했습니다.' UNION ALL
    SELECT 'stu3104', '디자인 시스템을 기준으로 배지, 카드, 입력창의 모서리와 여백을 통일했습니다.' UNION ALL
    SELECT 'stu3104', '서비스 소개와 주요 기능이 길어질 때 스크롤 영역으로 처리하는 레이아웃을 설계했습니다.' UNION ALL
    SELECT 'stu3105', 'Flutter로 알림 목록 화면을 구현하고 Firebase 메시지를 받아 읽음 상태를 표시했습니다.' UNION ALL
    SELECT 'stu3105', 'Dart에서 API 응답 모델을 만들고 null 값이 들어와도 화면이 멈추지 않도록 처리했습니다.' UNION ALL
    SELECT 'stu3105', 'Provider로 로그인 사용자 상태를 관리하고 로그아웃 시 화면을 초기화했습니다.' UNION ALL
    SELECT 'stu3106', 'Spring Security에서 refreshToken 재발급 API를 구현하고 accessToken 만료 시 새 토큰을 반환했습니다.' UNION ALL
    SELECT 'stu3106', 'JPA에서 팀과 팀원 데이터를 저장할 때 중복 저장을 막는 검증 로직을 작성했습니다.' UNION ALL
    SELECT 'stu3106', 'AWS 배포 후 CORS 설정과 환경변수 문제를 점검하며 프론트엔드 요청이 정상 연결되도록 수정했습니다.' UNION ALL
    SELECT 'stu3107', 'React로 사용자 대시보드 화면을 만들고 팀 생성 전에는 프로젝트 기능 접근을 막는 조건부 이동을 구현했습니다.' UNION ALL
    SELECT 'stu3107', 'CSS Modules로 카드 내부 아이콘과 제목 위치를 맞추고 화면 크기 변화에 맞게 간격을 조정했습니다.' UNION ALL
    SELECT 'stu3107', 'Vite 빌드 결과에서 번들 크기 경고를 확인하고 추후 코드 스플리팅이 필요한 파일을 정리했습니다.' UNION ALL
    SELECT 'stu3108', 'LangChain으로 학생 구현 경험을 요약하고 기술 키워드만으로 과대평가되지 않도록 프롬프트를 수정했습니다.' UNION ALL
    SELECT 'stu3108', 'FastAPI 응답에 팀별 강점과 약점 필드를 추가하고 프론트엔드에서 표시할 수 있는 JSON 구조를 정리했습니다.' UNION ALL
    SELECT 'stu3108', 'LLM 결과에서 학생 이름이 누락되지 않도록 입력 학생 목록과 출력 학생 목록을 비교하는 검증 로직을 작성했습니다.' UNION ALL
    SELECT 'stu3109', 'Figma에서 공지 작성 페이지의 마크다운 에디터 영역과 중요 공지 체크 UI를 정리했습니다.' UNION ALL
    SELECT 'stu3109', '툴바와 입력 영역의 간격을 조정해 긴 공지를 작성할 때 가독성이 좋아지도록 설계했습니다.' UNION ALL
    SELECT 'stu3109', '작성, 수정, 삭제 버튼의 위치와 상태를 정리해 관리자 화면 흐름을 단순화했습니다.' UNION ALL
    SELECT 'stu3110', 'Flutter로 팀원 목록 화면을 만들고 팀 생성이 완료된 뒤에만 접근할 수 있도록 조건부 화면 처리를 구현했습니다.' UNION ALL
    SELECT 'stu3110', 'REST API 응답을 받아 팀명과 서비스명을 표시하고 데이터가 없을 때 빈 상태 문구를 보여줬습니다.' UNION ALL
    SELECT 'stu3110', '모바일 화면에서 팀원 카드가 너무 길어지지 않도록 주요 스택만 보여주는 UI를 구성했습니다.' UNION ALL
    SELECT 'stu3111', 'Docker Compose 환경에서 Spring Boot, MySQL, AI 서버가 같은 네트워크로 통신하도록 설정했습니다.' UNION ALL
    SELECT 'stu3111', 'GitHub Actions 워크플로에서 테스트와 빌드 단계를 분리하고 실패 지점을 확인할 수 있게 구성했습니다.' UNION ALL
    SELECT 'stu3111', 'Nginx 설정을 통해 정적 파일 캐싱과 API 프록시 구조를 실험했습니다.' UNION ALL
    SELECT 'stu3112', 'JWT 인증 흐름에서 토큰 탈취 위험을 줄이기 위한 저장 위치와 만료 시간을 비교했습니다.' UNION ALL
    SELECT 'stu3112', 'Spring Security 예외 처리에서 401과 403을 구분해 프론트엔드가 다른 메시지를 보여줄 수 있게 했습니다.' UNION ALL
    SELECT 'stu3112', 'OWASP 체크리스트를 참고해 인증 API에서 확인해야 할 항목을 정리했습니다.' UNION ALL
    SELECT 'stu3113', 'Python으로 Greedy 방식의 1차 팀 생성 알고리즘을 만들고 팀 점수 차이를 계산했습니다.' UNION ALL
    SELECT 'stu3113', '역할군이 한 팀에 몰리지 않도록 배치 점수에 역할 분산 기준을 추가했습니다.' UNION ALL
    SELECT 'stu3113', '팀 생성 결과를 여러 번 검증하며 누락, 중복, 인원 차이 문제가 생기면 다시 조정하도록 만들었습니다.' UNION ALL
    SELECT 'stu3114', 'Figma에서 캡스톤 일지 목록과 상세 화면의 정보 구조를 정리했습니다.' UNION ALL
    SELECT 'stu3114', '제출 완료와 미제출 상태가 한눈에 보이도록 배지와 색상 기준을 만들었습니다.' UNION ALL
    SELECT 'stu3114', '관리자가 팀별 제출 현황을 빠르게 확인할 수 있도록 카드 레이아웃을 설계했습니다.' UNION ALL
    SELECT 'stu3115', 'Flutter로 프로젝트 기획서 입력 화면을 만들고 저장된 값을 다시 불러오는 수정 흐름을 구현했습니다.' UNION ALL
    SELECT 'stu3115', '모바일 화면에서 긴 텍스트 입력이 자연스럽게 보이도록 스크롤 영역을 조정했습니다.' UNION ALL
    SELECT 'stu3115', 'API 연결 실패 시 사용자에게 다시 시도할 수 있는 안내 문구를 보여줬습니다.' UNION ALL
    SELECT 'stu3116', 'Spring Boot로 캡스톤 일지 작성 API를 만들고 팀원별 작성 내용을 저장하는 구조를 구현했습니다.' UNION ALL
    SELECT 'stu3116', '팀원 전체가 제출했는지 확인해 일지 상태를 완료로 변경하는 로직을 작성했습니다.' UNION ALL
    SELECT 'stu3116', '관리자 일지 목록에서 제출 팀과 미제출 팀 수를 계산하는 응답 DTO를 구성했습니다.'
) AS e;

INSERT INTO user_experience (user_user_id, experience)
SELECT REPLACE(user_id, 'stu31', 'stu34'), experience
FROM (
    SELECT 'stu3101' AS user_id, 'React로 캡스톤 일지 관리 목록 화면을 만들고 제출 상태에 따라 카드 왼쪽 색상이 달라지도록 구현했습니다.' AS experience UNION ALL
    SELECT 'stu3101', '검색어와 학년 필터를 useState로 관리하고 useMemo로 필터링된 목록을 계산했습니다.' UNION ALL
    SELECT 'stu3101', '상세 페이지 이동을 위해 Link 컴포넌트를 사용하고 라우터 경로를 기능별로 분리했습니다.' UNION ALL
    SELECT 'stu3102', 'Spring Boot로 캡스톤 일지 목록 API를 만들고 팀별 제출 인원 수를 계산해 반환했습니다.' UNION ALL
    SELECT 'stu3102', 'JPA에서 Journal과 JournalEntry 관계를 설정하고 팀원별 작성 내용을 저장했습니다.' UNION ALL
    SELECT 'stu3102', '관리자 상세 조회에서 팀원별 활동 내용과 다음 계획을 한 번에 조회하도록 DTO를 구성했습니다.' UNION ALL
    SELECT 'stu3103', 'FastAPI에서 학생 분석 결과를 캐싱하는 구조를 실험하고 같은 학생을 반복 분석하지 않도록 처리했습니다.' UNION ALL
    SELECT 'stu3103', 'Pandas로 학생 기술 점수와 성향 점수를 합산해 팀 매칭에 사용할 점수 테이블을 만들었습니다.' UNION ALL
    SELECT 'stu3103', 'LLM 보정 결과가 원본 학생 목록과 일치하는지 확인하는 검증 함수를 작성했습니다.' UNION ALL
    SELECT 'stu3104', 'Figma에서 학생 관리 모달에 방사형 차트가 들어가는 레이아웃을 설계했습니다.' UNION ALL
    SELECT 'stu3104', '차트와 기본 정보가 한 화면에 같이 보이도록 좌우 레이아웃의 비율과 여백을 조정했습니다.' UNION ALL
    SELECT 'stu3104', '색상 대비를 고려해 그래프 영역과 텍스트 영역이 서로 방해되지 않도록 디자인했습니다.' UNION ALL
    SELECT 'stu3105', 'Flutter로 일지 작성 화면을 만들고 여러 입력 영역의 값을 하나의 객체로 묶어 저장했습니다.' UNION ALL
    SELECT 'stu3105', 'Dart에서 폼 검증 함수를 만들어 비어 있는 입력값이 있을 때 제출을 막았습니다.' UNION ALL
    SELECT 'stu3105', 'Firebase에 저장한 임시 데이터를 불러와 수정 화면에서 다시 채우는 기능을 구현했습니다.' UNION ALL
    SELECT 'stu3106', 'Spring Security에서 accessToken 만료 시 refreshToken으로 재발급하는 API를 구현했습니다.' UNION ALL
    SELECT 'stu3106', 'Axios 인터셉터와 맞춰 동작할 수 있도록 401 응답 형식과 재발급 응답 필드를 정리했습니다.' UNION ALL
    SELECT 'stu3106', '토큰 재발급 실패 시 사용자 정보를 초기화하고 로그인 화면으로 이동하는 흐름을 테스트했습니다.' UNION ALL
    SELECT 'stu3107', 'React로 팀 관리 카드 디자인을 수정하고 프로젝트 정보가 있을 때와 없을 때 다른 UI를 보여줬습니다.' UNION ALL
    SELECT 'stu3107', '긴 역할 분포 텍스트가 카드 밖으로 넘치지 않도록 flex-wrap과 min-width 처리를 적용했습니다.' UNION ALL
    SELECT 'stu3107', '팀원 이름 클릭 시 학생 관리 페이지로 이동해 해당 학생 상세 모달이 열리도록 쿼리 파라미터 흐름을 구성했습니다.' UNION ALL
    SELECT 'stu3108', 'LangGraph에서 팀 생성, LLM 보정, 검증, 최종 출력 단계를 노드로 분리했습니다.' UNION ALL
    SELECT 'stu3108', '검증 실패 시 다시 보정 단계로 돌아가도록 반복 구조를 만들고 최대 반복 횟수를 설정했습니다.' UNION ALL
    SELECT 'stu3108', '팀별 강점과 약점이 단순 기술 나열이 되지 않도록 소통, 역할, 구현 경험을 함께 반영하는 프롬프트를 작성했습니다.' UNION ALL
    SELECT 'stu3109', 'Figma에서 서비스 전체 UI 캡처를 정리하고 포트폴리오에 사용할 화면 이름을 정했습니다.' UNION ALL
    SELECT 'stu3109', '학생과 관리자 화면의 공통 카드 스타일을 비교해 헤더, 여백, 배지 기준을 맞췄습니다.' UNION ALL
    SELECT 'stu3109', '사용자가 저장 완료 상태를 명확히 알 수 있도록 성공 메시지 위치와 색상을 정리했습니다.' UNION ALL
    SELECT 'stu3110', 'React Native로 프로젝트 일정 카드 UI를 만들고 날짜별 할 일을 필터링해 표시했습니다.' UNION ALL
    SELECT 'stu3110', '앱 화면에서 API 응답이 느릴 때 로딩 상태를 보여주고 실패 시 재시도 버튼을 표시했습니다.' UNION ALL
    SELECT 'stu3110', '모바일에서 긴 텍스트가 잘리지 않도록 ScrollView와 numberOfLines 옵션을 비교했습니다.' UNION ALL
    SELECT 'stu3111', 'Dockerfile을 작성해 Spring Boot 애플리케이션을 이미지로 빌드하는 흐름을 테스트했습니다.' UNION ALL
    SELECT 'stu3111', 'GitHub Actions에서 Docker 이미지 빌드와 컨테이너 실행 테스트를 분리했습니다.' UNION ALL
    SELECT 'stu3111', 'Nginx 로그를 확인하며 정적 파일 요청과 API 요청이 정상적으로 나뉘는지 점검했습니다.' UNION ALL
    SELECT 'stu3112', 'Spring Security에서 CORS 설정과 인증 필터 순서가 요청 처리에 어떤 영향을 주는지 확인했습니다.' UNION ALL
    SELECT 'stu3112', '비밀번호 변경 API에서 기존 비밀번호 확인과 새 비밀번호 검증을 분리했습니다.' UNION ALL
    SELECT 'stu3112', '로그인 실패 시 아이디 또는 비밀번호 불일치 메시지가 반환되도록 예외 처리를 정리했습니다.' UNION ALL
    SELECT 'stu3113', 'Python으로 응답 일관성 점수를 계산하고 점수 차이가 큰 문항을 감지하는 함수를 작성했습니다.' UNION ALL
    SELECT 'stu3113', '성향 점수를 절대 기준이 아니라 보조 기준으로 사용하도록 팀 매칭 가중치를 조정했습니다.' UNION ALL
    SELECT 'stu3113', '팀 배정 이유에 기술 경험과 성향 보완 관계가 함께 들어가도록 출력 구조를 수정했습니다.' UNION ALL
    SELECT 'stu3114', 'Figma에서 프로젝트 기획서 페이지의 작성 기준 섹션을 제거하고 입력 폼 중심으로 레이아웃을 다시 잡았습니다.' UNION ALL
    SELECT 'stu3114', '주요 기능을 여러 개 추가할 수 있도록 입력 필드와 추가 버튼의 위치를 설계했습니다.' UNION ALL
    SELECT 'stu3114', '팀 관리 모달에서 프로젝트 정보와 팀 분석 영역이 균형 있게 보이도록 그리드 구조를 정리했습니다.' UNION ALL
    SELECT 'stu3115', 'Flutter로 공지 상세 화면에서 마크다운 스타일 텍스트를 일반 텍스트처럼 읽기 쉽게 표시했습니다.' UNION ALL
    SELECT 'stu3115', '사용자가 뒤로 가기 했을 때 이전 목록 상태가 유지되도록 화면 이동 구조를 정리했습니다.' UNION ALL
    SELECT 'stu3115', '저장 완료 후 대시보드로 이동하는 흐름을 구현하고 실패 시 오류 메시지를 표시했습니다.' UNION ALL
    SELECT 'stu3116', 'Spring Boot로 팀 프로젝트 정보 저장 API를 구현하고 이미 저장된 내용이 있으면 수정되도록 처리했습니다.' UNION ALL
    SELECT 'stu3116', '팀 관리 상세 API에 serviceName, serviceIntro, mainFeatures, strengths, weaknesses 필드를 포함했습니다.' UNION ALL
    SELECT 'stu3116', '관리자 팀 목록에서 프로젝트 정보가 입력된 팀과 미입력 팀을 구분할 수 있는 응답 구조를 정리했습니다.'
) AS e;

INSERT INTO user_preferred_teammates (user_user_id, preferred_teammates)
VALUES
('stu3101','stu3106'),('stu3101','stu3109'),
('stu3102','stu3106'),
('stu3103','stu3108'),
('stu3104','stu3101'),
('stu3105','stu3110'),
('stu3106','stu3102'),('stu3106','stu3116'),
('stu3107','stu3112'),
('stu3108','stu3103'),
('stu3109','stu3101'),
('stu3110','stu3105'),
('stu3111','stu3106'),
('stu3112','stu3102'),
('stu3113','stu3108'),
('stu3114','stu3109'),
('stu3115','stu3110'),
('stu3116','stu3106'),

('stu3201','stu3207'),
('stu3202','stu3209'),
('stu3203','stu3208'),
('stu3204','stu3210'),
('stu3205','stu3211'),
('stu3206','stu3202'),
('stu3207','stu3201'),
('stu3208','stu3203'),
('stu3209','stu3202'),('stu3209','stu3206'),
('stu3210','stu3204'),
('stu3211','stu3205'),
('stu3212','stu3202'),
('stu3213','stu3208'),
('stu3214','stu3209'),
('stu3215','stu3210'),
('stu3216','stu3211'),

('stu3301','stu3309'),('stu3301','stu3304'),
('stu3302','stu3306'),
('stu3303','stu3308'),
('stu3304','stu3301'),
('stu3305','stu3307'),
('stu3306','stu3302'),
('stu3307','stu3305'),
('stu3308','stu3303'),
('stu3309','stu3301'),('stu3309','stu3306'),
('stu3310','stu3304'),
('stu3311','stu3306'),
('stu3312','stu3309'),
('stu3313','stu3308'),
('stu3314','stu3310'),
('stu3315','stu3307'),
('stu3316','stu3306'),

('stu3401','stu3407'),
('stu3402','stu3409'),
('stu3403','stu3408'),
('stu3404','stu3410'),
('stu3405','stu3411'),
('stu3406','stu3402'),
('stu3407','stu3401'),
('stu3408','stu3403'),
('stu3409','stu3402'),('stu3409','stu3406'),
('stu3410','stu3404'),
('stu3411','stu3405'),
('stu3412','stu3402'),
('stu3413','stu3408'),
('stu3414','stu3409'),
('stu3415','stu3410'),
('stu3416','stu3411');

COMMIT;
```
