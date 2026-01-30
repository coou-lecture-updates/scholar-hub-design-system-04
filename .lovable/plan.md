

# Plan: Remove Dark Mode Feature

## Summary
Completely remove the dark mode feature and its toggle switch from the application, reverting to a light-only theme.

---

## Files to Modify

### 1. Delete Dark Mode Toggle Component
**File**: `src/components/ui/dark-mode-toggle.tsx`
- **Action**: Delete this file entirely

---

### 2. Remove ThemeProvider from Main Entry
**File**: `src/main.tsx`

**Current code**:
```tsx
import { ThemeProvider } from 'next-themes'

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

**Updated code**:
```tsx
createRoot(document.getElementById("root")!).render(<App />);
```

- Remove `ThemeProvider` import
- Render `<App />` directly without the wrapper

---

### 3. Remove Toggle from Navbar
**File**: `src/components/layout/Navbar.tsx`

**Changes**:
- Line 8: Remove import `import { SimpleDarkModeToggle } from '@/components/ui/dark-mode-toggle';`
- Line 456: Remove `<SimpleDarkModeToggle />` from the unauthenticated user section

---

## Optional Cleanup

### 4. CSS Dark Mode Variables
**File**: `src/index.css`

The `.dark` CSS class variables can optionally be removed since they will no longer be used. This is not required for functionality but keeps the codebase clean.

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/ui/dark-mode-toggle.tsx` | Delete file |
| `src/main.tsx` | Remove ThemeProvider wrapper |
| `src/components/layout/Navbar.tsx` | Remove import and toggle component |
| `src/index.css` | (Optional) Remove `.dark` class CSS variables |

---

## Expected Outcome
- Dark mode toggle button will no longer appear in the navbar
- Application will always display in light mode
- No dark theme switching functionality
- Cleaner codebase without unused theme code

