
# KALLA FINANCE — PROTOTYPE

**Gestion financière, budgétaire et allocation du capital**

KALLA Finance Prototype est une application web de gestion financière conçue pour organiser les revenus, les bénéfices, le budget personnel, la trésorerie et les investissements.

Le projet vise à proposer un outil personnalisable, accessible depuis un téléphone ou un ordinateur.

---

## 1. Objectifs du projet

- Organiser la répartition des bénéfices.
- Gérer un budget personnel.
- Suivre un fonds d'investissement.
- Organiser la trésorerie.
- Créer des tableaux financiers personnalisés.
- Modifier les catégories et les pourcentages.
- Calculer automatiquement les montants.
- Exporter et restaurer les données.

---

## 2. Structure des fichiers

Le projet utilise trois fichiers principaux :

| Fichier | Fonction |
|---|---|
| `index.html` | Structure de l'application |
| `styles.css` | Design et interface utilisateur |
| `app.js` | Calculs, données et fonctionnalités |

Le présent fichier `README.md` documente le projet.

Tous les fichiers doivent être placés à la racine du dépôt.

---

## 3. Répartition principale des bénéfices

La répartition initiale est la suivante :

| Affectation | Pourcentage |
|---|---:|
| Dîme | 10 % |
| Salaire personnel | 25 % |
| Trésorerie | 25 % |
| Investissement massif | 40 % |
| **Total** | **100 %** |

Cette répartition constitue la base de calcul des autres tableaux.

---

## 4. Fonds d'investissement

Le fonds d'investissement représente 40 % du bénéfice disponible selon la configuration initiale.

Sa répartition interne est :

| Catégorie | Pourcentage |
|---|---:|
| Business | 35 % |
| Immobilier | 25 % |
| Placements financiers | 15 % |
| Voyages | 10 % |
| Matériel | 10 % |
| Formations | 5 % |
| **Total** | **100 %** |

---

## 5. Trésorerie

La trésorerie représente initialement 25 % du bénéfice disponible.

Sa répartition interne est :

| Catégorie | Pourcentage |
|---|---:|
| Fonds de roulement | 35 % |
| Stock | 20 % |
| Charges et impôts | 15 % |
| Salaires et prestataires | 10 % |
| Réserve d'urgence | 10 % |
| Maintenance | 5 % |
| Outils et logiciels | 5 % |
| **Total** | **100 %** |

La trésorerie sert notamment à financer les dépenses de fonctionnement, les employés et les prestataires.

Les dépenses de personnel et de fonctionnement sont des charges de l'activité. Elles ne doivent pas être comptabilisées une deuxième fois comme une nouvelle part des bénéfices.

---

## 6. Budget personnel

Le budget personnel est calculé sur la part de salaire personnel, initialement fixée à 25 % du bénéfice.

| Catégorie | Pourcentage |
|---|---:|
| Vie courante | 30 % |
| Logement | 18 % |
| Voiture et transport | 8 % |
| Mariage | 8 % |
| Maison à long terme | 12 % |
| Famille et imprévus | 7 % |
| Épargne sécurité | 5 % |
| Détente et loisirs | 0 % |
| Enfants | 5 % |
| Santé | 7 % |
| **Total** | **100 %** |

---

## 7. Personnalisation

L'application prévoit la modification des tableaux principaux :

- Répartition des bénéfices.
- Budget personnel.
- Fonds d'investissement.
- Trésorerie.

Il est également possible de créer des tableaux supplémentaires.

Les fonctionnalités de personnalisation comprennent :

- Ajouter une catégorie.
- Renommer une catégorie.
- Modifier un pourcentage.
- Supprimer une catégorie.
- Créer un tableau.
- Renommer un tableau.
- Supprimer un tableau personnalisé.
- Définir un montant de référence.

Chaque tableau doit totaliser 100 % pour être considéré comme équilibré.

---

## 8. Modes de calcul

Les tableaux personnalisés peuvent fonctionner selon plusieurs modes :

### Mode indépendant

Le tableau possède son propre montant de référence.

### Mode lié au bénéfice

Le tableau utilise le bénéfice total comme base de calcul.

### Mode lié au salaire

Le tableau utilise le montant affecté au salaire personnel.

### Mode lié à l'investissement

Le tableau utilise le montant du fonds d'investissement.

### Mode lié à la trésorerie

Le tableau utilise le montant de la trésorerie.

---

## 9. Sauvegarde et sécurité

Les données sont enregistrées dans le stockage local du navigateur.

Clé de stockage utilisée :

`kalla-finance-prototype-v1`

Fonctionnalités prévues :

- Sauvegarde automatique locale.
- Exportation JSON.
- Restauration JSON.
- Exportation CSV.
- Impression des rapports.

**Important :** les données ne sont pas synchronisées entre plusieurs appareils. Il faut conserver des copies des sauvegardes.

Ce prototype possède un stockage distinct de celui de l'application KALLA Finance principale.

Ne supprimez pas les données du navigateur sans avoir préalablement sauvegardé les informations importantes.

---

## 10. Installation

1. Ouvrir le dépôt GitHub.
2. Ajouter `index.html`.
3. Ajouter `styles.css`.
4. Ajouter `app.js`.
5. Ajouter `README.md`.
6. Vérifier que les quatre fichiers sont à la racine.
7. Enregistrer les modifications.
8. Activer GitHub Pages si nécessaire pour publier l'application.

L'application est accessible depuis un navigateur compatible avec JavaScript et le stockage local.

---

## 11. Technologies utilisées

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Exportation JSON
- Exportation CSV

Aucune base de données distante ni aucun serveur ne sont nécessaires pour cette version.

---

## 12. Limites du prototype

Cette version est une démonstration fonctionnelle destinée aux essais.

Elle ne propose pas encore :

- La synchronisation cloud.
- La gestion de plusieurs utilisateurs.
- Un système de connexion sécurisé.
- La gestion de plusieurs comptes bancaires.
- Une comptabilité certifiée.
- La gestion fiscale complète.
- La sauvegarde automatique sur serveur.

Ces fonctionnalités pourront être intégrées dans une version ultérieure.

---

## 13. Évolution du projet

Les prochaines améliorations pourront inclure :

- Un système de comptes utilisateurs.
- Une base de données sécurisée.
- La synchronisation entre appareils.
- La gestion de plusieurs entreprises.
- Le suivi des investissements.
- La gestion des projets commerciaux.
- Des graphiques financiers interactifs.
- Des rapports mensuels et annuels.
- La gestion des devises FCFA, EUR et RMB.

---

**Projet : KALLA Finance**

**Organisation : KALLA GROUP**

*Gestion, discipline financière et développement du capital.*
