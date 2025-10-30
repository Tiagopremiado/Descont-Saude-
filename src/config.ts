// src/config.ts

// IMPORTANTE:
// Para a funcionalidade de "Salvar no Google Drive" funcionar, você precisa criar
// um projeto no Google Cloud, ativar a API do Google Drive e gerar credenciais.
//
// 1. Acesse https://console.cloud.google.com/
// 2. Crie um novo projeto (ou use um existente).
// 3. Vá para "APIs e Serviços" > "Biblioteca" e ative a "Google Drive API".
// 4. Vá para "APIs e Serviços" > "Credenciais":
//    a. Crie uma "Chave de API" e cole o valor abaixo em GOOGLE_API_KEY.
//    b. Crie um "ID do cliente OAuth 2.0" do tipo "Aplicativo da Web".
//       - Em "Origens JavaScript autorizadas", adicione os URLs onde seu app será executado.
//         Exemplos:
//         - Para desenvolvimento local: http://localhost:5173
//         - Para produção (exemplo Vercel): https://seu-app.vercel.app
//       - Cole o "ID do cliente" gerado abaixo em GOOGLE_CLIENT_ID.
//
// **NÃO COMPARTILHE ESTAS CHAVES PUBLICAMENTE SE O PROJETO FOR PRIVADO.**

export const GOOGLE_API_KEY = 'SUA_CHAVE_DE_API_DO_GOOGLE_AQUI';
export const GOOGLE_CLIENT_ID = 'SEU_ID_DE_CLIENTE_OAUTH_2.0_AQUI.apps.googleusercontent.com';

// O escopo define que a aplicação só poderá criar arquivos que ela mesma gerou.
// Isso aumenta a segurança, pois o app não poderá ver ou modificar outros arquivos no seu Drive.
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
