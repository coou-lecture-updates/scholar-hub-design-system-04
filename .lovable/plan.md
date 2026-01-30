
# Plan: Dark Mode, Stats Update, and Hero Section Enhancement

## Summary
This plan addresses three specific requests:
1. Add proper dark mode support with persistent user preference
2. Change the Departments stat from 42 to 50
3. Enhance the hero section to match the uploaded reference image

---

## Changes Required

### 1. Enable Dark Mode with Persistence

**Problem**: The dark mode toggle exists but the `ThemeProvider` from `next-themes` is not wrapping the application, so the theme cannot persist or function.

**Solution**: Wrap the App with `ThemeProvider` in `main.tsx`:

```text
main.tsx changes:
- Import ThemeProvider from 'next-themes'
- Wrap the App component with ThemeProvider
- Configure with defaultTheme="system", storageKey="coou-theme"
- Enable enableSystem option for system preference detection
```

**File**: `src/main.tsx`

---

### 2. Update Departments Statistic

**Problem**: Departments value is currently 42, should be 50.

**Solution**: Simple value change in StatsCounter.

**File**: `src/components/home/StatsCounter.tsx`
- Line 54: Change `value: 42` to `value: 50`

---

### 3. Hero Section UI Enhancements

**Reference Image Analysis:**
```text
+------------------------------------------+
|                                          |
|    Welcome to Chukwuemeka                |
|    Odumegwu Ojukwu University            |
|                                          |  <- Large italic white heading
|    Stay updated with the latest news,    |
|    events, and resources for Uli and     |
|    Igbariam campuses                     |  <- Subtitle (left-aligned look)
|                                          |
|   +----------------------------------+   |
|   |  Search for courses, events,     |   |
|   |  news...                    Q    |   |  <- Rounded input with icon
|   |                                  |   |
|   |  [Search]                        |   |  <- Small blue button
|   +----------------------------------+   |
|                                          |
|   [Academic Calendar] [Student Resources]|  <- Centered quick links
|                                          |
+------------------------------------------+
```

**Changes for HeroSection.tsx:**
1. Keep the italic font styling on the heading
2. The search card should have:
   - Rounded input field (already rounded-full)
   - Search button should be smaller/left-aligned, not full-width
   - Maintain clean white card appearance
3. Quick links should remain centered below the search card
4. Ensure mobile responsive: text scales appropriately on smaller screens

**File**: `src/components/home/HeroSection.tsx`

---

## Technical Implementation Details

### File 1: `src/main.tsx`
```tsx
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider 
    attribute="class" 
    defaultTheme="system" 
    enableSystem 
    storageKey="coou-theme"
  >
    <App />
  </ThemeProvider>
);
```

### File 2: `src/components/home/StatsCounter.tsx`
- Line 54: `{ label: 'Departments', value: 50, icon: <GraduationCap className="h-8 w-8" /> }`

### File 3: `src/components/home/HeroSection.tsx`
Key styling changes:
- Search button: Change from full-width to inline, left-aligned
- Button styles: `w-auto px-8 py-3` instead of `w-full`
- Maintain the italic heading style
- Keep responsive text sizing for mobile

---

## Files to Modify

| File | Change |
|------|--------|
| `src/main.tsx` | Wrap App with ThemeProvider for dark mode persistence |
| `src/components/home/StatsCounter.tsx` | Change Departments from 42 to 50 |
| `src/components/home/HeroSection.tsx` | Refine search card layout to match reference |

---

## Expected Outcome

After implementation:
- Dark mode toggle will properly switch themes
- Theme preference persists in localStorage (`coou-theme` key)
- System preference detection works automatically
- Departments stat shows "50"
- Hero section matches the clean, professional look from the reference image
- Mobile and desktop layouts both work correctly
