
# Technical Specification: Workout Template Module (custom_template.html)

### 1. Module Overview

The **Workout Template** serves as the central interface for workout management. It is architected as a dual-mode view that allows users to toggle between pre-defined workout templates and a dynamic custom routine creator. The module maintains the "High-Density" dark theme established in the project's global design tokens.

### 2. UI/UX Architecture

* **Hero Static Branding**: Unlike the landing page's dynamic slideshow, this module uses a static, high-contrast hero section with a linear-gradient overlay for improved legibility of the "Workout Template" title.
* **View Switcher (State Management)**: A custom-built horizontal toggle controls the visibility of the "Templates" and "Custom Creator" views. This is implemented using a CSS-driven active state and a JavaScript `switchView` function that modifies the `display` properties of content containers.
* **Visual Hierarchy**:
* **Templates View**: Uses a responsive CSS Grid (`auto-fill`) to present routine cards.
* **Custom Creator View**: Implements a structured table-based layout for data entry, ensuring high information density and ease of input for sets, reps, and rest periods.



### 3. Functional Logic & Interactivity

* **Dynamic DOM Manipulation**: The "Custom Creator" utilizes a JavaScript engine to handle routine construction:
* `addRow()`: Dynamically injects new table rows into the `exerciseBody` container, allowing for an unlimited number of exercises per routine.
* **Inline Deletion**: Each row includes a removal hook that allows users to prune exercises from the list without reloading the page.


* **Input Handling**: Standardized form controls are styled with a dark background and a `#333333` border to integrate seamlessly into the high-contrast environment.
* **Exercise Library Hook**: The "Exercise" input field is configured with an `onclick` event listener designed to trigger a modal-based exercise selection interface.

### 4. Technical Design Standards

* **Responsive Breakpoints**: The module uses fluid widths (`10%` padding) and grid layouts to ensure the interface remains functional on mobile devices while expanding to a maximum width of `1200px` on desktop displays.
* **Animation Engine**: Transitions between views are governed by a CSS `@keyframes` fade-in effect to provide a smooth, low-latency feel during navigation.
* **Typography**: Consistent with the project core, it utilizes a system-font stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`) to ensure high performance and native integration with the user's operating system.