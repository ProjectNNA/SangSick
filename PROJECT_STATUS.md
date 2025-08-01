# SangSick 퀴즈 애플리케이션 - 프로젝트 상태

## 📋 프로젝트 개요
**SangSick**은 한국어 기반 상식 퀴즈 애플리케이션으로, **Supabase** 백엔드와 **React + Vite** 프론트엔드를 사용합니다.

### 🛠️ 기술 스택
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication + RLS)
- **Styling**: Tailwind CSS (다크모드 지원)
- **Authentication**: Supabase Auth (이메일/비밀번호)
- **Language**: Full TypeScript with strict type checking

---

## 🗄️ 데이터베이스 스키마 (중요!)

### 📁 SQL 파일 위치: `/sql/` 폴더
**주요 SQL 파일들:**
- `quiz_sessions_table.sql` - **메인 데이터베이스 스키마** (모든 테이블, 함수, 트리거 포함)
- `current_schema_summary.md` - 데이터베이스 스키마 요약
- `user_tables_analysis.md` - 사용자 테이블 분석

### 🏗️ 핵심 테이블 구조

#### 1. **기본 테이블**
- `questions` - 퀴즈 문제 (category, subcategory, difficulty 1-5, explanation, reflection)
- `quiz_sessions` - 퀴즈 세션 (user_id, score, duration, completed)
- `user_roles` - 사용자 권한 (admin/user)

#### 2. **고급 추적 테이블** 
- `question_attempts` - **세부 문제 시도 추적** (카테고리별, 난이도별, 응답시간)
- `user_engagement_stats` - **사용자 참여 통계** (연속기록, 레벨, 총점수)
- `category_performance` - **카테고리별 성과** (정확도, 시도횟수, 포인트)

#### 3. **핵심 SQL 함수들**
- `record_question_attempt()` - 문제 시도 기록 (프론트엔드에서 호출)
- `get_user_quiz_stats()` - **종합 사용자 통계 반환** (JSON 형태)
- `calculate_points()` - 별표 기반 점수 계산 (1★=10점, 5★=50점)
- `update_category_performance()` - 카테고리 성과 자동 업데이트

---

## 🎯 구현된 주요 기능

### 1. **인증 및 사용자 관리**
- ✅ 이메일/비밀번호 로그인/회원가입
- ✅ 사용자 역할 관리 (admin/user)
- ✅ 프로필 관리 (닉네임, 아바타)
- ✅ Row Level Security (RLS) 적용

### 2. **퀴즈 시스템**
- ✅ 10문제 랜덤 퀴즈 세션
- ✅ 6개 카테고리: 과학, 역사, 지리, 문학, 스포츠, 예술
- ✅ 1-5 난이도 시스템 (별표 표시)
- ✅ 실시간 응답시간 측정
- ✅ 연속 정답 스트릭 추적
- ✅ 점수 시스템: 난이도별 포인트 (1★=10점, 5★=50점)

### 3. **고급 통계 및 분석 시스템** 🎮

#### **ProfileHeader 실시간 위젯들**
- 🔥 **연속 스트릭 카운터** (클릭하면 통계 페이지로)
- 🎖️ **레벨 배지** + 진행률 바
- 🏆 **완벽 세션 수** 표시
- 📊 **전체 정답률** 표시
- 📱 **모바일 대응** (컴팩트 버전)

#### **CategoryPerformance 컴포넌트**
- 📚 **대화형 카테고리 카드** (확장/축소 가능)
- 🎯 **성과 레벨**: 마스터(90%+), 우수(80%+), 양호(70%+), 보통(60%+), 개선필요
- 📈 **원형 진행률 표시기**
- ⚡ **정렬 옵션**: 정확도순, 시도횟수순, 점수순
- 💡 **개인화된 개선 제안**
- 🔍 **상세 분석**: 포인트, 난이도, 최근 활동, 연속 기록

#### **TimeInsights 컴포넌트**
- ⏰ **응답시간 분석**: 최빠름, 평균, 최느림 + 시각화
- 🌅 **최적 학습시간**: 시간대별 성과 분석
- 📊 **학습 효율성**: 분당 문제 해결 수
- 📚 **세션 분석**: 총 학습시간, 평균 세션 길이
- 💡 **시간 기반 인사이트** 및 최적화 제안

#### **Leaderboard 시스템**
- 🏆 **4개 랭킹 카테고리**: 총점, 정확도, 연속기록, 최근활동
- 🥇 **시상대 시각화** (1위, 2위, 3위)
- 👤 **현재 사용자 하이라이트**
- 🎮 **한국어 랭킹 타이틀**: 퀴즈왕, 2등, 3등
- 📊 **경쟁 가이드** 포함

### 4. **지수 레벨링 시스템** 🎖️
```
Level 1:  0-99 points      (100 needed)    ⭐ 초보자
Level 2:  100-299 points   (200 needed)    ⭐ 학습자  
Level 3:  300-699 points   (400 needed)    ⭐ 학생
Level 4:  700-1,499 points (800 needed)    ⭐ 학자
Level 5:  1,500-3,099 points (1,600 needed) 🌟 전문가
Level 6:  3,100-6,299 points (3,200 needed) 🌟 마스터
Level 7:  6,300-12,699 points (6,400 needed) 🌟 천재
Level 8:  12,700-25,499 points (12,800 needed) 💎 영재
Level 9:  25,500-51,099 points (25,600 needed) 💎 전설
Level 10: 51,100-102,299 points (51,200 needed) 💎 레전드
Level 11: 102,300-204,699 points (102,400 needed) 🏆 챔피언
Level 12: 204,700-409,499 points (204,800 needed) 🏆 그랜드마스터
Level 13: 409,500+ points (409,600 needed) 👑 퀴즈 신
```

### 5. **관리자 기능**
- ✅ 문제 관리 (추가, 수정, 삭제)
- ✅ 사용자 역할 관리
- ✅ 페이지네이션 (페이지당 20개)
- ✅ 검색 기능 (문제, 카테고리, 해설 등)
- ✅ **서브카테고리 표시** 추가됨
- ✅ **별표 난이도 표시** (★★★☆☆ 형태)

### 6. **표준화된 난이도 평가 시스템** ⭐
**점수 시스템**: 1★=10점, 2★=20점, 3★=30점, 4★=40점, 5★=50점

#### **난이도 등급 기준**
- **⭐ 1★ - 매우 쉬움** (고등학생~성인 누구나)
  - 일반 상식, 널리 알려진 사실, 일상에서 자주 접하는 정보
  - 90% 이상 정답률 예상
  - 예시: 대한민국의 수도, 1년은 몇 개월, 태양이 뜨는 방향

- **⭐⭐ 2★ - 쉬움** (고등학생~성인 기본)
  - 기본 개념, 사회적 상식, 고등학교 교과 수준
  - 70-80% 정답률 예상
  - 예시: 물질의 세 가지 상태, 광합성에서 흡수하는 기체, 조선의 첫 번째 왕

- **⭐⭐⭐ 3★ - 보통** (성인 교양, 고등학교 심화)
  - 전문 지식, 분석적 사고, 교양 수준의 응용
  - 50-60% 정답률 예상
  - 예시: 광합성과 호흡의 차이, 임진왜란의 주요 원인

- **⭐⭐⭐⭐ 4★ - 어려움** (대학생~성인 심화)
  - 심화 지식, 복합적 사고, 대학 교양 이상
  - 30-40% 정답률 예상
  - 예시: 양자역학 기본 원리, 조선 후기 실학사상

- **⭐⭐⭐⭐⭐ 5★ - 매우 어려움** (전문가 수준)
  - 전문가 지식, 고도의 분석, 성인 전문 분야
  - 20% 이하 정답률 예상
  - 예시: 상대성 이론의 시공간 개념, 12음기법의 혁신

#### **카테고리별 난이도 가이드라인**
- **🔬 과학**: 1★일상상식 → 2★기초개념 → 3★교육과정 → 4★고급개념 → 5★전문지식
- **📚 역사**: 1★주요인물 → 2★역사사건 → 3★배경원인 → 4★사상문화 → 5★역사해석
- **🌍 지리**: 1★국가수도 → 2★지형기후 → 3★지리현상 → 4★지리이론 → 5★방법론
- **🎭 문학**: 1★유명작품 → 2★문학장르 → 3★문학사조 → 4★문학이론 → 5★문학비평
- **⚽ 스포츠**: 1★인기스포츠 → 2★기술용어 → 3★역사기록 → 4★스포츠과학 → 5★스포츠철학
- **🎨 예술**: 1★유명작가 → 2★예술기법 → 3★예술사조 → 4★예술이론 → 5★예술비평

#### **자동 난이도 조정 시스템**
```
실제 정답률 기반 자동 조정:
90% 이상 → 난이도 -1 (너무 쉬움)
70-89% → 1★-2★ 적정 유지
50-69% → 2★-3★ 적정 유지  
30-49% → 3★-4★ 적정 유지
20-29% → 4★-5★ 적정 유지
20% 미만 → 검토 필요 (너무 어려움)
```

#### **품질 보증 체크리스트**
- [ ] 문제가 명확하고 모호하지 않음
- [ ] 정답이 확실하고 논란의 여지가 없음
- [ ] 선택지가 합리적이고 구별됨
- [ ] 해설이 정확하고 교육적임 (10-15 단어)
- [ ] 지식의 여운이 의미있음 (8-12 단어)
- [ ] 예상 정답률이 난이도 기준에 부합함

> **📱 Word Count 최적화**: 해설과 지식의 여운 단어 수는 모바일 UX 최적화 및 사용자 참여도 향상을 위해 설정되었습니다. 짧고 임팩트 있는 내용으로 퀴즈 몰입도를 유지하면서도 교육적 가치를 제공합니다.

---

## 📁 프로젝트 구조

### 🗂️ 핵심 디렉토리
```
SangSick/
├── sql/                    # 데이터베이스 스키마 및 문서
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── ProfileHeader.tsx    # 실시간 참여 위젯들
│   │   ├── CategoryPerformance.tsx  # 카테고리별 성과 분석
│   │   ├── TimeInsights.tsx     # 시간 기반 분석
│   │   ├── Leaderboard.tsx      # 경쟁 리더보드
│   │   ├── QuizGame.tsx         # 메인 퀴즈 게임
│   │   ├── Avatar.tsx           # 아바타 관리
│   │   └── AvatarEditor.tsx     # 아바타 편집기
│   ├── pages/              # 메인 페이지들
│   │   ├── HomePage.tsx         # 홈페이지
│   │   ├── ProfilePage.tsx      # 개인정보 + 요약 통계
│   │   ├── StatsPage.tsx        # 상세 통계 대시보드
│   │   └── AdminPage.tsx        # 관리자 패널
│   ├── lib/                # 유틸리티 및 라이브러리
│   │   ├── supabase.ts          # Supabase 클라이언트
│   │   ├── quizTracking.ts      # 퀴즈 추적 및 통계 함수들
│   │   ├── roleUtils.ts         # 역할 관리
│   │   ├── fetchQuestions.ts    # 문제 가져오기
│   │   └── updateQuestionStats.ts # 문제 통계 업데이트
│   ├── utils/              # 기타 유틸리티
│   │   ├── statistics.ts        # 통계 계산
│   │   └── imageUtils.ts        # 이미지 처리
│   └── types/              # TypeScript 타입 정의
└── public/                 # 정적 파일들
```

### 🔑 핵심 파일들
- **`quizTracking.ts`** - 모든 퀴즈 추적 로직의 중심
- **`quiz_sessions_table.sql`** - 완전한 데이터베이스 스키마
- **`StatsPage.tsx`** - 포괄적인 통계 대시보드
- **`ProfileHeader.tsx`** - 모든 페이지의 실시간 참여 표시기

---

## 🎮 사용자 경험 플로우

### 1. **참여 유도 시스템**
1. **HeaderWidgets** → 모든 페이지에서 즉시 게임화 피드백
2. **CategoryAnalysis** → 주제별 성과에 대한 깊은 통찰력
3. **TimeAnalytics** → 더 나은 학습을 위한 최적화 권장사항
4. **Leaderboard** → 경쟁적 동기부여 및 사회적 증명
5. **AchievementSystem** → 진행상황 추적 및 이정표 축하

### 2. **페이지 아키텍처**
- **HomePage.tsx**: 퀴즈 게임 + 환영 메시지
- **ProfilePage.tsx**: 개인정보 관리 + 핵심 통계 요약
- **StatsPage.tsx**: 포괄적인 분석 대시보드 (모든 고급 컴포넌트)
- **AdminPage.tsx**: 문제 관리 + 사용자 역할 관리

---

## 🔄 최근 변경사항 (마지막 세션)

### ✅ 완료된 작업
1. **ProfileHeader 참여 위젯 구현** - 실시간 스트릭, 레벨, 성취도 표시
2. **CategoryPerformance 고급 컴포넌트** - 대화형 카드, 상세 분석, 개선 제안
3. **TimeInsights 분석 시스템** - 응답시간, 학습 효율성, 시간대 분석
4. **Leaderboard 경쟁 시스템** - 다중 카테고리 랭킹, 시상대, 한국어 타이틀
5. **지수 레벨링 시스템 구현** - 진정한 지수적 성장으로 고레벨 "성취감" 제공
6. **AdminPage 개선** - 서브카테고리 표시 + 별표 난이도 표시
7. **🎯 한국어 단어 수 표준화 프로젝트 완료** - 전체 50개 문제 대상:
   - 해설(explanation): 15-20 한국어 단어 표준화
   - 지식의 여운(reflection): 8-15 한국어 단어 표준화
   - 역사적 사실 검증 및 정확성 확보
   - 모바일 UX 최적화를 위한 콘텐츠 길이 조정
   - 교육적 가치와 철학적 영감을 유지하면서 간결성 확보
8. **🔧 JSX → TSX 마이그레이션 완료** - 전체 프로젝트 TypeScript 전환:
   - 모든 컴포넌트 파일 .jsx → .tsx 변환 완료
   - 모든 페이지 파일 .jsx → .tsx 변환 완료
   - 모든 라이브러리 파일 .js → .ts 변환 완료
   - TypeScript 설정 및 타입 정의 완료
   - 엄격한 타입 검사 및 코드 품질 향상

### 🎯 핵심 성과
- **완전한 참여 생태계** 구축
- **실시간 게임화** 모든 페이지에서 작동
- **다차원 분석** (시간, 카테고리, 경쟁)
- **개인화된 권장사항** 사용자 행동 기반
- **사회적 기능** (리더보드, 비교 지표)
- **현대적 UI/UX** 부드러운 애니메이션과 반응형 디자인
- **📱 콘텐츠 품질 표준화** 모바일 최적화된 한국어 단어 수 기준 적용

---

## 🎮 게임화 기능 요약

### 참여 동기부여 시스템
- **⚡ 즉시 피드백**: 헤더 위젯의 실시간 통계
- **🎖️ 진행 시각화**: 레벨 진행률 바, 원형 정확도 차트
- **🔥 스트릭 시스템**: 연속 학습 일수 추적
- **🏆 성취도 배지**: 완벽한 세션, 마스터된 카테고리
- **👑 엘리트 상태**: 지수적 레벨링으로 고레벨 독점성
- **🥇 사회적 증명**: 리더보드 순위 및 비교

### 분석 및 개선
- **📊 포괄적인 통계**: 개인, 카테고리, 시간, 경쟁 지표
- **💡 스마트 인사이트**: AI 기반 성과 분석
- **🎯 개인화된 권장사항**: 개별 학습 패턴 기반
- **📈 트렌드 추적**: 시간 경과에 따른 성과 개선

---

## 🚀 기술적 하이라이트

### Frontend 아키텍처
- **TypeScript 기반**: 엄격한 타입 검사로 런타임 오류 방지
- **컴포넌트 기반**: 재사용 가능하고 유지보수 가능한 구조
- **병렬 도구 호출**: 효율적인 데이터 가져오기를 위한 최적화
- **반응형 디자인**: 모든 기기에서 완벽한 작동
- **다크모드 지원**: 완전한 테마 지원
- **상태 관리**: 효율적인 컴포넌트 간 통신
- **개발자 경험**: IntelliSense, 자동 완성, 리팩토링 지원

### Backend 설계
- **PostgreSQL 함수들**: 비즈니스 로직을 데이터베이스에서 처리
- **RLS 보안**: Row Level Security로 데이터 보호
- **자동 트리거들**: 참여 통계 자동 업데이트
- **JSON 응답**: 구조화된 통계 데이터 반환
- **확장 가능한 스키마**: 미래 기능 확장 준비

---

## 🔮 다음 단계 또는 개선 아이디어

### 잠재적 향상
1. **실시간 알림** - 새로운 성취도, 레벨업 알림
2. **카테고리별 퀴즈 필터링** - 특정 주제 집중 학습
3. **친구 시스템** - 친구와 점수 비교, 도전
4. **일일/주간 도전** - 특별 이벤트 및 보상
5. **모바일 앱** - PWA 또는 네이티브 앱
6. **다국어 지원** - 영어 버전 추가

### 데이터 분석
- **학습 패턴 분석** - 사용자 행동 예측
- **문제 품질 평가** - 통계 기반 문제 개선
- **A/B 테스트** - 기능 최적화

---

## 📝 중요 메모

### 🚨 주의사항
1. **`/sql/` 폴더**는 `.gitignore`에 추가됨 (프라이버시)
2. **Supabase RLS**가 모든 테이블에 적용됨
3. **레벨 계산**은 지수적 - 높은 레벨은 진정한 성취감
4. **Mock 데이터**가 Leaderboard에 사용됨 (실제 사용자 1명)

### 🔧 구성 파일들
- **TypeScript**: 엄격한 타입 검사 및 최신 ES 기능 지원
- **Tailwind**: 다크모드 및 커스텀 색상 구성
- **Vite**: 빠른 개발 서버 및 빌드 (TypeScript 네이티브 지원)
- **ESLint**: 코드 품질 유지 (TypeScript 규칙 포함)
- **PostCSS**: CSS 처리 최적화

---

## 🎯 프로젝트 상태: **완료된 MVP with 고급 기능들 + TypeScript 전환**

**SangSick**은 이제 **완전한 게임화된 학습 경험**을 제공하는 완성도 높은 애플리케이션입니다. 포괄적인 분석, 경쟁 기능, 개인화된 인사이트를 갖춘 현대적이고 매력적인 퀴즈 플랫폼입니다.

**TypeScript 마이그레이션 완료**로 코드 품질, 유지보수성, 개발자 경험이 크게 향상되었으며, **사용자 참여도 및 재방문율을 크게 높일 고급 기능들이 모두 구현되었습니다!** 🎮🚀🔧

---

*Last Updated: JSX → TSX 마이그레이션 완료 시점 (2025년 7월)*
*Next Session: TypeScript 기반 추가 기능 개발 또는 성능 최적화* 