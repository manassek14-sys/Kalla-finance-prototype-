(() => {
  'use strict';
  const FINANCE_KEY = 'kalla-finance-complete-v1';
  const styles = `
    #kalla-ai-button {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 9998;
      padding: 14px 20px;
      border: 0;
      border-radius: 30px;
      background: #d9b66f;
      color: #0b1020;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 5px 24px #0005;
    }
    #kalla-ai-panel {
      position: fixed;
      right: 18px;
      bottom: 82px;
      z-index: 9999;
      width: min(390px, calc(100vw - 36px));
      height: min(570px, calc(100dvh - 115px));
      display: none;
      flex-direction: column;
      overflow: hidden;
      background: #101a2d;
      color: #f4f5f8;
      border: 1px solid #34415a;
      border-radius: 18px;
      box-shadow: 0 12px 45px #0008;
      font-family: Arial, sans-serif;
    }
    #kalla-ai-panel.open {
      display: flex;
    }
    .kai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #17243b;
      border-bottom: 1px solid #34415a;
    }
    .kai-header strong {
      color: #d9b66f;
      font-size: 17px;
    }
    .kai-header small {
      display: block;
      margin-top: 5px;
      color: #aeb9ca;
    }
    #kai-close {
      background: transparent;
      color: white;
      border: 0;
      font-size: 25px;
      cursor: pointer;
    }
    #kai-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
    }
    .kai-message {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      padding: 11px 13px;
      margin-bottom: 12px;
      border-radius: 12px;
      line-height: 1.5;
      font-size: 14px;
    }
    .kai-bot {
      background: #1c2b43;
      border: 1px solid #34415a;
    }
    .kai-user {
      background: #d9b66f;
      color: #101a2d;
      margin-left: 28px;
    }
    .kai-suggestions {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      padding: 0 12px 12px;
    }
    .kai-suggestions button {
      padding: 8px 10px;
      border: 1px solid #52617a;
      background: #17243b;
      color: #f4f5f8;
      border-radius: 20px;
      cursor: pointer;
      font-size: 12px;
    }
    .kai-form {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #34415a;
    }
    #kai-input {
      min-width: 0;
      flex: 1;
      padding: 12px;
      color: white;
      background: #0b1020;
      border: 1px solid #52617a;
      border-radius: 10px;
      font-size: 14px;
    }
    #kai-send {
      padding: 0 14px;
      border: 0;
      border-radius: 10px;
      background: #d9b66f;
      color: #101a2d;
      font-weight: bold;
      cursor: pointer;
    }
    .kai-note {
      padding: 0 12px 12px;
      color: #aeb9ca;
      font-size: 11px;
      line-height: 1.4;
    }
  `;
  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);
  const button = document.createElement('button');
  button.id = 'kalla-ai-button';
  button.type = 'button';
  button.textContent = 'KALLA AI';
  const panel = document.createElement('section');
  panel.id = 'kalla-ai-panel';
  panel.setAttribute('aria-label', 'Assistant financier KALLA AI');
  panel.innerHTML = `
    <div class="kai-header">
      <div>
        <strong>KALLA AI</strong>
        <small>Assistant financier</small>
      </div>
      <button id="kai-close" type="button" aria-label="Fermer">×</button>
    </div>
    <div id="kai-messages" aria-live="polite"></div>
    <div class="kai-suggestions">
      <button type="button" data-question="Fais le bilan de mes finances">Mon bilan</button>
      <button type="button" data-question="Combien ai-je dépensé ?">Mes dépenses</button>
      <button type="button" data-question="Analyse ma trésorerie">Ma trésorerie</button>
    </div>
    <form class="kai-form" id="kai-form">
      <input id="kai-input" maxlength="500" autocomplete="off"
        placeholder="Pose une question financière..." required>
      <button id="kai-send" type="submit">Envoyer</button>
    </form>
    <div class="kai-note">
      Assistant de démonstration : les réponses sont calculées localement.
      Vérifie les chiffres avant toute décision financière.
    </div>
  `;
  document.body.append(button, panel);
  const messages = panel.querySelector('#kai-messages');
  const input = panel.querySelector('#kai-input');
  function say(text, role = 'bot') {
    const message = document.createElement('div');
    message.className = 'kai-message kai-' + role;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }
  function readFinance() {
    try {
      const raw = localStorage.getItem(FINANCE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return null;
      const transactions = Array.isArray(data.transactions)
        ? data.transactions
        : [];
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + Math.max(0, Number(t.amount) || 0), 0);
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + Math.max(0, Number(t.amount) || 0), 0);
      return {
        currency: data.currency || 'FCFA',
        income,
        expenses,
        balance: income - expenses,
        profit: Math.max(0, Number(data.profit) || 0),
        transactions
      };
    } catch (error) {
      return null;
    }
  }
  function formatMoney(value, currency) {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2
    }).format(value) + ' ' + currency;
  }
  function answer(question) {
    const finance = readFinance();
    if (!finance) {
      return 'Je ne trouve pas encore les données financières de KALLA Finance. Enregistre une opération dans le logiciel, puis réessaie.';
    }
    const q = question.toLowerCase();
    if (
      q.includes('bilan') ||
      q.includes('situation') ||
      q.includes('résumé')
    ) {
      return [
        'BILAN FINANCIER',
        '',
        'Revenus enregistrés : ' + formatMoney(finance.income, finance.currency),
        'Dépenses enregistrées : ' + formatMoney(finance.expenses, finance.currency),
        'Solde calculé : ' + formatMoney(finance.balance, finance.currency),
        'Bénéfice de référence configuré : ' + formatMoney(finance.profit, finance.currency),
        '',
        'Le solde correspond aux revenus moins les dépenses enregistrés dans le logiciel. Il ne représente pas nécessairement le solde bancaire réel.'
      ].join('\n');
    }
    if (
      q.includes('dépense') ||
      q.includes('dépensé') ||
      q.includes('charges')
    ) {
      return 'Tes dépenses enregistrées totalisent ' +
        formatMoney(finance.expenses, finance.currency) +
        '.\n\nCompare ce montant à ton budget pour savoir si tu respectes tes limites.';
    }
    if (
      q.includes('revenu') ||
      q.includes('recette') ||
      q.includes('gagné')
    ) {
      return 'Tes revenus enregistrés totalisent ' +
        formatMoney(finance.income, finance.currency) +
        '.\n\nCe montant correspond uniquement aux opérations saisies dans KALLA Finance.';
    }
    if (
      q.includes('trésorerie') ||
      q.includes('tresorerie') ||
      q.includes('solde') ||
      q.includes('disponible')
    ) {
      return 'Le solde calculé à partir de tes opérations est de ' +
        formatMoney(finance.balance, finance.currency) +
        '.\n\nAttention : ce chiffre ne tient pas automatiquement compte des dettes, factures à payer, fonds bloqués ou soldes bancaires non enregistrés.';
    }
    if (
      q.includes('répartition') ||
      q.includes('repartition') ||
      q.includes('bénéfice') ||
      q.includes('benefice')
    ) {
      const allocations = Array.isArray(
        JSON.parse(localStorage.getItem(FINANCE_KEY) || '{}').main
      )
        ? JSON.parse(localStorage.getItem(FINANCE_KEY)).main
        : [];
      if (!allocations.length) {
        return 'Aucune répartition personnalisée n’a été trouvée. Consulte la section Personnalisation.';
      }
      const total = allocations.reduce(
        (sum, item) => sum + (Number(item.pct) || 0),
        0
      );
      const lines = allocations.map(item => {
        const amount = finance.profit * (Number(item.pct) || 0) / 100;
        return item.name + ' (' + item.pct + '%) : ' +
          formatMoney(amount, finance.currency);
      });
      lines.unshift('RÉPARTITION DU BÉNÉFICE CONFIGURÉ');
      lines.push('');
      lines.push('Total des pourcentages : ' + total + '%');
      if (Math.abs(total - 100) > 0.001) {
        lines.push('Attention : la répartition ne totalise pas 100 %.');
      }
      return lines.join('\n');
    }
    if (
      q.includes('opération') ||
      q.includes('operation') ||
      q.includes('combien')
    ) {
      return 'Tu as enregistré ' + finance.transactions.length +
        ' opération(s).\n\nRevenus : ' +
        formatMoney(finance.income, finance.currency) +
        '\nDépenses : ' +
        formatMoney(finance.expenses, finance.currency) +
        '\nSolde calculé : ' +
        formatMoney(finance.balance, finance.currency);
    }
    return 'Je peux actuellement t’aider à consulter tes revenus, tes dépenses, ton solde calculé et tes répartitions.\n\nEssaie par exemple : « Fais le bilan de mes finances » ou « Calcule ma répartition des bénéfices ».';
  }
  function send(question) {
    const text = question.trim();
    if (!text) return;
    say(text, 'user');
    say(answer(text), 'bot');
  }
  button.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !messages.childElementCount) {
      say('Bonjour. Je suis KALLA AI. Je peux consulter les opérations enregistrées et t’aider à comprendre tes chiffres. Que souhaites-tu analyser ?');
    }
    if (panel.classList.contains('open')) input.focus();
  });
  panel.querySelector('#kai-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });
  panel.querySelector('#kai-form').addEventListener('submit', event => {
    event.preventDefault();
    send(input.value);
    input.value = '';
  });
  panel.querySelectorAll('[data-question]').forEach(btn => {
    btn.addEventListener('click', () => send(btn.dataset.question));
  });
})();