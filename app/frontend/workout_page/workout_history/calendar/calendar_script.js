// Calendar logic for workout_history_page.html
// This calendar now loads REAL workout history from the backend:
//   GET http://127.0.0.1:8000/workouts?user_id=1
// and shows "Completed" entries on the selected day.

const API_BASE = "http://127.0.0.1:8000";

const padded = (n) => String(n).padStart(2, "0");

// NOTE: Keep backend date keys as strings "YYYY-MM-DD".
// Avoid new Date("YYYY-MM-DD") because JS parses that as UTC and can shift a day.

function toDateKeyFromYMD(y, m1, d) {
  // y = year, m1 = 1..12, d = 1..31
  return `${y}-${padded(m1)}-${padded(d)}`;
}

function parseDateKeyLocal(dateKey) {
  // YYYY-MM-DD -> Date (local), safe because we supply y,m,d as numbers.
  const [y, m, d] = dateKey.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

function dateToMonthName(date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0=Sun
}

function getUserId() {
  // Reuse the progress tracker input if present; otherwise default to 1.
  const el = document.getElementById("progressUserId");
  const v = el ? parseInt(el.value, 10) : 1;
  return Number.isFinite(v) && v > 0 ? v : 1;
}

// --- Timezone-safe "today" key ---
function dateKeyNowInTZ(tz = "America/Chicago") {
  // Returns YYYY-MM-DD for "today" in the requested timezone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (t) => parts.find((p) => p.type === t)?.value;
  const y = get("year");
  const m = get("month");
  const d = get("day");
  return `${y}-${m}-${d}`;
}

function ymdFromDateKey(key) {
  const [y, m, d] = key.split("-").map((x) => parseInt(x, 10));
  return { y, m, d };
}

// ---- State ----
const todayStr = dateKeyNowInTZ("America/Chicago");
const { y: todayY, m: todayM } = ymdFromDateKey(todayStr);

let currentDate = new Date(todayY, todayM - 1, 1); // current month view (based on Chicago's month)
let selectedDate = todayStr;

// Map: dateKey -> array of WorkoutSession objects
let workoutsByDate = {};

// ---- DOM ----
const monthNameEl = document.getElementById("monthName");
const monthGrid = document.getElementById("monthGrid");
const selectedDateHeader = document.getElementById("selectedDateHeader");
const selectedDaySection = document.getElementById("selectedDaySection");
const bottomPlaceholder = document.getElementById("bottomPlaceholder");

const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

// ---- Backend loading ----
async function fetchWorkoutsForUser(userId) {
  const url = `${API_BASE}/workouts?user_id=${encodeURIComponent(userId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to load workouts (${res.status}). ${txt}`);
  }
  return await res.json();
}

function indexWorkoutsByDate(workouts) {
  const map = {};
  for (const w of workouts) {
    // backend returns workout_date as YYYY-MM-DD
    const key = w.workout_date;
    if (!map[key]) map[key] = [];
    map[key].push(w);
  }
  // Sort sessions per day by id (or could be time if you add it later)
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }
  return map;
}

async function reloadCalendarData() {
  // Load ALL workouts for user; filter by month client-side (simple + safe).
  // If you later add a backend "range" endpoint, you can optimize this.
  try {
    const userId = getUserId();
    const workouts = await fetchWorkoutsForUser(userId);
    workoutsByDate = indexWorkoutsByDate(workouts);
  } catch (err) {
    console.error(err);
    // Show error in placeholder area
    bottomPlaceholder.classList.remove("hidden");
    bottomPlaceholder.innerHTML = `<p style="color:#b00020;">Could not load workout history. Is the backend running at ${API_BASE}?</p>`;
    workoutsByDate = {};
  }
}

// ---- Rendering ----
function renderCalendar() {
  monthNameEl.textContent = dateToMonthName(currentDate).toUpperCase();
  monthGrid.innerHTML = "";

  ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((d) => {
    const div = document.createElement("div");
    div.className = "day-header";
    div.textContent = d;
    monthGrid.appendChild(div);
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    monthGrid.appendChild(empty);
  }

  const year = currentDate.getFullYear();
  const month1 = currentDate.getMonth() + 1; // 1..12

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "day-cell";

    // Build date key as a string (no timezone drift).
    const dateStr = toDateKeyFromYMD(year, month1, d);

    if (dateStr === selectedDate) cell.classList.add("selected");
    if (dateStr === todayStr) cell.classList.add("today");

    // mark days with workouts
    const items = workoutsByDate[dateStr] || [];
    if (items.length > 0) {
      cell.classList.add("has-workout");
      // small badge with count
      const badge = document.createElement("span");
      badge.className = "workout-badge";
      badge.textContent = String(items.length);
      cell.appendChild(badge);
    }

    const label = document.createElement("span");
    label.className = "day-number";
    label.textContent = String(d);
    cell.appendChild(label);

    cell.addEventListener("click", () => {
      selectedDate = dateStr;
      renderCalendar();
      renderSelectedDay();
    });

    monthGrid.appendChild(cell);
  }
}

function renderSelectedDay() {
  selectedDateHeader.textContent = `Selected: ${selectedDate}`;

  const items = workoutsByDate[selectedDate] || [];
  // Clear previous details (keep the header)
  selectedDaySection.querySelectorAll(".workout-card").forEach((n) => n.remove());

  if (!items.length) {
    bottomPlaceholder.classList.remove("hidden");
    bottomPlaceholder.innerHTML = `<p>No completed workouts logged for this day.</p>`;
    return;
  }

  bottomPlaceholder.classList.add("hidden");

  for (const w of items) {
    const card = document.createElement("div");
    card.className = "workout-card";
    const title = document.createElement("h4");
    title.textContent = `Completed • Workout #${w.id} • ${w.duration_minutes} min`;
    card.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "workout-meta";
    meta.textContent = `User: ${w.user_id}`;
    card.appendChild(meta);

    const exList = document.createElement("ul");
    exList.className = "exercise-list";

    const exercises = Array.isArray(w.exercises) ? w.exercises : [];
    if (!exercises.length) {
      const li = document.createElement("li");
      li.textContent = "(No exercises logged for this session)";
      exList.appendChild(li);
    } else {
      for (const ex of exercises) {
        const li = document.createElement("li");
        const wgt = ex.weight ?? 0;
        li.textContent = `${ex.exercise_name}: ${ex.sets} x ${ex.reps} @ ${wgt}`;
        exList.appendChild(li);
      }
    }

    card.appendChild(exList);
    selectedDaySection.appendChild(card);
  }
}

// ---- Navigation ----
function changeMonth(delta) {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
  renderCalendar();
  renderSelectedDay();
}

if (prevBtn) prevBtn.addEventListener("click", () => changeMonth(-1));
if (nextBtn) nextBtn.addEventListener("click", () => changeMonth(1));

// ---- Init ----
(async function init() {
  selectedDate = todayStr;

  await reloadCalendarData();
  renderCalendar();
  renderSelectedDay();

  // If the user id input changes (progress tracker input), reload calendar too.
  const uidEl = document.getElementById("progressUserId");
  if (uidEl) {
    uidEl.addEventListener("change", async () => {
      await reloadCalendarData();
      renderCalendar();
      renderSelectedDay();
    });
  }
})();