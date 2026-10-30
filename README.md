# COLLECTIVE — Gestion & investissement

Prototype web autonome en français pour suivre les membres, cotisations, projets, règles de répartition, mouvements de trésorerie et rapports.

## Démarrage
1. Décompressez le dossier.
2. Ouvrez `index.html` avec un navigateur récent (Chrome, Edge, Firefox ou Safari).
3. Les données de démonstration sont modifiables. Rendez-vous dans **Paramètres** pour personnaliser l’espace.

Aucun serveur ni installation de dépendance n’est nécessaire pour cette version de démonstration. Le navigateur doit autoriser JavaScript et `localStorage`.

## Modules
- Tableau de bord et indicateurs de suivi
- Membres : création, modification, recherche, export CSV
- Cotisations : enregistrement, statut, référence, modification et export
- Projets : budget, montant investi, statut, risque et notes
- Répartition : simulation des enveloppes redistribution / investissement / trésorerie / frais
- Trésorerie : journal des entrées et sorties
- Rapports : synthèse, impression / sauvegarde PDF via le navigateur
- Gouvernance : checklist et journal des actions
- Guide de commandes intégré
- Paramètres : devise, objectif, pourcentages, sauvegarde JSON et restauration

## Répartition par défaut
- Redistribution : 55 %
- Investissement : 25 %
- Trésorerie et sécurité : 15 %
- Frais de gestion : 5 %

La somme doit rester à 100 %. Cette règle est configurable.

## Sauvegarde et données
Les données sont conservées dans le stockage local du navigateur sur cet appareil. Utilisez **Exporter les données** pour obtenir une sauvegarde JSON. L’import remplace les données actuellement présentes : exportez une copie avant toute restauration. Les exports CSV peuvent être ouverts dans un tableur.

## Limites et précautions
Cette version est un prototype front-end, pas un système bancaire ou comptable certifié. Elle ne propose pas de comptes individuels, d’authentification, de rôles serveur, de synchronisation multi-appareils, de chiffrement dédié, de journal inviolable ni de connexion bancaire. Ne l’utilisez pas seule pour administrer de l’argent réel et n’y stockez pas de données sensibles.

Avant de collecter de l’argent ou d’investir les cotisations pour le compte de membres, faites vérifier les statuts, contrats, règles de sortie, fiscalité, comptabilité, protection des données et éventuelles autorisations financières par un juriste et un expert-comptable dans le pays concerné. Ne promettez pas de rendement garanti.

## Évolutions conseillées pour une version de production
1. Backend sécurisé et base de données (par ex. PostgreSQL).
2. Authentification forte, rôles (administrateur, trésorier, auditeur, membre) et permissions.
3. Journal d’audit non modifiable et rapprochement bancaire.
4. Reçus PDF numérotés, échéancier, relances et exports comptables.
5. Sauvegardes automatiques chiffrées, hébergement HTTPS et tests de sécurité.
6. Validation juridique et comptable avant mise en service.
