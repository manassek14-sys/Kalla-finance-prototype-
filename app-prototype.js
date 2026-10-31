"use strict";

/* =========================================================
   KALLA FINANCE — PROTOTYPE INDÉPENDANT
   Stockage séparé de l'application principale
========================================================= */

const STORAGE_KEY = "kalla-finance-prototype-v1";

const DEFAULT_STATE = {
  version: 1,
  currency: "FCFA",
  profit: 1000000,

  tables: {
    main: {
      name: "Répartition des bénéfices",
      baseType: "profit",
      rows: [
        { id: "tithe", name: "Dîme", percentage: 10 },
        { id: "salary", name: "Salaire personnel", percentage: 25 },
        { id: "treasury", name: "Trésorerie", percentage: 25 },
        { id: "investment", name: "Investissement massif", percentage: 40 }
      ]
    },

    budget: {
      name: "Budget personnel",
      baseType: "salary",
      linkedTo: "salary",
      rows: [
        { id: "living", name: "Vie courante", percentage: 30 },
        { id: "housing", name: "Logement", percentage: 18 },
        { id: "car", name: "Voiture et transport", percentage: 8 },
        { id: "wedding", name: "Mariage", percentage: 8 },
        { id: "house", name: "Maison à long terme", percentage: 12 },
        { id: "family", name: "Famille et imprévus", percentage: 7 },
        { id: "security", name: "Épargne sécurité", percentage: 5 },
        { id: "leisure", name: "Détente et loisirs", percentage: 0 },
        { id: "children", name: "Enfants", percentage: 5 },
        { id: "health", name: "Santé", percentage: 7 }
      ]
    },

    investment: {
      name: "Fonds d'investissement",
      baseType: "investment",
      linkedTo: "investment",
      rows: [
        { id: "business", name: "Business", percentage: 35 },
        { id: "real-estate", name: "Immobilier", percentage: 25 },
        { id: "placements", name: "Placements financiers", percentage: 15 },
        { id: "travel", name: "Voyages", percentage: 10 },
        { id: "equipment", name: "Matériel", percentage: 10 },
        { id: "training", name: "Formations", percentage: 5 }
      ]
    },

    treasury: {
      name: "Trésorerie",
      baseType: "treasury",
      linkedTo: "treasury",
      rows: [
        { id: "working-capital", name: "Fonds de roulement", percentage: 35 },
        { id: "stock", name: "Stock", percentage: 20 },
        { id: "expenses", name: "Charges et impôts", percentage: 15 },
        { id: "staff", name: "Salaires et prestataires", percentage: 10 },
        { id: "emergency", name: "Réserve d'urgence", percentage: 10 },
        { id: "maintenance", name: "Maintenance", percentage: 5 },
        { id: "tools", name: "Outils et logiciels", percentage: 5 }
      ]
    }
  },

  custom: []
};

let state = loadState();
let selectedTable = null;

/* =========================================================
   UTILITAIRES
========================================================= */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId() {
  return "id-" + Date.now().toString(36) +
    "-" + Math.random().toString(36).slice(2, 8);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function money(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2
  }).format(amount) + " " + state.currency;
}

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function percentageTotal(rows) {
  return rows.reduce((total, row) => total + number(row.percentage), 0);
}

function isValidPercentage(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}

/* =========================================================
   SAUVEGARDE ET RESTAURATION
========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return clone(DEFAULT_STATE);

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.tables ||
      !parsed.tables.main ||
      !Array.isArray(parsed.custom)
    ) {
      return clone(DEFAULT_STATE);
    }

    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      tables: {
        ...clone(DEFAULT_STATE.tables),
        ...parsed.tables
      },
      custom: Array.isArray(parsed.custom) ? parsed.custom : []
    };
  } catch (error) {
    console.error("Erreur de lecture des données :", error);
    return clone(DEFAULT_STATE);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const status = document.getElementById("storage-status");
    if (status) status.textContent = "Sauvegarde locale activée";

    return true;
  } catch (error) {
    console.error("Erreur de sauvegarde :", error);
    showMessage("Impossible de sauvegarder les données.", true);
    return false;
  }
}

function exportJSON() {
  const data = JSON.stringify(state, null, 2);
  downloadFile(data, "kalla-finance-sauvegarde.json", "application/json");
  showMessage("Sauvegarde JSON exportée.");
}

function importJSON(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);

      if (
        !imported ||
        typeof imported !== "object" ||
        !imported.tables ||
        !imported.tables.main ||
        !Array.isArray(imported.custom) ||
        typeof imported.profit !== "number"
      ) {
        throw new Error("Format de sauvegarde invalide.");
      }

      if (!confirm("Remplacer les données actuelles par cette sauvegarde ?")) {
        return;
      }

      state = {
        ...clone(DEFAULT_STATE),
        ...imported,
        tables: {
          ...clone(DEFAULT_STATE.tables),
          ...imported.tables
        }
      };

      saveState();
      renderAll();
      showMessage("Sauvegarde restaurée avec succès.");
    } catch (error) {
      showMessage("Fichier invalide ou incompatible.", true);
    }
  };

  reader.readAsText(file);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* =========================================================
   MESSAGES
========================================================= */

function showMessage(message, error = false) {
  const element = document.getElementById("app-message");
  if (!element) return;

  element.textContent = message;
  element.className = "app-message visible" + (error ? " error" : "");

  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    element.className = "app-message";
  }, 4000);
}

/* =========================================================
   CALCULS FINANCIERS
========================================================= */

function getMainAmount(id) {
  const row = state.tables.main.rows.find(item => item.id === id);

  if (!row) return 0;

  return state.profit * number(row.percentage) / 100;
}

function getTableBase(table) {
  if (table.baseType === "profit") {
    return state.profit;
  }

  if (table.baseType === "salary") {
    return getMainAmount("salary");
  }

  if (table.baseType === "investment") {
    return getMainAmount("investment");
  }

  if (table.baseType === "treasury") {
    return getMainAmount("treasury");
  }

  if (table.baseType === "linked") {
    return getMainAmount(table.linkedTo);
  }

  return number(table.baseAmount);
}

function getRowAmount(table, row) {
  const base = getTableBase(table);

  return base * number(row.percentage) / 100;
}

function validateTable(table) {
  const total = percentageTotal(table.rows);

  return {
    total,
    valid: Math.abs(total - 100) < 0.000001
  };
}

function validateAllTables() {
  return [
    ...Object.values(state.tables),
    ...state.custom
  ].every(table => validateTable(table).valid);
}

/* =========================================================
   AFFICHAGE DES TABLEAUX
========================================================= */

function renderAllocationTable(table, options = {}) {
  const editable = options.editable === true;
  const tableId = options.tableId || "";

  const rowsHTML = table.rows.map((row, index) => {
    const amount = getRowAmount(table, row);

    return `
      <tr>
        <td>
          ${editable
            ? `<input
                type="text"
                value="${escapeHTML(row.name)}"
                data-action="rename-row"
                data-table="${escapeHTML(tableId)}"
                data-index="${index}"
                aria-label="Nom de la catégorie">`
            : escapeHTML(row.name)}
        </td>

        <td>
          ${editable
            ? `<input
                class="percentage-input"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value="${number(row.percentage)}"
                data-action="percentage"
                data-table="${escapeHTML(tableId)}"
                data-index="${index}"
                aria-label="Pourcentage">`
            : number(row.percentage).toLocaleString("fr-FR") + " %"}
        </td>

        <td class="amount-cell">${money(amount)}</td>

        ${editable ? `
          <td>
            <button
              class="button button-danger remove-row"
              data-action="remove-row"
              data-table="${escapeHTML(tableId)}"
              data-index="${index}"
              type="button">
              Supprimer
            </button>
          </td>
        ` : ""}
      </tr>
    `;
  }).join("");

  const validation = validateTable(table);

  return `
    <div class="table-scroll">
      <table class="allocation-table">
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Pourcentage</th>
            <th>Montant</th>
            ${editable ? "<th>Action</th>" : ""}
          </tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>

    <div class="table-total">
      <span>Total des pourcentages</span>
      <strong>${validation.total.toLocaleString("fr-FR")} %</strong>
    </div>

    <div class="validation-message ${validation.valid ? "" : "error"}">
      ${validation.valid
        ? "Répartition équilibrée : 100 %."
        : "Attention : le total doit être égal à 100 %."}
    </div>

    ${editable ? `
      <div class="editor-actions">
        <button
          class="button button-secondary"
          data-action="add-row"
          data-table="${escapeHTML(tableId)}"
          type="button">
          Ajouter une catégorie
        </button>
      </div>
    ` : ""}
  `;
}

/* =========================================================
   IDENTIFICATION DES TABLEAUX
========================================================= */

function getTable(tableId) {
  if (state.tables[tableId]) return state.tables[tableId];

  return state.custom.find(table => table.id === tableId) || null;
}

function getTableId(table) {
  for (const [id, candidate] of Object.entries(state.tables)) {
    if (candidate === table) return id;
  }

  return table.id;
}

/* =========================================================
   TABLEAU DE BORD
========================================================= */

function renderDashboard() {
  const salary = getMainAmount("salary");
  const treasury = getMainAmount("treasury");
  const investment = getMainAmount("investment");

  setText("dashboard-profit", money(state.profit));
  setText("dashboard-salary", money(salary));
  setText("dashboard-treasury", money(treasury));
  setText("dashboard-investment", money(investment));

  setValue("profit-input", state.profit);
  setValue("income-profit-input", state.profit);
  setValue("currency", state.currency);
  setText("input-currency", state.currency);

  const mainContainer = document.getElementById("dashboard-main-allocation");

  if (mainContainer) {
    mainContainer.innerHTML = renderAllocationTable(state.tables.main);
  }
}

/* =========================================================
   PAGES PRINCIPALES
========================================================= */

function renderMainEditor() {
  const container = document.getElementById("main-allocation-editor");
  if (!container) return;

  container.innerHTML = renderAllocationTable(
    state.tables.main,
    { editable: true, tableId: "main" }
  );
}

function renderBudget() {
  const container = document.getElementById("budget-table");
  if (!container) return;

  container.innerHTML = `
    <p class="help-text">Montant disponible : ${money(getTableBase(state.tables.budget))}</p>
    ${renderAllocationTable(state.tables.budget, {
      editable: true,
      tableId: "budget"
    })}
  `;
}

function renderInvestment() {
  const container = document.getElementById("investment-table");
  if (!container) return;

  container.innerHTML = `
    <p class="help-text">Montant disponible : ${money(getTableBase(state.tables.investment))}</p>
    ${renderAllocationTable(state.tables.investment, {
      editable: true,
      tableId: "investment"
    })}
  `;
}

function renderTreasury() {
  const container = document.getElementById("treasury-table");
  if (!container) return;

  container.innerHTML = `
    <p class="help-text">Montant disponible : ${money(getTableBase(state.tables.treasury))}</p>
    ${renderAllocationTable(state.tables.treasury, {
      editable: true,
      tableId: "treasury"
    })}
  `;
}

/* =========================================================
   PERSONNALISATION
========================================================= */

function renderCustomizationEditor(tableId = selectedTable) {
  const container = document.getElementById("customization-editor");
  if (!container) return;

  const table = getTable(tableId);

  if (!table) {
    container.innerHTML = `
      <p class="empty-state">
        Sélectionnez un tableau ou créez un nouveau tableau.
      </p>
    `;
    return;
  }

  selectedTable = tableId;

  const isCustom = state.custom.some(item => item.id === tableId);

  container.innerHTML = `
    <div class="custom-table-editor">
      <div class="editor-toolbar">
        <div>
          <label for="table-name">Nom du tableau</label>
          <input
            id="table-name"
            type="text"
            value="${escapeHTML(table.name)}"
            data-action="table-name"
            data-table="${escapeHTML(tableId)}">
        </div>

        <div class="editor-actions">
          ${isCustom ? `
            <button
              class="button button-danger"
              data-action="delete-table"
              data-table="${escapeHTML(tableId)}"
              type="button">
              Supprimer le tableau
            </button>
          ` : ""}
        </div>
      </div>

      ${isCustom ? `
        <div>
          <label for="table-mode">Mode de calcul</label>
          <select
            id="table-mode"
            data-action="table-mode"
            data-table="${escapeHTML(tableId)}">

            <option value="independent" ${table.baseType === "independent" ? "selected" : ""}>
              Indépendant
            </option>

            <option value="profit" ${table.baseType === "profit" ? "selected" : ""}>
              Lié au bénéfice total
            </option>

            <option value="salary" ${table.baseType === "salary" ? "selected" : ""}>
              Lié au salaire
            </option>

            <option value="investment" ${table.baseType === "investment" ? "selected" : ""}>
              Lié à l'investissement
            </option>

            <option value="treasury" ${table.baseType === "treasury" ? "selected" : ""}>
              Lié à la trésorerie
            </option>
          </select>
        </div>

        ${table.baseType === "independent" ? `
          <div>
            <label for="table-base-amount">Montant de référence</label>
            <input
              id="table-base-amount"
              type="number"
              min="0"
              step="any"
              value="${number(table.baseAmount)}"
              data-action="table-base"
              data-table="${escapeHTML(tableId)}">
          </div>
        ` : ""}
      ` : `
        <p class="help-text">
          Ce tableau principal utilise automatiquement son montant de référence.
          Tu peux modifier ses catégories et ses pourcentages.
        </p>
      `}

      ${renderAllocationTable(table, {
        editable: true,
        tableId
      })}
    </div>
  `;
}

function createCustomTable() {
  const name = prompt("Nom du nouveau tableau :");

  if (!name || !name.trim()) return;

  const table = {
    id: makeId(),
    name: name.trim(),
    baseType: "independent",
    baseAmount: 0,
    rows: [
      { id: makeId(), name: "Catégorie 1", percentage: 100 }
    ]
  };

  state.custom.push(table);
  selectedTable = table.id;

  saveState();
  renderAll();
  renderCustomizationEditor(table.id);

  showMessage("Nouveau tableau créé.");
}

function addBusinessTable() {
  createCustomTable();
}

function deleteCustomTable(tableId) {
  const index = state.custom.findIndex(table => table.id === tableId);

  if (index === -1) return;

  if (!confirm("Supprimer définitivement ce tableau personnalisé ?")) return;

  state.custom.splice(index, 1);
  selectedTable = null;

  saveState();
  renderAll();

  showMessage("Tableau supprimé.");
}

function renderBusinessTables() {
  const container = document.getElementById("business-tables");
  if (!container) return;

  if (state.custom.length === 0) {
    container.innerHTML = `
      <p class="empty-state">
        Aucun tableau personnalisé. Créez votre premier tableau.
      </p>
    `;
    return;
  }

  container.innerHTML = state.custom.map(table => `
    <div class="business-table-card">
      <div class="panel-heading">
        <h4>${escapeHTML(table.name)}</h4>
        <button
          type="button"
          class="button button-secondary"
          data-action="edit-custom"
          data-table="${escapeHTML(table.id)}">
          Modifier
        </button>
      </div>

      <p>Montant de référence : ${money(getTableBase(table))}</p>

      ${renderAllocationTable(table)}
    </div>
  `).join("");
}

/* =========================================================
   RAPPORTS
========================================================= */

function renderReports() {
  const container = document.getElementById("report-content");
  if (!container) return;

  const mainRows = state.tables.main.rows;

  const mainHTML = mainRows.map(row => `
    <div class="report-row">
      <span>${escapeHTML(row.name)} (${row.percentage} %)</span>
      <strong>${money(getRowAmount(state.tables.main, row))}</strong>
    </div>
  `).join("");

  const extraHTML = state.custom.map(table => `
    <div class="report-row">
      <span>${escapeHTML(table.name)}</span>
      <strong>${money(getTableBase(table))}</strong>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="report-row">
      <span>Bénéfice de référence</span>
      <strong>${money(state.profit)}</strong>
    </div>

    ${mainHTML}

    <h3 style="margin-top:25px">Tableaux personnalisés</h3>

    ${extraHTML || '<p class="help-text">Aucun tableau supplémentaire.</p>'}
  `;
}

/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {
  const lines = [
    ["Tableau", "Catégorie", "Pourcentage", "Montant"]
  ];

  const allTables = [
    ...Object.entries(state.tables).map(([id, table]) => ({
      id,
      table
    })),
    ...state.custom.map(table => ({
      id: table.id,
      table
    }))
  ];

  allTables.forEach(({ table }) => {
    table.rows.forEach(row => {
      lines.push([
        table.name,
        row.name,
        row.percentage,
        getRowAmount(table, row)
      ]);
    });
  });

  const csv = "\uFEFF" + lines.map(row =>
    row.map(value =>
      '"' + String(value).replace(/"/g, '""') + '"'
    ).join(";")
  ).join("\n");

  downloadFile(csv, "kalla-finance-rapport.csv", "text/csv;charset=utf-8");

  showMessage("Rapport CSV exporté.");
}

/* =========================================================
   NAVIGATION
========================================================= */

const PAGE_TITLES = {
  dashboard: "Tableau de bord",
  income: "Revenus et bénéfices",
  budget: "Budget personnel",
  investment: "Fonds d'investissement",
  treasury: "Trésorerie",
  business: "Business",
  security: "Sécurité",
  reports: "Rapports",
  customization: "Personnalisation"
};

function navigate(page) {
  if (!PAGE_TITLES[page]) return;

  document.querySelectorAll(".page").forEach(element => {
    element.classList.toggle("active", element.id === "page-" + page);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  setText("page-title", PAGE_TITLES[page]);

  document.getElementById("sidebar")?.classList.remove("open");

  if (page === "customization") {
    renderCustomizationEditor();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   MODIFICATION DES TABLEAUX
========================================================= */

function handleTableAction(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const tableId = target.dataset.table;
  const table = getTable(tableId);
  const index = Number(target.dataset.index);

  if (!table && action !== "edit-custom") return;

  if (action === "percentage") {
    if (!isValidPercentage(target.value)) {
      showMessage("Le pourcentage doit être positif ou nul.", true);
      return;
    }

    table.rows[index].percentage = number(target.value);
    saveState();
    renderAll();
    renderCustomizationEditor(tableId);
  }

  if (action === "rename-row") {
    table.rows[index].name = target.value;
    saveState();
  }

  if (action === "remove-row") {
    if (table.rows.length <= 1) {
      showMessage("Un tableau doit conserver au moins une catégorie.", true);
      return;
    }

    table.rows.splice(index, 1);
    saveState();
    renderAll();
    renderCustomizationEditor(tableId);
  }

  if (action === "add-row") {
    table.rows.push({
      id: makeId(),
      name: "Nouvelle catégorie",
      percentage: 0
    });

    saveState();
    renderAll();
    renderCustomizationEditor(tableId);
  }

  if (action === "table-name") {
    table.name = target.value;
    saveState();
  }

  if (action === "table-base") {
    table.baseAmount = Math.max(0, number(target.value));
    saveState();
    renderAll();
    renderCustomizationEditor(tableId);
  }

  if (action === "table-mode") {
    const allowed = ["independent", "profit", "salary", "investment", "treasury"];

    if (!allowed.includes(target.value)) return;

    table.baseType = target.value;

    if (target.value === "independent" && !Number.isFinite(Number(table.baseAmount))) {
      table.baseAmount = 0;
    }

    saveState();
    renderAll();
    renderCustomizationEditor(tableId);
  }

  if (action === "delete-table") {
    deleteCustomTable(tableId);
  }

  if (action === "edit-custom") {
    selectedTable = tableId;
    navigate("customization");
    renderCustomizationEditor(tableId);
  }
}

/* =========================================================
   MISE À JOUR DES MONTANTS
========================================================= */

function updateProfit(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    showMessage("Saisissez un montant valide.", true);
    return;
  }

  state.profit = amount;

  saveState();
  renderAll();
  showMessage("Les calculs ont été actualisés.");
}

/* =========================================================
   FONCTIONS DOM
========================================================= */

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && document.activeElement !== element) {
    element.value = value;
  }
}

/* =========================================================
   AFFICHAGE GLOBAL
========================================================= */

function renderAll() {
  renderDashboard();
  renderMainEditor();
  renderBudget();
  renderInvestment();
  renderTreasury();
  renderBusinessTables();
  renderReports();

  if (selectedTable) {
    renderCustomizationEditor(selectedTable);
  }
}

/* =========================================================
   ÉVÉNEMENTS
========================================================= */

function bindEvents() {
  document.querySelectorAll(".nav-link").forEach(button => {
    button.addEventListener("click", () => {
      navigate(button.dataset.page);
    });
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      navigate(button.dataset.go);
    });
  });

  document.querySelectorAll("[data-custom-table]").forEach(button => {
    button.addEventListener("click", () => {
      const tableId = button.dataset.customTable;
      selectedTable = tableId;
      renderCustomizationEditor(tableId);
    });
  });

  document.addEventListener("click", handleTableAction);

  document.getElementById("calculate-profit")?.addEventListener("click", () => {
    updateProfit(document.getElementById("profit-input").value);
  });

  document.getElementById("profit-input")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      updateProfit(event.target.value);
    }
  });

  document.getElementById("income-profit-input")?.addEventListener("change", event => {
    updateProfit(event.target.value);
  });

  document.getElementById("currency")?.addEventListener("change", event => {
    state.currency = event.target.value;
    saveState();
    renderAll();
  });

  document.getElementById("export-json")?.addEventListener("click", exportJSON);
  document.getElementById("security-export")?.addEventListener("click", exportJSON);
  document.getElementById("export-csv")?.addEventListener("click", exportCSV);

  document.getElementById("import-json")?.addEventListener("change", event => {
    importJSON(event.target.files[0]);
    event.target.value = "";
  });

  document.getElementById("print-report")?.addEventListener("click", () => {
    navigate("reports");
    window.print();
  });

  document.getElementById("create-custom-table")?.addEventListener("click", createCustomTable);
  document.getElementById("add-business-table")?.addEventListener("click", addBusinessTable);

  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
  });
}

/* =========================================================
   INITIALISATION
========================================================= */

function init() {
  bindEvents();
  renderAll();
  navigate("dashboard");

  if (!localStorage.getItem(STORAGE_KEY)) {
    saveState();
  }

  console.log("KALLA Finance Prototype initialisé.");
}

document.addEventListener("DOMContentLoaded", init);
