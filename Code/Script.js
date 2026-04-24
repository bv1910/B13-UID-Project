let currentCell = null;
let selectedColor = 1;
let currentRole = 'student';
let swapMode = false;
let firstSwapCell = null;

function switchRole(role) {
    currentRole = role;

    // Update button states
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show/hide faculty controls
    const facultyControls = document.getElementById('faculty-controls');
    const timetable = document.getElementById('timetable');

    if (role === 'faculty') {
        facultyControls.classList.add('active');
        timetable.classList.remove('student-view');
    } else {
        facultyControls.classList.remove('active');
        timetable.classList.add('student-view');
        // Exit swap mode if active
        if (swapMode) {
            toggleSwapMode();
        }
    }
}

function toggleSwapMode() {
    swapMode = !swapMode;
    firstSwapCell = null;

    const swapInfo = document.getElementById('swap-info');
    const cells = document.querySelectorAll('.class-cell');

    if (swapMode) {
        swapInfo.classList.add('active');
        cells.forEach(cell => cell.classList.add('swap-mode'));
    } else {
        swapInfo.classList.remove('active');
        cells.forEach(cell => {
            cell.classList.remove('swap-mode');
            cell.classList.remove('selected-for-swap');
        });
    }
}

function handleCellClick(cell) {
    // Don't allow editing break or exam cells
    if (cell.classList.contains('break-cell') || cell.classList.contains('exam-cell')) {
        return;
    }

    if (currentRole === 'student') {
        // Students can only view, not edit
        return;
    }

    if (swapMode) {
        handleSwap(cell);
    } else {
        editCell(cell);
    }
}

function handleSwap(cell) {
    if (!cell.classList.contains('filled')) {
        alert('Cannot swap with empty cell');
        return;
    }

    if (!firstSwapCell) {
        // Select first cell
        firstSwapCell = cell;
        cell.classList.add('selected-for-swap');
        document.getElementById('swap-message').textContent = 'Now click on another class to swap with';
    } else {
        // Perform swap
        if (firstSwapCell === cell) {
            // Clicked same cell, deselect
            firstSwapCell.classList.remove('selected-for-swap');
            firstSwapCell = null;
            document.getElementById('swap-message').textContent = 'Click on a class to select it, then click another class to swap';
            return;
        }

        // Swap the data
        const temp = {
            subject: firstSwapCell.dataset.subject,
            teacher: firstSwapCell.dataset.teacher,
            room: firstSwapCell.dataset.room,
            color: firstSwapCell.dataset.color,
            online: firstSwapCell.dataset.online,
            link: firstSwapCell.dataset.link,
            html: firstSwapCell.innerHTML
        };

        // Update first cell with second cell's data
        firstSwapCell.dataset.subject = cell.dataset.subject;
        firstSwapCell.dataset.teacher = cell.dataset.teacher;
        firstSwapCell.dataset.room = cell.dataset.room;
        firstSwapCell.dataset.color = cell.dataset.color;
        firstSwapCell.dataset.online = cell.dataset.online;
        firstSwapCell.dataset.link = cell.dataset.link;
        firstSwapCell.innerHTML = cell.innerHTML;

        // Remove old color and add new
        for (let i = 1; i <= 8; i++) {
            firstSwapCell.classList.remove('color-' + i);
        }
        firstSwapCell.classList.add('color-' + cell.dataset.color);

        // Update second cell with temp data
        cell.dataset.subject = temp.subject;
        cell.dataset.teacher = temp.teacher;
        cell.dataset.room = temp.room;
        cell.dataset.color = temp.color;
        cell.dataset.online = temp.online;
        cell.dataset.link = temp.link;
        cell.innerHTML = temp.html;

        // Remove old color and add new
        for (let i = 1; i <= 8; i++) {
            cell.classList.remove('color-' + i);
        }
        cell.classList.add('color-' + temp.color);

        // Reset swap mode
        firstSwapCell.classList.remove('selected-for-swap');
        firstSwapCell = null;
        document.getElementById('swap-message').textContent = 'Classes swapped successfully! Click on another class to swap again.';

        // Update statistics after swapping
        updateStatistics();

        setTimeout(() => {
            document.getElementById('swap-message').textContent = 'Click on a class to select it, then click another class to swap';
        }, 2000);
    }
}

function openAddModal() {
    if (currentRole !== 'faculty') return;

    document.getElementById('modal-title').textContent = 'Assign Class';
    document.getElementById('delete-btn').style.display = 'none';
    document.getElementById('subject-name').value = '';
    document.getElementById('teacher-name').value = '';
    document.getElementById('room-number').value = '';
    document.getElementById('is-online').checked = false;
    document.getElementById('online-link').value = '';
    document.getElementById('online-link-group').style.display = 'none';
    selectColor(1);
    currentCell = null;
    document.getElementById('modal').classList.add('active');
}

function editCell(cell) {
    if (currentRole !== 'faculty') return;

    currentCell = cell;
    const hasContent = cell.classList.contains('filled');

    if (hasContent) {
        document.getElementById('modal-title').textContent = 'Edit Class';
        document.getElementById('delete-btn').style.display = 'block';
        document.getElementById('subject-name').value = cell.dataset.subject || '';
        document.getElementById('teacher-name').value = cell.dataset.teacher || '';
        document.getElementById('room-number').value = cell.dataset.room || '';

        const isOnline = cell.dataset.online === 'true';
        document.getElementById('is-online').checked = isOnline;
        document.getElementById('online-link').value = cell.dataset.link || '';
        document.getElementById('online-link-group').style.display = isOnline ? 'block' : 'none';

        selectColor(parseInt(cell.dataset.color) || 1);
    } else {
        document.getElementById('modal-title').textContent = 'Assign Class';
        document.getElementById('delete-btn').style.display = 'none';
        document.getElementById('subject-name').value = '';
        document.getElementById('teacher-name').value = '';
        document.getElementById('room-number').value = '';
        document.getElementById('is-online').checked = false;
        document.getElementById('online-link').value = '';
        document.getElementById('online-link-group').style.display = 'none';
        selectColor(1);
    }

    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function selectColor(colorNum) {
    selectedColor = colorNum;
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.querySelector(`.color-option[data-color="${colorNum}"]`).classList.add('selected');
}

function toggleOnlineLink() {
    const isOnline = document.getElementById('is-online').checked;
    document.getElementById('online-link-group').style.display = isOnline ? 'block' : 'none';
}

function saveSubject(event) {
    event.preventDefault();

    if (!currentCell) return;

    const subjectName = document.getElementById('subject-name').value;
    const teacherName = document.getElementById('teacher-name').value;
    const roomNumber = document.getElementById('room-number').value;
    const isOnline = document.getElementById('is-online').checked;
    const onlineLink = document.getElementById('online-link').value;

    // Remove all color classes
    for (let i = 1; i <= 8; i++) {
        currentCell.classList.remove('color-' + i);
    }

    // Add new data
    currentCell.classList.add('filled');
    currentCell.classList.add('color-' + selectedColor);
    currentCell.dataset.subject = subjectName;
    currentCell.dataset.teacher = teacherName;
    currentCell.dataset.room = roomNumber;
    currentCell.dataset.color = selectedColor;
    currentCell.dataset.online = isOnline;
    currentCell.dataset.link = isOnline ? onlineLink : '';

    let html = `
        <div class="subject-name">${subjectName}${isOnline ? ' <span class="online-badge">🌐</span>' : ''}</div>
        <div class="teacher-name">${teacherName}</div>
        <div class="room-number">${roomNumber}</div>
    `;

    if (isOnline && onlineLink) {
        html += `<a href="${onlineLink}" class="online-link" target="_blank" onclick="event.stopPropagation()">Join</a>`;
    }

    currentCell.innerHTML = html;

    closeModal();

    // Update statistics after adding/editing a class
    updateStatistics();
}

function deleteSubject() {
    if (!currentCell) return;

    if (confirm('Are you sure you want to delete this class?')) {
        // Remove all color classes
        for (let i = 1; i <= 8; i++) {
            currentCell.classList.remove('color-' + i);
        }

        currentCell.classList.remove('filled');
        delete currentCell.dataset.subject;
        delete currentCell.dataset.teacher;
        delete currentCell.dataset.room;
        delete currentCell.dataset.color;
        delete currentCell.dataset.online;
        delete currentCell.dataset.link;

        currentCell.innerHTML = '<span class="empty-cell">Click to add</span>';

        closeModal();

        // Update statistics after deleting a class
        updateStatistics();
    }
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Close modal when clicking outside
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Initialize in student view
switchRole('student');

// Page switching function
function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // Remove active from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageName + '-page').classList.add('active');

    // Activate selected tab
    event.target.classList.add('active');

    // Update statistics when switching to report page
    if (pageName === 'report') {
        updateStatistics();
    }
}

// Function to count all classes in timetable
function countClasses() {
    const filledCells = document.querySelectorAll('.class-cell.filled:not(.break-cell):not(.exam-cell)');
    return filledCells.length;
}

// Function to count online classes
function countOnlineClasses() {
    const onlineCells = document.querySelectorAll('.class-cell.filled[data-online="true"]');
    return onlineCells.length;
}

// Function to count classes by subject
function countClassesBySubject() {
    const subjectCounts = {
        'Mathematics': 0,
        'English': 0,
        'Physics': 0,
        'Chemistry': 0,
        'Art & Design': 0,
        'History': 0,
        'Computer Science': 0,
        'Physical Education': 0
    };

    const filledCells = document.querySelectorAll('.class-cell.filled:not(.break-cell):not(.exam-cell)');
    filledCells.forEach(cell => {
        const subject = cell.dataset.subject;
        if (subject && subjectCounts.hasOwnProperty(subject)) {
            subjectCounts[subject]++;
        }
    });

    return subjectCounts;
}

// Function to update all statistics in the report
function updateStatistics() {
    // Update total classes
    const totalClasses = countClasses();
    document.querySelector('.stat-card .stat-value').textContent = totalClasses;

    // Update online classes
    const onlineClasses = countOnlineClasses();
    const onlinePercentage = totalClasses > 0 ? Math.round((onlineClasses / totalClasses) * 100) : 0;
    document.querySelector('.stat-card.green .stat-value').textContent = onlineClasses;
    document.querySelector('.stat-card.green .stat-subtext').textContent = onlinePercentage + '% of total classes';

    // Update subject-wise breakdown
    const subjectCounts = countClassesBySubject();
    const subjectItems = document.querySelectorAll('.subject-item');

    const subjectOrder = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Art & Design', 'History', 'Computer Science', 'Physical Education'];

    subjectItems.forEach((item, index) => {
        const subjectName = subjectOrder[index];
        const count = subjectCounts[subjectName];
        const countElement = item.querySelector('.subject-item-count');
        if (countElement) {
            countElement.textContent = count + ' classes conducted';
        }
    });
}

// Initialize statistics on page load
updateStatistics();