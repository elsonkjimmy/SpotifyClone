# Conventions de Code - Spotify Clone (TP Mobile)

Ce document répertorie les règles de nommage et de structure adoptées pour faciliter la compréhension et l'explication du code lors de la soutenance du TP.

## Principes de Clarté

1. **Nommage Explicite** : Les noms de fonctions et de composants doivent décrire précisément l'action ou l'élément. 
   - *Exemple :* `boutonPourSeConnecter` au lieu de `btnSubmit`.
   - *Exemple :* `recupererLesMusiquesDepuisFirestore` au lieu de `fetchData`.

2. **Commentaires Pédagogiques** : Chaque fichier important commence par une brève explication en français de son rôle.

3. **Langue** : Les noms de variables et fonctions seront en anglais (standard de l'industrie) mais extrêmement descriptifs, ou en "Franglais" explicite si nécessaire pour lever toute ambiguïté sur le but pédagogique.

4. **Structure du Code** : Séparation stricte entre l'interface (UI) et la logique (Services/Services).

## Lexique du Projet

- **Screens** -> Écrans de l'application.
- **Components** -> Éléments visuels réutilisables.
- **Services** -> Logique métier (Firebase, Lecteur Audio).
- **Theme** -> Couleurs et styles visuels.
