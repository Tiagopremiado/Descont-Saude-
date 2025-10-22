# Descont'Saúde PWA

Este é um sistema PWA (Progressive Web App) para a Descont'Saúde, projetado para gerenciar clientes, dependentes e pagamentos, além de fornecer um portal dedicado para os clientes.

## Tecnologias Utilizadas

-   React
-   TypeScript
-   Vite
-   Tailwind CSS

## Como Executar o Projeto

### Pré-requisitos

-   Node.js (versão 18 ou superior)
-   npm, yarn ou pnpm

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DA_PASTA>
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

### Rodando em Desenvolvimento

Para iniciar o servidor de desenvolvimento, execute:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

## Build para Produção

Para criar a versão de produção do aplicativo, execute:

```bash
npm run build
```

Os arquivos otimizados serão gerados no diretório `dist/`.

## Deploy na Vercel

1.  Faça o push do seu código para um repositório no GitHub.
2.  Acesse sua conta na [Vercel](https://vercel.com).
3.  Clique em "Add New..." -> "Project".
4.  Importe o repositório do GitHub.
5.  A Vercel deve detectar automaticamente que é um projeto Vite e configurar os comandos de build e o diretório de saída corretamente.
6.  Adicione as variáveis de ambiente necessárias (como `API_KEY`) nas configurações do projeto na Vercel.
7.  Clique em "Deploy".
