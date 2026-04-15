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

---

## 3. Category / Filter Button Bars

Both the Exercise Library page and the Exercise Library modal inside Workout Template use a row of category filter buttons. The lists are nearly identical (muscle group names), but the components are written separately.

| Component | Location | Filter Set |
|---|---|---|
| `ExerciseFilterBar` | ExerciseLibraryPage | ALL, CHEST, BACK, LEGS, SHOULDERS, BICEPS, TRICEPS, ABS |
| Filter `<select>` in `ExerciseLibraryModal` | WorkoutTemplate > CustomCreatorView | ALL, CHEST, BACK, SHOULDERS, ARMS, LEGS, ABS, CARDIO |

### Current Examples

```jsx
// ExerciseFilterBar.jsx — renders pill buttons
function ExerciseFilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="el-filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`el-filter-btn${activeFilter === f ? ' active' : ''}`}
          onClick={() => onFilterChange(f)}
        >{f}</button>
      ))}
    </div>
  );
}

// ExerciseLibraryModal.jsx — renders a <select> for the same purpose
<select
  className="wt-library-filter"
  value={libraryFilter}
  onChange={(e) => onFilterChange(e.target.value)}
>
  {BODY_PARTS.map((bp) => (
    <option key={bp} value={bp}>{bp}</option>
  ))}
</select>
```

### What a Common `CategoryFilterBar` Could Look Like
```jsx
// components/common/CategoryFilterBar.jsx
function CategoryFilterBar({ options, activeFilter, onFilterChange, className = '' }) {
  return (
    <div className={`filter-bar ${className}`}>
      {options.map((opt) => (
        <button
          key={opt}
          className={`filter-btn${activeFilter === opt ? ' active' : ''}`}
          onClick={() => onFilterChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilterBar;
```

---

## 4. Numeric Stepper (Edit-in-place)

`HeightStepper` and `WeightStepper` in the Account page are structurally identical. Both have `−` / `+` buttons, a value display that turns into an inline `<input>` when clicked, unit-aware formatting, and a save-on-blur / Enter key handler.

| Component | Value | Unit Conversion |
|---|---|---|
| `HeightStepper` | `heightInches` | inches ↔ cm |
| `WeightStepper` | `weightLbs` | lbs ↔ kg |

### What a Common `NumericStepper` Could Look Like
```jsx
// components/common/NumericStepper.jsx
function NumericStepper({ label, displayValue, onIncrement, onDecrement, editingValue, isEditing, onStartEdit, onChange, onSave, onKey }) {
  return (
    <div className="account-stat-cell">
      <div className="account-stat-label">{label}</div>
      <div className="account-stat-stepper">
        <button className="account-step-btn" onClick={onDecrement} aria-label="Decrease">−</button>
        {isEditing ? (
          <input
            className="account-stat-input"
            value={editingValue}
            onChange={onChange}
            onBlur={onSave}
            onKeyDown={onKey}
            autoFocus
          />
        ) : (
          <span
            className="account-stat-val account-stat-val--tap"
            onClick={onStartEdit}
            title="Tap to edit"
          >
            {displayValue}
          </span>
        )}
        <button className="account-step-btn" onClick={onIncrement} aria-label="Increase">+</button>
      </div>
    </div>
  );
}

export default NumericStepper;
```

---

## 5. Exercise / Workout Cards

Template cards in `TemplatesView` and saved workout cards (`SavedWorkoutCard`) in `CustomCreatorView` share almost the same card shell: a title, a subtitle label, an exercise count badge, and one or more action buttons. The only differences are the set of buttons and the expandable exercise list unique to saved cards.

| Component | Title Source | Badge | Actions |
|---|---|---|---|
| Template card (inline in `TemplatesView`) | `template.name` | exercise count | Use Template |
| `SavedWorkoutCard` | `workout.name` | exercise count | View / Customize / Begin / Delete |

### Current Template Card (inline JSX in `TemplatesView.jsx`)
```jsx
<article key={template.id} className="wt-template-card">
  <h2>{template.name}</h2>
  <p>{template.description}</p>
  <span>{template.exercises?.length ?? 0} EXERCISES</span>
  <button className="btn wt-btn-full" onClick={() => openTemplate(template)}>
    Use Template
  </button>
</article>
```

### What a Common `WorkoutCard` Could Look Like
```jsx
// components/common/WorkoutCard.jsx
function WorkoutCard({ title, subtitle, exerciseCount, actions, children }) {
  return (
    <article className="wt-template-card">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      <span>{exerciseCount} EXERCISES</span>
      <div className="wt-card-actions">
        {actions}
      </div>
      {children}
    </article>
  );
}

export default WorkoutCard;
```

---


## 6. Modal / Overlay Pattern

Three separate components implement the same backdrop-overlay-panel structure independently. All share: a dark backdrop `div`, a nested content panel, a close `✕`/`×` button, and click-outside-to-close logic. Only `ExerciseModal` adds an Escape-key listener.

| Component | Backdrop class | Close trigger |
|---|---|---|
| `ExerciseModal` | `el-modal-backdrop` + `el-modal-overlay` | backdrop click + Escape key |
| `TemplateDetailPanel` | `wt-detail-overlay` | backdrop click |
| `ExerciseLibraryModal` | `wt-library-overlay` | backdrop click |

### Current Examples (close button + backdrop)
```jsx
// ExerciseModal.jsx
<div className="el-modal-backdrop" role="dialog" aria-modal="true">
  <div className="el-modal-overlay" onClick={onClose} />
  <div className="el-modal-content">
    <button className="el-modal-close" onClick={onClose} aria-label="Close">&times;</button>
    {/* content */}
  </div>
</div>

// TemplateDetailPanel.jsx
<div className="wt-detail-overlay" onClick={onClose}>
  <div className="wt-detail-panel" onClick={(e) => e.stopPropagation()}>
    <button className="wt-detail-close" onClick={onClose} aria-label="Close">✕</button>
    {/* content */}
  </div>
</div>
```

### What a Common `ModalShell` Could Look Like
```jsx
// components/common/ModalShell.jsx
import { useEffect } from 'react';

function ModalShell({ onClose, ariaLabel, className = '', children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="modal-overlay" onClick={onClose} />
      <div className={`modal-panel ${className}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        {children}
      </div>
    </div>
  );
}

export default ModalShell;
```

---

## 7. Trend Chart Section

`PerformanceTrends` and `NutritionTrends` are structurally nearly identical. Both register the same Chart.js modules, use the same `CHART_OPTIONS` shape (same grid/tick colors), share the same outer `progress-tracker` section layout, the same time-filter button row, and the same loading/error/empty/data conditional block inside `chart-container`. The only structural difference is that `NutritionTrends` adds macro-toggle buttons and `PerformanceTrends` adds a search form.
6
```jsx
// PerformanceTrends.jsx — chart-container block
<div className="chart-container">
  {!exerciseName && !loading && <div className="trends-empty">Enter an exercise name…</div>}
  {loading && <div className="trends-empty">Loading…</div>}
  {!loading && error && <div className="trends-empty trends-error">{error}</div>}
  {!loading && !error && filteredPoints.length === 0 && <div className="trends-empty">No data…</div>}
  {!loading && !error && filteredPoints.length > 0 && <Line data={chartData} options={CHART_OPTIONS} />}
</div>

// NutritionTrends.jsx — identical structure
<div className="chart-container">
  {loading && <div className="trends-empty">Loading…</div>}
  {!loading && error && <div className="trends-empty trends-error">{error}</div>}
  {!loading && !error && filteredPoints.length === 0 && <div className="trends-empty">No data…</div>}
  {!loading && !error && filteredPoints.length > 0 && <Line data={chartData} options={CHART_OPTIONS} />}
</div>
```

### What a Common `TrendChartSection` Could Look Like
```jsx
// components/common/TrendChartSection.jsx
import { Line } from 'react-chartjs-2';

const SHARED_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#222' }, ticks: { color: '#888' } },
    x: { grid: { display: false }, ticks: { color: '#888' } },
  },
};

function TrendChartSection({ title, filterOptions, activeFilter, onFilterChange, loading, error, hasData, chartData, emptyMessage, chartOptions, extraControls }) {
  return (
    <section className="progress-tracker">
      <div className="progress-header">
        <h2>{title}</h2>
        <div className="time-filters">
          {filterOptions.map(({ key, label }) => (
            <button
              key={key}
              className={`filter-btn${activeFilter === key ? ' active' : ''}`}
              onClick={() => onFilterChange(key)}
            >{label}</button>
          ))}
        </div>
      </div>

      {extraControls}

      <div className="chart-container">
        {loading && <div className="trends-empty">Loading…</div>}
        {!loading && error && <div className="trends-empty trends-error">{error}</div>}
        {!loading && !error && !hasData && <div className="trends-empty">{emptyMessage}</div>}
        {!loading && !error && hasData && (
          <Line data={chartData} options={chartOptions ?? SHARED_CHART_OPTIONS} />
        )}
      </div>
    </section>
  );
}

export default TrendChartSection;
```

---

## 8. Exercise Muscle/Equipment Badge Pair

The same two-badge pattern (`muscle_group` + `equipment`) is rendered inline in five separate places, each with slightly different class names but identical conditional logic.

| Component | Badge classes |
|---|---|
| `exerciseLibrary/ExerciseCard` | `el-badge el-badge-muscle` / `el-badge el-badge-equipment` |
| `exerciseLibrary/ExerciseModal` | `el-badge el-badge-muscle` / `el-badge el-badge-equipment` |
| `activeWorkout/ExerciseCard` | `aw-badge aw-badge-muscle` / `aw-badge aw-badge-equip` |
| `workoutTemplate/TemplateDetailPanel` | inline text joined with ` · ` |
| `workoutTemplate/ExerciseLibraryModal` | inline text joined with ` · ` |

### Current Example (repeated in each)
```jsx
{exercise.muscle_group && (
  <span className="el-badge el-badge-muscle">{exercise.muscle_group}</span>
)}
{exercise.equipment && (
  <span className="el-badge el-badge-equipment">{exercise.equipment}</span>
)}
```

### What a Common `ExerciseBadges` Could Look Like
```jsx
// components/common/ExerciseBadges.jsx
function ExerciseBadges({ muscleGroup, equipment, badgeClass = 'badge' }) {
  if (!muscleGroup && !equipment) return null;
  return (
    <div className="exercise-badges">
      {muscleGroup && <span className={`${badgeClass} badge-muscle`}>{muscleGroup}</span>}
      {equipment && <span className={`${badgeClass} badge-equipment`}>{equipment}</span>}
    </div>
  );
}

export default ExerciseBadges;
```

---

## 9. Auth Form Text Field

Both `LoginPage` and `SignUpPage` repeat the same `<div className="auth-field"><label>…</label><input … /></div>` wrapper for plain text/email fields. `PasswordInput` is already abstracted, but the plain text field wrapper is the remaining inline repetition inside auth forms.

```jsx
// LoginPage.jsx
<div className="auth-field">
  <label>Email</label>
  <input type="email" placeholder="name@email.com" value={email} onChange={...} required />
</div>

// SignUpPage.jsx — same pattern twice (Full Name + Email)
<div className="auth-field">
  <label>Full Name</label>
  <input type="text" placeholder="Jane Doe" value={form.name} onChange={update('name')} required />
</div>
```

### What a Common `AuthField` Could Look Like
```jsx
// components/auth/AuthField.jsx
function AuthField({ label, type = 'text', placeholder, value, onChange }) {
  return (
    <div className="auth-field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} required />
    </div>
  );
}

export default AuthField;
```
---