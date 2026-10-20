/* Syntax/import/asset checks. This is NOT a device build or a rules emulator. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const sources = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))].filter((file) =>
  /\.tsx?$/.test(file),
);
let imports = 0,
  assets = 0;
for (const file of sources) {
  const source = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      strict: true,
    },
  });
  const errors = (result.diagnostics || []).filter(
    (d) => d.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(
    errors.length,
    0,
    `${file}: ${errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n')}`,
  );
  for (const match of source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)) {
    const target = match[1];
    if (target.startsWith('@/') || target.startsWith('.')) {
      const base = target.startsWith('@/')
        ? path.join(root, 'src', target.slice(2))
        : path.resolve(path.dirname(file), target);
      assert.ok(
        ['', '.ts', '.tsx', '.js', '/index.ts', '/index.tsx'].some((suffix) =>
          fs.existsSync(base + suffix),
        ),
        `Import ausente: ${file} -> ${target}`,
      );
      ++imports;
    }
  }
  for (const match of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)) {
    if (match[1].startsWith('.')) {
      assert.ok(
        fs.existsSync(path.resolve(path.dirname(file), match[1])),
        `Asset ausente: ${file} -> ${match[1]}`,
      );
      ++assets;
    }
  }
  assert.ok(!/<(div|span|button|h1|img)\b/.test(source), `Elemento HTML em tela nativa: ${file}`);
}
for (const file of [
  'app.json',
  'package.json',
  'tsconfig.json',
  'firebase.json',
  'firestore.indexes.json',
  '.firebaserc',
])
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
assert.ok(
  !walk(path.join(root, 'assets')).some((p) => /\.(ttf|otf|woff2?)$/i.test(p)),
  'Unexpected bundled font file',
);
console.log(
  `Sintaxe: ${sources.length} arquivos. Imports locais: ${imports}. Assets referenciados: ${assets}. JSONs: OK.`,
);
console.log('Isto nao substitui npm run typecheck, compilacao Metro ou testes em aparelho.');
