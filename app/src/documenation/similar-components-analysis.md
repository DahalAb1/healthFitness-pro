# Similar Components Across Pages

This document identifies UI patterns that appear in multiple pages and proposes what a shared common component could look like for each pattern.

---

## 1. Page Hero / Header Sections

Every feature page has its own hero component that renders a heading and a short description sentence. They all follow the same visual formula but are defined separately.

| Component | Page | Structure |
|---|---|---|
| `WorkoutTemplateHero` | WorkoutTemplatePage | tagline + h1 + description |
| `ExerciseLibraryHero` | ExerciseLibraryPage | h1 + description |
| `HistoryHero` | HistoryPage | h1 + description |
| `NutritionHero` | NutritionPage | h1 + description + stat strip + image |

### Current Example (`ExerciseLibraryHero.jsx`)
```jsx
function ExerciseLibraryHero() {
  return (
    <section className="el-hero">
      <h1>Exercise Library</h1>
      <p>Explore our comprehensive collection of exercises for every muscle group</p>
    </section>
  );
}
```

### What a Common `PageHero` Component Could Look Like
```jsx
// components/common/PageHero.jsx
function PageHero({ tagline, title, description, className = '', children }) {
  return (
    <section className={`page-hero ${className}`}>
      {tagline && <p className="page-hero-tagline">{tagline}</p>}
      <h1>{title}</h1>
      {description && <p className="page-hero-description">{description}</p>}
      {children}
    </section>
  );
}

export default PageHero;
```

**Usage across pages:**
```jsx
// WorkoutTemplatePage
<PageHero tagline="Training Hub" title="Workout Template"
  description="Choose from our expertly crafted workout templates or create your own custom routines." />

// ExerciseLibraryPage
<PageHero title="Exercise Library"
  description="Explore our comprehensive collection of exercises for every muscle group" />

// HistoryPage
<PageHero title="History"
  description="Your fitness journey at a glance. Select a day to review specific session data or analyze trends below." />
```

---
## 2. Page Shell (Navbar + Footer Wrapper)

Six of the nine pages use the exact same `<Navbar /> ... <Footer />` wrapper pattern. Only `ActiveWorkoutPage` already abstracts this into `WorkoutPageShell` — the other pages repeat the pattern inline.

| Page | Pattern |
|---|---|
| `FrontPage` | `<Navbar />` + sections + `<Footer />` inline |
| `WorkoutTemplatePage` | `<Navbar />` + content + `<Footer />` inline |
| `ExerciseLibraryPage` | `<Navbar />` + content + `<Footer />` inline |
| `NutritionPage` | `<Navbar />` + content + `<Footer />` inline |
| `HistoryPage` | `<Navbar />` + content + `<Footer />` inline |
| `AccountPage` | `<Navbar />` + content (no Footer) |
| `ActiveWorkoutPage` | ✅ Uses `WorkoutPageShell` |

### Current Example (`WorkoutPageShell.jsx` — the existing abstraction)
```jsx
// components/activeWorkout/WorkoutPageShell.jsx
function WorkoutPageShell({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
```

### What a Shared `PageShell` in `common/` Could Look Like
```jsx
// components/common/PageShell.jsx
function PageShell({ children, showFooter = true }) {
  return (
    <>
      <Navbar />
      {children}
      {showFooter && <Footer />}
    </>
  );
}

export default PageShell;
```

**Usage:**
```jsx
// NutritionPage (currently repeats Navbar/Footer)
function NutritionPage() {
  return (
    <PageShell>
      <NutritionHub />
    </PageShell>
  );
}

// AccountPage (no footer)
function AccountPage() {
  return (
    <PageShell showFooter={false}>
      <div className="account-page">...</div>
    </PageShell>
  );
}
```

