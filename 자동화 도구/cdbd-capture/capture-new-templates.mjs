// 새 템플릿만 자동 감지 → 캡처 (증분)
// 1) discover-v2.mjs로 현재 라이브 템플릿 전체 재수집 (templates-list.json 갱신)
// 2) 출력 위치의 기존 폴더명({cat}__{name})과 비교 → 폴더 없는 = 새 템플릿
// 3) 새 것만: 원페이지=세그먼트 분할 / 멀티페이지=전 페이지 캡처
// 실행: node capture-new-templates.mjs            (새 것만)
//       node capture-new-templates.mjs --all      (전체 강제 재캡처)
import { spawnSync } from 'child_process';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const OUT_ROOT = process.env.CDBD_OUT_ROOT || join(homedir(), 'Desktop', 'CdBd', '마케팅', 'CdBd 템플릿 스크린샷');
const FORCE_ALL = process.argv.includes('--all');
const SKIP_DISCOVER = process.argv.includes('--no-discover');
if (!existsSync(OUT_ROOT)) mkdirSync(OUT_ROOT, { recursive: true });

const run = (script, args = []) => spawnSync('node', [script, ...args], { stdio: 'inherit', env: { ...process.env, CDBD_OUT_ROOT: OUT_ROOT } });

// 1) 라이브 재수집
if (!SKIP_DISCOVER) {
  console.log('▶ 현재 템플릿 목록 재수집 (discover-v2.mjs)…');
  const r = run('discover-v2.mjs');
  if (r.status !== 0) { console.error('✗ 디스커버리 실패'); process.exit(1); }
}

// 2) 디프
const all = JSON.parse(readFileSync('templates-list.json', 'utf8'));
const folder = (t) => t.slug.replace(/\//g, '__');
const existing = new Set(
  existsSync(OUT_ROOT) ? readdirSync(OUT_ROOT, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name) : []
);
const todo = FORCE_ALL ? all : all.filter(t => !existing.has(folder(t)));

console.log(`\n위치: ${OUT_ROOT}`);
console.log(`라이브 템플릿: ${all.length}개 · 기존 폴더: ${existing.size}개`);
if (!todo.length) { console.log('✅ 새 템플릿 없음 — 추가할 것 없음.'); process.exit(0); }

console.log(`\n🆕 새 템플릿 ${todo.length}개:`);
for (const t of todo) console.log(`   - ${t.slug}  (${t.type})`);

// 3) 캡처
const singles = todo.filter(t => t.type === 'single').map(t => t.slug);
const multis  = todo.filter(t => t.type === 'multi').map(t => t.slug);
if (singles.length) { console.log(`\n▶ 원페이지 ${singles.length}개 분할 캡처…`); run('capture-template-segments.mjs', singles); }
if (multis.length)  { console.log(`\n▶ 멀티페이지 ${multis.length}개 전 페이지 캡처…`); run('capture-multipage-all.mjs', multis); }

console.log(`\n✅ 완료 — ${todo.length}개 추가 → ${OUT_ROOT}`);
