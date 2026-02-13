# 🎨 Design System Quick Reference

## ✅ Unified Across All Screens

---

## 🎯 Color Palette

### **Background**
```css
#030303 (Pure dark - everywhere)
```

### **Text Colors**
```css
white/90  → Primary text (headings, important)
white/60  → Secondary text (labels, descriptions)
white/40  → Tertiary text (placeholders, hints)
```

### **Gradients**
```css
/* Headers & Titles */
from-indigo-300 via-white/90 to-rose-300

/* Primary Buttons */
from-indigo-600 to-rose-600

/* Success Actions */
from-emerald-500 to-cyan-500

/* Score Bars */
Keyword:  from-indigo-500 to-cyan-500
Semantic: from-rose-500 to-violet-500
```

---

## ✨ Glassmorphism

### **All Cards & Surfaces**
```css
bg-white/[0.03]              /* 3% white overlay */
backdrop-blur-xl             /* Heavy blur */
border border-white/[0.08]   /* 8% white border */
```

### **Hover States**
```css
border-indigo-400/50
shadow-[0_8px_32px_0_rgba(99,102,241,0.15)]
```

---

## 💫 Glow Effects

### **Buttons**
```css
shadow-[0_8px_32px_0_rgba(99,102,241,0.3)]
hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.5)]
```

### **Progress Bars**
```css
Keyword:  shadow-[0_0_20px_rgba(99,102,241,0.5)]
Semantic: shadow-[0_0_20px_rgba(244,63,94,0.5)]
```

---

## 🎭 Skill Chips

### **Found Skills**
```css
bg-emerald-500/15
text-emerald-300
border-emerald-500/30
```

### **Missing Skills**
```css
bg-rose-500/10
text-rose-300
border-rose-500/20
```

---

## 🌊 Ambient Backgrounds

### **Floating Orbs** (All Screens)
```css
bg-indigo-500/10 blur-3xl animate-blob
bg-rose-500/10 blur-3xl animate-blob
bg-violet-500/10 blur-3xl animate-blob
```

### **Gradient Wash**
```css
bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05]
```

---

## 📏 Spacing

```css
p-4, p-5, p-6, p-8           /* Padding */
gap-2, gap-3, gap-4, gap-6   /* Gaps */
mb-2, mb-4, mb-6, mb-8       /* Margins */
```

---

## 🔲 Border Radius

```css
rounded-xl    /* Buttons, inputs, cards */
rounded-2xl   /* Large cards */
rounded-full  /* Pills, chips, icons */
```

---

## ⏱️ Transitions

```css
transition-all duration-300 ease-in-out  /* Default */
```

---

## 🎯 Quick Copy-Paste

### **Glass Card**
```jsx
<div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6">
  Content here
</div>
```

### **Gradient Button**
```jsx
<button className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white shadow-[0_8px_32px_0_rgba(99,102,241,0.3)] border border-white/10 transition-all duration-300">
  Click Me
</button>
```

### **Gradient Title**
```jsx
<h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
  Your Title
</h1>
```

### **Skill Chip (Found)**
```jsx
<span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
  ✓ Python
</span>
```

### **Progress Bar**
```jsx
<div className="w-full bg-white/[0.05] rounded-full h-2">
  <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" style={{width: '75%'}} />
</div>
```

---

## 🎨 Where Each Style is Used

### **Landing Page**
- Background: #030303
- Title: indigo-300 → white/90 → rose-300
- Badge: white/[0.03] glass
- CTA: indigo-600 → rose-600 button

### **Upload Interface**
- Background: #030303
- Drop zone: white/[0.03] glass
- Icon: indigo-500 → rose-500
- Analyze button: emerald-500 → cyan-500

### **Results Dashboard**
- Background: #030303
- Cards: white/[0.03] glass
- Progress bars: Glowing gradients
- Skill chips: Emerald (found) / Rose (missing)

---

## ✅ Status

**Unified:** ✅ Complete
**Build:** ✅ Verified
**Consistency:** 🎯 100%

Run `npm run dev` and experience the harmony! ✨
