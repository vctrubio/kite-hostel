# TODO List

## 🔧 Real-time User Role Updates
- [ ] **Fix UserNav and /app/user/ not updating after user wallet changes**
  - Issue: `router.refresh()` doesn't update UserWalletProvider context
  - Current: Works in references form, but UserNav/user page show stale role
  - Solution needed: Either fix real-time subscription or find alternative sync method

## 📊 Complete Admin Dashboard Tables
- [ ] **Finish up all entity tables for admin dashboard**
  - [ ] **Create DRY getters for multiple entities**
    - Extract common query patterns into reusable functions
    - Implement consistent filtering and sorting logic
    - Reduce code duplication across entity actions
  - [ ] **Enhance dropdown consistency in row components**
    - Standardize dropdown styling and behavior
    - Ensure consistent interaction patterns across all entity rows
    - Improve UX with better hover states and animations

## 🎨 Global Design System
- [ ] **Pick better global Tailwind colors for app**
  - Review current color scheme for consistency
  - Choose professional color palette
  - Update global CSS variables and theme configuration
  - Ensure proper contrast ratios for accessibility