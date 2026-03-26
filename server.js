require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { initDb } = require('./db');
const contactRoute = require('./routes/contact');

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Segurança HTTP
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(cookieParser());

// Rate limiting alto
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, message: { error: 'Muitas tentativas. Aguarde 15 minutos.' }, standardHeaders: true, legacyHeaders: false });
app.use(globalLimiter);

// CSRF via cookies
const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' } });
app.use(csrfProtection);

app.get('/api/csrf', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/contact', contactLimiter, contactRoute);

// Servir frontend estático
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Erro de CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Requisição CSRF inválida.' });
  }
  next(err);
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}.`);
  });
}).catch((err) => {
  console.error('Falha ao inicializar o banco:', err);
  process.exit(1);
});
