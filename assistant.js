(() => {
  'use strict';

  // --------------------------------------------------
  // 1. CONNEXION AUX DONNEES DE KALLA FINANCE
  // --------------------------------------------------

  const FINANCE_KEY = 'kalla-finance-prototype-app-v1';
  const ALLOCATION_KEY = 'kalla-finance-allocations-prototype-v1';

  const styles = `
    #kalla-ai-button {
      position:fixed;right:18px;bottom:18px;z-index:9998;
      padding:14px 20px;border:0;border-radius:30px;
      background:#d9b66f;color:#0b1020;font-weight:800;
      cursor:pointer;box-shadow:0 5px 24px #0005;
    }
    #kalla-ai-panel {
      position:fixed;right:18px;bottom:82px;z-index:9999;
      width:min(410px,calc(100vw - 24px));
      height:min(620px,calc(100dvh - 105px));
      display:none;flex-direction:column;overflow:hidden;
      background:#101a2d;color:#f4f5f8;
      border:1px solid #34415a;border-radius:18px;
      box-shadow:0 12px 45px #0008;font-family:Arial,sans-serif;
    }
    #kalla-ai-panel.open{display:flex}
    .kai-header {
      display:flex;justify-content:space-between;
      align-items:center;padding:16px;background:#17243b;
      border-bottom:1px solid #34415a;
    }
    .kai-header strong{color:#d9b66f;font-size:18px}
    .kai-header small{display:block;margin-top:5px;color:#aeb9ca}
    #kai-close {
      background:transparent;color:white;border:0;
      font-size:25px;cursor:pointer;
    }
    #kai-messages{flex:1;overflow-y:auto;padding:14px}
    .kai-message {
      white-space:pre-wrap;overflow-wrap:anywhere;
      padding:11px 13px;margin-bottom:12px;
      border-radius:12px;line-height:1.55;font-size:14px;
    }
    .kai-bot{background:#1c2b43;border:1px solid #34415a}
    .kai-user{background:#d9b66f;color:#101a2d;margin-left:28px}
    .kai-suggestions {
      display:flex;gap:7px;flex-wrap:wrap;padding:0 12px 12px;
    }
    .kai-suggestions button {
      padding:8px 10px;border:1px solid #52617a;
      background:#17243b;color:#f4f5f8;
      border-radius:20px;cursor:pointer;font-size:12px;
    }
    .kai-form {
      display:flex;gap:8px;padding:12px;
      border-top:1px solid #34415a;
    }
    #kai-input {
      min-width:0;flex:1;padding:12px;color:white;
      background:#0b1020;border:1px solid #52617a;
      border-radius:10px;font-size:14px;
    }
    #kai-send {
      padding:0 14px;border:0;border-radius:10px;
      background:#d9b66f;color:#101a2d;
      font-weight:bold;cursor:pointer;
    }
    .kai-note {
      padding:0 12px 12px;color:#aeb9ca;
      font-size:11px;line-height:1.4;
    }
  `;

  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);

  // --------------------------------------------------
  // 2. CREATION DE L'INTERFACE KALLA AI
  // --------------------------------------------------

  const button = document.createElement('button');
  button.id = 'kalla-ai-button';
  button.type = 'button';
  button.textContent = 'KALLA AI';

  const panel = document.createElement('section');
  panel.id = 'kalla-ai-panel';
  panel.setAttribute('aria-label', 'Assistant KALLA AI');

  panel.innerHTML = `
    <div class="kai-header">
      <div>
        <strong>KALLA AI</strong>
        <small>Assistant financier intelligent</small>
      </div>
      <button id="kai-close" type="button">×</button>
    </div>

    <div id="kai-messages" aria-live="polite"></div>

    <div class="kai-suggestions">
      <button data-question="Fais le bilan de mes finances">Mon bilan</button>
      <button data-question="Analyse mes budgets">Mes budgets</button>
      <button data-question="Analyse mes investissements">Investissements</button>
      <button data-question="Analyse mes entreprises">Entreprises</button>
      <button data-question="Calcule mes répartitions">Répartitions</button>
    </div>

    <form class="kai-form" id="kai-form">
      <input id="kai-input" maxlength="500"
        autocomplete="off"
        placeholder="Pose une question financière..." required>
      <button id="kai-send" type="submit">Envoyer</button>
    </form>

    <div class="kai-note">
      Les calculs sont effectués à partir des données enregistrées
      sur cet appareil. Cette version n'est pas encore connectée
      à un modèle d'intelligence artificielle externe.
    </div>
  `;

  document.body.append(button, panel);

  const messages = panel.querySelector('#kai-messages');
  const input = panel.querySelector('#kai-input');

  // --------------------------------------------------
  // 3. LECTURE SECURISEE DES DONNEES
  // --------------------------------------------------

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error('Erreur de lecture KALLA:', error);
      return fallback;
    }
  }

  function readFinance() {
    const data = readJSON(FINANCE_KEY, null);

    if (!data || typeof data !== 'object') return null;

    const transactions = Array.isArray(data.transactions)
      ? data.transactions
      : [];

    const investments = Array.isArray(data.investments)
      ? data.investments
      : [];

    const businesses = Array.isArray(data.businesses)
      ? data.businesses
      : [];

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);

    return {
      ...data,
      transactions,
      investments,
      businesses,
      budgets: data.budgets || {},
      categories: data.categories || {},
      main: Array.isArray(data.main) ? data.main : [],
      sub: data.sub || {},
      currency: data.currency || 'FCFA',
      profit: Math.max(0, Number(data.profit) || 0),
      income,
      expenses,
      balance: income - expenses
    };
  }

  function readCustomAllocations() {
    const tables = readJSON(ALLOCATION_KEY, []);
    return Array.isArray(tables) ? tables : [];
  }

  // --------------------------------------------------
  // 4. OUTILS DE CALCUL
  // --------------------------------------------------

  function money(value, currency) {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2
    }).format(Number(value) || 0) + ' ' + currency;
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function total(list, filter) {
    return list.filter(filter).reduce(
      (sum, item) => sum + Math.max(0, Number(item.amount) || 0),
      0
    );
  }

  function currentMonthTransactions(finance) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return finance.transactions.filter(t => {
      if (!t.date) return false;
      const date = new Date(t.date + 'T12:00:00');
      return date.getMonth() === month &&
        date.getFullYear() === year;
    });
  }

  // --------------------------------------------------
  // 5. ANALYSE DES REVENUS ET DEPENSES
  // --------------------------------------------------

  function transactionAnalysis(finance) {
    const month = currentMonthTransactions(finance);

    const monthIncome = total(month, t => t.type === 'income');
    const monthExpenses = total(month, t => t.type === 'expense');

    const categories = {};

    finance.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const name = t.category || 'Sans catégorie';
        categories[name] = (categories[name] || 0) +
          (Number(t.amount) || 0);
      });

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      monthIncome,
      monthExpenses,
      topCategories
    };
  }

  // --------------------------------------------------
  // 6. ANALYSE DES BUDGETS
  // --------------------------------------------------

  function budgetAnalysis(finance) {
    const month = currentMonthTransactions(finance);
    const expenses = month.filter(t => t.type === 'expense');

    const spent = {};

    expenses.forEach(t => {
      const category = t.category || 'Sans catégorie';
      spent[category] = (spent[category] || 0) +
        (Number(t.amount) || 0);
    });

    return Object.entries(finance.budgets).map(([category, limit]) => {
      const budget = Math.max(0, Number(limit) || 0);
      const actual = spent[category] || 0;

      return {
        category,
        budget,
        spent: actual,
        remaining: budget - actual,
        exceeded: actual > budget
      };
    });
  }

  // --------------------------------------------------
  // 7. ANALYSE DES INVESTISSEMENTS
  // --------------------------------------------------

  function investmentAnalysis(finance) {
    const list = finance.investments;

    const invested = list.reduce(
      (sum, item) => sum + Math.max(0, Number(item.amount) || 0),
      0
    );

    const statuses = {};

    list.forEach(item => {
      const status = item.status || 'Non précisé';
      statuses[status] = (statuses[status] || 0) + 1;
    });

    return { invested, count: list.length, statuses };
  }

  // --------------------------------------------------
  // 8. ANALYSE DES ENTREPRISES
  // --------------------------------------------------

  function businessAnalysis(finance) {
    const list = finance.businesses;

    const capital = list.reduce(
      (sum, item) => sum + Math.max(0, Number(item.capital) || 0),
      0
    );

    const statuses = {};

    list.forEach(item => {
      const status = item.status || 'Non précisé';
      statuses[status] = (statuses[status] || 0) + 1;
    });

    return { capital, count: list.length, statuses };
  }

  // --------------------------------------------------
  // 9. ANALYSE DES REPARTITIONS
  // --------------------------------------------------

  function allocationAnalysis(finance) {
    const lines = finance.main.map(item => {
      const pct = Number(item.pct) || 0;

      return {
        name: item.name || 'Catégorie',
        pct,
        amount: finance.profit * pct / 100
      };
    });

    const percentage = lines.reduce((sum, item) => sum + item.pct, 0);

    return { lines, percentage };
  }

  function customAllocationAnalysis(finance) {
    const tables = readCustomAllocations();

    return tables.map(table => {
      const amount = Math.max(0, Number(table.amount) || 0);
      const categories = Array.isArray(table.categories)
        ? table.categories
        : [];

      const percentage = categories.reduce(
        (sum, item) => sum + (Number(item.pct) || 0), 0
      );

      return {
        title: table.title || 'Répartition',
        amount,
        percentage,
        categories: categories.map(item => ({
          name: item.name || 'Catégorie',
          pct: Number(item.pct) || 0,
          amount: amount * (Number(item.pct) || 0) / 100
        }))
      };
    });
  }

  // --------------------------------------------------
  // 10. CONSTRUCTION DU BILAN GENERAL
  // --------------------------------------------------

  function generalReport(finance) {
    const activity = transactionAnalysis(finance);
    const investments = investmentAnalysis(finance);
    const businesses = businessAnalysis(finance);

    return [
      'BILAN GENERAL DE KALLA FINANCE',
      '',
      'REVENUS : ' + money(finance.income, finance.currency),
      'DEPENSES : ' + money(finance.expenses, finance.currency),
      'SOLDE CALCULE : ' + money(finance.balance, finance.currency),
      '',
      'CE MOIS-CI',
      'Revenus : ' + money(activity.monthIncome, finance.currency),
      'Dépenses : ' + money(activity.monthExpenses, finance.currency),
      '',
      'INVESTISSEMENTS',
      'Nombre : ' + investments.count,
      'Capital suivi : ' + money(investments.invested, finance.currency),
      '',
      'ENTREPRISES ET PROJETS',
      'Nombre : ' + businesses.count,
      'Capital engagé suivi : ' + money(businesses.capital, finance.currency),
      '',
      'Bénéfice distribuable configuré : ' +
        money(finance.profit, finance.currency),
      '',
      'Le solde calculé ne représente pas nécessairement le solde bancaire réel.'
    ].join('\n');
  }

  // --------------------------------------------------
  // 11. REPONSES DE KALLA AI
  // --------------------------------------------------

  function answer(question) {
    const finance = readFinance();

    if (!finance) {
      return 'Je ne trouve pas les données de KALLA Finance. Vérifie que tu as ouvert le bon prototype et enregistré des opérations.';
    }

    const q = normalize(question);
    const currency = finance.currency;

    if (
      q.includes('bilan') ||
      q.includes('situation generale') ||
      q.includes('resume') ||
      q.includes('finances')
    ) {
      return generalReport(finance);
    }

    if (
      q.includes('budget') ||
      q.includes('depassement')
    ) {
      const budgets = budgetAnalysis(finance);

      if (!budgets.length) {
        return 'Aucun budget n’est encore configuré. Ajoute des limites dans la section Budget.';
      }

      const lines = budgets.map(item =>
        item.category + ' : ' +
        money(item.spent, currency) + ' dépensés sur ' +
        money(item.budget, currency) +
        (item.exceeded ? ' — DEPASSEMENT de ' +
          money(Math.abs(item.remaining), currency)
          : ' — Reste ' + money(item.remaining, currency))
      );

      return 'ANALYSE DES BUDGETS DU MOIS\n\n' + lines.join('\n');
    }

    if (
      q.includes('investissement') ||
      q.includes('investissements') ||
      q.includes('portefeuille')
    ) {
      const data = investmentAnalysis(finance);

      return [
        'ANALYSE DES INVESTISSEMENTS',
        '',
        'Nombre de projets : ' + data.count,
        'Montant total suivi : ' + money(data.invested, currency),
        '',
        ...Object.entries(data.statuses).map(
          ([status, count]) => status + ' : ' + count
        ),
        '',
        'Les montants représentent les sommes saisies, pas un rendement vérifié.'
      ].join('\n');
    }

    if (
      q.includes('entreprise') ||
      q.includes('business') ||
      q.includes('activite') ||
      q.includes('capital engage')
    ) {
      const data = businessAnalysis(finance);

      return [
        'ANALYSE DES ENTREPRISES',
        '',
        'Activités suivies : ' + data.count,
        'Capital engagé : ' + money(data.capital, currency),
        '',
        ...Object.entries(data.statuses).map(
          ([status, count]) => status + ' : ' + count
        ),
        '',
        'Les bénéfices des entreprises ne sont pas calculés si tu ne les as pas enregistrés.'
      ].join('\n');
    }

    if (
      q.includes('repartition') ||
      q.includes('benefice') ||
      q.includes('distribution') ||
      q.includes('dime')
    ) {
      const data = allocationAnalysis(finance);

      if (!data.lines.length) {
        return 'Aucune enveloppe principale n’est configurée.';
      }

      const lines = data.lines.map(item =>
        item.name + ' (' + item.pct + '%) : ' +
        money(item.amount, currency)
      );

      lines.push('');
      lines.push('Total des pourcentages : ' + data.percentage + '%');

      if (Math.abs(data.percentage - 100) > 0.001) {
        lines.push('Attention : la répartition ne totalise pas 100 %.');
      }

      return 'REPARTITION DU BENEFICE\n\n' + lines.join('\n');
    }

    if (
      q.includes('tableau personnalise') ||
      q.includes('tableaux') ||
      q.includes('mes repartitions')
    ) {
      const tables = customAllocationAnalysis(finance);

      if (!tables.length) {
        return 'Aucun tableau personnalisé n’a été créé.';
      }

      return tables.map(table => [
        table.title,
        'Montant : ' + money(table.amount, currency),
        'Total : ' + table.percentage + '%',
        ...table.categories.map(item =>
          item.name + ' : ' + item.pct + '% — ' +
          money(item.amount, currency)
        )
      ].join('\n')).join('\n\n');
    }

    if (
      q.includes('depense') ||
      q.includes('depenses') ||
      q.includes('charges')
    ) {
      const activity = transactionAnalysis(finance);

      const categories = activity.topCategories.map(
        ([name, amount]) => name + ' : ' + money(amount, currency)
      );

      return [
        'ANALYSE DES DEPENSES',
        '',
        'Total enregistré : ' + money(finance.expenses, currency),
        'Dépenses du mois : ' + money(activity.monthExpenses, currency),
        '',
        'Principales catégories :',
        ...(categories.length ? categories : ['Aucune dépense enregistrée.'])
      ].join('\n');
    }

    if (
      q.includes('revenu') ||
      q.includes('recette') ||
      q.includes('gagne') ||
      q.includes('gagner')
    ) {
      const activity = transactionAnalysis(finance);

      return [
        'ANALYSE DES REVENUS',
        '',
        'Total enregistré : ' + money(finance.income, currency),
        'Revenus du mois : ' + money(activity.monthIncome, currency),
        '',
        'Ces montants correspondent aux opérations saisies dans le logiciel.'
      ].join('\n');
    }

    if (
      q.includes('tresorerie') ||
      q.includes('solde') ||
      q.includes('disponible')
    ) {
      return [
        'ANALYSE DE TRESORERIE',
        '',
        'Revenus enregistrés : ' + money(finance.income, currency),
        'Dépenses enregistrées : ' + money(finance.expenses, currency),
        'Solde calculé : ' + money(finance.balance, currency),
        '',
        'Ce calcul ne prend pas automatiquement en compte les dettes, créances, factures non saisies ou soldes bancaires.'
      ].join('\n');
    }

    if (
      q.includes('operation') ||
      q.includes('historique') ||
      q.includes('combien')
    ) {
      return [
        'HISTORIQUE DES OPERATIONS',
        '',
        'Nombre d’opérations : ' + finance.transactions.length,
        'Revenus : ' + money(finance.income, currency),
        'Dépenses : ' + money(finance.expenses, currency),
        'Solde : ' + money(finance.balance, currency)
      ].join('\n');
    }

    return [
      'Je peux analyser les différentes sections de KALLA Finance.',
      '',
      'Tu peux me demander :',
      '- Fais le bilan de mes finances.',
      '- Analyse mes budgets.',
      '- Analyse mes investissements.',
      '- Analyse mes entreprises.',
      '- Calcule mes répartitions.',
      '- Analyse mes dépenses.',
      '- Analyse ma trésorerie.'
    ].join('\n');
  }

  // --------------------------------------------------
  // 12. AFFICHAGE DES MESSAGES
  // --------------------------------------------------

  function say(text, role = 'bot') {
    const message = document.createElement('div');
    message.className = 'kai-message kai-' + role;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function send(question) {
    const text = String(question || '').trim();

    if (!text) return;

    say(text, 'user');
    say(answer(text), 'bot');
  }

  // --------------------------------------------------
  // 13. EVENEMENTS ET INTERACTIONS
  // --------------------------------------------------

  button.addEventListener('click', () => {
    panel.classList.toggle('open');

    if (panel.classList.contains('open') &&
        !messages.childElementCount) {
      say(
        'Bienvenue dans KALLA AI. Je peux analyser les données enregistrées dans ton logiciel. Que souhaites-tu examiner ?'
      );
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
    btn.addEventListener('click', () => {
      send(btn.dataset.question);
    });
  });

})();
