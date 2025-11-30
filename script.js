// Common timezones
const timezones = [
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'Denver (MST/MDT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' }
];

let selectedTimezones = [];

// Initialize with user's timezone and one other
function init() {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    addTimezone(userTimezone, 'Your Location');
    addTimezone('America/New_York', 'New York');
    
    updateResults();
    
    document.getElementById('addTimezoneBtn').addEventListener('click', () => {
        addTimezone('Europe/London', '');
    });
    
    document.getElementById('timeSlider').addEventListener('input', updateResults);
}

function addTimezone(timezone, label = '') {
    const id = Date.now();
    selectedTimezones.push({ id, timezone, label });
    
    const timezoneList = document.getElementById('timezoneList');
    const item = document.createElement('div');
    item.className = 'timezone-item';
    item.dataset.id = id;
    
    item.innerHTML = `
        <input type="text" placeholder="Location name" value="${label}" class="location-input">
        <select class="timezone-select">
            ${timezones.map(tz => 
                `<option value="${tz.value}" ${tz.value === timezone ? 'selected' : ''}>${tz.label}</option>`
            ).join('')}
        </select>
        <button class="remove-btn">Remove</button>
    `;
    
    timezoneList.appendChild(item);
    
    item.querySelector('.location-input').addEventListener('input', (e) => {
        const tz = selectedTimezones.find(t => t.id === id);
        if (tz) tz.label = e.target.value;
        updateResults();
    });
    
    item.querySelector('.timezone-select').addEventListener('change', (e) => {
        const tz = selectedTimezones.find(t => t.id === id);
        if (tz) tz.timezone = e.target.value;
        updateResults();
    });
    
    item.querySelector('.remove-btn').addEventListener('click', () => {
        selectedTimezones = selectedTimezones.filter(t => t.id !== id);
        item.remove();
        updateResults();
    });
    
    updateResults();
}

function updateResults() {
    const slider = document.getElementById('timeSlider');
    const baseHour = parseFloat(slider.value);
    
    // Update current time display
    const currentTimeEl = document.getElementById('currentTime');
    currentTimeEl.textContent = formatTime(baseHour);
    
    // Calculate times for each timezone
    const meetingTimesEl = document.getElementById('meetingTimes');
    meetingTimesEl.innerHTML = '';
    
    if (selectedTimezones.length === 0) {
        meetingTimesEl.innerHTML = '<p style="color: #999;">Add timezones to see meeting times</p>';
        return;
    }
    
    // Use first timezone as reference
    const referenceTimezone = selectedTimezones[0].timezone;
    const now = new Date();
    const referenceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(baseHour), (baseHour % 1) * 60);
    
    selectedTimezones.forEach(tz => {
        const item = document.createElement('div');
        item.className = 'meeting-time-item';
        
        // Convert time to target timezone
        const timeString = referenceDate.toLocaleTimeString('en-US', {
            timeZone: tz.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const hour = parseInt(referenceDate.toLocaleTimeString('en-US', {
            timeZone: tz.timezone,
            hour: '2-digit',
            hour12: false
        }));
        
        // Determine if it's a good time
        let className = 'good';
        if (hour < 7 || hour > 22) {
            className = 'bad';
        } else if (hour < 9 || hour > 18) {
            className = 'warning';
        }
        
        item.classList.add(className);
        
        const locationName = tz.label || tz.timezone;
        item.innerHTML = `
            <span class="location">${locationName}</span>
            <span class="time">${timeString}</span>
        `;
        
        meetingTimesEl.appendChild(item);
    });
}

function formatTime(hour) {
    const h = Math.floor(hour);
    const m = (hour % 1) * 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const displayMinute = m === 0 ? '00' : m.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
}

// Initialize on load
init();
