# Review App

Aplicação completa de reviews de livros, jogos e filmes. Usuários criam conta, cadastram mídias e deixam avaliações com nota e comentário.

## Stack

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT (autenticação) + bcrypt (hash de senha)

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

## Funcionalidades

- Cadastro e login de usuário (autenticação via JWT)
- Rotas protegidas (só usuário autenticado cria review)
- Autorização por dono (só quem criou uma review pode editar/deletar ela)
- CRUD completo de reviews (criar, listar, editar, deletar)
- Cadastro e listagem de mídias (livros, jogos, filmes), com suporte a novos tipos via enum
- Página de detalhes de cada mídia, com lista de reviews e formulário para nova avaliação

## Modelagem do banco

Três entidades principais:

- **User** — usuários da aplicação
- **Media** — livros, jogos e filmes, com um campo `type` (enum) que permite adicionar novos tipos de mídia sem alterar o schema
- **Review** — conecta `User` e `Media`, com nota, comentário e as respectivas foreign keys

## Rotas da API
 
| Método | Rota             | Descrição                            | Protegida |
|--------|------------------|---------------------------------------|-----------|
| POST   | /users/register  | Cria um novo usuário                  | Não       |
| POST   | /users/login     | Autentica e retorna um token JWT      | Não       |
| GET    | /media           | Lista todas as mídias                 | Não       |
| GET    | /media/:id       | Detalhes de uma mídia + suas reviews  | Não       |
| POST   | /media           | Cria uma nova mídia                   | Sim       |
| GET    | /reviews         | Lista todas as reviews                | Não       |
| POST   | /reviews         | Cria uma review                       | Sim       |
| PUT    | /reviews/:id     | Edita uma review (só o dono)          | Sim       |
| DELETE | /reviews/:id     | Deleta uma review (só o dono)         | Sim       |


## Próximos passos
- [ ] Refinar o visual com shadcn/ui
- [ ] Deploy (backend e frontend)

