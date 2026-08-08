# Electric Piano Sampler - Guide d'utilisation

## 🎹 Intégration Tone.js réussie !

Le système StringsOrchestrator utilise maintenant un véritable **sampler de piano électrique** basé sur Tone.js, remplaçant le synthétiseur basique.

## 📦 Ce qui a été fait

### 1. Module EP Sampler (`src/utils/epSampler.ts`)
- Chargement de samples Rhodes/Wurlitzer
- Reverb ECM-style (2.5s decay, 30% wet)
- Chorus subtil pour la chaleur
- Gestion propre de l'initialisation audio
- API simple pour jouer des accords

### 2. AudioEngine mis à jour
- Utilise maintenant le sampler au lieu du synthé basique
- Attack/Release naturels du piano électrique
- Son authentique avec effets intégrés

### 3. Structure des samples
```
public/samples/epiano/
├── README.md (guide complet)
├── .gitkeep
└── [samples MP3 à ajouter]
```

## 🎵 Samples requis

Le sampler attend 6 fichiers MP3:

```
EP_C3.mp3   - Do octave 3
EP_F3.mp3   - Fa octave 3
EP_A#3.mp3  - La# octave 3
EP_D4.mp3   - Ré octave 4
EP_F4.mp3   - Fa octave 4
EP_A#4.mp3  - La# octave 4
```

## 📥 Où obtenir les samples

### Option 1: Freesound.org (gratuit)
1. Chercher "Rhodes piano" ou "Wurlitzer"
2. Télécharger des notes individuelles
3. Renommer selon la convention ci-dessus
4. Placer dans `public/samples/epiano/`

### Option 2: Logic Pro / Ableton
1. Ouvrir un EP virtuel (Vintage Electric Piano, etc.)
2. Enregistrer chaque note (C3, F3, A#3, D4, F4, A#4)
3. Exporter en MP3 44.1kHz
4. Placer dans le dossier samples

### Option 3: Générateurs en ligne
- Synthesia samples
- Virtual Piano samples
- Musical Artifacts

## ⚙️ Configuration actuelle

Le sampler est configuré avec:
```typescript
{
  reverb: 2.5,      // 2.5s decay (ECM style)
  chorus: true,     // Warmth & width
  attack: 0.01,     // Fast attack (piano-like)
  release: 1.2      // Natural decay
}
```

## 🔄 Fonctionnement

1. **Au démarrage:**
   - Le sampler charge les 6 fichiers MP3
   - Tone.js interpole automatiquement les notes entre les samples
   - Les effets (reverb/chorus) sont connectés

2. **Pendant la lecture:**
   - Chaque accord utilise les samples les plus proches
   - Interpolation automatique pour les notes manquantes
   - Release naturel avec reverb tail

3. **Fallback:**
   - Si les samples ne sont pas trouvés, Tone.js utilise des oscillateurs
   - Le son sera basique mais fonctionnel
   - Message d'erreur dans la console

## 🎨 Style ECM / AiXEL

Le sampler est configuré pour le son caractéristique:
- **Reverb spacieux** (2.5s) comme sur les albums ECM
- **Chorus léger** pour la profondeur Rhodes
- **Attack rapide** pour la clarté des voicings
- **Release long** pour les harmonies flottantes

## 🧪 Test

1. Lancer l'application
2. Sélectionner un accord (ex: Cmaj7(#11))
3. Ajouter à la séquence
4. Cliquer Play
5. Écouter le son du piano électrique avec reverb/chorus

## 🐛 Troubleshooting

**Le son est basique/synthétique:**
- Les samples MP3 ne sont pas chargés
- Vérifier `public/samples/epiano/` contient les fichiers
- Vérifier les noms de fichiers correspondent exactement
- Ouvrir la console pour voir les erreurs de chargement

**Pas de son du tout:**
- Vérifier que l'audio context est démarré (clic utilisateur requis)
- Le navigateur peut bloquer l'autoplay
- Vérifier le volume système

**Latence/décalage:**
- C'est normal au premier clic (chargement)
- Les lectures suivantes seront fluides
- Les samples sont mis en cache

## 🚀 Prochaines étapes

Pour améliorer encore:

1. **Ajouter plus de samples:**
   - Couvrir 2 octaves complètes
   - Ajouter des samples avec variations de vélocité

2. **Presets de son:**
   - Rhodes Mark I (bright)
   - Wurlitzer (mellow)
   - Vintage (lo-fi)

3. **Effets additionnels:**
   - Tremolo (optionnel)
   - Phaser (style 70s)
   - Compression douce

## 📝 Intégration avec AiXEL

Le sampler EP est maintenant connecté au système AiXEL:
- Utilise les voicings authentiques du `AIXEL_MASTER_MODEL_2025_FULL`
- Respecte les règles harmoniques ECM
- Son cohérent avec le style Axel Fisch

## 💡 Exemple d'utilisation

```typescript
import { playChord } from './utils/epSampler';

// Jouer un accord Cmaj7(#11) style AiXEL
await playChord(
  ['C4', 'E4', 'B4', 'F#5'],  // voicing ouvert
  2.0,    // 2 secondes
  0.8     // vélocité
);
```

---

**Note:** Pour le son optimal, ajoutez vos samples MP3 dans `public/samples/epiano/` ! Sans samples, le système utilise des oscillateurs basiques comme fallback.
