const express = require('express');
const validator = require('validator');
const crypto = require('crypto');
const { sendContactEmail } = require('../mailer');
const { ContactLog } = require('../db');

const router = express.Router();

/**
 * Rota de contato com validação forte e sanitização.
 */
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, demanda } = req.body;

    if (!nome || !telefone || !demanda) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const cleanNome = validator.trim(String(nome));
    const cleanTelefone = validator.trim(String(telefone));
    const cleanDemanda = validator.trim(String(demanda));

    if (!validator.isLength(cleanNome, { min: 2, max: 100 })) {
      return res.status(400).json({ error: 'Nome precisa ter entre 2 e 100 caracteres.' });
    }
    if (!/^[0-9]{11}$/.test(cleanTelefone)) {
      return res.status(400).json({ error: 'Telefone deve ser 11 dígitos.' });
    }
    if (!validator.isLength(cleanDemanda, { min: 10, max: 500 })) {
      return res.status(400).json({ error: 'Demanda precisa ter entre 10 e 500 caracteres.' });
    }

    const safeNome = validator.escape(cleanNome);
    const safeTelefone = validator.escape(cleanTelefone);
    const safeDemanda = validator.escape(cleanDemanda);

    // Log mínimo não sensível (hashes + meta) para atender uso de banco
    const fingerprint = crypto.createHash('sha256').update(safeNome + safeTelefone).digest('hex');
    await ContactLog.create({
      event: 'contact_form_submission',
      fingerprint,
      ip: req.ip || null,
      userAgent: req.get('User-Agent') || null
    });

    // Envia email para o escritório
    await sendContactEmail({ nome: safeNome, telefone: safeTelefone, demanda: safeDemanda });

    res.json({ success: true, message: 'Contato enviado com sucesso.' });
  } catch (err) {
    console.error('[contact] ', err);
    res.status(500).json({ error: 'Erro interno. Tente novamente mais tarde.' });
  }
});

module.exports = router;
