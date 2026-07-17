# rules-subject.js ↔ rule_scan.py 동기화 감사

`assets/js/rules-subject.js`는 SSOT `​.claude/skills/setteuk-review/scripts/rule_scan.py`의
R1~R10·F1·F2 핵심 판정을 이식(scanSSOT)하고, 기존 앱(`학교생활기록부 점검기.html`)의
~25종 추가 검사를 상위집합(scanExtras)으로 이식했다. 규칙이 바뀌면 rule_scan.py를
먼저 고치고 이 파일을 동기화한다.

검증: `tests/rules-parity.mjs` — 대표 문단 12개를 rule_scan.py(JSON 배치 모드)와
rules-subject.js 양쪽에 통과시켜 R1~R10·F1·F2 규칙코드 **집합**이 일치함을 단언한다
(2026-07-18 실행 결과: PASS 26 / FAIL 0, python 교차비교 포함).

## 1. SSOT 규칙(R1~R10·F1·F2) — 판정 그대로 이식

| 규칙 | rule_scan.py 판정 | rules-subject.js 판정(grade/color) | 비고 |
|---|---|---|---|
| R1알파벳 | 위반 후보 | violation / m-red | 정규식·순서(파일형식 우선 검사) 동일 |
| F1외국어확인 | 확인 필요 | check / m-brown | `subject` 매개변수로 FOREIGN_SUBJECTS(일본어·공통영어) 판정 — §2 참고 |
| F2파일형식확인 | 확인 필요 | check / m-brown | FILE_FORMATS 8종 동일 |
| R2특수기호 | 위반 후보 | violation / m-red | `능력단위\s*:` 쌍점만 면제, 면제 판정 로직(콜론 위치 Set) 동일 |
| R3과거시제(기본) | 위반 후보 | violation / m-red | 았/었/였 직접 + ㅆ받침 축약(중성 한정, '겠' 제외) 동일 |
| R3과거시제 — `~던` 의심 | 위반 후보(구분 없음) | **check / m-brown** | §3 참고 — SSOT는 등급 구분이 없지만(R=위반 후보) JS는 확인 필요로 완화 |
| R3과거시제 — 내용 안의 과거형(`다고/다는/다며`) | 위반 후보(구분 없음) | **check / m-brown** | §3 참고 |
| R3과거시제 — 작은따옴표 짝 내부 | 예외(미검출) | 예외(미검출) | quoteRanges 로직 동일 |
| R4내면심리 | 위반 후보 | info / m-rose | MIND_WORDS 32개 그대로 복사 |
| R5역량어단독 | 위반 후보 | info / m-rose | COMPETENCY_PATTERNS 정규식 동일 |
| R6지칭어 | 위반 후보 | check / m-brown | PRONOUN_PATTERNS 동일(학생[은이]\|그는\|그녀는\|본인[은이]) |
| R7기재금지 | 위반 후보 | violation / m-red | BANNED_ITEMS 4항목 정규식·순서 동일 |
| R8무관내용 | 위반 후보 | check / m-brown | IRRELEVANT 4항목 정규식 동일 |
| R9줄바꿈도서명(줄바꿈/겹화살괄호/굽은따옴표/홀수따옴표) | 위반 후보 | violation / m-red | 4개 서브 트리거 모두 이식 |
| R10분량 | 위반 후보 | violation / m-red | §4 참고 — span 처리만 다름 |

## 2. 판정 등급(grade) 매핑 — SSOT는 R=위반후보/F=확인필요 2단만 구분

rule_scan.py는 자체적으로 "위반/확인필요/참고" 3단 등급을 매기지 않는다(R 접두 = 위반
후보로 LLM 검토 대상, F 접두 = 확인 필요, 그 외 구분 없음 — 최종 확정은 사람이 하는
설계). rules-subject.js는 브라우저에서 바로 하이라이트로 보여줘야 하므로 3단 등급을
직접 매겼다:

- **violation(m-red)** — R1·R2·R3(기본)·R7·R9: 규칙 위반이 사실상 확정적인 패턴
- **check(m-brown)** — F1·F2·R3(예외 서브케이스)·R6·R8: 문맥에 따라 정당할 수 있어
  교사 판단이 필요한 패턴
- **info(m-rose)** — R4·R5: 내용 서술 자체가 아니라 표현 강도·근거 동반 여부를 참고로
  짚어주는 패턴(위반 단정 아님)

CLAUDE.md 변경이력 "완화 규칙 엄격화"(2026-07-16) 항목이 R3의 `~던`·"내용 안의
과거형" 서브케이스를 확인 필요로 격상하기로 확정한 근거다. 이 파일은 그 결정을
따라 최초 구현 시점부터 check 등급으로 배정했다(SSOT와 모순 아님 — SSOT는애초에
등급을 안 매기므로).

## 3. §2 profile.subjectName — F1 자동 판정의 파라미터화

rule_scan.py의 `scan_text(text, subject="")`는 subject 문자열에 "일본어"·"공통영어"가
포함되는지로 외국어 과목 여부를 판정한다. subject.html의 설정 행에는 "일반/수학/과학/
영어" 4개 프로파일만 있고 "일본어" 옵션이 없다(실제 파싱 결과의 과목명이 이미
"일본어"로 나오기 때문). 따라서 `scan(text, profile)`은:

- `profile.id === 'english'` (설정 행에서 사용자가 명시적으로 "영어" 선택) 또는
- `profile.subjectName`(과목별 보기에서 실제 과목명, 예: "일본어", "공통영어1")이
  FOREIGN_SUBJECTS 중 하나를 포함

둘 중 하나만 만족해도 isForeign=true로 판정한다. subject-app.js는 과목 그룹별로
scan()을 호출할 때 `profile.subjectName`에 실제 과목명을 넣어 자동으로 이 판정이
동작하게 한다(사용자가 별도로 "일본어" 프로파일을 고를 필요 없음).

## 4. R10분량 — span 처리 차이(표시 방식만, 판정 조건은 동일)

rule_scan.py는 `span: [0, len(text)]`로 전체 문단을 가리킨다(LLM이 JSON만 읽으므로
문제없음). rules-subject.js가 이를 그대로 쓰면 `SGB.core.buildAnnotatedHtml`의
겹침 제거 로직(먼저 나온 가장 넓은 span이 이후 모든 span을 삼킴)이 전체 문단을
붉게 칠하고 다른 규칙의 하이라이트를 전부 가려버린다. 그래서 rules-subject.js는
R10 finding의 span을 `[0, 0]`(폭 0)으로 바꿔 하이라이트에는 나타나지 않게 하고,
초과 여부는 이미 `.gauge`(바이트 게이지)가 시각적으로 보여주며, 이슈 목록·엑셀
내보내기에는 정상적으로 포함된다. **바이트 임계값(1500B 초과) 판정 조건 자체는
SSOT와 동일** — UI에서 사용자가 바이트 제한을 바꾸면(§6 설정 행) 그 값을
`profile.byteLimit`으로 전달해 판정 기준도 함께 바뀐다(SSOT는 하드코딩 1500).

## 5. 확장 규칙(scanExtras) — 기존 앱 이식, 신규 규칙코드(SSOT와 겹치지 않음)

기존 앱(`학교생활기록부 점검기.html`)의 아래 검사들을 상위집합으로 이식했다.
전부 SSOT에 없는 별도 규칙코드(U/N/S/C/M 접두)를 부여해 R1~R10·F1·F2 규칙코드
집합과 절대 겹치지 않는다 — 패리티 테스트가 이 접두 코드들을 필터링하고 비교하므로
안전하다.

| 코드 | 내용 | grade/color | 원본 |
|---|---|---|---|
| U1대학명 | 특정 대학명 36종 목록 매칭 | violation / m-red | UNIVERSITY_KEYWORDS |
| U2기관인증 | 교외 학원·인증시험·대회 키워드 | violation / m-red | ORG_KEYWORDS |
| U3부모직업 | 부모 신분·직업 암시 표현 | violation / m-red | SETEUK_BANNED 5번째 항목(SSOT BANNED_ITEMS엔 없음 — §6 참고) |
| N1기재유의어 | NEIS 기재 유의어 57종 → 대체 표현 제안 | check / m-brown | CAUTION_TERMS |
| N2괄호영문 | 한글(영문) 로마자 병기 | check / m-brown | PAREN_ROMANIZATION_REGEX |
| S1추측표현 | "~것 같음", "~로 보임" 등 추측성 표현 | info / m-rose | SPECULATIVE_REGEX |
| S2미사여구 | 과한 미화·최상급, 남발 표현 | info / m-amber | FLOWERY_SEVERE/MILD |
| S3패턴반복 | 문장 종결 8자 패턴 반복 | info / m-violet | findPatternRepeats |
| S4템플릿반복 | "~을 통해 ~함양" 상투 템플릿 | info / m-violet | TEMPLATE_REGEX |
| S5종결혼용 | 과거형/명사형/평서형 종결 혼용 | info / m-slate | classifyEnding |
| S6띄어쓰기 | 쉼표·마침표·콜론·괄호 앞뒤 띄어쓰기 12종 | check / m-slate | findSpacingMatches |
| S7과정부족 | 활동 과정 서술어 부재(60자 이상 문단만) | info / m-slate | findProcessLack |
| S8문장중복 | 같은 과목 내 다른 학생과 문장 중복(8자 이상) | check / m-teal | findCrossDuplicates — §7 참고, 별도 API |
| C1진로전공 | 진로·전공 직접 언급 의심 | check / m-brown | CAREER_KEYWORDS(+CAREER_JIRO_ALLOW 예외) |
| C2학과직업 | 특정 학과·직업명 의심 | check / m-brown | MAJOR_JOB_REGEX(+예외 필터) |
| M1성취기준코드 | 성취기준 코드 직접 인용(수학 프로파일만) | check / m-slate | ACHIEVEMENT_CODE_REGEX |
| M2수식기호 | 수식 기호 직접 사용(수학 프로파일만) | check / m-slate | MATH_SYMBOL_REGEX |

## 6. R7기재금지 — SSOT BANNED_ITEMS와 기존 앱의 차이(의도적 분리)

기존 앱의 `SETEUK_BANNED`는 SSOT `BANNED_ITEMS`(4항목: 대학명 의심·어학시험·소논문·
교외수상)에 "부모님 직업\|아버지는\|어머니는\|부모의 직업\|부모 직장" 항목이 하나
더 있다(5항목). SSOT에는 이 항목이 없으므로, rules-subject.js는 이를 R7기재금지
코드로 합치지 **않고** 별도 코드 `U3부모직업`으로 분리했다. 이렇게 분리한 이유:
패리티 테스트가 두 엔진의 R7기재금지 코드 "집합"이 텍스트별로 정확히 같은지
검사하는데, 만약 부모직업 패턴을 R7기재금지로 합치면 그 문구가 포함된 픽스처에서
JS만 R7기재금지를 내고 rule_scan.py는 안 내는 불일치가 생겨 패리티가 깨진다.
별도 코드로 분리하면 SSOT 규칙코드 집합은 항상 순수하게 유지되면서, 기존 앱의
유용한 검사도 잃지 않는다.

## 7. S8문장중복 — scan() 계약 밖의 별도 API

`SGB.rulesSubject.scan(text, profile)`은 문단 하나만 보고 판정하므로 "다른 학생과의
문장 중복"은 원리상 이 함수 안에서 계산할 수 없다(여러 학생 텍스트를 동시에 봐야
함). 그래서 `SGB.rulesSubject.findCrossDuplicates(entries)`를 별도로 노출했고
(`entries: [{id, text}] → {[id]: finding[]}`), subject-app.js가 **같은 과목으로
묶인 학생들끼리만** 비교해 그 결과를 scan() 결과에 합친다(다른 과목 학생과 비교하지
않음 — 국어 세특과 수학 세특의 우연한 문장 일치는 표절 신호로 보기 어려워서다).
기존 앱은 과목 구분 없이 전체 학생을 비교했는데(단일 과목 툴이라 구분이 무의미했음),
이 앱은 다과목 툴이므로 과목 단위 비교로 범위를 좁힌 것이 의도적 개선이다.

## 8. F2 파일형식 — 알파벳 검사보다 우선

SSOT와 동일하게, 알파벳 매치가 FILE_FORMATS(GIF/JPG/JPEG/PNG/PDF/SVG/PSD/MP4) 8종과
대소문자 무관 일치하면 R1알파벳/F1외국어확인보다 **먼저** F2파일형식확인으로
분류하고 `continue`한다(외국어 프로파일이어도 파일형식이 우선). rules-subject.js의
`scanSSOT()` 40번째 줄 부근에서 동일한 순서로 구현했다.
