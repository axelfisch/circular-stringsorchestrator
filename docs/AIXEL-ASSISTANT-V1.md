# AiXEL Assistant intégré V1 - conception technique

## Objectif produit

Remplacer progressivement le détour actuel par le GPT externe par un assistant musical intégré capable de proposer une progression de huit mesures fondée sur le contexte réel du projet. Une proposition n’est jamais appliquée automatiquement : elle doit être validée, prévisualisée, puis acceptée ou annulée par l’utilisateur.

## Périmètre V1

- Requête en langage naturel limitée à 800 caractères.
- Contexte transmis : accord sélectionné, style, tempo, signature 4/4 et huit mesures actuelles.
- Réponse courte accompagnée, si pertinent, d’une seule proposition complète de huit mesures.
- Une ou deux positions d’accord par mesure, avec inversions et basses étrangères.
- Validation stricte côté serveur et côté navigateur avant tout aperçu.
- Aperçu non destructif; Apply remplace la séquence seulement après une action explicite. Cancel ne modifie rien.
- Le lien AiXEL GPT actuel demeure disponible comme solution de secours durant V1.

## Architecture retenue

1. Le panneau existant construit une `AiXELAssistantRequest` versionnée.
2. `POST /api/aixel-assistant` reçoit la requête dans une Netlify Function moderne.
3. La fonction valide les limites et le contexte avant tout appel de modèle.
4. Le modèle est appelé uniquement côté serveur via Netlify AI Gateway; aucune clé n’est placée dans le bundle Vite.
5. La sortie structurée est validée comme `AiXELAssistantResponse`.
6. Le navigateur valide de nouveau la réponse et affiche la proposition comme aperçu.
7. Apply convertit les accords transportables en `SequenceMeasure` avec de nouveaux identifiants locaux.

```text
User prompt + current project
           |
           v
Validated V1 request
           |
           v
Netlify Function -> AI Gateway -> structured response
           |
           v
Validated preview -> Apply OR Cancel
```

## Contrat musical

- Le contrat est versionné avec `version: "1"`.
- Une séquence contient exactement huit mesures numérotées de 1 à 8.
- `chordCount` vaut 1 ou 2.
- Une mesure simple doit conserver son deuxième emplacement à `null`.
- Les identifiants React ne traversent jamais l’API; ils sont créés uniquement lors de Apply.
- V1 accepte seulement 4/4 et un tempo entier de 40 à 260 BPM, conformément au séquenceur actuel.

## Sécurité et fiabilité

- Aucun secret dans `VITE_*`, le navigateur ou le dépôt.
- Corps JSON borné et validation avant appel au modèle.
- Sortie du modèle traitée comme donnée non fiable jusqu’à validation complète.
- Aucun HTML produit par le modèle n’est rendu.
- Message utilisateur sobre en cas d’indisponibilité; le projet courant reste intact.
- Journaliser seulement l’identifiant de requête, la durée et le statut; ne pas journaliser inutilement les compositions.
- Ajouter une limitation de débit avant une ouverture publique ou payante.

## Étapes de construction

1. **Contract V1** : types, conversions et validations testées - terminé.
2. **Function V1** : endpoint Netlify, validation serveur et adaptateur AI Gateway - terminé.
3. **Preview V1** : réponse, comparaison avec la séquence courante, Apply et Cancel dans le panneau existant sans refonte.
4. **Hardening V1** : erreurs, délai maximal, limitation de débit, télémétrie minimale et tests de production.

## Function V1 livrée

- Endpoint moderne `POST /api/aixel-assistant` dans `netlify/functions/aixel-assistant.ts`.
- Corps limité à 64 Kio et `Content-Type: application/json` obligatoire.
- Validation du contrat avant toute initialisation du client IA.
- Adaptateur OpenAI officiel relié aux variables serveur injectées par Netlify AI Gateway.
- Modèle V1 : `gpt-4o-mini`, avec sortie JSON puis validation complète comme donnée non fiable.
- Réponses d’erreur stables sans fuite de détails fournisseur et sans mise en cache.
- Tests du service avec modèle simulé; aucun crédit IA n’est consommé par la suite de tests.
- `netlify.toml` configure le build Vite et le répertoire des Functions, sans secret.

Le test local complet de l’AI Gateway devra utiliser `netlify dev` après liaison volontaire du dépôt au site Netlify. Aucun déploiement n’est effectué par cette étape.

## Critères d’acceptation finaux

- Une demande produit une réponse sans ouvrir un autre onglet.
- Aucune réponse invalide ne peut modifier la séquence.
- L’utilisateur entend l’aperçu avant de choisir Apply.
- Apply met à jour les mêmes huit mesures utilisées par Playback, MIDI, MusicXML et PDF.
- Cancel ou une erreur laisse le projet rigoureusement inchangé.
- Tests, typecheck, lint et build restent verts.
