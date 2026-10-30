
// SMART CALENDAR PROJECT

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("month-year");
const selectedDateText = document.getElementById("selected-date");
const eventList = document.getElementById("event-list");
const modal = document.getElementById("event-modal");
const modalDate = document.getElementById("modal-date");
const eventForm = document.getElementById("event-form");

const today = new Date();

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

let selectedDate = null;

let events = {};

try {
    events = JSON.parse(localStorage.getItem("smartCalendarEvents")) || {};
} catch (error) {
    events = {};
}

// LIVE DIGITAL CLOCK

function updateClock() {
    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString();

    document.getElementById("today-date").textContent =
        now.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

updateClock();
setInterval(updateClock, 1000);

// SAVE EVENTS

function saveEvents() {
    localStorage.setItem(
        "smartCalendarEvents",
        JSON.stringify(events)
    );
}

// FORMAT DATE KEY

function getDateKey(year, month, day) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");

    return `${year}-${formattedMonth}-${formattedDay}`;
}

// DISPLAY CALENDAR

function renderCalendar() {
    calendar.querySelectorAll(".calendar-day").forEach(day => {
        day.remove();
    });

    const firstDay = new Date(
        currentYear,
        currentMonth,
        1
    ).getDay();

    const totalDays = new Date(
        currentYear,
        currentMonth + 1,
        0
    ).getDate();

    monthYear.textContent = new Date(
        currentYear,
        currentMonth
    ).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric"
    });

    // Empty spaces before the first day

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty";
        calendar.appendChild(emptyCell);
    }

    // Create each date

    for (let day = 1; day <= totalDays; day++) {
        const dateCell = document.createElement("div");

        dateCell.className = "calendar-day";
        dateCell.textContent = day;

        const dateKey = getDateKey(
            currentYear,
            currentMonth,
            day
        );

        // Highlight today's date

        if (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        ) {
            dateCell.classList.add("today");
        }

        // Mark dates containing reminders

        if (events[dateKey] && events[dateKey].length > 0) {
            dateCell.classList.add("has-event");
        }

        // Highlight selected date

        if (selectedDate === dateKey) {
            dateCell.classList.add("selected");
        }

        // Single-click: view reminders

        dateCell.addEventListener("click", () => {
            selectedDate = dateKey;
            renderCalendar();
            displayEvents(dateKey);
        });

        // Double-click: add a reminder

        dateCell.addEventListener("dblclick", () => {
            openModal(dateKey);
        });

        calendar.appendChild(dateCell);
    }
}

// DISPLAY REMINDERS

function displayEvents(dateKey) {
    selectedDateText.textContent = new Date(
        dateKey + "T00:00:00"
    ).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    eventList.innerHTML = "";

    const dayEvents = events[dateKey] || [];

    if (dayEvents.length === 0) {
        eventList.innerHTML = `
            <p class="empty-message">
                No reminders for this date.
                Double-click the date to add one.
            </p>
        `;
        return;
    }

    dayEvents.forEach((event, index) => {
        const item = document.createElement("div");
        item.className = "event-item";

        const title = document.createElement("h4");
        title.textContent = event.title;

        const description = document.createElement("p");
        description.textContent =
            event.description || "No description provided.";

        item.appendChild(title);
        item.appendChild(description);

        if (event.time) {
            const time = document.createElement("p");
            time.className = "event-time";
            time.textContent = "Time: " + event.time;
            item.appendChild(time);
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete Reminder";

        deleteButton.addEventListener("click", () => {
            deleteEvent(dateKey, index);
        });

        item.appendChild(deleteButton);
        eventList.appendChild(item);
    });
}

// OPEN ADD REMINDER MODAL

function openModal(dateKey) {
    selectedDate = dateKey;

    modalDate.textContent = new Date(
        dateKey + "T00:00:00"
    ).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    modal.classList.add("show");
    document.getElementById("event-title").focus();
}

// CLOSE MODAL

function closeModal() {
    modal.classList.remove("show");
    eventForm.reset();
}

document.getElementById("close-modal")
    .addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// SAVE NEW REMINDER

eventForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedDate) {
        return;
    }

    const title = document.getElementById("event-title")
        .value.trim();

    const description = document.getElementById("event-description")
        .value.trim();

    const time = document.getElementById("event-time")
        .value;

    if (!title) {
        alert("Please enter a reminder title.");
        return;
    }

    if (!events[selectedDate]) {
        events[selectedDate] = [];
    }

    events[selectedDate].push({
        title: title,
        description: description,
        time: time
    });

    saveEvents();
    closeModal();

    renderCalendar();
    displayEvents(selectedDate);
});

// DELETE REMINDER

function deleteEvent(dateKey, index) {
    const confirmed = confirm(
        "Are you sure you want to delete this reminder?"
    );

    if (!confirmed) {
        return;
    }

    events[dateKey].splice(index, 1);

    if (events[dateKey].length === 0) {
        delete events[dateKey];
    }

    saveEvents();
    renderCalendar();
    displayEvents(dateKey);
}

// PREVIOUS MONTH

document.getElementById("prev-month")
    .addEventListener("click", () => {
        currentMonth--;

        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }

        renderCalendar();
    });

// NEXT MONTH

document.getElementById("next-month")
    .addEventListener("click", () => {
        currentMonth++;

        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }

        renderCalendar();
    });

// INITIALIZE CALENDAR

renderCalendar();
