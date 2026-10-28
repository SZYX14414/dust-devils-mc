# Dust Devil’s MC — V5 Ultimate : plan de livraison

## Invariants obligatoires
- Ne jamais supprimer ou réinitialiser `auth.users`, `member_profiles`, `member_logins`, `club_data`, `club_announcements`, `club_audit`.
- Garder les fonctions Netlify, les variables secrètes uniquement côté serveur et l’intégration Google Sheets.
- Toute modification de schéma doit être additive, versionnée et testée sur une copie.
- Droits contrôlés côté serveur; les boutons masqués ne sont pas une protection.
- Prévoir export ET test de restauration, sans prétendre qu'un export JSON est une sauvegarde complète des comptes Auth.

## Lots de réalisation
1. **Design Ultimate Western** : thème noir/bronze, navigation, accessibilité et mobile (aperçu inclus).
2. **Membres et hiérarchie** : fiches enrichies et historique des grades; relier par identifiants stables sans imposer de compte Auth pour figurer dans l'effectif.
3. **Calendrier et événements** : événements, inscriptions, présence et permissions bureau.
4. **Tableau de bord / classements / quotas** : indicateurs fondés sur les journaux réels, normalisation des identités, suppression des doublons Google.
5. **Trésorerie avancée et actions** : journal immuable, catégories, filtres, exports, validations.
6. **Recrutement, annonces et notifications** : statuts, lecture par membre, préférences.
7. **Votes du bureau, documents et réunions** : contrôle d'accès serveur, historique des votes, fichiers privés.
8. **Sécurité et sauvegardes** : tests RLS, journal d'audit, limitation des requêtes, restauration testée, contrôle des accès aux documents.

## Validation avant chaque mise en production
- Tester sur site de prévisualisation avec compte administrateur et compte membre.
- Vérifier l'absence de perte de données et la conservation des anciennes fonctionnalités.
- Vérifier qu'un membre ne peut pas contourner les restrictions en appelant directement les endpoints.
- Vérifier sauvegarde et procédure de retour arrière.

## Points à confirmer
- Format exact des enregistrements `club_data` et des actions Google Sheets.
- Modèle des permissions et des documents privés.
- Politique de conservation des journaux et des sauvegardes.

## V5 — Lot comptes et radio
- Annuaire des comptes existants : affichage, rôle et permissions administrateur.
- Radio du club : salons Général, Bureau et Trésorerie, messages persistants et contrôle serveur.
- Migration additive : SUPABASE_MIGRATION_V5_CHAT.sql.
- À développer : notifications, messages privés, calendrier, votes, rapprochement financier des ventes et caméras Discord.
