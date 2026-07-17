// 규칙 패리티 테스트 — rules-subject.js(SGB.rulesSubject.scan)의 SSOT 규칙코드(R1~R10·F1·F2)가
// rule_scan.py(SSOT)와 대표 문단 기준으로 일치하는지 확인한다.
// 실행: node tests/rules-parity.mjs  (Node 24+, ESM)
//
// 단언 범위: 규칙코드 "집합"(객관 판정)까지. 판정 등급(violation/check) 매핑은
// docs/rules-sync-diff.md 수동 감사 항목 — 여기서는 다루지 않는다.
// rule_scan.py 가 없으면(로컬 개발 환경 등) 교차 비교는 건너뛰고, 각 픽스처에 하드코딩한
// expectedCodes 기준 자체 검증만 수행한다(스캐너 로직 자체 회귀 방지).
import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, 'golden-parse.cjs-shim.js'));

// 이중 런타임 계약: rules-subject.js를 로드하면 globalThis.SGB.rulesSubject 가 채워진다.
require(path.join(__dirname, '..', 'assets', 'js', 'rules-subject.js'));
const { scan } = globalThis.SGB.rulesSubject;

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

// ---------------------------------------------------------------------
// 대표 문단 픽스처 12개 — R1~R10·F1·F2 전 코드를 최소 1회 이상 커버.
// 모호 트리거(R6 합성어, R3 '~던' 어간 오탐) 회피, 결정적으로 작성.
// ---------------------------------------------------------------------
const FIXTURES = [
  {
    label: 'R1알파벳 + F2파일형식확인',
    text: 'PBL 프로젝트 결과물을 JPG로 저장함.',
    expectedCodes: ['R1알파벳', 'F2파일형식확인']
  },
  {
    label: 'R2특수기호(능력단위 쌍점 면제 대조) + R3과거시제(축약형)',
    text: '[능력단위: 정보처리와관리]를 반영했으며, 준비물: 태블릿을 사용함.',
    expectedCodes: ['R2특수기호', 'R3과거시제']
  },
  {
    label: 'R3과거시제(았/었/였 직접)',
    text: '자료를 분석하였음.',
    expectedCodes: ['R3과거시제']
  },
  {
    label: 'R3과거시제(ㅆ받침 축약) + 겠 제외',
    text: '실험을 정리했으나 다음에는 더 노력하겠음.',
    expectedCodes: ['R3과거시제']
  },
  {
    label: 'R3과거시제 — 작은따옴표 짝 내부 예외(음성 테스트)',
    text: "임원은 '최선을 다했다'라는 문장을 인용해 발표함.",
    expectedCodes: []
  },
  {
    label: 'R4내면심리 + R5역량어단독 + R3과거시제(부수)',
    text: '발표를 통해 자신감을 얻었으며, 문제해결력이 돋보임.',
    expectedCodes: ['R4내면심리', 'R5역량어단독', 'R3과거시제']
  },
  {
    label: 'R6지칭어',
    text: '학생은 스스로 계획을 세워 실행함.',
    expectedCodes: ['R6지칭어']
  },
  {
    label: 'R7기재금지(소논문)',
    text: '소논문을 작성해 제출함.',
    expectedCodes: ['R7기재금지']
  },
  {
    label: 'R8무관내용(출석)',
    text: '출석을 성실히 지키며 발표를 준비함.',
    expectedCodes: ['R8무관내용']
  },
  {
    label: 'R9줄바꿈도서명(줄바꿈 + 굽은따옴표)',
    text: '‘중요한 개념’을 정리함.\n다음 문단으로 이어짐.',
    expectedCodes: ['R9줄바꿈도서명']
  },
  {
    label: 'R10분량(1,500바이트 초과)',
    text: '모둠에서 자료를 정리하고 결과를 발표하는 태도를 보임. '.repeat(25),
    expectedCodes: ['R10분량']
  },
  {
    label: 'F1외국어확인(가나, 일본어 프로파일)',
    text: 'ひらがな 표현을 살펴봄.',
    subject: '일본어',
    expectedCodes: ['F1외국어확인']
  }
];

// R10 픽스처가 실제로 1500바이트를 넘는지 자체 점검(반복 횟수 튜닝 실수 방지)
{
  const r10 = FIXTURES.find(f => f.label.startsWith('R10'));
  const b = globalThis.SGB.rulesSubject.byteLenUtf3(r10.text);
  check('R10 픽스처 실제 1500바이트 초과', b > 1500, `실제 ${b}바이트`);
}

// SSOT 코드만 추출(R1~R10, F1, F2) — rules-subject.js의 확장 코드(U/N/S/C/M 접두)는 제외.
const SSOT_CODE_RE = /^(R([1-9]|10)[가-힣]+|F[12][가-힣]+)$/;
function ssotCodeSet(findings) {
  return new Set(findings.map(f => f.rule).filter(r => SSOT_CODE_RE.test(r)));
}
function setEquals(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}
function setDiff(label, a, b) {
  const onlyA = [...a].filter(x => !b.has(x));
  const onlyB = [...b].filter(x => !a.has(x));
  return `${label}에만 있음: [${onlyA.join(',')}] / 상대에만 있음: [${onlyB.join(',')}]`;
}

// ---------------------------------------------------------------------
// 1) JS 스캐너 자체 검증(expectedCodes 대조) — python 유무와 무관하게 항상 실행
// ---------------------------------------------------------------------
console.log('\n==== 1) rules-subject.js 자체 검증(expectedCodes) ====');
const jsResults = FIXTURES.map(fx => {
  const profile = { id: 'general', subjectName: fx.subject || '', byteLimit: 1500 };
  const findings = scan(fx.text, profile);
  return { fx, findings, codes: ssotCodeSet(findings) };
});
jsResults.forEach(({ fx, codes }) => {
  const expected = new Set(fx.expectedCodes);
  check(
    `[JS] ${fx.label}`,
    setEquals(codes, expected),
    setDiff('JS', codes, expected)
  );
});

// ---------------------------------------------------------------------
// 2) rule_scan.py 교차 비교(있으면 실행, 없으면 skip)
// ---------------------------------------------------------------------
console.log('\n==== 2) rule_scan.py 교차 비교(SSOT) ====');
const RULE_SCAN_CANDIDATES = [
  path.join(__dirname, '..', '..', '..', '.claude', 'skills', 'setteuk-review', 'scripts', 'rule_scan.py'),
  path.join(__dirname, '..', '..', '.claude', 'skills', 'setteuk-review', 'scripts', 'rule_scan.py')
];
const ruleScanPath = RULE_SCAN_CANDIDATES.find(p => fs.existsSync(p));

if (!ruleScanPath) {
  console.log('SKIP  rule_scan.py를 찾을 수 없어 교차 비교를 건너뜁니다(로컬 개발 게이트).');
  console.log(`      시도한 경로: ${RULE_SCAN_CANDIDATES.join(' | ')}`);
} else {
  console.log(`rule_scan.py 발견: ${ruleScanPath}`);
  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `sgb-rules-parity-input-${Date.now()}.json`);
  const outputPath = path.join(tmpDir, `sgb-rules-parity-output-${Date.now()}.json`);
  const payload = FIXTURES.map(fx => ({ text: fx.text, subject: fx.subject || '' }));
  fs.writeFileSync(inputPath, JSON.stringify(payload), 'utf8');

  function tryRun(pythonCmd) {
    return spawnSync(pythonCmd, [ruleScanPath, inputPath, '-o', outputPath], { encoding: 'utf8' });
  }
  let runResult = tryRun('python');
  if (runResult.error || runResult.status !== 0) {
    const fallback = tryRun('python3');
    if (!fallback.error && fallback.status === 0) runResult = fallback;
  }

  if (runResult.error || runResult.status !== 0) {
    console.log('SKIP  python 실행 실패 — 교차 비교를 건너뜁니다.');
    console.log(`      stderr: ${(runResult.stderr || runResult.error || '').toString().slice(0, 500)}`);
  } else {
    const pyEntries = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    check('python 출력 개수 == 픽스처 개수', pyEntries.length === FIXTURES.length,
      `실제 ${pyEntries.length} / 기대 ${FIXTURES.length}`);

    FIXTURES.forEach((fx, i) => {
      const pyCodes = ssotCodeSet(pyEntries[i].findings || []);
      const jsCodes = jsResults[i].codes;
      check(
        `[JS==PY] ${fx.label}`,
        setEquals(jsCodes, pyCodes),
        setDiff('JS', jsCodes, pyCodes)
      );
    });
  }

  try { fs.unlinkSync(inputPath); } catch (e) { /* noop */ }
  try { fs.unlinkSync(outputPath); } catch (e) { /* noop */ }
}

// ---------------------------------------------------------------------
console.log(`\n==== 결과: PASS ${pass} / FAIL ${fail} ====`);
if (fail > 0) process.exit(1);
