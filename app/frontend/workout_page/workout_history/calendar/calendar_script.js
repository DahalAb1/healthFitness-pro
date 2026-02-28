// interactive logic for calendar.html
const workoutData = {
    '2026-02-17': {
        title: 'Heavy Push Day',
        time: '08:00 AM',
        notes: 'Bench Press, OHP, Triceps',
        status: 'planned'
    },
    '2026-02-18': {
        title: 'Leg Day',
        time: '06:00 PM',
        notes: 'Squats, Lunges, Leg Press',
        status: 'planned'
    }
};

const padded = n => String(n).padStart(2,'0');
let today = new Date();
const todayStr = `${today.getFullYear()}-${padded(today.getMonth()+1)}-${padded(today.getDate())}`;
let currentDate = new Date();
let selectedDate = todayStr;

const monthNameEl = document.getElementById('monthName');
const monthGrid = document.getElementById('monthGrid');
const selectedDateHeader = document.getElementById('selectedDateHeader');
const selectedDaySection = document.getElementById('selectedDaySection');
const bottomPlaceholder = document.getElementById('bottomPlaceholder');

function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
}
function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function renderCalendar() {
    monthNameEl.textContent = dateToMonthName(currentDate).toUpperCase();
    monthGrid.innerHTML = '';
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
        const div = document.createElement('div');
        div.className='day-header';
        div.textContent = d;
        monthGrid.appendChild(div);
    });

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    for (let i=0; i<firstDay; i++) {
        const empty = document.createElement('div');
        empty.className='day-cell empty';
        monthGrid.appendChild(empty);
    }
    for (let d=1; d<=daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className='day-cell';
        const dateStr = `${currentDate.getFullYear()}-${padded(currentDate.getMonth()+1)}-${padded(d+1)}`;
        if (dateStr === selectedDate) cell.classList.add('selected');
        if (dateStr === todayStr) cell.classList.add('today');
        cell.textContent = d;
        cell.addEventListener('click', () => {
            selectedDate = dateStr;
            renderCalendar();
            renderSelected();
        });
        monthGrid.appendChild(cell);
    }
}

function renderSelected() {
    const dt = new Date(selectedDate);
    selectedDateHeader.textContent = `SELECTED DATE: ${dt.toLocaleDateString('en-US',{ month:'short', day:'2-digit', year:'numeric'})}`;
    const workout = workoutData[selectedDate];
    const canEdit = selectedDate >= todayStr; // allow editing today or future
    if (workout) {
        if (selectedDate < todayStr) {
            // past workout, show view description box with a button
            selectedDaySection.innerHTML = `<h3 id="selectedDateHeader">${selectedDateHeader.textContent}</h3>
                <div class="no-workout view-box">
                    <p><strong>${workout.title}</strong> &mdash; ${workout.time}</p>
                    <p>${workout.notes}</p>
                    <button id="viewBtn" class="start-btn">VIEW WORKOUT</button>
                </div>`;
            document.getElementById('viewBtn').addEventListener('click', () => {
                alert('Viewing workout for ' + selectedDate);
            });
        } else {
            // today/future workout
            selectedDaySection.innerHTML = `<h3 id="selectedDateHeader">${selectedDateHeader.textContent}</h3>
                <div class="workout-card ${workout.status}">
                    <span class="status-badge">${workout.status.charAt(0).toUpperCase()+workout.status.slice(1)}</span>
                    <time>${workout.time}</time>
                    <h4>${workout.title}</h4>
                    <p>${workout.notes}</p>
                    <div class="workout-actions">
                        <button class="edit-btn" ${canEdit ? '' : 'disabled'}>EDIT</button>
                        <button class="start-btn">START WORKOUT</button>
                    </div>
                </div>`;
        }
        bottomPlaceholder.style.display = 'none';
    } else {
        selectedDaySection.innerHTML = `<h3 id="selectedDateHeader">${selectedDateHeader.textContent}</h3>
            <div class="no-workout"><p>No workouts planned for this day</p></div>`;
        bottomPlaceholder.style.display = 'block';
        bottomPlaceholder.innerHTML = `<p>Tap "Add Workout" to create a plan for ${dt.toLocaleDateString('en-US',{ month:'short', day:'2-digit', year:'numeric'})}</p>`;
        if (canEdit) {
            bottomPlaceholder.innerHTML += `<br><button id="addBtn" class="start-btn">ADD WORKOUT</button>`;
            document.getElementById('addBtn').addEventListener('click', () => {
                alert('Add workout for ' + selectedDate);
            });
        }
    }
}

function dateToMonthName(date) {
    return date.toLocaleDateString('en-US',{ month:'long', year:'numeric'});
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-1);
    renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+1);
    renderCalendar();
});

// initial render
renderCalendar();
renderSelected();
