import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Verifica se a configuração de email está completa
const isEmailConfigured = (): boolean => {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== 'your-resend-api-key'
  );
};

// Função para enviar email usando Resend
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!isEmailConfigured()) {
    const error = new Error(
      'Email não configurado. Configure RESEND_API_KEY no arquivo .env.'
    );
    console.error('[EMAIL]', error.message);
    throw error;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('[EMAIL] Email enviado com sucesso:', data);
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email. Verifique sua API Key do Resend.');
  }
};

// Template de email para recuperação de senha
export const createPasswordResetEmail = (token: string, email: string): string => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1a1a1a;
          margin: 0;
          font-size: 24px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #000;
          color: #fff;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #333;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 30px;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Charpynter Hair</h1>
        </div>
        <div class="content">
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p>Para redefinir sua senha, clique no botão abaixo:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </p>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
          <div class="warning">
            <strong>Importante:</strong> Este link expirará em 1 hora. Se você não solicitou a redefinição de senha, ignore este email.
          </div>
        </div>
        <div class="footer">
          <p>Este email foi enviado para ${email}</p>
          <p>&​copy; 2024 Charpynter Hair. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template de email para confirmação de conta
export const createAccountConfirmationEmail = (token: string, email: string, nome: string): string => {
  const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/confirm-email?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de Conta</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1a1a1a;
          margin: 0;
          font-size: 24px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #000;
          color: #fff;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #333;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 30px;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Charpynter Hair</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Bem-vindo ao Charpynter Hair! Para ativar sua conta, precisamos confirmar seu email.</p>
          <p>Por favor, clique no botão abaixo para confirmar sua conta:</p>
          <p style="text-align: center;">
            <a href="${confirmUrl}" class="button">Confirmar Conta</a>
          </p>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #0066cc;">${confirmUrl}</p>
          <div class="warning">
            <strong>Importante:</strong> Este link expirará em 24 horas. Se você não criou esta conta, ignore este email.
          </div>
        </div>
        <div class="footer">
          <p>Este email foi enviado para ${email}</p>
          <p>&​copy; 2024 Charpynter Hair. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};