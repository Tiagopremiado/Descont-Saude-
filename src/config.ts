// FIX: The triple-slash directive below includes Vite's client types. This is necessary for TypeScript to recognize `import.meta.env` and resolves the "'env' does not exist on type 'ImportMeta'" error.
/// <reference types="vite/client" />

// IMPORTANTE:
// As variáveis de ambiente para a API do Google (VITE_GOOGLE_API_KEY e VITE_GOOGLE_CLIENT_ID)
// são carregadas a partir do ambiente de execução.
//
// Em produção (Vercel):
// - As variáveis devem ser configuradas no painel do projeto Vercel.
// - Certifique-se de que os nomes são VITE_GOOGLE_API_KEY e VITE_GOOGLE_CLIENT_ID.
// - Após configurar, faça um "Redeploy" para que as variáveis sejam aplicadas no build.
//
// Para desenvolvimento local:
// - Crie um arquivo chamado `.env.local` na raiz do projeto.
// - Adicione as seguintes linhas, substituindo pelos seus valores:
//   VITE_GOOGLE_API_KEY=SUA_CHAVE_DE_API
//   VITE_GOOGLE_CLIENT_ID=SEU_ID_DE_CLIENTE.apps.googleusercontent.com
//
// O prefixo `VITE_` é necessário para que o Vite exponha essas variáveis para o código do frontend.

export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


// O escopo define que a aplicação só poderá criar arquivos que ela mesma gerou.
// Isso aumenta a segurança, pois o app não poderá ver ou modificar outros arquivos no seu Drive.
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
