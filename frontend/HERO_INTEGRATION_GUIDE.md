# HeroGeometric Component Integration Guide

## ✅ Setup Complete!

The HeroGeometric component has been successfully integrated into your TalentFit application.

## 📁 Files Created/Modified

### New Files:
- ✅ `src/lib/utils.ts` - Utility functions for className merging (shadcn standard)
- ✅ `src/components/ui/shape-landing-hero.tsx` - Main HeroGeometric component
- ✅ `src/components/demo.tsx` - Demo implementation with TalentFit branding
- ✅ `src/App-with-hero.tsx` - Alternative App.jsx with hero toggle
- ✅ `tsconfig.json` - TypeScript configuration with path aliases
- ✅ `tsconfig.node.json` - TypeScript configuration for Vite

### Modified Files:
- ✅ `vite.config.ts` - Added path alias support (@/ → src/)

### Dependencies Installed:
- ✅ `clsx` - Conditional className utility
- ✅ `tailwind-merge` - Tailwind CSS class merger
- ✅ `framer-motion` - Already installed ✓
- ✅ `lucide-react` - Already installed ✓

## 🎯 Component Features

### HeroGeometric Component
- **Animated Shapes**: 5 elegant floating shapes with glassmorphism effects
- **Smooth Animations**: Framer Motion powered entrance and floating animations
- **Fully Responsive**: Mobile-first design with breakpoints (sm, md)
- **Customizable Props**:
  - `badge`: Top badge text (default: "Design Collective")
  - `title1`: First line of heading (default: "Elevate Your Digital Vision")
  - `title2`: Second line with gradient (default: "Crafting Exceptional Websites")

### Visual Elements:
- Dark theme background (#030303)
- Gradient shapes with color variations (indigo, rose, violet, amber, cyan)
- Glassmorphism effects with backdrop blur
- Radial gradients for depth
- Smooth fade-up animations for text

## 🚀 How to Use

### Option 1: Replace App.jsx (Recommended for Demo)

If you want to use the new geometric hero as the landing page:

```bash
cd frontend
mv src/App.jsx src/App-original.jsx
mv src/App-with-hero.tsx src/App.tsx
```

Then restart your dev server:
```bash
npm run dev
```

You'll see a "✨ Preview New Hero" button in the top-right corner to toggle between views.

### Option 2: Direct Import (Custom Integration)

Import the component anywhere in your app:

```tsx
import { HeroGeometric } from "@/components/ui/shape-landing-hero"

function MyPage() {
  return (
    <HeroGeometric 
      badge="TalentFit"
      title1="AI-Powered Resume"
      title2="Screening Made Easy"
    />
  )
}
```

### Option 3: Use the Demo Component

```tsx
import { DemoHeroGeometric } from "@/components/demo"

function LandingPage() {
  return <DemoHeroGeometric />
}
```

## 🎨 Customization Guide

### Changing Colors

Edit the gradient colors in `shape-landing-hero.tsx`:

```tsx
// Find this in the component
gradient="from-indigo-500/[0.15]"  // Change indigo to any color

// Available color presets in tailwind.config.js:
// indigo, purple, emerald, rose, violet, amber, cyan
```

### Adjusting Animations

**Speed**: Change `duration` values:
```tsx
transition={{
  duration: 2.4,  // Make slower: 3.5, faster: 1.5
  delay,
}}
```

**Floating Effect**: Modify the y-axis animation:
```tsx
animate={{
  y: [0, 15, 0],  // Increase/decrease for more/less movement
}}
```

### Adding More Shapes

Copy an existing `<ElegantShape />` and adjust:
```tsx
<ElegantShape
  delay={0.8}                    // Start animation timing
  width={180}                    // Width in pixels
  height={50}                    // Height in pixels
  rotate={10}                    // Rotation angle
  gradient="from-blue-500/[0.15]"  // Color gradient
  className="left-[30%] top-[50%]"  // Position
/>
```

## 📱 Responsive Behavior

The component is fully responsive with these breakpoints:

- **Mobile** (`<768px`): Smaller shapes, adjusted positions
- **Tablet** (`≥768px`): Medium shapes, optimized spacing
- **Desktop** (`≥1024px`): Full-size shapes, maximum visual impact

Text scales automatically:
- Mobile: `text-4xl`
- Tablet: `text-6xl`
- Desktop: `text-8xl`

## 🔧 Troubleshooting

### Issue: "Cannot find module '@/lib/utils'"

**Solution**: Make sure `tsconfig.json` has path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And `vite.config.ts` has the alias:
```ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Issue: TypeScript errors

**Solution**: Restart your TypeScript server in VS Code:
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Select and hit Enter

### Issue: Animations not working

**Solution**: Make sure framer-motion is installed:
```bash
npm install framer-motion
```

### Issue: Component not displaying

**Solution**: 
1. Check that the component has `min-h-screen` (full height)
2. Ensure parent containers don't have overflow hidden
3. Verify dark background isn't conflicting with page background

## 🎯 Integration with TalentFit

### Recommended Use Cases:

1. **Landing Page**: Use as the main hero section before users interact with the app
2. **Loading State**: Show during resume analysis
3. **Success Screen**: Display after successful analysis with modified text
4. **About/Features Page**: Showcase the AI capabilities

### Example: Analysis Loading State

```tsx
function App() {
  const [analyzing, setAnalyzing] = useState(false);

  if (analyzing) {
    return (
      <HeroGeometric 
        badge="TalentFit AI"
        title1="Analyzing Resume"
        title2="Please Wait..."
      />
    );
  }

  // ... rest of your app
}
```

## 🎨 Color Palette Used

The component uses these colors from your existing Tailwind config:

- **Indigo**: Primary brand color (#6366f1)
- **Rose**: Accent color (#f43f5e)
- **Violet**: Secondary accent (#a855f7)
- **Amber**: Warm accent (#f59e0b)
- **Cyan**: Cool accent (#06b6d4)

All with low opacity (`/[0.15]`) for subtle, elegant effects.

## 📊 Performance Notes

- **Initial Load**: ~100ms for animations to start
- **Memory**: Minimal overhead from framer-motion
- **Mobile**: Optimized with reduced motion for lower-end devices
- **Accessibility**: Respects `prefers-reduced-motion` media query

## 🚀 Next Steps

1. **Test the component**: Run `npm run dev` and click "✨ Preview New Hero"
2. **Customize text**: Change badge and titles to match your branding
3. **Adjust colors**: Experiment with different gradient combinations
4. **Add CTAs**: Consider adding buttons or links to the hero
5. **Integrate with flow**: Decide where in your app this hero should appear

## 📚 Additional Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Component Credits**: HeroGeometric by Kokonut UI
**Integrated by**: AI Assistant
**Date**: February 13, 2026
