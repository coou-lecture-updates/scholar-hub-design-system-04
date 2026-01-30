
# Plan: Hero Section Restoration and Dark Mode Fix

## Summary
This plan addresses two issues:
1. Restore the hero section to match the "before" design (image-15)
2. Fix dark mode to apply properly across all pages by replacing hardcoded colors with semantic Tailwind classes

---

## Issue 1: Hero Section Differences

### Analysis of Before vs Now

| Element | BEFORE (Desired) | NOW (Current) |
|---------|------------------|---------------|
| Title | 2 lines, larger text | 4 lines, wrapping too much |
| Subtitle | Left-aligned under title | Centered |
| Search Card | Wider, more spacious | Narrower |
| Search Button | Small, left-aligned in card | Small, centered |
| Quick Links | Semi-transparent outline style | Solid blue background |

### Changes for HeroSection.tsx

1. **Title**: Remove `text-center` from parent, use left alignment on larger screens
2. **Title sizing**: Increase minimum text size so it fits on fewer lines
3. **Subtitle**: Left-align to match the reference
4. **Search Card**: Make wider with `max-w-3xl` instead of `max-w-2xl`
5. **Quick Links**: Keep the semi-transparent outline style (current is correct)

---

## Issue 2: Dark Mode Not Updating All Pages

### Root Cause
The `Navbar.tsx` component uses hardcoded colors that don't respond to dark mode:
- Line 217: `bg-white` should be `bg-card`
- Line 230: `text-gray-700` should be `text-foreground`
- Line 141: `text-blue-700` should be `text-primary`

### Components to Fix

**File: `src/components/layout/Navbar.tsx`**
- Replace `bg-white` with `bg-card`
- Replace `text-gray-700` with `text-foreground`
- Replace `text-blue-700` with `text-primary`

**File: `src/components/layout/Footer.tsx`**
- Ensure all colors use semantic tokens or have `dark:` variants

---

## Technical Implementation

### File 1: `src/components/home/HeroSection.tsx`

Key changes to match "before" design:
```text
Current:
- max-w-3xl mx-auto text-center

Change to:
- max-w-4xl mx-auto (wider container)
- Title and subtitle left-aligned on larger screens
- Search card wider (max-w-3xl)
```

The title should read on 2 lines like:
"Welcome to Chukwuemeka Odumegwu Ojukwu University"
Instead of 4 lines.

### File 2: `src/components/layout/Navbar.tsx`

Replace hardcoded colors:
- Line 217: `bg-white` -> `bg-card`
- Line 230: `text-gray-700` -> `text-foreground`
- Line 141: `text-blue-700` -> `text-primary`
- All mobile menu colors need the same treatment

### File 3: `src/index.css`

Add dark mode sidebar variables to the `.dark` section:
```css
--sidebar-background: 224 71% 4%;
--sidebar-foreground: 213 31% 91%;
--sidebar-primary: 210 40% 98%;
--sidebar-primary-foreground: 222.2 47.4% 1.2%;
--sidebar-accent: 216 34% 17%;
--sidebar-accent-foreground: 210 40% 98%;
--sidebar-border: 216 34% 17%;
--sidebar-ring: 216 34% 17%;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Restore layout to "before" design - wider container, left-aligned text on desktop |
| `src/components/layout/Navbar.tsx` | Replace hardcoded colors with semantic Tailwind classes |
| `src/index.css` | Add dark mode sidebar CSS variables |

---

## Expected Outcome

After implementation:
1. Hero section will match the "before" reference image:
   - Title displays on 2 lines (not 4)
   - Subtitle is left-aligned under title
   - Search card is wider and more spacious
2. Dark mode will properly update:
   - Navbar will use dark backgrounds and light text in dark mode
   - All pages will correctly respond to theme toggle
   - Footer will maintain proper contrast in both modes
