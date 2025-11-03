// FIX: Manually defining the ImportMeta interface to provide types for Vite environment variables.
// This is a workaround for when the triple-slash directive `/// <reference types="vite/client" />` is not resolved correctly,
// and it fixes errors related to `import.meta.env`.
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly VITE_GOOGLE_API_KEY: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
  }
}

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

if (!import.meta.env.VITE_GOOGLE_API_KEY || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  throw new Error(
    "ERRO: As credenciais da API do Google não foram encontradas. " +
    "Por favor, crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes linhas:\n\n" +
    "VITE_GOOGLE_API_KEY=SUA_CHAVE_DE_API_AQUI\n" +
    "VITE_GOOGLE_CLIENT_ID=SEU_ID_DE_CLIENTE_AQUI\n\n" +
    "Você pode obter essas credenciais no Google Cloud Console. Após adicionar o arquivo, reinicie o servidor de desenvolvimento."
  );
}

export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


// O escopo define que a aplicação só poderá criar arquivos que ela mesma gerou.
// Isso aumenta a segurança, pois o app não poderá ver ou modificar outros arquivos no seu Drive.
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';