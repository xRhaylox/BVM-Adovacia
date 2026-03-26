const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

async function sendContactEmail({ nome, telefone, demanda }) {
  const to = process.env.to || 'contato@bvmadvocacia.com';
  const from = process.env.from || 'nao-responda@bvmadvocacia.com';

  const mail = {
    from,
    to,
    subject: `Nova demanda de contato - ${nome}`,
    text: `Contato de: ${nome}\nTelefone: ${telefone}\nDemanda: ${demanda}`,
    html: `<h2>Nova demanda de contato</h2><p><strong>Nome:</strong> ${nome}</p><p><strong>Telefone:</strong> ${telefone}</p><p><strong>Demanda:</strong> ${demanda}</p>`
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('E-mail simulado:', mail);
    return { accepted: [to], response: 'simulado' };
  }

  return transport.sendMail(mail);
}

module.exports = { sendContactEmail };