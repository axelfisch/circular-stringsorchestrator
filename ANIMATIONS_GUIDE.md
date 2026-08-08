# Animation & Visual Effects Guide

## ✨ Animations intégrées dans StringsOrchestrator

Le système d'animations ECM-style apporte fluidité et élégance à l'interface tout en respectant l'esthétique minimaliste du label ECM.

---

## 🎨 Classes d'animation disponibles

### 1. **Ring (Sélecteur circulaire principal)**
```css
.ring {
  transition: transform 0.6s ease-in-out, opacity 0.3s ease;
}
```
- Transition fluide de 0.6s pour les transformations
- Effet hover avec scale(1.02) subtil
- Appliqué au canvas principal du CircularSelector

### 2. **Active Glow (Effet de surbrillance active)**
```css
.active-glow {
  filter: drop-shadow(0 0 15px #60A5FA) drop-shadow(0 0 30px #0EA5E9);
  animation: pulse-glow 0.8s ease-in-out;
}
```
- Double drop-shadow bleu pour effet lumineux
- Animation pulse de 0.8s
- Appliqué aux boutons "Add to Sequence" et au chord display principal

### 3. **Rotate Smooth (Rotation fluide)**
```css
.rotate-smooth {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```
- Bezier curve personnalisée pour rotation naturelle
- Utilisé pour les contrôles de rotation des anneaux

### 4. **Beat Pulse (Indicateur de beat)**
```css
.beat-pulse {
  animation: beat-indicator 0.4s ease-out;
}
```
- Scale de 1 à 1.2 et retour
- Parfait pour indiquer la lecture de chaque mesure
- Animation rapide (0.4s)

### 5. **Extension Highlight (Mise en évidence des extensions)**
```css
.extension-highlight {
  animation: extension-glow 1s ease-in-out infinite alternate;
}
```
- Glow pulsant infini
- Appliqué au panneau des extensions harmoniques
- Attire l'attention sur les options d'extensions disponibles

### 6. **Bar Active (État actif des mesures)**
```css
.bar-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(14, 165, 233, 0.3) 100%);
  border-color: #60A5FA;
  animation: bar-highlight 0.3s ease-out;
}
```
- Gradient diagonal bleu
- Animation de highlight avec scale et box-shadow
- Utilisé pour indiquer la mesure en cours de lecture

### 7. **Play Button (Bouton de lecture)**
```css
.play-button {
  transition: all 0.2s ease;
}
.play-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
}
```
- Hover avec scale 1.05 et shadow verte
- Active avec scale 0.95 pour feedback tactile
- Appliqué au bouton "Add to Sequence"

### 8. **Fade In (Entrée en fondu)**
```css
.fade-in {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- Apparition douce avec translation verticale
- Appliqué aux champs de sélection (Genre, Key, Extension, etc.)
- Durée 0.3s pour rapidité

### 9. **ECM Fade (Style ECM authentique)**
```css
.ecm-fade {
  animation: ecmFade 0.8s ease-in-out;
}
@keyframes ecmFade {
  from { opacity: 0; filter: blur(4px); }
  to { opacity: 1; filter: blur(0); }
}
```
- Entrée avec effet blur pour style éthéré
- Appliqué au titre principal "StringsOrchestrator"
- Évoque l'esthétique cristalline ECM

### 10. **Slider Thumb (Contrôles de slider)**
```css
.slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
}
```
- Scale important (1.2) pour visibilité
- Shadow bleue lumineuse
- Feedback visuel pour contrôles de tempo/volume

---

## 🎯 Application dans les composants

### CircularSelector
- **Canvas principal**: `.ring`, `.ecm-fade`
- **Boutons de rotation**: `hover:scale-110`, `active:scale-95`
- **Panneau Extensions**: `.extension-highlight` (glow pulsant)
- **Tous les contrôles**: `.fade-in` au chargement

### ChordDisplay
- **Champs de sélection**: `.fade-in`, hover avec border colorée
- **Full Chord display**: `.active-glow`, `hover:scale-105`
- **Bouton Add**: `.play-button`, `.active-glow`
- **Labels**: Transitions sur hover

### ChordSequencer
- **Mesure active**: `.bar-active` (gradient + animation)
- **Beat indicator**: `.beat-pulse` pendant la lecture
- **Bouton Play**: `.play-button` avec shadow verte
- **Boutons Clear/Remove**: Transitions scale

---

## 🎬 Keyframes personnalisés

### pulse-glow
```css
@keyframes pulse-glow {
  0%   { opacity: 1; filter: drop-shadow(0 0 25px #93C5FD); }
  50%  { opacity: 1; filter: drop-shadow(0 0 35px #60A5FA); }
  100% { opacity: 0.9; filter: drop-shadow(0 0 15px #3B82F6); }
}
```
Utilisé pour les éléments actifs et sélectionnés.

### beat-indicator
```css
@keyframes beat-indicator {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
```
Pulsation rythmique pour indiquer le beat actuel.

### extension-glow
```css
@keyframes extension-glow {
  from { opacity: 0.7; filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5)); }
  to   { opacity: 1; filter: drop-shadow(0 0 16px rgba(96, 165, 250, 0.8)); }
}
```
Attire l'attention sur les extensions harmoniques disponibles.

### bar-highlight
```css
@keyframes bar-highlight {
  0%   { transform: scale(0.98); box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
  50%  { transform: scale(1.02); box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
  100% { transform: scale(1); box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
}
```
Highlight dramatique pour la mesure en cours de lecture.

---

## 🎨 Palette de couleurs des effets

| Effet | Couleur | Usage |
|-------|---------|-------|
| **Glow bleu** | `#60A5FA`, `#0EA5E9` | Sélection générale, active state |
| **Glow vert** | `#34D399`, `rgba(34, 197, 94, 0.4)` | Boutons d'action positive |
| **Highlight violet** | `#A855F7` | Extensions harmoniques |
| **Highlight vert foncé** | `#10B981` | Bass inversions |
| **Highlight orange** | `#F59E0B` | Styles musicaux |

---

## ⚙️ Durées standards

- **Micro-interactions**: 0.2s (hover, active)
- **Transitions courtes**: 0.3-0.4s (fade-in, beat)
- **Transitions moyennes**: 0.6s (ring, rotation)
- **Transitions longues**: 0.8s+ (ECM fade, extension glow)

---

## 🌟 Principes ECM appliqués

1. **Élégance subtile**: Pas d'animations agressives ou trop rapides
2. **Profondeur spatiale**: Utilisation de drop-shadow plutôt que box-shadow standard
3. **Cristallin**: Effets de blur légers pour l'entrée
4. **Respiration**: Animations alternées (infinite alternate) plutôt que boucles dures
5. **Feedback visuel**: Toujours confirmer les actions utilisateur

---

## 🔧 Personnalisation

Pour ajuster les animations, modifiez `src/index.css`:

```css
/* Exemple: Ralentir l'animation du ring */
.ring {
  transition: transform 1.2s ease-in-out; /* au lieu de 0.6s */
}

/* Exemple: Changer la couleur du glow */
.active-glow {
  filter: drop-shadow(0 0 15px #YOUR_COLOR);
}
```

---

## 📱 Performance

Toutes les animations utilisent:
- `transform` (GPU-accelerated)
- `opacity` (GPU-accelerated)
- `filter` avec parcimonie

Éviter:
- Animations de `width`/`height`
- Animations de `left`/`top`
- Trop de `box-shadow` animés simultanément

---

## 🎯 Bonnes pratiques

1. **Consistency**: Utiliser les classes définies plutôt que des styles inline
2. **Accessibility**: Les animations peuvent être désactivées via `prefers-reduced-motion`
3. **Layering**: Combiner plusieurs classes (ex: `.ring.active-glow.ecm-fade`)
4. **Testing**: Tester sur différents navigateurs et tailles d'écran

---

**Note**: Toutes ces animations sont optimisées pour créer l'expérience visuelle ECM/AiXEL tout en maintenant des performances fluides (60 FPS).
