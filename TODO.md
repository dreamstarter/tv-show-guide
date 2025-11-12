# TV Show Guide - Task Tracking

> **Project Status:** Phase 2 - Component Architecture
> **Last Updated:** November 12, 2025

## 🎯 Current Sprint: Component Architecture

### 🔴 High Priority - In Progress

- [ ] **Create BaseComponent foundation class** `@high @foundation`
  - [ ] Define abstract BaseComponent class with TypeScript
  - [ ] Implement constructor with props handling
  - [ ] Add lifecycle methods: `render()`, `mount()`, `unmount()`
  - [ ] Add event listener management with `addEventListener()` wrapper
  - [ ] Add `destroy()` method for cleanup
  - [ ] Add `update(props)` method for re-rendering
  - **Files:** `src/components/BaseComponent.ts`
  - **Dependencies:** None
  - **Estimated Time:** 1-2 hours

### 🟡 Medium Priority - Ready to Start

- [ ] **Create ShowCard component** `@medium @component`
  - [ ] Extend BaseComponent
  - [ ] Display show title with returning/ended status styling
  - [ ] Add platform chip (Hulu/Peacock/Paramount)
  - [ ] Add network badge
  - [ ] Display season info (S#: start date - end date)
  - [ ] Add air day display
  - [ ] Add edit button with click handler
  - **Files:** `src/components/ShowCard.ts`
  - **Dependencies:** BaseComponent
  - **Estimated Time:** 2-3 hours

- [ ] **Create FilterControls component** `@medium @component`
  - [ ] Extend BaseComponent
  - [ ] Add platform checkboxes (Hulu, Peacock, Paramount)
  - [ ] Add "Show Non-Returning" toggle
  - [ ] Add "Use Estimates" toggle
  - [ ] Add network estimate checkboxes (ABC, NBC, CBS, FOX)
  - [ ] Wire up to ReactiveShowManager filter methods
  - [ ] Add filter change event handlers
  - **Files:** `src/components/FilterControls.ts`
  - **Dependencies:** BaseComponent, ReactiveShowManager
  - **Estimated Time:** 2-3 hours

- [ ] **Create SearchBox component** `@medium @component`
  - [ ] Extend BaseComponent
  - [ ] Add search input field
  - [ ] Add clear button
  - [ ] Implement debounced search (300ms delay)
  - [ ] Display search results count
  - [ ] Add search term highlighting capability
  - [ ] Wire to ReactiveShowManager search
  - **Files:** `src/components/SearchBox.ts`
  - **Dependencies:** BaseComponent, ReactiveShowManager, debounce utility
  - **Estimated Time:** 2 hours

- [ ] **Create StatsDisplay component** `@medium @component`
  - [ ] Extend BaseComponent
  - [ ] Display total shows count
  - [ ] Display returning vs non-returning breakdown
  - [ ] Display shows by platform (Hulu, Peacock, Paramount)
  - [ ] Display shows by network (ABC, NBC, CBS, FOX)
  - [ ] Subscribe to ReactiveShowManager stats
  - [ ] Auto-update on state changes
  - **Files:** `src/components/StatsDisplay.ts`
  - **Dependencies:** BaseComponent, ReactiveShowManager
  - **Estimated Time:** 2 hours

- [ ] **Create WeekNavigator component** `@medium @component`
  - [ ] Extend BaseComponent
  - [ ] Add previous week button
  - [ ] Add "This Week" button
  - [ ] Add next week button
  - [ ] Add jump to date picker
  - [ ] Add week range display
  - [ ] Wire to ReactiveShowManager week offset methods
  - [ ] Subscribe to week offset changes
  - **Files:** `src/components/WeekNavigator.ts`
  - **Dependencies:** BaseComponent, ReactiveShowManager
  - **Estimated Time:** 2 hours

### 🟢 Low Priority - Blocked

- [ ] **Create WeekViewTable component** `@low @component @blocked`
  - [ ] Extend BaseComponent
  - [ ] Render weekly schedule grid
  - [ ] Add day columns (Sunday - Saturday)
  - [ ] Group shows by day
  - [ ] Display show count per day
  - [ ] Use ShowCard for individual shows
  - [ ] Handle empty days gracefully
  - **Files:** `src/components/WeekViewTable.ts`
  - **Dependencies:** BaseComponent, ShowCard, ReactiveShowManager
  - **Blocked by:** ShowCard component
  - **Estimated Time:** 3-4 hours

- [ ] **Create LegendTable component** `@low @component @blocked`
  - [ ] Extend BaseComponent
  - [ ] Display master list of all shows
  - [ ] Use ShowCard components for rendering
  - [ ] Add sorting capability (by platform, network, title)
  - [ ] Subscribe to filtered shows from ReactiveShowManager
  - [ ] Handle search term highlighting
  - **Files:** `src/components/LegendTable.ts`
  - **Dependencies:** BaseComponent, ShowCard, ReactiveShowManager
  - **Blocked by:** ShowCard component
  - **Estimated Time:** 2-3 hours

### 🔵 Integration Phase

- [ ] **Refactor DOMIntegration to use components** `@integration @refactor`
  - [ ] Create component factory/registry
  - [ ] Replace `renderAllShows()` with LegendTable component
  - [ ] Replace `renderWeekView()` with WeekViewTable component
  - [ ] Replace `renderLegend()` with LegendTable component
  - [ ] Replace filter rendering with FilterControls component
  - [ ] Replace search rendering with SearchBox component
  - [ ] Add component lifecycle management
  - [ ] Ensure proper cleanup on view changes
  - **Files:** `src/core/DOMIntegration.ts`
  - **Dependencies:** All components above
  - **Estimated Time:** 3-4 hours

- [ ] **Add component lifecycle testing** `@testing @quality`
  - [ ] Create manual test page (test.html)
  - [ ] Test component mounting
  - [ ] Test component updating
  - [ ] Test component unmounting
  - [ ] Test event listener cleanup
  - [ ] Check for memory leaks (Chrome DevTools)
  - [ ] Verify ReactiveShowManager subscriptions cleanup
  - **Files:** `tests/components.test.html`, `tests/component-tests.ts`
  - **Dependencies:** All components
  - **Estimated Time:** 2-3 hours

---

## ✅ Completed Tasks

### Phase 1: Foundation (Completed Nov 2025)
- [x] TypeScript conversion with full compilation
- [x] Module system (core/, state/, types/, utils/)
- [x] Error handling & validation
- [x] Enhanced CSS with animations
- [x] Mobile-optimized UI

### Phase 2: State Management (Completed Nov 2025)
- [x] StateManager with reactive observers
- [x] Computed properties with caching
- [x] Undo/redo functionality (50 action history)
- [x] localStorage persistence
- [x] ReactiveShowManager wrapper
- [x] Application integration
- [x] DOMIntegration reactive subscriptions
- [x] Undo/redo UI controls with keyboard shortcuts
- [x] Week navigation controls with date filtering

---

## 📊 Sprint Metrics

**Total Tasks:** 10
**Completed:** 0
**In Progress:** 0
**Blocked:** 2
**Estimated Total Time:** 22-28 hours

**Current Focus:** BaseComponent foundation

---

## 🐛 Known Issues

- [ ] Three shows missing start dates (911 Lonestar, High County, Will Trent)
- [ ] Week view shows same data across weeks (expected: overlapping season dates)

---

## 💡 Future Enhancements (Backlog)

### Testing Framework
- [ ] Setup Vitest for unit testing
- [ ] Add test coverage for StateManager
- [ ] Add test coverage for ReactiveShowManager
- [ ] Add integration tests

### PWA Features
- [ ] Service worker for offline support
- [ ] Manifest.json for installation
- [ ] Push notifications for show reminders

### Advanced Features
- [ ] Fuzzy search implementation
- [ ] Show statistics charts
- [ ] Export to multiple formats (CSV, PDF)
- [ ] TMDB API integration
- [ ] Calendar integration

---

## 📝 Notes

- **Component Pattern:** All components extend BaseComponent for consistency
- **Naming Convention:** PascalCase for component classes, kebab-case for CSS classes
- **File Structure:** One component per file in `src/components/`
- **Testing Strategy:** Manual testing first, automated tests in Phase 3
- **Code Review:** Self-review before committing, use TypeScript strict mode

---

## 🔗 Quick Links

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Full roadmap
- [README.md](./README.md) - Project overview
- [src/components/](./src/components/) - Component directory

---

*Last sprint review: N/A*
*Next sprint planning: After Component Architecture completion*
