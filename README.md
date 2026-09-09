# Review App

Aplicação full-stack de reviews de livros, jogos e filmes. Usuários criam conta, cadastram mídias e deixam avaliações com nota e comentário.

🔗 **Demo ao vivo:** [review-site-dead15.vercel.app](https://review-site-dead15.vercel.app)
🔗 **API:** [review-backend-34u7.onrender.com](https://review-backend-34u7.onrender.com)

> A API roda no plano gratuito do Render, que "dorme" após um período de inatividade  a primeira requisição depois de um tempo parado pode levar alguns segundos a mais para responder.

## Stack

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL (hospedado no [Neon](https://neon.com))
- Prisma ORM
- JWT (autenticação) + bcrypt (hash de senha)

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router

**Deploy**
- Backend: Render
- Frontend: Vercel
- Banco de dados: Neon

## Funcionalidades

- Cadastro e login de usuário (autenticação via JWT)
- Rotas protegidas (só usuário autenticado cria mídia ou review)
- Autorização por dono (só quem criou uma review pode editar/deletar ela)
- CRUD completo de reviews (criar, listar, editar, deletar) pela interface
- Cadastro, listagem e exclusão de mídias (livros, jogos, filmes), com suporte a novos tipos via enum
- Página de detalhes de cada mídia, com lista de reviews e formulário para nova avaliação
- Nota média calculada por mídia, exibida nos cards da listagem
- Busca por título e filtro por tipo de mídia
- Página "Minhas reviews", com edição e exclusão inline

## Modelagem do banco

Três entidades principais:

- **User** — usuários da aplicação
- **Media** — livros, jogos e filmes, com um campo `type` (enum) que permite adicionar novos tipos de mídia sem alterar o schema
- **Review** — conecta `User` e `Media`, com nota, comentário e as respectivas foreign keys (exclusão de mídia remove suas reviews em cascata)

## Rotas da API

| Método | Rota             | Descrição                             | Protegida |
|--------|------------------|-----------------------------------------|-----------|
| POST   | /users/register  | Cria um novo usuário                    | Não       |
| POST   | /users/login     | Autentica e retorna um token JWT        | Não       |
| GET    | /media           | Lista todas as mídias (com nota média)  | Não       |
| GET    | /media/:id       | Detalhes de uma mídia + suas reviews    | Não       |
| POST   | /media           | Cria uma nova mídia                     | Sim       |
| DELETE | /media/:id       | Deleta uma mídia                        | Sim       |
| GET    | /reviews         | Lista todas as reviews                  | Não       |
| GET    | /reviews/mine    | Lista as reviews do usuário logado      | Sim       |
| POST   | /reviews         | Cria uma review                         | Sim       |
| PUT    | /reviews/:id     | Edita uma review (só o dono)            | Sim       |
| DELETE | /reviews/:id     | Deleta uma review (só o dono)           | Sim       |

## Rodando localmente

### Pré-requisitos

- Node.js
- PostgreSQL

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` a partir do `.env.example`, preenchendo com seus dados:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
JWT_SECRET="sua_chave_secreta_aqui"
```

Rode as migrations e suba o servidor:

```bash
npx prisma migrate dev
npm run dev
```

O backend sobe em `http://localhost:3000`.

Para rodar em modo produção local:
```bash
npm run build
npm run start
```

### Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env` na pasta `frontend`:
```
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

O frontend sobe em `http://localhost:5173`.

## Próximos passos

- [ ] Página de "melhor avaliados" com agregação no backend
- [ ] Autorização por dono também em `Media` (hoje qualquer usuário autenticado pode excluir qualquer mídia)
- [ ] Testes automatizados
