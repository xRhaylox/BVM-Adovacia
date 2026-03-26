document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  fetchCsrf();

  const form = document.getElementById('contatoForm');
  const message = document.getElementById('formMessage');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const demanda = document.getElementById('demanda').value.trim();
    const _csrf = document.getElementById('csrfToken').value;

    if (!nome || nome.length < 2 || nome.length > 100) {
      message.textContent = 'Nome inválido. Informe entre 2 e 100 caracteres.';
      return;
    }
    if (!/^\d{11}$/.test(telefone)) {
      message.textContent = 'Telefone deve ter exatamente 11 dígitos numéricos.';
      return;
    }
    if (!demanda || demanda.length < 10 || demanda.length > 500) {
      message.textContent = 'Demanda inválida. Informe entre 10 e 500 caracteres.';
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, demanda, _csrf }),
      });

      const data = await response.json();
      if (!response.ok) {
        message.textContent = data.error || 'Erro ao enviar. Tente novamente.';
        return;
      }
      message.textContent = 'Mensagem enviada com sucesso! Abrindo WhatsApp...';

      const encoded = encodeURIComponent(`Olá, sou ${nome}, demanda: ${demanda}`);
      window.open(`https://wa.me/5596984079393?text=${encoded}`, '_blank');
      form.reset();
      fetchCsrf();
    } catch (err) {
      console.error(err);
      message.textContent = 'Erro de rede ao enviar a solicitação.';
    }
  });
});

async function fetchCsrf() {
  try {
    const res = await fetch('/api/csrf', { credentials: 'include' });
    const data = await res.json();
    if (data && data.csrfToken) {
      document.getElementById('csrfToken').value = data.csrfToken;
    }
  } catch (err) {
    console.warn('Não foi possível obter CSRF token.', err);
  }
}
