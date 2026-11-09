# ChatRoom

Chat em tempo real com salas: crie uma sala, entre nas salas dos outros e
converse com as mensagens chegando na hora, vendo quem está online e quem está
digitando.

Projeto 4 de 5 da disciplina **Programação para Dispositivos Móveis** (IESB),
construído a partir do guia do Prof. Me. Bruno Assunção Dias.

## Funcionalidades

- Cadastro e login com **e-mail e senha** (Supabase Auth), com validação dos
  formulários
- Perfil criado sozinho no cadastro (nome e cor do avatar), com edição do nome
- Salas com emoji, nome e descrição; criar, entrar e sair
- Mensagens em **tempo real** (Supabase Realtime, Postgres Changes): chegam
  sem atualizar a tela, inclusive quando são apagadas
- **Quem está online** em cada sala (Realtime Presence)
- **"Fulano está digitando..."** (Realtime Broadcast), que some sozinho
- Mensagens agrupadas por autor, as suas à direita, e apagar segurando a
  própria mensagem
- Segurança no banco com **RLS**: só quem está na sala lê e envia mensagens,
  e cada um só apaga as próprias

## Tecnologias

React Native · Expo (SDK 58) · Expo Router · TypeScript · Supabase (Auth,
Postgres, RLS, Realtime) · TanStack Query · React Hook Form · Zod · Jest ·
PGlite (testes do banco)

## Como executar (Supabase local)

O projeto roda com o **Supabase local em Docker**, com portas próprias
(54350–54359) para conviver com outros projetos no mesmo computador.

1. Instale as dependências: `npm install`
2. Com o Docker aberto, inicie o Supabase: `npx supabase start`
3. Crie as tabelas:
   `docker exec -i supabase_db_chatroom psql -U postgres < supabase/schema.sql`
4. Copie `.env.example` para `.env` com o endereço do computador na rede
   (`http://NOME-DO-MAC.local:54351`) e a chave **Publishable** que aparece em
   `npx supabase status`.
5. Inicie o app com `npx expo start` e abra no Expo Go. Para testar o tempo
   real com dois aparelhos, aperte `w` para abrir uma segunda conta no
   navegador.

No Supabase local a confirmação de e-mail fica desligada: a conta já entra
logo depois do cadastro.

## Testes

| Comando            | O que testa                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `npm test`         | Tudo: app (Jest) e banco (PGlite)                                |
| `npm run test:app` | 20 testes: agrupamento de mensagens, "digitando", avatar         |
| `npm run test:db`  | 13 testes: RLS de perfis, salas, membros e mensagens; permissões |

Os testes do banco reproduzem as **permissões padrão do Supabase real** (que
liberam tudo para `anon` e `authenticated`, inclusive `TRUNCATE`); o
`schema.sql` revoga essas permissões e concede só o necessário.

## Diferenças em relação ao guia

Correções feitas durante a construção e os testes no iPhone, todas
documentadas no relatório:

- **Segurança:** `revoke` dos privilégios padrão do Supabase nas quatro
  tabelas e nas funções.
- **Tempo real:** o aviso de mensagem apagada não usa filtro por sala (eventos
  de DELETE só trazem o `id`); a mensagem enviada não aparece duplicada quando
  o Realtime chega antes da resposta; o histórico é buscado só depois de
  entrar na sala; a contagem "N na sala" se atualiza quando alguém entra ou
  sai.
- **Contagem de membros:** a função `member_count` mostra quantas pessoas há
  numa sala também para quem ainda não entrou, sem revelar quem são.
- **Navegador:** confirmações e avisos (`src/utils/dialogs.ts`) funcionam
  também na web, onde o `Alert.alert` não faz nada.
- **Sem conexão:** requisições ao Supabase têm limite de 8 segundos, e as
  mensagens de erro do iOS são traduzidas para "Sem conexão com a internet.".
- **Guia:** emojis da tela "Nova sala" (em branco no PDF), arquivos
  `errors.ts` e `icons.ts` (citados mas não incluídos), dois ajustes de tipo,
  configuração do Jest, área segura na tela de salas e "1 participante".

## Arquitetura

```
app/            rotas (Expo Router): (auth) login e cadastro; (app) abas, sala e nova sala
src/
  components/   interface (bolha de mensagem, cartão de sala, avatar, estados)
  context/      sessão do Supabase Auth
  hooks/        salas, mensagens (Realtime), presença e "digitando"
  lib/          cliente do Supabase e do TanStack Query
  schemas/      validação dos formulários (Zod)
  services/     acesso ao Supabase
  theme/        cores, espaçamentos e raios
  utils/        agrupamento, "digitando", avatar, erros e diálogos
supabase/
  config.toml   Supabase local (portas próprias, Realtime ligado)
  schema.sql    tabelas, RLS, gatilho de perfil e funções
  tests/        testes do banco
```

## Autora

**Karina Ribeiro Modesto**

- GitHub: https://github.com/Karina-RM
