/** Offline unit tests of the REAL TS utility/service code. No production Firebase is used. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
function loader(overrides = {}) {
  const cache = new Map();
  function load(relative) {
    let file = path.resolve(root, relative);
    if (!path.extname(file)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    const source = fs.readFileSync(file, 'utf8');
    const code = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const module = { exports: {} };
    cache.set(file, module);
    const customRequire = (name) => {
      if (Object.prototype.hasOwnProperty.call(overrides, name)) return overrides[name];
      if (name.startsWith('@/')) return load('src/' + name.slice(2));
      if (name.startsWith('.'))
        return load(path.relative(root, path.resolve(path.dirname(file), name)));
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(
      customRequire,
      module,
      module.exports,
    );
    return module.exports;
  }
  return load;
}
const load = loader();
const v = load('src/utils/validation');
const dates = load('src/utils/date');
const errors = load('src/utils/errors');
const stamp = (n) => ({ toMillis: () => n });
const photos = {
  jpeg: 'data:image/jpeg;base64,/9j/AA==',
  png: 'data:image/png;base64,iVBORw==',
  webp: 'data:image/webp;base64,UklGRg==',
};
const cases = [
  [
    'normaliza e-mail',
    () => assert.equal(v.validarEmail('  Alguem@EXAMPLE.com '), 'alguem@example.com'),
  ],
  ['recusa e-mail invalido', () => assert.throws(() => v.validarEmail('sem-arroba'))],
  ['recusa e-mail com espacos', () => assert.throws(() => v.validarEmail('a b@c.com'))],
  ['senha minima', () => assert.throws(() => v.validarSenha('12345'))],
  ['senha maxima', () => assert.throws(() => v.validarSenha('x'.repeat(129)))],
  ['senha valida', () => assert.doesNotThrow(() => v.validarSenha('exemplo123'))],
  [
    'texto remove espacos',
    () => assert.equal(v.textoObrigatorio('  abc ', 'Titulo', 10, 3), 'abc'),
  ],
  ['recusa texto vazio', () => assert.throws(() => v.textoObrigatorio('   ', 'Texto', 30))],
  [
    'recusa texto longo',
    () => assert.throws(() => v.textoObrigatorio('a'.repeat(4001), 'Mensagem', 4000)),
  ],
  [
    'aceita mensagem no limite',
    () => assert.equal(v.textoObrigatorio('a'.repeat(4000), 'Mensagem', 4000).length, 4000),
  ],
  [
    'conversa tem ID simetrico',
    () => assert.equal(v.criarConversaId('Bob', 'Ana'), v.criarConversaId('Ana', 'Bob')),
  ],
  ['conversa tem ordem canonica', () => assert.equal(v.criarConversaId('Bob', 'Ana'), 'Ana:Bob')],
  ['nao conversa consigo', () => assert.throws(() => v.criarConversaId('Ana', 'Ana'))],
  ['nao permite separador no UID', () => assert.throws(() => v.criarConversaId('a:b', 'c'))],
  ['nao permite barra no UID', () => assert.throws(() => v.validarUid('../admin'))],
  ['nao permite UID vazio', () => assert.throws(() => v.validarUid(''))],
  ['nao permite UID ausente', () => assert.throws(() => v.validarUid(undefined))],
  ['UID longo rejeitado', () => assert.throws(() => v.validarUid('x'.repeat(129)))],
  ['foto nula remove avatar', () => assert.equal(v.validarFoto(null), null)],
  ...Object.entries(photos).map(([key, value]) => [
    `avatar ${key} valido`,
    () => assert.equal(v.validarFoto(value), value),
  ]),
  [
    'recusa URL em lugar de Base64',
    () => assert.throws(() => v.validarFoto('https://example.com/x.jpg')),
  ],
  [
    'recusa SVG em Base64',
    () => assert.throws(() => v.validarFoto('data:image/svg+xml;base64,AA==')),
  ],
  ['recusa Base64 vazio', () => assert.throws(() => v.validarFoto('data:image/jpeg;base64,'))],
  [
    'limita tamanho do avatar',
    () => assert.throws(() => v.validarFoto('data:image/jpeg;base64,' + 'A'.repeat(180000))),
  ],
  [
    'aceita avatar exatamente no limite',
    () =>
      assert.equal(
        v.validarFoto('data:image/jpeg;base64,' + 'A'.repeat(180000 - 23)).length,
        180000,
      ),
  ],
  ['migra JPEG legado', () => assert.equal(v.fotoDoLegado('/9j/AA=='), photos.jpeg)],
  ['migra PNG legado', () => assert.equal(v.fotoDoLegado('iVBORw=='), photos.png)],
  ['migra WebP legado', () => assert.equal(v.fotoDoLegado('UklGRg=='), photos.webp)],
  [
    'foto invalida nao quebra perfil antigo',
    () => assert.equal(v.fotoDoLegado({ foto: 'errado' }), null),
  ],
  [
    'foto muito grande recebe fallback',
    () => assert.equal(v.fotoDoLegado('A'.repeat(190000)), null),
  ],
  ['busca ignora acentos', () => assert.equal(v.normalizar('  CEILÂNDIA  '), 'ceilandia')],
  [
    'iniciais primeiro e ultimo nome',
    () => assert.equal(v.iniciais('Warley de Morais Borges'), 'WB'),
  ],
  ['iniciais fallback', () => assert.equal(v.iniciais('   '), '?')],
  ['contador indefinido vira zero', () => assert.equal(v.numeroSeguro(undefined), 0)],
  ['contador negativo nao propaga', () => assert.equal(v.numeroSeguro(-1), 0)],
  ['contador fracionario nao propaga', () => assert.equal(v.numeroSeguro(1.5), 0)],
  ['contador valido preservado', () => assert.equal(v.numeroSeguro(50), 50)],
  ['data invalida nao derruba tela', () => assert.equal(dates.millis('ontem'), null)],
  ['timestamp valido', () => assert.equal(dates.millis(stamp(123)), 123)],
  [
    'timestamp que lanca erro',
    () =>
      assert.equal(
        dates.millis({
          toMillis() {
            throw new Error();
          },
        }),
        null,
      ),
  ],
  ['tempo relativo faltando', () => assert.equal(dates.tempoRelativo(null), 'agora')],
  ['hora sem timestamp e pendente', () => assert.equal(dates.horaMensagem(null), 'Enviando')],
  [
    'erros de senha nao revelam conta',
    () =>
      assert.equal(
        errors.mensagemErro({ code: 'auth/user-not-found' }),
        errors.mensagemErro({ code: 'auth/wrong-password' }),
      ),
  ],
  ['erro ausente tem fallback', () => assert.equal(typeof errors.mensagemErro(null), 'string')],
];
for (const [name, check] of cases) test(name, check);

/** This mock tests service intent/atomic writes; it DOES NOT evaluate Firestore rules/concurrency. */
function services() {
  const store = new Map();
  const auth = { currentUser: { uid: 'Ana', email: 'ana@example.com', displayName: 'Ana Silva' } };
  let serial = 0;
  let commits = 0;
  const ref = (base, ...parts) => {
    const full = [base?.path, ...parts].filter(Boolean).join('/');
    return { path: full, id: full.split('/').at(-1) };
  };
  const snapshot = (r) => ({
    id: r.path.split('/').at(-1),
    exists: () => store.has(r.path),
    data: () => store.get(r.path),
  });
  const mutations = (ops) => {
    for (const [type, r, data, options] of ops) {
      if (type === 'delete') store.delete(r.path);
      else
        store.set(
          r.path,
          type === 'update' || options?.merge ? { ...store.get(r.path), ...data } : { ...data },
        );
    }
    ++commits;
  };
  const firestore = {
    collection: ref,
    doc: (base, ...parts) => ref(base, ...(parts.length ? parts : ['auto' + ++serial])),
    serverTimestamp: () => stamp(++serial),
    getDoc: async (r) => snapshot(r),
    setDoc: async (r, d, o) => mutations([['set', r, d, o]]),
    updateDoc: async (r, d) => mutations([['update', r, d]]),
    deleteDoc: async (r) => mutations([['delete', r]]),
    runTransaction: async (_db, fn) => {
      const ops = [];
      const tx = {
        get: async (r) => {
          assert.equal(ops.length, 0, 'Todas as leituras devem preceder as escritas');
          return snapshot(r);
        },
        set: (r, d, o) => ops.push(['set', r, d, o]),
        update: (r, d) => ops.push(['update', r, d]),
        delete: (r) => ops.push(['delete', r]),
      };
      const result = await fn(tx);
      if (ops.length) mutations(ops);
      return result;
    },
  };
  const l = loader({
    'firebase/firestore': firestore,
    './firebase/auth': { auth },
    './firebase/firestore': { db: {} },
  });
  return {
    store,
    auth,
    get commits() {
      return commits;
    },
    forum: l('src/services/forumService').forumService,
    chat: l('src/services/chatService').chatService,
    profile: l('src/services/profileService').profileService,
  };
}
const post = {
  titulo: 'Como conhecer o bairro?',
  texto: 'Vamos conversar.',
  categoria: 'Geral',
  regiao: '',
};
test('publicacao usa UID autenticado e contadores zerados', async () => {
  const s = services();
  const id = await s.forum.publicar({ ...post, autorId: 'Bob' });
  const d = s.store.get('forum/' + id);
  assert.equal(d.autorId, 'Ana');
  assert.equal(d.totalComentarios, 0);
  assert.equal(d.totalCurtidas, 0);
});
test('comentario e contador sao gravados na mesma transacao', async () => {
  const s = services();
  const id = await s.forum.publicar(post);
  const before = s.commits;
  await s.forum.comentar(id, '  Legal! ', 'c1');
  assert.equal(s.commits, before + 1);
  assert.equal(s.store.get(`forum/${id}`).totalComentarios, 1);
  assert.equal(s.store.get(`forum/${id}/comentarios/c1`).texto, 'Legal!');
});
test('retry do comentario nao duplica nem incrementa contador', async () => {
  const s = services();
  const id = await s.forum.publicar(post);
  await s.forum.comentar(id, 'Legal!', 'c1');
  const before = s.commits;
  await s.forum.comentar(id, 'Legal!', 'c1');
  assert.equal(s.commits, before);
  assert.equal(s.store.get(`forum/${id}`).totalComentarios, 1);
});
test('ID de comentario ja usado nao aceita texto diferente', async () => {
  const s = services();
  const id = await s.forum.publicar(post);
  await s.forum.comentar(id, 'Legal!', 'c1');
  await assert.rejects(() => s.forum.comentar(id, 'Outra coisa', 'c1'));
});
test('curtida alterna documento e contador sem ficar negativo', async () => {
  const s = services();
  const id = await s.forum.publicar(post);
  await s.forum.alternarCurtida(id);
  assert.equal(s.store.get(`forum/${id}`).totalCurtidas, 1);
  assert.ok(s.store.has(`forum/${id}/curtidas/Ana`));
  await s.forum.alternarCurtida(id);
  assert.equal(s.store.get(`forum/${id}`).totalCurtidas, 0);
  assert.ok(!s.store.has(`forum/${id}/curtidas/Ana`));
});
test('contadores ausentes no legado iniciam em zero', async () => {
  const s = services();
  s.store.set('forum/legado', { titulo: 'Antigo' });
  await s.forum.comentar('legado', 'Novo', 'c1');
  assert.equal(s.store.get('forum/legado').totalComentarios, 1);
  assert.equal(s.store.get('forum/legado').titulo, 'Antigo');
});
test('abrir chat dos dois lados retorna um unico documento', async () => {
  const s = services();
  assert.equal(await s.chat.abrirConversa('Bob'), 'Ana:Bob');
  s.auth.currentUser = { uid: 'Bob' };
  assert.equal(await s.chat.abrirConversa('Ana'), 'Ana:Bob');
  assert.equal(s.store.size, 1);
});
test('mensagem e resumo sao gravados juntos', async () => {
  const s = services();
  const id = await s.chat.abrirConversa('Bob');
  const before = s.commits;
  await s.chat.enviar(id, 'Ola', 'm1');
  assert.equal(s.commits, before + 1);
  assert.equal(s.store.get(`conversas/${id}`).ultimaMensagemId, 'm1');
  assert.equal(s.store.get(`conversas/${id}/mensagens/m1`).autorId, 'Ana');
});
test('retry da mensagem nao duplica', async () => {
  const s = services();
  const id = await s.chat.abrirConversa('Bob');
  await s.chat.enviar(id, 'Ola', 'm1');
  const before = s.commits;
  await s.chat.enviar(id, 'Ola', 'm1');
  assert.equal(s.commits, before);
  assert.equal(s.store.size, 2);
});
test('servico rejeita envio por nao participante', async () => {
  const s = services();
  const id = await s.chat.abrirConversa('Bob');
  s.auth.currentUser = { uid: 'Carol' };
  await assert.rejects(() => s.chat.enviar(id, 'Ola', 'm1'));
  assert.equal(s.store.size, 1);
});
test('leitura referencia mensagem vista, nunca horario futuro do commit', async () => {
  const s = services();
  const id = await s.chat.abrirConversa('Bob');
  const message = { id: 'm1', criadoEm: stamp(100), autorId: 'Bob', texto: 'Ola' };
  await s.chat.marcarLida(id, message);
  const data = s.store.get(`conversas/${id}/leituras/Ana`);
  assert.equal(data.mensagemId, 'm1');
  assert.equal(data.lidoEm.toMillis(), 100);
  await s.chat.marcarLida(id, { ...message, id: 'old', criadoEm: stamp(90) });
  assert.equal(s.store.get(`conversas/${id}/leituras/Ana`).mensagemId, 'm1');
});
test('perfil salva foto no usuario e replica somente campos publicos', async () => {
  const s = services();
  await s.profile.salvar({ nome: 'Ana Silva', fotoBase64: photos.jpeg, regiao: 'Guara' });
  const own = s.store.get('usuarios/Ana');
  const publicData = s.store.get('perfisPublicos/Ana');
  assert.equal(own.fotoBase64, photos.jpeg);
  assert.equal(publicData.fotoBase64, photos.jpeg);
  assert.equal(own.email, 'ana@example.com');
  assert.deepEqual(Object.keys(publicData).sort(), ['atualizadoEm', 'fotoBase64', 'nome', 'uid']);
  assert.equal(s.commits, 1);
});
test('migracao preserva campos legados sem expor CPF ou e-mail', async () => {
  const s = services();
  s.store.set('usuarios/Ana', {
    nome: 'Ana Silva',
    email: 'ana@example.com',
    cpf: 'PRIVADO',
    avatarBase64: '/9j/AA==',
  });
  await s.profile.garantirPerfil(s.auth.currentUser);
  assert.equal(s.store.get('usuarios/Ana').cpf, 'PRIVADO');
  assert.equal(s.store.get('usuarios/Ana').fotoBase64, photos.jpeg);
  assert.equal(s.store.get('perfisPublicos/Ana').cpf, undefined);
  assert.equal(s.store.get('perfisPublicos/Ana').email, undefined);
});
test('novo login nao regrava perfil ja sincronizado', async () => {
  const s = services();
  await s.profile.garantirPerfil(s.auth.currentUser);
  const before = s.commits;
  await s.profile.garantirPerfil(s.auth.currentUser);
  assert.equal(s.commits, before);
});
test('servicos exigem autenticacao', async () => {
  const s = services();
  s.auth.currentUser = null;
  await assert.rejects(() => s.forum.publicar(post));
  await assert.rejects(() => s.chat.abrirConversa('Bob'));
});

test('remover foto nao ressuscita avatarBase64 legado no proximo login', async () => {
  const s = services();
  s.store.set('usuarios/Ana', {
    nome: 'Ana Silva',
    email: 'ana@example.com',
    avatarBase64: '/9j/AA==',
  });
  await s.profile.garantirPerfil(s.auth.currentUser);
  await s.profile.salvar({ nome: 'Ana Silva', fotoBase64: null, regiao: '' });
  await s.profile.garantirPerfil(s.auth.currentUser);
  assert.equal(s.store.get('usuarios/Ana').fotoBase64, null);
  assert.equal(s.store.get('perfisPublicos/Ana').fotoBase64, null);
  assert.equal(s.store.get('usuarios/Ana').avatarBase64, '/9j/AA==');
});
