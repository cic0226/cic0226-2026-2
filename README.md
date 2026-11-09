# Mapeei - Expo Go | Etapa 1

Aplicativo novo em React Native, TypeScript e Expo Router. Usa Firebase Authentication e Cloud Firestore com a configuração do projeto legado fornecido.

**Escopo desta entrega:** base funcional implementada em código, com autenticação, perfil, fórum e conversa privada. O protótipo Figma não ficou acessível no ambiente de desenvolvimento desta entrega. As imagens, a identidade visual e a organização inicial vieram do legado; não houve validação de fidelidade tela a tela. Não se trata de uma reprodução visual certificada como idêntica ao Figma.

## Comece aqui

1. Extraia o ZIP em uma pasta nova. Não copie o `node_modules` nem o `package-lock.json` do legado.
2. Use Node.js **22.13 ou superior**. O alvo é **Expo SDK 57**, React Native **0.86.3** e React **19.2.3**. Consulte `package.json`.
3. Instale as dependências:

```bash
cd mapeei-expo
npm install
npx expo install --check
npx expo-doctor
```

O ambiente de geração não conseguiu baixar as dependências do SDK 57; por isso **não foi inventado um lockfile**. O `npm install` gerará o seu `package-lock.json`. Valide e mantenha esse arquivo no repositório. Havendo divergências apontadas pelo Expo, use `npx expo install --fix`, sem misturar pacotes de outro SDK ou usar `--force` para esconder conflitos.

**Antes do primeiro login conectado ao seu banco:** valide as regras no emulador e publique os arquivos de regras/índices. As regras antigas não autorizam os novos fluxos de perfil e chat. Nenhuma regra, índice ou dado foi publicado automaticamente nesta entrega.

## Configuração Firebase

O `.env` da entrega foi preenchido a partir da configuração cliente encontrada no legado. A inicialização está em `src/services/firebase/`; o mapeamento das variáveis está em `src/config/firebase.config.ts`.

Confira o `projectId` do `.env` e o projeto selecionado no Console Firebase. Mantenha o provedor **E-mail/senha** habilitado em Authentication. O aplicativo não usa login por CPF, Google ou Apple nesta etapa: preserva o fluxo de e-mail/senha do ZIP.

O `.env` está no `.gitignore`. O projeto também contém `.env.example` sem os valores do seu projeto. Nunca acrescente credenciais Admin, arquivos de service account, senhas ou chaves privadas ao código do aplicativo. Não publique o ZIP original inteiro como se fosse uma versão pública do portfólio.

### Regras e índices

Arquivos separados na raiz:

```text
firestore.rules
firestore.indexes.json
firebase.json
.firebaserc
```

**Atenção:** `firestore.rules` é um conjunto completo para esta nova aplicação, não um trecho para somar às regras permissivas antigas. Revise eventuais outras coleções do seu projeto e guarde uma cópia das regras existentes antes de substituir. A nova validação exige gravações atômicas; clientes legados que gravam perfis/comentários de outra maneira precisarão ser atualizados. Não mantenha as permissões antigas abertas em paralelo.

Após os testes locais, no Console, abra Firestore > Regras e publique o conteúdo de `firestore.rules`. Para publicar regras e índices pela CLI, confira primeiro o ID correto:

```bash
npx firebase-tools login
npx firebase-tools projects:list
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project SEU_PROJECT_ID
```

Substitua `SEU_PROJECT_ID` pelo projeto correto, conferido no seu `.env`. Esse comando altera a configuração do banco selecionado, mas não faz migração de documentos. A criação do índice deve terminar antes de testar a lista de conversas.

No Console, o índice composto corresponde a: coleção `conversas`; campo `participantes` com modo Array contains; campo `atualizadoEm` descendente; escopo Collection. O JSON também desativa índices de campos Base64 e de textos que não são consultados.

### Rodar no Expo Go

```bash
npm start -- --clear
```

Abra o QR Code no Expo Go compatível com o SDK 57. Computador e celular precisam ter conectividade entre si. Para testes web, `npm run web`; para iniciar com um simulador instalado, `npm run ios` ou `npm run android`. Expo Go é o ambiente de desenvolvimento; este ZIP não contém APK/IPA.

## Teste primeiro sem tocar na produção

### Testes automatizados

```bash
npm run check:source
npm test
npm run typecheck
```

A suíte unitária utiliza implementações simuladas do Firestore para testar o código real dos serviços. Ela não se conecta ao seu Firebase e não valida regras de segurança. Há uma suíte separada de integração com as regras reais:

```bash
npm --prefix tests/firestore install
npm run test:rules
```

Essa segunda suíte requer Java/JDK e instalação inicial dos emuladores. Use JDK 21. Ela usa exclusivamente o projeto local `demo-mapeei`, sem ler o `.env` da aplicação. Veja os resultados efetivamente obtidos e as limitações em `docs/VALIDACAO.md`.

### Aplicativo conectado aos emuladores

Copie `.env.emulator.example` para `.env.local`. Para celular físico, altere `EXPO_PUBLIC_EMULATOR_HOST` para o IPv4 local do computador. `127.0.0.1` no celular aponta para o próprio celular, não para o computador.

```bash
cp .env.emulator.example .env.local
npx firebase-tools emulators:start --only auth,firestore --project demo-mapeei
```

Em outro terminal na mesma pasta:

```bash
npm start -- --clear
```

O `firebase.json` permite acesso de dispositivos da rede local aos emuladores Auth/Firestore. Use somente uma rede confiável; não exponha essas portas à internet. A interface do emulador permanece em `127.0.0.1:4000` no computador. O túnel do Expo, isoladamente, não expõe o emulador ao celular.

As contas de teste do emulador são separadas das contas reais. Para voltar ao projeto real, remova ou renomeie `.env.local` e reinicie o Expo com cache limpo. Variáveis `.env.local` sobrepõem `.env`; deixá-las ativas pode fazer parecer que seu banco real está vazio.

## O que está implementado

| Área         | Fluxos e comportamentos                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Autenticação | Cadastro, login, recuperação de senha, persistência nativa via AsyncStorage, logout e proteção de rotas.                                         |
| Início       | Imagens do legado, destaques, categorias e navegação para conteúdos informativos.                                                                |
| Explorar     | Catálogo inicial de seis regiões, pesquisa local, detalhes, favorito e acesso ao fórum por região.                                               |
| Fórum        | Publicar, editar a própria publicação, comentar, curtir/descurtir, favoritar e carregar mais itens.                                              |
| Autores      | Nome e foto atualizados a partir do perfil público; tocar em outro autor abre a conversa privada.                                                |
| Chat         | Um documento por dupla, mensagens em tempo real, histórico paginado, resumo na lista, marca de não lida, recibo de leitura e bloqueio bilateral. |
| Perfil       | Editar nome/região, selecionar/remover foto e visualizar favoritos. A foto é comprimida e gravada em Base64 no documento do usuário.             |

Fórum e chat não são alimentados por listas fictícias: usam o Firestore. Os conteúdos editoriais e o catálogo inicial de regiões são locais e estão identificados como iniciais; não há API de estatísticas, imóveis, mapas ou avaliações integrada nesta etapa.

## Fotos em Base64

Caminho principal: `usuarios/{uid}.fotoBase64`. O valor armazenado é um data URI completo, por exemplo `data:image/jpeg;base64,...`, e pode ser exibido diretamente com `Image` do React Native.

A seleção abre a galeria, recorta uma imagem quadrada, reduz/comprime para JPEG e limita o resultado a **180.000 caracteres**, incluindo o prefixo. Apenas clicar em **Salvar alterações** envia a foto. Cancelar a seleção mantém a foto anterior. Remover foto grava `null` depois de salvar.

Existe uma segunda cópia de nome/foto em `perfisPublicos/{uid}` para exibir autores sem liberar acesso ao e-mail ou a outros dados privados do documento principal. As duas cópias são sincronizadas na mesma transação e conferidas pelas regras. Base64 é codificação, não criptografia. Não se usa Firebase Storage nem Cloud Functions.

## Estrutura e próximas validações

```text
app/                    Rotas, autenticação, abas e telas
src/components/         Componentes visuais reutilizáveis
src/context/            Sessão autenticada e favoritos
src/hooks/              Streams, perfis de autores e ações
src/services/           Perfil, fórum, chat, imagens e Firebase
src/theme/              Cores e estilos-base
src/types/              Contratos dos documentos
src/utils/              Validações, datas e erros
assets/                 Imagens aproveitadas do legado
scripts/                Testes unitários e verificações de fontes
tests/firestore/       Testes reais de regras no emulador
docs/                  Arquitetura, migração, validação e checklist
```

Leia `docs/LEGADO_E_MIGRACAO.md` antes de usar documentos antigos e `docs/CHECKLIST.md` para testar com duas contas. A comparação visual final depende dos frames exportados do Figma. Recursos não implementados, como push, anexo no chat, moderação administrativa e exclusão completa de conta, estão listados em `docs/VALIDACAO.md`.

## Referências técnicas

Consultadas em 15/10/2026; não substituem os testes no dispositivo:

- Expo Go / SDK suportado: `https://expo.dev/go`
- Matriz SDK, React Native, React e Node: `https://docs.expo.dev/versions/latest/`
- Firebase JS SDK no Expo: `https://docs.expo.dev/guides/using-firebase/`
- Autenticação persistente: `https://expo.fyi/firebase-js-auth-setup`
- Image Picker: `https://docs.expo.dev/versions/latest/sdk/imagepicker/`
- Image Manipulator: `https://docs.expo.dev/versions/latest/sdk/imagemanipulator/`
- Regras com validação de transações: `https://firebase.google.com/docs/firestore/security/rules-conditions`
- Testes no emulador: `https://firebase.google.com/docs/rules/unit-tests`
- Limites do Firestore: `https://firebase.google.com/docs/firestore/quotas`
