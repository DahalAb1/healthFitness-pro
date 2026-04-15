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
