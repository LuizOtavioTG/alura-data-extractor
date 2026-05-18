# Alura Data Extractor

Repositório para extrair dados de cursos concluídos na Alura e gerar um arquivo JSON local para uso em outros projetos, como portfólios, sites pessoais ou aplicações frontend.

## Como funciona

O script `scripts/update-alura-courses.mjs` busca os dados da API informada no `.env`, filtra os cursos concluídos e gera o arquivo:

```text
src/assets/data/alura-courses.json
```

Cada curso gerado inclui dados básicos como nome, slug, progresso, link do curso e link do certificado.

## Requisitos

- Node.js 18 ou superior
- Uma URL válida da API da Alura com os dados do usuário
- O nome de usuário da Alura para montar os links dos certificados

## Configuração

Crie um arquivo `.env` na raiz do projeto com:

```env
ALURA_API_URL=https://cursos.alura.com.br/api/dashboard/YOUR_USER
ALURA_USERNAME=YOUR_USER
```

Substitua `YOUR_USER` pelo seu usuário da Alura.

O arquivo `.env` está no `.gitignore`, então ele não será versionado.

## Como atualizar os cursos

Execute:

```bash
npm run update:alura
```

Isso atualiza o arquivo `src/assets/data/alura-courses.json`.

## Arquivos gerados

O arquivo `src/assets/data/alura-courses.json` também está no `.gitignore`, porque é gerado automaticamente a partir da API.

Formato esperado:

```json
{
  "updatedAt": "2026-05-17T22:02:29.800Z",
  "platform": "Alura",
  "totalCourses": 1,
  "courses": [
    {
      "id": 12345,
      "name": "Nome do curso",
      "slug": "slug-do-curso",
      "progress": 100,
      "finished": true,
      "platform": "Alura",
      "courseUrl": "https://www.alura.com.br/curso-online-slug-do-curso",
      "certificateUrl": "https://cursos.alura.com.br/user/YOUR_USER/course/slug-do-curso/certificate"
    }
  ]
}
```

## Scripts

```bash
npm run update:alura
```

Busca os dados da Alura e gera o JSON local.
