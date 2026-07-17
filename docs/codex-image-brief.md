# 이미지 작업지시서 (Codex용)

이 문서 하나만 Codex(외부 이미지 생성 도구)에 전달하면 "생기부 점검 허브"에 필요한 이미지 5장을 만들어 정확한 경로에 넣을 수 있습니다. 코드는 이미지가 없어도 이미 완성된 것처럼 보이도록 CSS 대체 아트(fallback)가 구현되어 있으므로, 이미지는 있으면 더 좋아지는 요소이지 필수 조건이 아닙니다. 서두르지 말고 아래 스타일 가이드를 지켜 만들어 주세요.

## 공통 스타일 가이드

모든 이미지에 예외 없이 적용됩니다(og.png의 텍스트 예외는 아래 표에 별도 표시).

- **화풍**: 플랫 벡터 일러스트(flat vector illustration). 그라데이션, 3D 베벨, 사실적 렌더링 금지.
- **팔레트(고정)**:
  - 메인 브랜드: 인디고 `#4F46E5`
  - 라이트 인디고: `#EEF0FE`
  - 화이트: `#FFFFFF`
  - 잉크(다크 라인/디테일): `#1B1F2E`
  - 파스텔 보조(포인트로만, 한 이미지에 1~2개까지): 앰버 `#FDF0C9`, 로즈 `#FCE7EE`, 틸 `#D9F2EF`, 바이올렛 `#EDE8FB`, 슬레이트 `#E8ECF4`
- **텍스트**: 이미지 안에 글자·문자를 넣지 않습니다. **유일한 예외는 og.png** — "생기부 점검 허브" 문구만 허용됩니다(아래 og.png 항목 참고).
- **배경**: 투명 배경 PNG. **유일한 예외는 og.png** — 소셜 미리보기 카드는 있는 그대로 노출되므로 불투명(흰색 또는 라이트 인디고 배경 채움) 이어야 합니다.
- **금지 사항**: 과도한 그라데이션, 3D 입체감, 그림자 여러 겹(그림자는 최대 1단계만), 사진 합성, 장식 과다.
- **모티브 어휘**: 서류/문서, 형광펜(하이라이트 스윕), 체크마크, 돋보기, 폴더. 이 다섯 가지를 이미지별로 조합해 사용합니다.
- **디테일**: 카드형 도형의 모서리는 넉넉하게 둥글리고(라운딩), 단일 방향의 옅은 그림자 정도만 허용합니다.

## 이미지별 상세

| 파일 경로 | 크기 | 용도·배치 | alt 텍스트 |
|---|---|---|---|
| `assets/img/hero.png` | 1600×1000 | 랜딩(`index.html`) 히어로 섹션 우측에 배치되는 메인 일러스트 | 생기부 점검 결과를 형광펜으로 표시하는 문서와 체크 아이콘 일러스트 |
| `assets/img/tool-subject.png` | 800×600 | 랜딩의 "교과세특 점검기" 도구 카드 상단 이미지 | 교과세특 점검 도구를 상징하는 체크리스트 문서 일러스트 |
| `assets/img/tool-career.png` | 800×600 | 랜딩의 "창체 점검기" 도구 카드 상단 이미지 | 창의적 체험활동 점검 도구를 상징하는 폴더와 활동유형 탭 일러스트 |
| `assets/img/empty-state.png` | 640×480 | `subject.html`·`career.html`의 업로드 전 빈 결과 화면 안내 이미지 | 파일을 아직 올리지 않은 빈 업로드 상태 일러스트 |
| `assets/img/og.png` | 1200×630 | 소셜 공유(OG) 미리보기 카드. **이 파일만 "생기부 점검 허브" 텍스트 허용**, 배경 불투명 | 생기부 점검 허브 — 학교생활기록부 점검 도구 |

### 1. hero.png — 영문 생성 프롬프트

```
Flat vector illustration, no 3D, of a Korean school report document (blank ruled
lines suggesting text, no legible letters) on a clean white card, with a bold
indigo (#4F46E5) highlighter stroke swept horizontally across two lines
suggesting a highlight-sweep motion. A large rounded checkmark badge in indigo
floats at the top-right corner of the card. A soft light-indigo (#EEF0FE)
magnifying glass icon overlaps the bottom-left of the document, inspecting the
text lines. Single soft drop shadow beneath the document card, generous
14px-radius rounded corners on every card shape. A few small pastel accent dots
(amber #FDF0C9, teal #D9F2EF) scattered subtly in the background for texture.
Flat color fills only — no gradients, no bevels, no photographic elements, no
text or letters anywhere. Transparent background. Generous negative space
around the composition so it can be cropped into a right-aligned hero panel.
Style reference: modern SaaS product illustration, Linear/Notion aesthetic,
minimal and clean, 1600x1000 canvas.
```

### 2. tool-subject.png — 영문 생성 프롬프트

```
Flat vector illustration of an open textbook/document stack with a checklist
overlay: three horizontal lines, each with a small indigo (#4F46E5) checkmark
bullet instead of a plain dot, and one line partially covered by a
light-indigo (#EEF0FE) highlighter swatch. A small rounded subject-tag shape
sits in the top corner (no text on it). Flat color fills, no gradients, no 3D,
no text or letters, transparent background, single soft drop shadow, 14px
rounded corners, centered composition with even padding on all sides. Modern
SaaS illustration style (Linear/Notion aesthetic). Palette: indigo #4F46E5,
white, ink #1B1F2E, one pastel accent (teal #D9F2EF or amber #FDF0C9) for the
tag shape only. 800x600 canvas.
```

### 3. tool-career.png — 영문 생성 프롬프트

```
Flat vector illustration of an open folder icon in indigo (#4F46E5) with four
small rounded tab shapes peeking out along the top edge, each tab a different
pastel color (amber #FDF0C9, rose #FCE7EE, teal #D9F2EF, violet #EDE8FB)
representing four activity categories — no text or letters on the tabs. A
small compass or location-pin icon in light-indigo (#EEF0FE) sits beside the
folder, suggesting guidance and direction. Flat color fills only, no
gradients, no 3D bevels, transparent background, single soft drop shadow,
14px rounded corners, centered composition with even padding. Modern SaaS
illustration style (Linear/Notion aesthetic). Palette limited to indigo,
white, ink #1B1F2E, plus the four pastel tab accents. 800x600 canvas.
```

### 4. empty-state.png — 영문 생성 프롬프트

```
Flat vector illustration of an empty upload state: a dashed-border rounded
rectangle in light-indigo (#EEF0FE) representing a drop zone, containing a
simple upward-arrow-into-tray icon in indigo (#4F46E5). A small blank
document silhouette floats just above the tray as if about to be dropped in.
No text or letters anywhere. Flat fills only, no gradients, no 3D, transparent
background, single soft drop shadow beneath the tray, 14px rounded corners,
generous white space around the composition. Modern SaaS empty-state
illustration style (Linear/Notion aesthetic). Palette: indigo #4F46E5, white,
ink #1B1F2E, one pastel accent (slate #E8ECF4) for subtle background shapes.
640x480 canvas.
```

### 5. og.png — 두 단계로 제작 (텍스트·배경 예외)

AI 이미지 생성기는 한글 텍스트를 정확히 그리지 못하는 경우가 많습니다. 그래서 이 이미지만 **배경 일러스트를 먼저 텍스트 없이 생성한 뒤, 텍스트를 별도로 얹는 방식**을 권장합니다.

**5-1. 배경 일러스트 영문 생성 프롬프트** (텍스트 없이):

```
Flat vector illustration for a social-media share banner background, wide
landscape composition (1200x630). On the left third of the canvas, a
simplified version of a document card with an indigo (#4F46E5) highlighter
sweep and a small checkmark badge, pushed toward the bottom-left corner.
Leave at least the right 55% of the canvas as clean, empty, near-flat space
(solid white #FFFFFF or very light indigo #EEF0FE) for a headline to be
added afterward. Flat fills only, no gradients, no 3D, no text or letters in
the generated image, single soft drop shadow under the document card, 14px
rounded corners. Modern SaaS aesthetic, opaque background (not transparent).
```

**5-2. 텍스트 얹기** (이미지 편집 도구로 직접, 또는 Codex에 별도 지시):
- 문구: `생기부 점검 허브`
- 위치: 배경 일러스트가 비워둔 우측(또는 상단 여백) 공간, 세로 중앙 정렬
- 폰트: Pretendard, 굵기 800(Black에 가까운 두께), 자간 -0.02em
- 색상: 잉크 `#1B1F2E` 또는 브랜드 인디고 `#4F46E5` 중 배경과 대비가 더 뚜렷한 쪽
- 크기: 1200×630 캔버스 기준 64~72px 정도(가로 폭의 절반을 넘지 않게)
- 완성 후 반드시 텍스트가 잘리거나 배경과 겹쳐 가독성이 떨어지지 않는지 확인

## 납품 방법

완성한 PNG를 **표에 적힌 경로·파일명 그대로** 저장하기만 하면 됩니다. 사이트 코드가 해당 경로를 참조하도록 이미 만들어져 있어서 별도 설정 없이 자동으로 인식됩니다.

- 파일명은 표와 **완전히 동일**하게 (`hero.png`, `tool-subject.png`, `tool-career.png`, `empty-state.png`, `og.png`).
- 저장 위치는 프로젝트 루트 기준 `assets/img/` 폴더 (예: `saenggibu-checker/assets/img/hero.png`).
- 확장자는 반드시 `.png`.
- 이미지를 아직 넣지 않았거나 일부만 넣어도 사이트는 정상 동작합니다 — 코드에 `onerror` 폴백이 있어 이미지 로드에 실패하면 자동으로 CSS 대체 아트가 대신 나타나는 구조입니다. 이미지는 준비되는 대로 하나씩 교체해도 됩니다.

## 완료 체크리스트

- [ ] `hero.png` — 1600×1000, 투명 배경, `assets/img/hero.png`
- [ ] `tool-subject.png` — 800×600, 투명 배경, `assets/img/tool-subject.png`
- [ ] `tool-career.png` — 800×600, 투명 배경, `assets/img/tool-career.png`
- [ ] `empty-state.png` — 640×480, 투명 배경, `assets/img/empty-state.png`
- [ ] `og.png` — 1200×630, **불투명** 배경, "생기부 점검 허브" 텍스트 포함, `assets/img/og.png`
- [ ] 5장 모두 팔레트(인디고·라이트인디고·화이트·잉크 + 파스텔 포인트 1~2개) 준수
- [ ] og.png를 제외한 4장에 글자·문자가 전혀 없음
- [ ] 그라데이션·3D 베벨·사실적 사진 요소가 없음
- [ ] 파일명·경로가 표와 정확히 일치(대소문자·확장자 포함)
- [ ] 저장 후 사이트를 새로고침해 이미지가 깨지지 않고 표시되는지 확인(코드 수정 불필요)
