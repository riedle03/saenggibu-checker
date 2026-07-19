// 골든 테스트 — SGB.parse.parseWorkbook 을 표본 xlsx 2종으로 검증한다.
// 실행: node tests/golden-parse.mjs  (Node 24+, ESM)
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, 'golden-parse.cjs-shim.js'));

// 이중 런타임 계약: 벤더 XLSX를 전역에 얹은 뒤 xlsx-parse.js를 로드한다(브라우저의 <script> 순서 로드를 모사).
globalThis.XLSX = require(path.join(__dirname, '..', 'assets', 'vendor', 'xlsx.full.min.js'));
require(path.join(__dirname, '..', 'assets', 'js', 'xlsx-parse.js'));

const { parseWorkbook } = globalThis.SGB.parse;

const SAMPLE_ROOT = 'C:/project/2026 하계 1급 정교사 자격연수 업무경감';
const SAMPLE_1_6 = path.join(SAMPLE_ROOT, '2026 1-6 과세특.xlsx');
const SAMPLE_1_5 = path.join(SAMPLE_ROOT, '2026 1-5 과세특.xlsx');

const EXPECTED_SUBJECTS = [
  '공통국어1', '공통수학1', '공통영어1', '한국사1', '기술·가정', '일본어',
  '성공적인 직업 생활', '스마트 문화 앱 콘텐츠 제작', '시각 디자인', '체육1', '디자인 일반'
];
const FRAGMENTS = ['츠 제작', '인', '스마트 문화 앱 콘텐', '시각 디자'];

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) {
    pass++;
    console.log(`PASS  ${label}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}${detail ? '  — ' + detail : ''}`);
  }
}

function readWorkbook(filePath) {
  const buf = fs.readFileSync(filePath);
  return globalThis.XLSX.read(buf, { type: 'buffer', cellDates: false });
}

function countNamedRows(result) {
  // 명명행(성명 있는 원본 데이터 행) 수는 파서가 직접 세어 반환하는 namedRowCount를 오라클로 쓴다.
  // (entries.length 합은 쓰지 않는다 — 페이지 경계에서 성명 칸이 중복 기재된 연속행을 같은 학생·
  //  같은 과목이면 병합하므로, 원본 행 수와 최종 entries 개수가 항상 같지는 않다.)
  return result.namedRowCount;
}

function countFragmentResidue(result) {
  let residue = 0;
  const inSubjects = result.subjects.filter(s => FRAGMENTS.includes(s));
  residue += inSubjects.length;
  result.students.forEach(st => st.entries.forEach(e => {
    if (FRAGMENTS.includes(e.subject)) residue += 1;
  }));
  return residue;
}

function countHeaderLiteralAsSubject(result) {
  let n = 0;
  if (result.subjects.includes('과 목')) n++;
  result.students.forEach(st => st.entries.forEach(e => { if (e.subject === '과 목') n++; }));
  return n;
}

// ---------------------------------------------------------------------
// 표본1: 2026 1-6 과세특.xlsx
// ---------------------------------------------------------------------
console.log('\n==== 표본1: 2026 1-6 과세특.xlsx ====');
let result16;
try {
  const wb = readWorkbook(SAMPLE_1_6);
  result16 = parseWorkbook(wb, { fileName: '2026 1-6 과세특.xlsx' });
  check('표본1 파싱 예외 없이 완주', true);
} catch (err) {
  check('표본1 파싱 예외 없이 완주', false, err && err.stack);
}

if (result16) {
  check('표본1 format === printdump', result16.format === 'printdump', `실제: ${result16.format}`);

  const named16 = countNamedRows(result16);
  check('표본1 명명행 정확히 206', named16 === 206, `실제: ${named16}`);

  const subjects16 = result16.subjects;
  check(
    '표본1 과목 정확히 11종(순서 포함)',
    subjects16.length === EXPECTED_SUBJECTS.length && EXPECTED_SUBJECTS.every((s, i) => subjects16[i] === s),
    `실제(${subjects16.length}): ${JSON.stringify(subjects16)}`
  );

  const residue16 = countFragmentResidue(result16);
  check('표본1 조각 과목 잔존 0', residue16 === 0, `잔존 ${residue16}건`);

  const headerLeak16 = countHeaderLiteralAsSubject(result16);
  check("표본1 '과 목' 헤더 문자열 과목 등록 0", headerLeak16 === 0, `등록 ${headerLeak16}건`);

  check('표본1 sourceLabel에 학급 정보 포함', /1학년\s*6반/.test(result16.sourceLabel || ''), `실제: ${result16.sourceLabel}`);
}

// ---------------------------------------------------------------------
// 표본2: 2026 1-5 과세특.xlsx (보조 표본 — 예외 없이 완주 + 조각 0)
// ---------------------------------------------------------------------
console.log('\n==== 표본2: 2026 1-5 과세특.xlsx ====');
let result15;
try {
  const wb = readWorkbook(SAMPLE_1_5);
  result15 = parseWorkbook(wb, { fileName: '2026 1-5 과세특.xlsx' });
  check('표본2 파싱 예외 없이 완주', true);
} catch (err) {
  check('표본2 파싱 예외 없이 완주', false, err && err.stack);
}

if (result15) {
  const named15 = countNamedRows(result15);
  check('표본2 명명행 정확히 205', named15 === 205, `실제: ${named15}`);

  const subjects15 = result15.subjects;
  check(
    '표본2 과목 정확히 11종(순서 포함)',
    subjects15.length === EXPECTED_SUBJECTS.length && EXPECTED_SUBJECTS.every((s, i) => subjects15[i] === s),
    `실제(${subjects15.length}): ${JSON.stringify(subjects15)}`
  );

  const residue15 = countFragmentResidue(result15);
  check('표본2 조각 과목 잔존 0', residue15 === 0, `잔존 ${residue15}건`);
}

// ---------------------------------------------------------------------
// 표본3: NEIS 업로드 표준 양식 (학년도/…/과목/과목코드/반/번호/성명/…/세특)
// 헤더에 '과목'+'성명'이 함께 있어 인쇄덤프로 오판되면 반/번호 값(5/1 등)이
// 페이지 푸터 정규식에 걸려 전 행이 버려지는 회귀를 방지한다.
// ---------------------------------------------------------------------
console.log('\n==== 표본3: NEIS 업로드 표준 양식 (뉴미디어디자인과_공통국어1_6반) ====');
const SAMPLE_NEIS = path.join(SAMPLE_ROOT, '2026_1학기_1학년_특성화_1_뉴미디어디자인과_공통국어1_과목세특_6.xlsx');
let resultNeis;
try {
  const wb = readWorkbook(SAMPLE_NEIS);
  resultNeis = parseWorkbook(wb, { fileName: path.basename(SAMPLE_NEIS) });
  check('표본3 파싱 예외 없이 완주', true);
} catch (err) {
  check('표본3 파싱 예외 없이 완주', false, err && err.stack);
}

if (resultNeis) {
  check('표본3 format === standard', resultNeis.format === 'standard', `실제: ${resultNeis.format}`);
  check('표본3 학생 정확히 18명', resultNeis.students.length === 18, `실제: ${resultNeis.students.length}`);
  check(
    "표본3 과목은 파일 내 '과목' 열 값(공통국어1)",
    resultNeis.subjects.length === 1 && resultNeis.subjects[0] === '공통국어1',
    `실제: ${JSON.stringify(resultNeis.subjects)}`
  );
  const first = resultNeis.students[0];
  check(
    "표본3 첫 학생 번호는 반/번호 열(6/1) + 세특 본문 보존",
    !!first && first.no === '6/1' && first.entries.length === 1 && first.entries[0].text.length > 40,
    first ? `no=${first.no} entries=${first.entries.length} textLen=${(first.entries[0] || {}).text ? first.entries[0].text.length : 0}` : '학생 없음'
  );
}

// ---------------------------------------------------------------------
// mergeStudents 스모크 테스트 (표준 모드 다중 파일 병합 계약 확인)
// ---------------------------------------------------------------------
console.log('\n==== mergeStudents 스모크 ====');
try {
  const { mergeStudents } = globalThis.SGB.parse;
  const a = [{ id: 1, no: '1', name: '홍길동', entries: [{ subject: '공통국어1', text: 'A' }] }];
  const b = [{ id: 1, no: '1', name: '홍길동', entries: [{ subject: '공통수학1', text: 'B' }] }];
  const merged = mergeStudents(a, b);
  check('mergeStudents 동일 학생 entries 병합', merged.length === 1 && merged[0].entries.length === 2, JSON.stringify(merged));
} catch (err) {
  check('mergeStudents 동일 학생 entries 병합', false, err && err.stack);
}

try {
  const { mergeStudents } = globalThis.SGB.parse;
  const a = [{ id: 1, no: '1', name: '홍길동', entries: [{ subject: '공통국어1', text: '구파일 내용' }] }];
  const b = [{ id: 1, no: '1', name: '홍길동', entries: [{ subject: '공통국어1', text: '신파일 내용(최신)' }] }];
  const merged = mergeStudents(a, b);
  const ok = merged.length === 1 && merged[0].entries.length === 1 &&
    merged[0].entries[0].text === '신파일 내용(최신)' && merged.replacedCount === 1;
  check('mergeStudents 동일 과목 재업로드 시 교체(중복 방지) + replacedCount', ok, JSON.stringify(merged) + ' replacedCount=' + merged.replacedCount);
} catch (err) {
  check('mergeStudents 동일 과목 재업로드 시 교체(중복 방지) + replacedCount', false, err && err.stack);
}

// ---------------------------------------------------------------------
console.log(`\n==== 결과: PASS ${pass} / FAIL ${fail} ====`);
if (fail > 0) process.exit(1);
