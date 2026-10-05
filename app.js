// IEEE Day 2026 - Pradyut Parva 3 Application Controller

// State Management
const appState = {
  currentScreen: 'welcomeScreen',
  navHistory: ['welcomeScreen'],
  selectedCategory: null,     // 'technical' | 'non-technical'
  selectedLocation: null,     // 'entrance1' | 'entrance2' | 'entrance3' | 'inside'
  selectedEvent: null,        // Event ID (1-14)
  avoidStairs: false,         // Accessibility toggle
  activeFilter: 'all',        // 'all' | 'day1' | 'day2'
  searchQuery: '',
  savedEvents: [],            // Array of saved event IDs
  currentFloorView: 0,        // Active floor on map (0: Ground, 1: First, 2: Second)
  mapZoom: 1.0,
  mapPan: { x: 0, y: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },
  userLostLocation: null      // Set when user identifies landmark via "I'm Lost" helper
};

// Helper: Format clean event venue (e.g. "Room 308 (ECE Department)", "Seminar Hall 124")
function getEventVenue(event) {
  if (!event) return '';
  return event.roomName || (event.room ? `Room ${event.room}` : 'TBA');
}

// Helper: Format clean event floor and venue (e.g. "Second Floor • Room 308 (ECE Department)")
function getEventFloorAndVenue(event) {
  if (!event) return '';
  const venue = getEventVenue(event);
  return `${event.floor} Floor • ${venue}`;
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  initializeApp();
  registerServiceWorker();
  initMapGestureControls();
});

// Load state from localStorage
function loadSavedState() {
  const savedLocation = localStorage.getItem('userLocation');
  const savedCategory = localStorage.getItem('ieee_selected_category');
  const savedEvents = localStorage.getItem('savedEvents');
  const savedLost = localStorage.getItem('ieee_user_lost_location');

  if (savedLocation) {
    appState.selectedLocation = savedLocation;
  }
  if (savedCategory) {
    appState.selectedCategory = savedCategory;
  }
  if (savedEvents) {
    try {
      appState.savedEvents = JSON.parse(savedEvents);
    } catch (e) {
      appState.savedEvents = [];
    }
  }
  if (savedLost) {
    try {
      appState.userLostLocation = JSON.parse(savedLost);
    } catch (e) {}
  }
}

// Persist state to localStorage
function saveState() {
  if (appState.selectedLocation) {
    localStorage.setItem('userLocation', appState.selectedLocation);
  }
  if (appState.selectedCategory) {
    localStorage.setItem('ieee_selected_category', appState.selectedCategory);
  }
  localStorage.setItem('savedEvents', JSON.stringify(appState.savedEvents));
  if (appState.userLostLocation) {
    localStorage.setItem('ieee_user_lost_location', JSON.stringify(appState.userLostLocation));
  } else {
    localStorage.removeItem('ieee_user_lost_location');
  }
}

// Initialize application
function initializeApp() {
  updateCategoryBadges();
  updateLocationDisplay();
  updateBottomNavActive('welcomeScreen');
  initAdminMode();

  // Handle URL parameters (e.g. shared route links)
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('event');
  const fromLocation = params.get('from');

  if (eventId && fromLocation) {
    appState.selectedLocation = fromLocation;
    appState.selectedEvent = parseInt(eventId, 10);
    showScreen('navigationScreen');
  }
}

// Admin Mode Management (Map Edit Access for Creator Only)
function initAdminMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();
  
  if (urlParams.get('admin') === 'true' || urlParams.get('admin') === '1' || urlParams.get('edit') === '1' || hash === '#admin' || hash === '#edit') {
    localStorage.setItem('ieee_admin_mode', 'true');
  }

  // Auto-enable on localhost if not explicitly set to false
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
  if (isLocalhost && localStorage.getItem('ieee_admin_mode') === null) {
    localStorage.setItem('ieee_admin_mode', 'true');
  }

  const isAdmin = localStorage.getItem('ieee_admin_mode') === 'true';
  document.body.classList.toggle('admin-mode-active', isAdmin);

  // Secret keyboard shortcut: Ctrl+Shift+E or Ctrl+Alt+M
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) ||
        (e.ctrlKey && e.altKey && (e.key === 'M' || e.key === 'm'))) {
      e.preventDefault();
      toggleAdminMode();
    }
  });

  // Secret triple-tap on hero title or logo
  const logo = document.querySelector('.logo-container') || document.querySelector('.hero-title') || document.querySelector('.hero-section');
  if (logo) {
    let clickCount = 0;
    let clickTimer = null;
    logo.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        clickCount = 0;
        toggleAdminMode();
      } else {
        clickTimer = setTimeout(() => { clickCount = 0; }, 600);
      }
    });
  }

  // Expose global debug / helper shortcuts
  window.openRouteMapperStudio = openRouteMapperStudio;
  window.toggleAdminMode = toggleAdminMode;
}

function toggleAdminMode() {
  const currentlyAdmin = localStorage.getItem('ieee_admin_mode') === 'true';
  const newAdmin = !currentlyAdmin;
  if (newAdmin) {
    localStorage.setItem('ieee_admin_mode', 'true');
    document.body.classList.add('admin-mode-active');
    showToast('🛠️ Admin Mode Enabled (Route Mapper Studio Unlocked)');
    openRouteMapperStudio();
  } else {
    localStorage.setItem('ieee_admin_mode', 'false');
    document.body.classList.remove('admin-mode-active');
    showToast('🔒 Admin Mode Disabled');
    closeRouteMapperStudio();
  }
}

// Update category count badges
function updateCategoryBadges() {
  const techCount = eventsData.events.filter(e => e.category.toLowerCase() === 'technical').length;
  const nontechCount = eventsData.events.filter(e => e.category.toLowerCase() === 'non-technical').length;

  const techBadge = document.getElementById('techCountBadge');
  const nontechBadge = document.getElementById('nontechCountBadge');

  if (techBadge) techBadge.textContent = `${techCount} Events`;
  if (nontechBadge) nontechBadge.textContent = `${nontechCount} Events`;
}

// Screen Navigation Manager
function showScreen(screenId, pushHistory = true) {
  const targetScreen = document.getElementById(screenId);
  if (!targetScreen) {
    console.warn("Target screen not found:", screenId);
    return;
  }

  // Close any open modals
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));

  // Manage navigation history stack
  if (pushHistory && appState.currentScreen !== screenId) {
    appState.navHistory.push(screenId);
  }

  // Explicitly hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });

  // Explicitly activate target screen
  targetScreen.classList.add('active');
  targetScreen.style.display = (screenId === 'welcomeScreen') ? 'flex' : 'block';
  appState.currentScreen = screenId;
  window.scrollTo(0, 0);

  // Update global bottom nav
  updateBottomNavActive(screenId);

  // Initialize screen-specific content
  if (screenId === 'categoryScreen') {
    updateCategoryBadges();
  } else if (screenId === 'eventListScreen') {
    renderEventList();
  } else if (screenId === 'eventDetailScreen') {
    renderEventDetails();
  } else if (screenId === 'locationScreen') {
    renderLocationScreen();
  } else if (screenId === 'navigationScreen') {
    renderNavigationScreen();
  }
}

// Back Navigation
function goBack() {
  if (appState.navHistory.length > 1) {
    appState.navHistory.pop(); // Remove current screen
    const prevScreen = appState.navHistory[appState.navHistory.length - 1];
    showScreen(prevScreen, false);
  } else {
    // Logical fallback based on current screen
    switch (appState.currentScreen) {
      case 'categoryScreen':
        showScreen('welcomeScreen', false);
        break;
      case 'eventListScreen':
        showScreen('categoryScreen', false);
        break;
      case 'eventDetailScreen':
        showScreen('eventListScreen', false);
        break;
      case 'locationScreen':
        showScreen('eventDetailScreen', false);
        break;
      case 'navigationScreen':
        showScreen('locationScreen', false);
        break;
      default:
        showScreen('welcomeScreen', false);
    }
  }
}

// Update active state in bottom navigation bar (if present)
function updateBottomNavActive(screenId) {
  const nav = document.getElementById('globalBottomNav');
  if (!nav) return;

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (screenId === 'welcomeScreen') {
    const btn = document.getElementById('navBtnHome');
    if (btn) btn.classList.add('active');
  } else if (screenId === 'categoryScreen') {
    const btn = document.getElementById('navBtnCategory');
    if (btn) btn.classList.add('active');
  } else if (screenId === 'eventListScreen' || screenId === 'eventDetailScreen') {
    const btn = document.getElementById('navBtnEvents');
    if (btn) btn.classList.add('active');
  } else if (screenId === 'navigationScreen') {
    const btn = document.getElementById('navBtnMap');
    if (btn) btn.classList.add('active');
  }
}

// Action: "Explore Events" button on Greeting screen
function exploreEvents() {
  showScreen('categoryScreen');
}

// Action: Category selection
function selectCategory(category) {
  appState.selectedCategory = category;
  saveState();
  showScreen('eventListScreen');
}

// Action: Change category shortcut from event list header
function changeCategory() {
  showScreen('categoryScreen');
}

// Update location banner display
function updateLocationDisplay() {
  const locationText = document.getElementById('currentLocationText');
  if (!locationText) return;

  if (appState.selectedLocation) {
    const entrance = eventsData.entrances.find(e => e.id === appState.selectedLocation);
    locationText.textContent = `📍 Location: ${entrance ? entrance.name : 'Inside Building'}`;
  } else {
    locationText.textContent = '📍 Location: Not set yet';
  }
}

// Render Event List View
function renderEventList() {
  updateLocationDisplay();

  // If no category selected yet, default to stored or 'technical'
  if (!appState.selectedCategory) {
    appState.selectedCategory = 'technical';
  }

  // Update category indicator pill in header
  const isTech = appState.selectedCategory.toLowerCase() === 'technical';
  const pillIcon = document.getElementById('categoryPillIcon');
  const pillText = document.getElementById('categoryPillText');
  if (pillIcon) pillIcon.textContent = isTech ? '💻' : '🎭';
  if (pillText) pillText.textContent = isTech ? 'Technical Track' : 'Non-Technical Track';

  const container = document.getElementById('categoryEventsList');
  if (!container) return;
  container.innerHTML = '';

  // Filter events
  let filtered = eventsData.events.filter(e => e.category.toLowerCase() === appState.selectedCategory.toLowerCase());

  // Apply Day Filter chips
  if (appState.activeFilter === 'day1') {
    filtered = filtered.filter(e => e.date === '2026-10-07' || (e.day && e.day.includes('Day 1')));
  } else if (appState.activeFilter === 'day2') {
    filtered = filtered.filter(e => e.date === '2026-10-08' || (e.day && e.day.includes('Day 2')));
  }

  // Apply Search Query filter (by title, full name, room, roomName, department, description)
  if (appState.searchQuery && appState.searchQuery.trim() !== '') {
    const q = appState.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(e => 
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.fullName && e.fullName.toLowerCase().includes(q)) ||
      (e.room && e.room.toLowerCase().includes(q)) ||
      (e.roomName && e.roomName.toLowerCase().includes(q)) ||
      (e.department && e.department.toLowerCase().includes(q)) ||
      (e.shortDescription && e.shortDescription.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-light-gray);">
        <p style="font-size: 32px; margin-bottom: 10px;">🔍</p>
        <p style="font-size: 16px; font-weight: 700; color: #FFFFFF;">No events found</p>
        <p style="font-size: 13px; margin-top: 5px;">Try adjusting your search query or day filter.</p>
      </div>
    `;
    return;
  }

  // Render cards
  filtered.forEach(event => {
    container.appendChild(createEventCardElement(event));
  });
}

// Create an Event List Item Card
function createEventCardElement(event) {
  const isSaved = appState.savedEvents.includes(event.id);
  const isTech = event.category.toLowerCase() === 'technical';

  const card = document.createElement('div');
  card.className = `event-card-item ${isTech ? 'tech-item' : 'nontech-item'}`;
  card.onclick = () => openEventDetails(event.id);

  card.innerHTML = `
    <div class="event-card-top">
      <div class="event-card-title-group">
        <h3 class="event-card-title-main">${event.title || event.name}</h3>
        <p class="event-card-subtitle">${event.fullName}</p>
      </div>
      <button class="event-star-btn ${isSaved ? 'saved' : ''}" 
              onclick="event.stopPropagation(); toggleSaveEvent(${event.id})" 
              aria-label="${isSaved ? 'Remove from schedule' : 'Save to schedule'}">
        ${isSaved ? '⭐' : '☆'}
      </button>
    </div>

    <div class="event-card-meta-chips">
      <span class="meta-chip dept-chip">🏢 ${event.department}</span>
      <span class="meta-chip time-chip">📅 ${event.day} • ${event.time}</span>
      <span class="meta-chip venue-chip">📍 ${getEventFloorAndVenue(event)}</span>
    </div>

    <p style="font-size: 13px; color: var(--text-light-blue); line-height: 1.5; margin-bottom: 10px;">
      ${event.shortDescription || event.description}
    </p>

    <div class="event-card-footer">
      <span>View Details & Route</span>
      <span>→</span>
    </div>
  `;

  return card;
}

// Filter Event List by Search Input
function filterEvents() {
  const searchInput = document.getElementById('eventSearch');
  const clearBtn = document.getElementById('searchClearBtn');
  if (searchInput) {
    appState.searchQuery = searchInput.value;
    if (clearBtn) {
      clearBtn.classList.toggle('visible', searchInput.value.length > 0);
    }
    renderEventList();
  }
}

// Clear Search Input
function clearSearch() {
  const searchInput = document.getElementById('eventSearch');
  const clearBtn = document.getElementById('searchClearBtn');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  if (clearBtn) {
    clearBtn.classList.remove('visible');
  }
  appState.searchQuery = '';
  renderEventList();
}

// Filter Event List by Day Chips
function setFilter(filter) {
  appState.activeFilter = filter;

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.remove('active');
    if (chip.dataset.filter === filter) {
      chip.classList.add('active');
    }
  });

  renderEventList();
}

// Toggle Save Event (Favourites)
function toggleSaveEvent(eventId) {
  const idx = appState.savedEvents.indexOf(eventId);
  if (idx > -1) {
    appState.savedEvents.splice(idx, 1);
    showToast('Removed from favourites');
  } else {
    appState.savedEvents.push(eventId);
    showToast('Added to favourites ⭐');
  }

  saveState();
  if (appState.currentScreen === 'eventListScreen') {
    renderEventList();
  } else if (appState.currentScreen === 'eventDetailScreen') {
    updateEventDetailSaveButton();
  } else if (appState.currentScreen === 'navigationScreen') {
    updateRouteSaveButton();
  }
}

function toggleSaveCurrentEvent() {
  if (appState.selectedEvent) {
    toggleSaveEvent(appState.selectedEvent);
  }
}

// Open Event Details View
function openEventDetails(eventId) {
  appState.selectedEvent = eventId;
  showScreen('eventDetailScreen');
}

// Render Event Details View
function renderEventDetails() {
  const card = document.getElementById('eventDetailCard');
  if (!card) return;

  const event = eventsData.events.find(e => e.id === appState.selectedEvent);
  if (!event) {
    card.innerHTML = '<p>Event not found.</p>';
    return;
  }

  const isSaved = appState.savedEvents.includes(event.id);
  const isTech = event.category.toLowerCase() === 'technical';

  card.innerHTML = `
    <div class="detail-header-section">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
        <div>
          <span style="font-size: 12px; font-weight: 800; color: ${isTech ? '#00D4FF' : '#FF0099'}; letter-spacing: 1px;">
            EVENT ${event.number} • ${isTech ? 'TECHNICAL TRACK' : 'NON-TECHNICAL TRACK'}
          </span>
          <h2 class="detail-main-title">${event.title || event.name}</h2>
          <p class="detail-full-name">${event.fullName}</p>
        </div>
        <button class="event-star-btn ${isSaved ? 'saved' : ''}" 
                onclick="toggleSaveCurrentEvent()" 
                aria-label="Save to favourites">
          ${isSaved ? '⭐' : '☆'}
        </button>
      </div>
    </div>

    <div class="detail-meta-grid">
      <div class="detail-meta-box">
        <div class="detail-meta-label">Department</div>
        <div class="detail-meta-val">🏢 ${event.department}</div>
      </div>
      <div class="detail-meta-box">
        <div class="detail-meta-label">Date & Time</div>
        <div class="detail-meta-val">📅 ${event.day} | ${event.time}</div>
      </div>
      <div class="detail-meta-box">
        <div class="detail-meta-label">Venue Location</div>
        <div class="detail-meta-val">📍 ${getEventFloorAndVenue(event)}</div>
      </div>
      <div class="detail-meta-box">
        <div class="detail-meta-label">Perks</div>
        <div class="detail-meta-val">🏆 Cash Prizes & Certificates</div>
      </div>
    </div>

    <div class="detail-description-section">
      <h3 style="font-size: 16px; font-weight: 800; color: #FFFFFF; margin-bottom: 8px;">Event Description</h3>
      <p>${event.description}</p>
    </div>

    <div class="detail-coordinator-box">
      <div>
        <strong style="color: #FFFFFF;">👤 Student Coordinator:</strong> ${event.teamLeader.name}
      </div>
      ${event.teamLeader.contact ? `
        <a href="tel:${event.teamLeader.contact}" class="call-btn" style="text-decoration: none;">
          📞 Call ${event.teamLeader.contact}
        </a>
      ` : '<span style="color: var(--text-light-gray); font-size: 13px;">Desk at Venue</span>'}
    </div>

    <div class="detail-actions-group">
      <button class="btn-primary btn-get-directions" onclick="getDirectionsForCurrentEvent()">
        <span>🧭 Get Fastest Route to ${getEventVenue(event)}</span>
        <span>→</span>
      </button>
      <button class="btn-secondary" onclick="showScreen('eventListScreen')">
        ← Back to Events List
      </button>
    </div>
  `;
}

function updateEventDetailSaveButton() {
  const isSaved = appState.savedEvents.includes(appState.selectedEvent);
  const btn = document.querySelector('#eventDetailCard .event-star-btn');
  if (btn) {
    btn.innerHTML = isSaved ? '⭐' : '☆';
    btn.classList.toggle('saved', isSaved);
  }
}

// Action: "Get Directions" from Event Details
function getDirectionsForCurrentEvent() {
  // Always ask "Where are you right now?" first so the user picks their starting entrance
  showScreen('locationScreen');
}

// Render "Where are you right now?" Location Screen
function renderLocationScreen() {
  const titleSpan = document.getElementById('locationTargetEventName');
  if (titleSpan) {
    if (appState.selectedEvent) {
      const event = eventsData.events.find(e => e.id === appState.selectedEvent);
      titleSpan.textContent = event ? `${event.title} (${getEventVenue(event)})` : 'your event';
    } else {
      titleSpan.textContent = 'your event';
    }
  }

  // Highlight previously selected entrance if any
  document.querySelectorAll('.entrance-card').forEach(card => {
    card.classList.remove('selected');
  });
  if (appState.selectedLocation) {
    const activeCard = document.querySelector(`.entrance-card[onclick*="'${appState.selectedLocation}'"]`);
    if (activeCard) {
      activeCard.classList.add('selected');
    }
  }
}

// Action: Select Entrance Location
function selectLocation(locationId) {
  appState.selectedLocation = locationId;
  appState.userLostLocation = null;
  saveState();
  updateLocationDisplay();

  const entrance = eventsData.entrances.find(e => e.id === locationId);
  showToast(`Location set: ${entrance ? entrance.name : 'Inside Building'}`);

  if (appState.selectedEvent) {
    showScreen('navigationScreen');
  } else {
    showScreen('eventListScreen');
  }
}

// Action: Change Location
function changeLocation() {
  showScreen('locationScreen');
}

// Render Route Screen with Dijkstra Path & Interactive SVG Map
function renderNavigationScreen() {
  if (!appState.selectedEvent) {
    showScreen('eventListScreen');
    return;
  }

  const event = eventsData.events.find(e => e.id === appState.selectedEvent);
  if (!event) return;

  // If location is somehow not set, redirect to location selector
  if (!appState.selectedLocation) {
    showScreen('locationScreen');
    return;
  }

  // Header and Location summary
  const eventTitleEl = document.getElementById('navEventTitle');
  const eventLocEl = document.getElementById('navEventLocation');
  const fromEl = document.getElementById('navFromLocation');
  const toEl = document.getElementById('navToLocation');

  if (eventTitleEl) eventTitleEl.textContent = `${event.title} - ${event.fullName}`;
  if (eventLocEl) eventLocEl.textContent = getEventFloorAndVenue(event);

  const entrance = eventsData.entrances.find(e => e.id === appState.selectedLocation);
  if (fromEl) fromEl.textContent = entrance ? entrance.name : 'Central Inside Foyer';
  if (toEl) toEl.textContent = getEventVenue(event);

  // Calculate Shortest Path using Dijkstra engine from navigation-graph.js
  const route = findShortestPath(appState.selectedLocation, event.room, {
    avoidStairs: appState.avoidStairs
  });

  // Update Route Metrics
  const durationEl = document.getElementById('routeDuration');
  const distanceEl = document.getElementById('routeDistance');
  const methodEl = document.getElementById('routeMethod');
  const methodIconEl = document.getElementById('routeMethodIcon');

  if (route) {
    if (durationEl) durationEl.textContent = `About ${route.estimatedMinutes} min walk`;
    if (distanceEl) distanceEl.textContent = `${route.totalDistance} meters`;
    if (methodEl) {
      if (route.transitMethod === 'Lift') {
        methodEl.textContent = 'Via Elevator (Accessible)';
        if (methodIconEl) methodIconEl.textContent = '🛗';
      } else if (route.transitMethod === 'Stairs') {
        methodEl.textContent = 'Via Stairs (Fastest)';
        if (methodIconEl) methodIconEl.textContent = '🪜';
      } else {
        methodEl.textContent = 'Walk (Same Floor)';
        if (methodIconEl) methodIconEl.textContent = '🚶';
      }
    }

    // Render Directions
    renderStepDirections(route.steps);

    // Custom route badge indicator
    const navCustomBadge = document.getElementById('navCustomBadge');
    if (navCustomBadge) {
      navCustomBadge.style.display = route.isCustom ? 'flex' : 'none';
    }

    // Update floor route dot badges
    updateFloorTabsWithRoute(route, event);

    // Determine initial floor map view:
    // If route starts on Ground, show Ground; or show event floor
    const eventFloorMap = { 'Ground': 0, 'First': 1, 'Second': 2 };
    const eventFloorNum = eventFloorMap[event.floor] !== undefined ? eventFloorMap[event.floor] : 0;
    
    // Default to the floor where the user starts, or where the event is
    appState.currentFloorView = 0; // Start at entrance floor (Ground)
    switchFloor(appState.currentFloorView);

    // Draw Interactive SVG Map
    renderInteractiveSVGMap(route, event, appState.currentFloorView);
  } else {
    if (durationEl) durationEl.textContent = 'Route unavailable';
    if (distanceEl) distanceEl.textContent = '--';
  }

  updateRouteSaveButton();
}

// Update Avoid Stairs Accessibility Toggle
function toggleAvoidStairs(checked) {
  appState.avoidStairs = checked;
  showToast(checked ? 'Stairs avoided. Routing through lifts.' : 'Fastest path via stairs enabled.');
  renderNavigationScreen();
}

// Update floor tabs route presence dots
function updateFloorTabsWithRoute(route, event) {
  const dot0 = document.getElementById('dotFloor0');
  const dot1 = document.getElementById('dotFloor1');
  const dot2 = document.getElementById('dotFloor2');

  const usesFloor0 = route.floorPaths[0] && route.floorPaths[0].length > 0;
  const usesFloor1 = route.floorPaths[1] && route.floorPaths[1].length > 0;
  const usesFloor2 = route.floorPaths[2] && route.floorPaths[2].length > 0;

  if (dot0) dot0.classList.toggle('has-route', usesFloor0);
  if (dot1) dot1.classList.toggle('has-route', usesFloor1);
  if (dot2) dot2.classList.toggle('has-route', usesFloor2);
}

// Switch Floor Tab
function switchFloor(floorNum) {
  appState.currentFloorView = floorNum;

  // Update tabs active state
  [0, 1, 2].forEach(f => {
    const tab = document.getElementById(`floorTab${f}`);
    if (tab) {
      tab.classList.toggle('active', f === floorNum);
    }
  });

  const event = eventsData.events.find(e => e.id === appState.selectedEvent);
  if (!event) return;

  const route = findShortestPath(appState.selectedLocation, event.room, {
    avoidStairs: appState.avoidStairs
  });

  renderInteractiveSVGMap(route, event, floorNum);
}

// Render Step-by-Step Directions
function renderStepDirections(steps) {
  const container = document.getElementById('directionsList');
  if (!container) return;
  container.innerHTML = '';

  steps.forEach((step, idx) => {
    const item = document.createElement('div');
    item.className = 'direction-step';
    item.innerHTML = `
      <div class="step-number">${idx + 1}</div>
      <div class="step-content">
        <p class="step-instruction">${step.instruction}</p>
        <p class="step-detail">${step.detail}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

function updateRouteSaveButton() {
  const isSaved = appState.savedEvents.includes(appState.selectedEvent);
  const star = document.getElementById('routeFavStar');
  if (star) {
    star.textContent = isSaved ? '★' : '☆';
  }
}

// =========================================================================
// INTERACTIVE SVG FLOOR MAP ENGINE
// Renders architectural layout, rooms, doors, stairs, elevator, and animated route
// =========================================================================

function renderPinBadge(pinNum, x, y) {
  return `
    <g class="blueprint-pin" data-pin="${pinNum}" onclick="onMapPinClick(${pinNum})" transform="translate(${x}, ${y})">
      <circle r="14" class="pin-bg" filter="url(#pinShadow)"/>
      <text y="4" class="pin-num">${pinNum}</text>
    </g>
  `;
}

function onMapPinClick(pinNum) {
  const event = eventsData.events.find(e => e.pin === pinNum);
  if (!event) return;

  const pinBox = document.getElementById('modalSelectedPinBox');
  if (pinBox) {
    pinBox.style.display = 'block';
    pinBox.innerHTML = `
      <div class="pin-box-header">
        <div class="pin-box-number">${event.number}</div>
        <div class="pin-box-title">
          <h4>${event.title} • ${event.fullName}</h4>
          <p>${event.roomName} • ${event.day} • ${event.time}</p>
        </div>
        <button class="pin-box-close" onclick="closePinInfo()" aria-label="Close">×</button>
      </div>
      <div class="pin-box-details">
        <p><strong>Faculty:</strong> ${event.faculty.name}</p>
        <p><strong>Student Leader:</strong> ${event.teamLeader.name} (${event.teamLeader.contact || 'Help Desk'})</p>
      </div>
      <div class="pin-box-actions">
        <button class="btn-primary btn-sm" onclick="navigateToEventFromMap(${event.id})">🧭 Get Route to This Event</button>
      </div>
    `;
    pinBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    showToast(`Pin ${pinNum}: ${event.title} (${event.roomName})`);
  }
}

function closePinInfo() {
  const pinBox = document.getElementById('modalSelectedPinBox');
  if (pinBox) pinBox.style.display = 'none';
}

function onMapRoomClick(roomId) {
  const event = eventsData.events.find(e => e.room === roomId);
  if (event) {
    onMapPinClick(event.pin);
  } else if (roomId === 'cafe') {
    showToast('☕ Campus Cafeteria (Ground Floor Annex)');
  } else if (roomId === 'physics') {
    showToast('Physics Lab (Ground Floor Annex)');
  } else if (roomId === 'chem') {
    showToast('Chemistry Lab (Ground Floor Annex)');
  }
}

function onMapEntranceClick(entranceId) {
  const entrance = eventsData.entrances.find(e => e.id === entranceId);
  if (entrance) {
    showToast(`${entrance.name}: ${entrance.description}`);
  }
}

function onMapTransitClick(transitType) {
  if (transitType === 'lift') {
    showToast('🛗 Central Elevator: Connects Ground, 1st, and 2nd Floors');
  } else {
    showToast('🪜 Staircase: Connects Ground, 1st, and 2nd Floors');
  }
}

function navigateToEventFromMap(eventId) {
  closeModal('fullMapModal');
  appState.selectedEvent = eventId;
  saveState();
  // Always ask "Where are you right now?" first
  showScreen('locationScreen');
}

function renderInteractiveSVGMap(route, event, floorNum, targetElementId = 'interactiveMap', isFullModal = false) {
  const mapContainer = document.getElementById(targetElementId);
  if (!mapContainer) return;

  const targetRoom = (event && event.room) ? event.room : '';

  // Blueprint target room highlight bounds on 1754 x 1241 coordinate system
  const roomBounds = {
    // Ground
    '124': { x: 880, y: 565, w: 220, h: 95, label: 'Seminar Hall 124', pin: 1 },
    '118': { x: 860, y: 830, w: 235, h: 85, label: 'AV Hall 118', pin: 2 },
    'E-Yantra': { x: 745, y: 990, w: 105, h: 95, label: 'E Yantra Lab', pin: 3 },
    '119': { x: 685, y: 760, w: 95, h: 90, label: 'ISE Lab 119', pin: 4 },
    // First
    '203': { x: 545, y: 130, w: 150, h: 85, label: 'Room 203', pin: 5 },
    '208': { x: 1070, y: 130, w: 150, h: 85, label: 'Room 208', pin: 6 },
    '213': { x: 1190, y: 640, w: 100, h: 90, label: 'Room 213', pin: 7 },
    '214': { x: 1190, y: 805, w: 100, h: 90, label: 'Room 214', pin: 8 },
    // Second
    '303': { x: 1130, y: 130, w: 125, h: 85, label: 'Room 303', pin: 9 },
    '305': { x: 1130, y: 235, w: 125, h: 75, label: 'Room 305', pin: 10 },
    '306': { x: 1130, y: 410, w: 125, h: 75, label: 'Room 306', pin: 11 },
    '307': { x: 1130, y: 535, w: 125, h: 75, label: 'Room 307', pin: 12 },
    '308': { x: 1130, y: 635, w: 125, h: 75, label: 'Room 308', pin: 13 },
    '325': { x: 990, y: 525, w: 95, h: 95, label: 'Room 325', pin: 14 }
  };

  // SVG viewBox matches authentic blueprint image dimensions: 1754 x 1241
  let svg = `
    <svg viewBox="0 0 1754 1241" xmlns="http://www.w3.org/2000/svg" class="campus-blueprint-svg">
      <defs>
        <!-- Route drop shadow -->
        <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0284C7" flood-opacity="0.6"/>
        </filter>
        <!-- Target room glow -->
        <filter id="targetAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- White Canvas Background matching Image 2 Blueprint -->
      <rect width="1754" height="1241" fill="#FFFFFF"/>

      <!-- Authentic Blueprint Image (Exact Match to Image 2) -->
      <image href="floor${floorNum}.png" x="0" y="0" width="1754" height="1241" preserveAspectRatio="xMidYMid meet"/>
  `;

  // Highlight Destination Room (if targeted and on this floor)
  const targetBounds = roomBounds[targetRoom];
  if (targetBounds && ((floorNum === 0 && [1,2,3,4].includes(targetBounds.pin)) ||
                       (floorNum === 1 && [5,6,7,8].includes(targetBounds.pin)) ||
                       (floorNum === 2 && [9,10,11,12,13,14].includes(targetBounds.pin)))) {
    svg += `
      <!-- Glowing Target Room Highlight -->
      <g class="map-room-highlight-pulse" filter="url(#targetAura)">
        <rect x="${targetBounds.x}" y="${targetBounds.y}" width="${targetBounds.w}" height="${targetBounds.h}" rx="8"
              fill="rgba(239, 68, 68, 0.22)" stroke="#DC2626" stroke-width="5" stroke-dasharray="10 6"/>
      </g>
    `;
  }

  // Draw Animated Shortest Path Walking Route (if route exists and applies to this floor)
  if (route && route.floorPaths && route.floorPaths[floorNum] && route.floorPaths[floorNum].length > 1) {
    const pointsStr = route.floorPaths[floorNum].map(n => `${n.x},${n.y}`).join(' ');
    svg += `
      <!-- Route Underlay Track for Contrast on Blueprint -->
      <polyline points="${pointsStr}" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
      <!-- Animated Cyan/Azure Polyline Route (NO BLACK FILL) -->
      <polyline points="${pointsStr}" fill="none" class="route-path-animated" filter="url(#routeGlow)"/>
    `;
  }

  // Start Marker Pin ("START HERE")
  if (route && route.startNode && route.startNode.floor === floorNum) {
    svg += `
      <g class="marker-pin-start" transform="translate(${route.startNode.x}, ${route.startNode.y})">
        <circle r="18" fill="none" stroke="#16A34A" stroke-width="4"/>
        <circle r="9" fill="#16A34A"/>
        <rect x="-62" y="-44" width="124" height="26" rx="6" fill="#15803D" stroke="#FFFFFF" stroke-width="2"/>
        <text x="0" y="-27" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle" dominant-baseline="middle">START HERE</text>
      </g>
    `;
  }

  // Destination Marker Pin ("DESTINATION")
  if (route && route.targetNode && route.targetNode.floor === floorNum) {
    svg += `
      <g class="marker-pin-dest" transform="translate(${route.targetNode.x}, ${route.targetNode.y})">
        <circle r="20" fill="none" stroke="#DC2626" stroke-width="4"/>
        <circle r="10" fill="#DC2626"/>
        <rect x="-68" y="-44" width="136" height="26" rx="6" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
        <text x="0" y="-27" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle" dominant-baseline="middle">DESTINATION</text>
      </g>
    `;
  }

  // Multi-floor Transition Transfer indicator
  if (route && route.pathNodes) {
    for (let i = 0; i < route.pathNodes.length - 1; i++) {
      const a = route.pathNodes[i];
      const b = route.pathNodes[i + 1];
      if (a.floor === floorNum && b.floor !== floorNum) {
        const isLift = a.type === 'lift' || b.type === 'lift';
        const icon = isLift ? '🛗' : '🪜';
        const transitName = isLift ? 'Central LIFT' : 'Stairs';
        const nextFloorName = b.floor === 1 ? '1st Floor' : (b.floor === 2 ? '2nd Floor' : 'Ground Floor');
        svg += `
          <g transform="translate(${a.x}, ${a.y})">
            <rect x="-115" y="24" width="230" height="32" rx="8" fill="#312E81" stroke="#FFFFFF" stroke-width="2"/>
            <text x="0" y="45" fill="#FFFFFF" font-size="12" font-weight="800" text-anchor="middle" dominant-baseline="middle">
              ${icon} Take ${transitName} to ${nextFloorName}
            </text>
          </g>
        `;
      }
    }
  }

  // Interactive Clickable Hotspots overlay for pins & callouts
  svg += `<g class="blueprint-hotspots">`;

  // Hotspots per floor
  if (floorNum === 0) {
    // Entrances
    svg += `
      <rect x="510" y="535" width="90" height="85" fill="transparent" cursor="pointer" onclick="onMapEntranceClick('entrance1')"><title>Main Entrance 1 (Front View)</title></rect>
      <rect x="880" y="130" width="85" height="40" fill="transparent" cursor="pointer" onclick="onMapEntranceClick('entrance2')"><title>Entrance 2 (North Gate)</title></rect>
      <rect x="880" y="970" width="85" height="40" fill="transparent" cursor="pointer" onclick="onMapEntranceClick('entrance3')"><title>Entrance 3 (South Gate)</title></rect>
      <rect x="840" y="740" width="55" height="50" fill="transparent" cursor="pointer" onclick="onMapTransitClick('lift')"><title>Central Elevator</title></rect>
      
      <!-- Pin 1: Seminar Hall 124 -->
      <circle cx="1044" cy="613" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(1)"><title>Pin 1: Seminar Hall 124 (24 Hrs Hackathon)</title></circle>
      <rect x="1280" y="570" width="400" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(1)"><title>Pin 1: 24 Hrs Hackathon</title></rect>
      
      <!-- Pin 2: AV Hall 118 -->
      <circle cx="1018" cy="877" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(2)"><title>Pin 2: AV Hall 118 (Treasure Hunt)</title></circle>
      <rect x="1280" y="835" width="400" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(2)"><title>Pin 2: Treasure Hunt</title></rect>

      <!-- Pin 3: E Yantra Lab -->
      <circle cx="783" cy="1021" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(3)"><title>Pin 3: E Yantra Lab (Robo Race)</title></circle>
      <rect x="1280" y="980" width="400" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(3)"><title>Pin 3: Robo Race</title></rect>

      <!-- Pin 4: ISE Lab 119 -->
      <circle cx="735" cy="828" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(4)"><title>Pin 4: ISE Lab 119 (Webathon)</title></circle>
      <rect x="100" y="780" width="220" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(4)"><title>Pin 4: Webathon</title></rect>
    `;
  } else if (floorNum === 1) {
    // First Floor Hotspots
    svg += `
      <rect x="710" y="765" width="55" height="50" fill="transparent" cursor="pointer" onclick="onMapTransitClick('lift')"><title>Central Elevator</title></rect>
      <rect x="750" y="460" width="330" height="260" fill="transparent" cursor="pointer" onclick="showToast('📚 Central Library - Main Floor 1 Core')"><title>Central Library</title></rect>

      <!-- Pin 5: Room 203 -->
      <circle cx="621" cy="173" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(5)"><title>Pin 5: Room 203 (Technical Debate)</title></circle>
      <rect x="100" y="510" width="220" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(5)"><title>Pin 5: Technical Debate</title></rect>

      <!-- Pin 6: Room 208 -->
      <circle cx="1143" cy="173" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(6)"><title>Pin 6: Room 208 (AI vs Human)</title></circle>
      <rect x="1350" y="145" width="360" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(6)"><title>Pin 6: AI vs Human</title></rect>

      <!-- Pin 7: Room 213 -->
      <circle cx="1230" cy="691" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(7)"><title>Pin 7: Room 213 (Technical Quiz)</title></circle>
      <rect x="1350" y="505" width="360" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(7)"><title>Pin 7: Technical Quiz</title></rect>

      <!-- Pin 8: Room 214 -->
      <circle cx="1230" cy="854" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(8)"><title>Pin 8: Room 214 (Connections)</title></circle>
      <rect x="1350" y="680" width="360" height="85" fill="transparent" cursor="pointer" onclick="onMapPinClick(8)"><title>Pin 8: Connections</title></rect>
    `;
  } else if (floorNum === 2) {
    // Second Floor Hotspots
    svg += `
      <rect x="720" y="960" width="55" height="50" fill="transparent" cursor="pointer" onclick="onMapTransitClick('lift')"><title>Central Elevator</title></rect>

      <!-- Pin 9: Room 303 -->
      <circle cx="1181" cy="166" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(9)"><title>Pin 9: Room 303 (Antenna Hackathon)</title></circle>
      <rect x="1350" y="125" width="360" height="75" fill="transparent" cursor="pointer" onclick="onMapPinClick(9)"><title>Pin 9: Antenna Hackathon</title></rect>

      <!-- Pin 10: Room 305 -->
      <circle cx="1181" cy="272" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(10)"><title>Pin 10: Room 305 (Photography)</title></circle>
      <rect x="1350" y="240" width="360" height="75" fill="transparent" cursor="pointer" onclick="onMapPinClick(10)"><title>Pin 10: Photography</title></rect>

      <!-- Pin 11: Room 306 -->
      <circle cx="1181" cy="446" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(11)"><title>Pin 11: Room 306 (Prompt War)</title></circle>
      <rect x="1350" y="410" width="360" height="75" fill="transparent" cursor="pointer" onclick="onMapPinClick(11)"><title>Pin 11: Prompt War</title></rect>

      <!-- Pin 12: Room 307 -->
      <circle cx="1181" cy="572" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(12)"><title>Pin 12: Room 307 (Gaming)</title></circle>
      <rect x="1350" y="535" width="360" height="75" fill="transparent" cursor="pointer" onclick="onMapPinClick(12)"><title>Pin 12: Gaming</title></rect>

      <!-- Pin 13: Room 308 -->
      <circle cx="1181" cy="670" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(13)"><title>Pin 13: Room 308 (Circuit Debugging)</title></circle>
      <rect x="70" y="475" width="280" height="50" fill="transparent" cursor="pointer" onclick="onMapPinClick(13)"><title>Pin 13: Circuit Debugging</title></rect>

      <!-- Pin 14: Room 325 -->
      <circle cx="1038" cy="600" r="30" fill="transparent" cursor="pointer" onclick="onMapPinClick(14)"><title>Pin 14: Room 325 (Code Debugging)</title></circle>
      <rect x="1350" y="720" width="360" height="75" fill="transparent" cursor="pointer" onclick="onMapPinClick(14)"><title>Pin 14: Code Debugging</title></rect>
    `;
  }

  svg += `</g>`;

  // User Current Location Pin ("YOU ARE HERE") - from landmark helper or selected entrance
  // Placed at the very end of SVG so it is painted on top of all blueprint layers and hotspots
  const currLoc = getCurrentUserLocation();
  if (currLoc && currLoc.floor === floorNum) {
    svg += `
      <!-- Animated Glowing Pin for User Location ("YOU ARE HERE") -->
      <g class="marker-pin-user-current" transform="translate(${currLoc.x}, ${currLoc.y})" onclick="showUserLocationInfo()" style="cursor: pointer;">
        <circle r="52" fill="none" stroke="#00D4FF" stroke-width="4.5" opacity="0.9">
          <animate attributeName="r" values="26;74;26" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.95;0.1;0.95" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle r="32" fill="rgba(0, 212, 255, 0.28)" stroke="#00D4FF" stroke-width="2"/>
        <circle r="18" fill="#00D4FF" stroke="#FFFFFF" stroke-width="3"/>
        <circle r="7" fill="#0A1628"/>
        <!-- Top Pill Badge -->
        <g filter="url(#routeGlow)">
          <rect x="-105" y="-64" width="210" height="38" rx="8" fill="#0A1628" stroke="#00D4FF" stroke-width="2.5"/>
          <text x="0" y="-42" fill="#00D4FF" font-size="15" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">📍 YOU ARE HERE</text>
        </g>
        <!-- Bottom Label -->
        <rect x="-105" y="24" width="210" height="30" rx="6" fill="#0A1628" stroke="#FFFFFF" stroke-width="1.8"/>
        <text x="0" y="40" fill="#FFFFFF" font-size="13" font-weight="800" text-anchor="middle" dominant-baseline="middle">${currLoc.name}</text>
      </g>
    `;
  }

  svg += `</svg>`;
  mapContainer.innerHTML = svg;
}

// Map Zoom and Pan Interaction Controls
function zoomMap(factor) {
  appState.mapZoom = Math.max(0.7, Math.min(3.0, appState.mapZoom * factor));
  applyMapTransform();
}

function resetMapZoom() {
  appState.mapZoom = 1.0;
  appState.mapPan = { x: 0, y: 0 };
  applyMapTransform();
}

function applyMapTransform() {
  const mapEl = document.getElementById('interactiveMap');
  if (mapEl) {
    mapEl.style.transform = `scale(${appState.mapZoom}) translate(${appState.mapPan.x}px, ${appState.mapPan.y}px)`;
  }
}

function initMapGestureControls() {
  const wrapper = document.getElementById('interactiveMapWrapper');
  if (!wrapper) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - appState.mapPan.x;
    startY = e.clientY - appState.mapPan.y;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    appState.mapPan.x = (e.clientX - startX);
    appState.mapPan.y = (e.clientY - startY);
    applyMapTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch handling for mobile drag and pinch
  let touchStartDist = 0;
  let touchStartZoom = 1.0;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - appState.mapPan.x;
      startY = e.touches[0].clientY - appState.mapPan.y;
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDist = Math.hypot(dx, dy);
      touchStartZoom = appState.mapZoom;
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      appState.mapPan.x = (e.touches[0].clientX - startX);
      appState.mapPan.y = (e.touches[0].clientY - startY);
      applyMapTransform();
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / touchStartDist;
      appState.mapZoom = Math.max(0.7, Math.min(3.0, touchStartZoom * scale));
      applyMapTransform();
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    isDragging = false;
    touchStartDist = 0;
  });
}

// Share Route Link
function shareRoute() {
  if (!appState.selectedEvent || !appState.selectedLocation) return;
  const event = eventsData.events.find(e => e.id === appState.selectedEvent);
  const url = `${window.location.origin}${window.location.pathname}?event=${event.id}&from=${appState.selectedLocation}`;

  if (navigator.share) {
    navigator.share({
      title: `IEEE Day 2026 - Route to ${event.title}`,
      text: `Directions to ${event.title} (${event.fullName}) at IEEE Day 2026:`,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Route link copied to clipboard!');
    });
  }
}

// Coordinator telephone call
function callCoordinator() {
  if (!appState.selectedEvent) return;
  const event = eventsData.events.find(e => e.id === appState.selectedEvent);
  if (event && event.teamLeader && event.teamLeader.contact) {
    window.location.href = `tel:${event.teamLeader.contact}`;
  } else {
    showToast('Coordinator desk located at event room');
  }
}

// Modals: Schedule, Help, Lost, Full Map
function showMySchedule() {
  const modal = document.getElementById('scheduleModal');
  const list = document.getElementById('scheduleList');
  if (!modal || !list) return;

  if (appState.savedEvents.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; color: var(--text-light-gray); padding: 30px;">
        <p style="font-size: 32px; margin-bottom: 8px;">⭐</p>
        <p style="font-weight: 700; color: #FFFFFF;">No events saved yet</p>
        <p style="font-size: 13px;">Tap the star icon on any event to add it to your personal schedule.</p>
      </div>
    `;
  } else {
    list.innerHTML = '';
    const saved = eventsData.events.filter(e => appState.savedEvents.includes(e.id));
    saved.forEach(ev => {
      const item = document.createElement('div');
      item.className = 'schedule-item';
      item.onclick = () => {
        closeModal('scheduleModal');
        openEventDetails(ev.id);
      };
      item.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: var(--badge-cyan);">${ev.day} • ${ev.time}</div>
        <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; margin: 4px 0;">${ev.title} - ${ev.fullName}</div>
        <div style="font-size: 13px; color: var(--text-light-gray);">📍 Room ${ev.room}, ${ev.floor} Floor (${ev.department})</div>
      `;
      list.appendChild(item);
    });
  }

  modal.classList.add('active');
}

function shareSchedule() {
  if (appState.savedEvents.length === 0) {
    showToast('Add events to your schedule first!');
    return;
  }

  const names = appState.savedEvents.map(id => {
    const e = eventsData.events.find(x => x.id === id);
    return e ? `${e.title} (${e.day})` : '';
  }).filter(Boolean).join(', ');

  const text = `My IEEE Day 2026 Schedule: ${names}`;
  if (navigator.share) {
    navigator.share({ title: 'IEEE Day 2026 Schedule', text });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Schedule copied to clipboard!');
    });
  }
}

let modalMapZoom = 1.0;
let modalMapPan = { x: 0, y: 0 };

function zoomModalMap(factor) {
  modalMapZoom = Math.max(0.7, Math.min(3.0, modalMapZoom * factor));
  applyModalMapTransform();
}

function resetModalMapZoom() {
  modalMapZoom = 1.0;
  modalMapPan = { x: 0, y: 0 };
  applyModalMapTransform();
}

function applyModalMapTransform() {
  const mapEl = document.getElementById('modalInteractiveMap');
  if (mapEl) {
    mapEl.style.transform = `scale(${modalMapZoom}) translate(${modalMapPan.x}px, ${modalMapPan.y}px)`;
  }
}

function initModalMapGestureControls() {
  const wrapper = document.getElementById('modalInteractiveMapWrapper');
  if (!wrapper || wrapper._gestureInitialized) return;
  wrapper._gestureInitialized = true;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - modalMapPan.x;
    startY = e.clientY - modalMapPan.y;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    modalMapPan.x = (e.clientX - startX);
    modalMapPan.y = (e.clientY - startY);
    applyModalMapTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  let touchStartDist = 0;
  let touchStartZoom = 1.0;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - modalMapPan.x;
      startY = e.touches[0].clientY - modalMapPan.y;
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDist = Math.hypot(dx, dy);
      touchStartZoom = modalMapZoom;
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      modalMapPan.x = (e.touches[0].clientX - startX);
      modalMapPan.y = (e.touches[0].clientY - startY);
      applyModalMapTransform();
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / touchStartDist;
      modalMapZoom = Math.max(0.7, Math.min(3.0, touchStartZoom * scale));
      applyModalMapTransform();
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    isDragging = false;
    touchStartDist = 0;
  });
}

function getCurrentUserLocation() {
  if (appState.userLostLocation) {
    return appState.userLostLocation;
  }
  const locId = appState.selectedLocation || 'entrance1';
  const ent = eventsData.entrances.find(e => e.id === locId);
  if (ent) {
    return {
      id: ent.id,
      name: ent.name,
      floor: 0,
      floorName: 'Ground Floor',
      x: ent.coordinates.x,
      y: ent.coordinates.y,
      icon: ent.id === 'inside' ? '🏢' : '🚪',
      description: ent.description,
      isEntrance: true
    };
  }
  return {
    id: 'entrance1',
    name: 'Main Entrance 1',
    floor: 0,
    floorName: 'Ground Floor',
    x: 550,
    y: 576,
    icon: '🚪',
    description: 'Front gate - Primary entrance',
    isEntrance: true
  };
}

function showFullMap(targetFloor) {
  const modal = document.getElementById('fullMapModal');
  if (modal) {
    modal.classList.add('active');
    resetModalMapZoom();
    
    // Ensure default location is set if none was selected yet
    if (!appState.selectedLocation && !appState.userLostLocation) {
      appState.selectedLocation = 'entrance1';
    }

    const currLoc = getCurrentUserLocation();
    let floorToLoad = 0;
    if (targetFloor !== undefined && targetFloor !== null) {
      floorToLoad = targetFloor;
    } else if (currLoc) {
      floorToLoad = currLoc.floor;
    }
    switchModalFloor(floorToLoad);
    initModalMapGestureControls();
  }
}

function switchModalFloor(floorNum) {
  const currLoc = getCurrentUserLocation();

  [0, 1, 2].forEach(f => {
    const tab = document.getElementById(`modalFloorTab${f}`);
    if (tab) {
      tab.classList.toggle('active', f === floorNum);
      const existingBadge = tab.querySelector('.user-here-tab-badge');
      if (existingBadge) existingBadge.remove();
      if (currLoc && currLoc.floor === f) {
        const badge = document.createElement('span');
        badge.className = 'user-here-tab-badge';
        badge.innerHTML = '📍 You';
        tab.appendChild(badge);
      }
    }
  });

  // Update Location Bar text inside modal
  const locBarText = document.getElementById('modalUserLocText');
  if (locBarText && currLoc) {
    locBarText.innerHTML = `Current Location: <strong>${currLoc.name}</strong> (${currLoc.floorName})`;
  }

  const summaries = {
    0: '<strong>Ground Floor:</strong> 4 Events (Pins 1–4) • Central LIFT • Seminar Hall 124 (Hackathon) • AV Hall 118 (Treasure Hunt) • ISE Lab 119 (Webathon) • Annex (Robo Race, Cafe, Physics, Chem)',
    1: '<strong>1st Floor:</strong> 4 Events (Pins 5–8) • Central Library • Room 203 (Debate) • Room 208 (AI vs Human) • Room 213 (Tech Quiz) • Room 214 (Connections) • CSE Labs',
    2: '<strong>2nd Floor:</strong> 6 Events (Pins 9–14) • Room 303 (Antenna Hackathon) • Room 305 (Photo) • Room 306 (Prompt War) • Room 307 (Gaming) • Room 308 (Circuit) • Room 325 (Code) • ECE Dept'
  };

  const summaryEl = document.getElementById('modalFloorSummary');
  if (summaryEl) summaryEl.innerHTML = summaries[floorNum] || '';

  renderInteractiveSVGMap(null, null, floorNum, 'modalInteractiveMap', true);

  const floorNameMap = { 0: 'Ground', 1: 'First', 2: 'Second' };
  const targetFloor = floorNameMap[floorNum];
  const floorEvents = eventsData.events.filter(e => e.floor === targetFloor);

  const eventsListEl = document.getElementById('modalFloorEventsList');
  if (eventsListEl) {
    eventsListEl.innerHTML = '';
    floorEvents.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'modal-event-chip';
      card.onclick = () => onMapPinClick(ev.pin);
      card.innerHTML = `
        <div class="chip-pin">${ev.pin}</div>
        <div class="chip-info">
          <h5>${ev.title}</h5>
          <p>${ev.roomName} • ${ev.day}</p>
        </div>
        <button class="chip-nav-btn" title="Navigate" onclick="event.stopPropagation(); navigateToEventFromMap(${ev.id})">➔</button>
      `;
      eventsListEl.appendChild(card);
    });
  }

  if (currLoc) {
    if (currLoc.floor === floorNum) {
      showUserLocationInfo();
    } else {
      const pinBox = document.getElementById('modalSelectedPinBox');
      if (pinBox) {
        pinBox.style.display = 'block';
        pinBox.innerHTML = `
          <div class="user-other-floor-banner">
            <div>
              <strong>📍 You are on ${currLoc.floorName}</strong> (${currLoc.name})
            </div>
            <button onclick="switchModalFloor(${currLoc.floor})">Switch to My Floor</button>
          </div>
        `;
      }
    }
  } else {
    closePinInfo();
  }
}

function showUserLocationInfo() {
  const loc = getCurrentUserLocation();
  if (!loc) return;
  const pinBox = document.getElementById('modalSelectedPinBox');
  if (pinBox) {
    pinBox.style.display = 'block';
    pinBox.innerHTML = `
      <div class="user-location-callout" style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.96), rgba(15, 30, 60, 0.96)); border: 2px solid #00D4FF; border-radius: 12px; padding: 14px 18px; margin-top: 14px; box-shadow: 0 0 20px rgba(0, 212, 255, 0.35);">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px; flex: 1;">
            <div style="font-size: 28px; width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 212, 255, 0.15); border: 2.5px solid #00D4FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);">
              ${loc.icon || '📍'}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #00D4FF; box-shadow: 0 0 8px #00D4FF;"></span>
                <span style="font-size: 11px; font-weight: 800; color: #00D4FF; letter-spacing: 1px; text-transform: uppercase;">You Are Here</span>
              </div>
              <h4 style="font-size: 17px; font-weight: 800; color: #FFFFFF; margin: 3px 0 2px 0;">${loc.name}</h4>
              <p style="font-size: 12px; color: #94A3B8; margin: 0;">📍 ${loc.floorName} • ${loc.description}</p>
            </div>
          </div>
          <button class="pin-box-close" onclick="closePinInfo()" aria-label="Close" style="color: #94A3B8; font-size: 24px; background: none; border: none; cursor: pointer; padding: 0 4px; line-height: 1;">×</button>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <button class="btn-primary btn-sm" onclick="closeModal('fullMapModal'); showScreen('eventListScreen');" style="background: linear-gradient(135deg, #00D4FF, #0077B6); color: #050B14; font-weight: 800; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 12px;">
            🧭 Browse Events
          </button>
          <button class="btn-secondary btn-sm" onclick="closeModal('fullMapModal'); showLostHelper();" style="background: rgba(255, 255, 255, 0.1); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px;">
            🔄 Change Location / I'm Lost
          </button>
        </div>
      </div>
    `;
    try {
      pinBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
  }
}

function showHelp() {
  const modal = document.getElementById('helpModal');
  if (modal) modal.classList.add('active');
}

function showEmergency() {
  showHelp();
}

function showLostHelper() {
  closeModal('helpModal');
  const modal = document.getElementById('lostModal');
  if (modal) modal.classList.add('active');
}

const campusLandmarks = {
  'cafe': {
    id: 'cafe',
    name: 'Campus Cafeteria',
    floor: 0,
    floorName: 'Ground Floor',
    x: 590,
    y: 1115,
    icon: '☕',
    description: 'Ground Floor, South Wing Annex near Entrance 3',
    nearestEntrance: 'entrance3'
  },
  'library': {
    id: 'library',
    name: 'Central Library',
    floor: 1,
    floorName: '1st Floor',
    x: 906,
    y: 617,
    icon: '📚',
    description: '1st Floor, Central Quadrangle overlooking Courtyard',
    nearestEntrance: 'inside'
  },
  'eee-lab': {
    id: 'eee-lab',
    name: 'EEE Lab / North Corridor',
    floor: 0,
    floorName: 'Ground Floor',
    x: 820,
    y: 280,
    icon: '🔧',
    description: 'Ground Floor, North-West Wing near Entrance 2',
    nearestEntrance: 'entrance2'
  },
  'seminar': {
    id: 'seminar',
    name: 'Seminar Hall 124',
    floor: 0,
    floorName: 'Ground Floor',
    x: 1044,
    y: 613,
    icon: '🎤',
    description: 'Ground Floor, East Wing Corridor (Hackathon Venue)',
    nearestEntrance: 'entrance1'
  },
  'lift': {
    id: 'lift',
    name: 'Central Elevator (LIFT)',
    floor: 0,
    floorName: 'Ground Floor',
    x: 866,
    y: 756,
    icon: '🛗',
    description: 'Ground Floor, Central Foyer & Elevator Lobby',
    nearestEntrance: 'inside'
  }
};

function foundLandmark(landmark) {
  if (landmark === 'none') {
    showToast('Connecting you with an IEEE student coordinator...');
    setTimeout(() => {
      callVolunteer();
    }, 500);
    return;
  }

  const loc = campusLandmarks[landmark];
  if (!loc) {
    showToast('Location not recognized. Please choose from the list.');
    return;
  }

  // 1. Set user location in state
  appState.userLostLocation = loc;
  appState.selectedLocation = loc.nearestEntrance;

  // Persist to localStorage
  try {
    localStorage.setItem('userLocation', loc.nearestEntrance);
    localStorage.setItem('ieee_user_lost_location', JSON.stringify(loc));
  } catch (e) {}

  // 2. Close lost modal & help modal
  closeModal('lostModal');
  closeModal('helpModal');

  // 3. Open campus map modal directly onto the landmark's floor
  showFullMap(loc.floor);

  // 4. Show the "You Are Here" info box
  showUserLocationInfo();

  // 5. Toast feedback
  showToast(`📍 Located you at ${loc.name} on ${loc.floorName}!`);
}

function callVolunteer() {
  closeModal('lostModal');
  showHelp();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.update();
    }).catch(() => {});
  }
}

// =========================================================================
// ROUTE MAPPER STUDIO & VISUAL PATH CALIBRATION
// =========================================================================

const mapperState = {
  startId: 'entrance1',
  targetRoom: '124',
  currentFloor: 0,
  mode: 'draw', // 'draw' | 'pan'
  waypointsByFloor: { 0: [], 1: [], 2: [] }
};

let mapperMapZoom = 1.0;
let mapperMapPan = { x: 0, y: 0 };
let mapperPanStart = { x: 0, y: 0 };

function openRouteMapperStudio(startId = null, targetRoomId = null) {
  const modal = document.getElementById('routeMapperModal');
  if (!modal) return;

  if (startId) mapperState.startId = startId;
  else if (appState.selectedLocation) mapperState.startId = appState.selectedLocation;
  else mapperState.startId = 'entrance1';

  if (targetRoomId) {
    mapperState.targetRoom = String(targetRoomId);
  } else if (appState.selectedEvent) {
    const ev = eventsData.events.find(e => e.id === appState.selectedEvent);
    if (ev) mapperState.targetRoom = String(ev.room);
  } else {
    mapperState.targetRoom = '124';
  }

  const targetSelect = document.getElementById('mapperTargetSelect');
  if (targetSelect) {
    targetSelect.innerHTML = '';
    eventsData.events.forEach(ev => {
      const opt = document.createElement('option');
      opt.value = ev.room;
      opt.textContent = `Pin ${ev.pin}: ${ev.title} (Room ${ev.room} - ${ev.floor} Floor)`;
      targetSelect.appendChild(opt);
    });
    targetSelect.value = mapperState.targetRoom;
  }

  const startSelect = document.getElementById('mapperStartSelect');
  if (startSelect) {
    startSelect.value = mapperState.startId;
  }

  loadRouteIntoMapper();

  modal.classList.add('active');
  resetMapperMapZoom();
  initMapperGestureControls();
  updateMapperUI();
}

function openRouteMapperStudioForCurrentRoute() {
  const ev = eventsData.events.find(e => e.id === appState.selectedEvent);
  const roomId = ev ? ev.room : '124';
  openRouteMapperStudio(appState.selectedLocation || 'entrance1', roomId);
}

function closeRouteMapperStudio() {
  closeModal('routeMapperModal');
  const navScreen = document.getElementById('navigationScreen');
  if (navScreen && navScreen.classList.contains('active')) {
    renderNavigationScreen();
  }
}

function onMapperSelectionChange() {
  const startSelect = document.getElementById('mapperStartSelect');
  const targetSelect = document.getElementById('mapperTargetSelect');
  if (startSelect) mapperState.startId = startSelect.value;
  if (targetSelect) mapperState.targetRoom = targetSelect.value;
  loadRouteIntoMapper();
  updateMapperUI();
}

function loadRouteIntoMapper() {
  let custom = null;
  try {
    const raw = localStorage.getItem('ieee_custom_routes');
    if (raw) {
      const all = JSON.parse(raw);
      const key = `${mapperState.startId}_${mapperState.targetRoom}`;
      custom = all[key];
    }
  } catch (e) {}

  if (custom && custom.waypointsByFloor) {
    mapperState.waypointsByFloor = {
      0: (custom.waypointsByFloor[0] || []).map(p => ({ x: Number(p.x), y: Number(p.y) })),
      1: (custom.waypointsByFloor[1] || []).map(p => ({ x: Number(p.x), y: Number(p.y) })),
      2: (custom.waypointsByFloor[2] || []).map(p => ({ x: Number(p.x), y: Number(p.y) }))
    };
  } else {
    prefillDefaultRouteInMapper(false);
  }

  const ev = eventsData.events.find(e => String(e.room) === String(mapperState.targetRoom));
  const floorNameMap = { 'Ground': 0, 'First': 1, 'Second': 2 };
  const evFloor = (ev && floorNameMap[ev.floor] !== undefined) ? floorNameMap[ev.floor] : 0;
  
  if (mapperState.waypointsByFloor[0] && mapperState.waypointsByFloor[0].length > 0) {
    mapperState.currentFloor = 0;
  } else if (mapperState.waypointsByFloor[evFloor] && mapperState.waypointsByFloor[evFloor].length > 0) {
    mapperState.currentFloor = evFloor;
  } else {
    mapperState.currentFloor = 0;
  }

  switchMapperFloor(mapperState.currentFloor);
}

function prefillDefaultRouteInMapper(showToastMsg = true) {
  try {
    const defaultRoute = findShortestPath(mapperState.startId, mapperState.targetRoom, { ignoreCustom: true });
    if (defaultRoute && defaultRoute.floorPaths) {
      mapperState.waypointsByFloor = {
        0: (defaultRoute.floorPaths[0] || []).map(p => ({ x: Math.round(p.x), y: Math.round(p.y) })),
        1: (defaultRoute.floorPaths[1] || []).map(p => ({ x: Math.round(p.x), y: Math.round(p.y) })),
        2: (defaultRoute.floorPaths[2] || []).map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }))
      };
      if (showToastMsg) {
        showToast('🔄 Loaded default corridor route as editable waypoints!');
      }
      renderMapperCanvas();
      updateMapperUI();
    }
  } catch (e) {
    console.error('Failed to pre-fill default route', e);
  }
}

function switchMapperFloor(floorNum) {
  mapperState.currentFloor = floorNum;
  [0, 1, 2].forEach(f => {
    const tab = document.getElementById(`mapperFloorTab${f}`);
    if (tab) tab.classList.toggle('active', f === floorNum);
  });
  renderMapperCanvas();
  updateMapperUI();
}

function setMapperMode(mode) {
  mapperState.mode = mode;
  const drawBtn = document.getElementById('mapperModeDrawBtn');
  const panBtn = document.getElementById('mapperModePanBtn');
  if (drawBtn) drawBtn.classList.toggle('active', mode === 'draw');
  if (panBtn) panBtn.classList.toggle('active', mode === 'pan');

  const wrapper = document.getElementById('mapperCanvasWrapper');
  if (wrapper) {
    wrapper.style.cursor = mode === 'draw' ? 'crosshair' : 'grab';
  }
}

function addMapperWaypoint(x, y) {
  if (!mapperState.waypointsByFloor[mapperState.currentFloor]) {
    mapperState.waypointsByFloor[mapperState.currentFloor] = [];
  }
  mapperState.waypointsByFloor[mapperState.currentFloor].push({ x, y });
  renderMapperCanvas();
  updateMapperUI();
  
  const count = mapperState.waypointsByFloor[mapperState.currentFloor].length;
  showToast(`📍 Placed Point ${count} at (${x}, ${y})`);
}

function undoMapperWaypoint() {
  const arr = mapperState.waypointsByFloor[mapperState.currentFloor];
  if (arr && arr.length > 0) {
    const removed = arr.pop();
    renderMapperCanvas();
    updateMapperUI();
    showToast(`↶ Removed last waypoint (${removed.x}, ${removed.y})`);
  } else {
    showToast('No points to undo on this floor');
  }
}

function clearMapperCurrentFloor() {
  mapperState.waypointsByFloor[mapperState.currentFloor] = [];
  renderMapperCanvas();
  updateMapperUI();
  showToast(`🗑️ Cleared waypoints on Floor ${mapperState.currentFloor}`);
}

function saveCustomRoute(showToastMsg = true) {
  const totalCount = (mapperState.waypointsByFloor[0] || []).length +
                     (mapperState.waypointsByFloor[1] || []).length +
                     (mapperState.waypointsByFloor[2] || []).length;

  if (totalCount < 2) {
    showToast('⚠️ Please plot at least 2 waypoints before saving!');
    return false;
  }

  const ev = eventsData.events.find(e => String(e.room) === String(mapperState.targetRoom));
  const key = `${mapperState.startId}_${mapperState.targetRoom}`;

  let allRoutes = {};
  try {
    const raw = localStorage.getItem('ieee_custom_routes');
    if (raw) allRoutes = JSON.parse(raw);
  } catch (e) {}

  allRoutes[key] = {
    startId: mapperState.startId,
    targetRoom: mapperState.targetRoom,
    targetPin: ev ? ev.pin : 0,
    targetTitle: ev ? ev.title : '',
    savedAt: new Date().toISOString(),
    waypointsByFloor: {
      0: mapperState.waypointsByFloor[0] || [],
      1: mapperState.waypointsByFloor[1] || [],
      2: mapperState.waypointsByFloor[2] || []
    }
  };

  try {
    localStorage.setItem('ieee_custom_routes', JSON.stringify(allRoutes));
  } catch (e) {
    showToast('Storage error saving route');
    return false;
  }

  if (showToastMsg) {
    showToast(`💾 Route saved for ${mapperState.startId} ➔ Room ${mapperState.targetRoom}!`);
  }

  updateMapperUI();
  return true;
}

function deleteCustomRoute() {
  const key = `${mapperState.startId}_${mapperState.targetRoom}`;
  try {
    const raw = localStorage.getItem('ieee_custom_routes');
    if (raw) {
      const allRoutes = JSON.parse(raw);
      if (allRoutes[key]) {
        delete allRoutes[key];
        localStorage.setItem('ieee_custom_routes', JSON.stringify(allRoutes));
        showToast('Reverted route back to default graph path.');
        prefillDefaultRouteInMapper(false);
        updateMapperUI();
      }
    }
  } catch (e) {}
}

function saveAndNextMapperRoute() {
  saveCustomRoute(false);
  nextMapperRoute();
}

function nextMapperRoute() {
  const targetSelect = document.getElementById('mapperTargetSelect');
  if (!targetSelect) return;
  const currentIdx = targetSelect.selectedIndex;
  if (currentIdx < targetSelect.options.length - 1) {
    targetSelect.selectedIndex = currentIdx + 1;
    mapperState.targetRoom = targetSelect.value;
    loadRouteIntoMapper();
    updateMapperUI();
    showToast(`Switched to Pin ${targetSelect.selectedIndex + 1}`);
  } else {
    showToast('🎉 All 14 routes reached! You have mapped every pin.');
  }
}

function prevMapperRoute() {
  const targetSelect = document.getElementById('mapperTargetSelect');
  if (!targetSelect) return;
  const currentIdx = targetSelect.selectedIndex;
  if (currentIdx > 0) {
    targetSelect.selectedIndex = currentIdx - 1;
    mapperState.targetRoom = targetSelect.value;
    loadRouteIntoMapper();
    updateMapperUI();
  }
}

function renderMapperCanvas() {
  const container = document.getElementById('mapperCanvasContainer');
  if (!container) return;

  const floorNum = mapperState.currentFloor;
  const ev = eventsData.events.find(e => String(e.room) === String(mapperState.targetRoom));
  const floorNameMap = { 'Ground': 0, 'First': 1, 'Second': 2 };
  const evFloor = (ev && floorNameMap[ev.floor] !== undefined) ? floorNameMap[ev.floor] : -1;
  const startEntrance = eventsData.entrances.find(e => e.id === mapperState.startId);
  const startFloor = startEntrance ? (floorNameMap[startEntrance.floor] || 0) : 0;

  const points = mapperState.waypointsByFloor[floorNum] || [];

  let svg = `
    <svg id="mapperSvg" viewBox="0 0 1754 1241" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
      <defs>
        <filter id="mapperRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#00D4FF" flood-opacity="0.8"/>
        </filter>
      </defs>

      <!-- White Canvas Background -->
      <rect width="1754" height="1241" fill="#FFFFFF"/>

      <!-- Blueprint Image -->
      <image href="floor${floorNum}.png" x="0" y="0" width="1754" height="1241" preserveAspectRatio="xMidYMid meet"/>
  `;

  // Start Entrance Pin on this floor
  if (startFloor === floorNum && startEntrance) {
    const coords = startEntrance.coordinates;
    svg += `
      <g class="marker-start-entrance" transform="translate(${coords.x}, ${coords.y})">
        <circle r="22" fill="none" stroke="#16A34A" stroke-width="4"/>
        <circle r="10" fill="#16A34A"/>
        <rect x="-65" y="-48" width="130" height="26" rx="6" fill="#15803D" stroke="#FFFFFF" stroke-width="2"/>
        <text x="0" y="-31" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle" dominant-baseline="middle">START: ${startEntrance.name}</text>
      </g>
    `;
  }

  // Destination Pin on this floor
  if (evFloor === floorNum && ev) {
    const coords = ev.coordinates;
    svg += `
      <g class="marker-dest-room" transform="translate(${coords.x}, ${coords.y})">
        <circle r="24" fill="none" stroke="#DC2626" stroke-width="4"/>
        <circle r="12" fill="#DC2626"/>
        <rect x="-85" y="-50" width="170" height="28" rx="6" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
        <text x="0" y="-32" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle" dominant-baseline="middle">DEST: Pin ${ev.pin} (${ev.room})</text>
      </g>
    `;
  }

  // Draw Polyline connecting waypoints
  if (points.length > 1) {
    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
    svg += `
      <!-- White high-contrast underlay track -->
      <polyline points="${pointsStr}" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
      <!-- Glowing cyan animated polyline -->
      <polyline points="${pointsStr}" fill="none" stroke="#00D4FF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="14 8" filter="url(#mapperRouteGlow)"/>
    `;
  }

  // Draw Numbered Waypoint Pins
  points.forEach((pt, idx) => {
    const isFirst = idx === 0 && startFloor === floorNum;
    const isLast = idx === points.length - 1 && evFloor === floorNum;
    const color = isFirst ? '#16A34A' : (isLast ? '#DC2626' : '#0284C7');

    svg += `
      <g class="mapper-waypoint-node" transform="translate(${pt.x}, ${pt.y})" cursor="pointer" onclick="event.stopPropagation(); removeMapperWaypointAtIndex(${idx})">
        <circle r="18" fill="${color}" stroke="#FFFFFF" stroke-width="3"/>
        <text x="0" y="1" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle" dominant-baseline="middle">${idx + 1}</text>
        <title>Waypoint ${idx + 1} (${pt.x}, ${pt.y}) - Click to remove</title>
      </g>
    `;
  });

  svg += `</svg>`;
  container.innerHTML = svg;
}

function removeMapperWaypointAtIndex(idx) {
  const arr = mapperState.waypointsByFloor[mapperState.currentFloor];
  if (arr && idx >= 0 && idx < arr.length) {
    arr.splice(idx, 1);
    renderMapperCanvas();
    updateMapperUI();
    showToast(`Removed waypoint ${idx + 1}`);
  }
}

function updateMapperUI() {
  [0, 1, 2].forEach(f => {
    const badge = document.getElementById(`mapperPtBadge${f}`);
    if (badge) {
      const count = (mapperState.waypointsByFloor[f] || []).length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  });

  const key = `${mapperState.startId}_${mapperState.targetRoom}`;
  let isCustom = false;
  try {
    const raw = localStorage.getItem('ieee_custom_routes');
    if (raw) {
      const all = JSON.parse(raw);
      isCustom = !!all[key];
    }
  } catch (e) {}

  const statusBadge = document.getElementById('mapperRouteStatusBadge');
  const deleteBtn = document.getElementById('mapperDeleteRouteBtn');
  if (statusBadge) {
    if (isCustom) {
      statusBadge.textContent = '✨ Custom Mapped (Saved)';
      statusBadge.className = 'mapper-status-pill custom-active';
      if (deleteBtn) deleteBtn.style.display = 'inline-block';
    } else {
      statusBadge.textContent = '⚪ Default Graph Route';
      statusBadge.className = 'mapper-status-pill';
      if (deleteBtn) deleteBtn.style.display = 'none';
    }
  }

  const countHud = document.getElementById('mapperCountHud');
  if (countHud) {
    const floorPts = (mapperState.waypointsByFloor[mapperState.currentFloor] || []).length;
    const totalPts = (mapperState.waypointsByFloor[0] || []).length +
                     (mapperState.waypointsByFloor[1] || []).length +
                     (mapperState.waypointsByFloor[2] || []).length;
    countHud.textContent = `Floor ${mapperState.currentFloor}: ${floorPts} pts • Total: ${totalPts} pts`;
  }

  const ev = eventsData.events.find(e => String(e.room) === String(mapperState.targetRoom));
  const floorNameMap = { 'Ground': 0, 'First': 1, 'Second': 2 };
  const evFloor = (ev && floorNameMap[ev.floor] !== undefined) ? floorNameMap[ev.floor] : 0;
  const guidanceEl = document.getElementById('mapperGuidanceText');
  if (guidanceEl) {
    if (evFloor === 0) {
      guidanceEl.textContent = `This event is on Ground Floor! Click points along the corridor from Entrance to Room ${mapperState.targetRoom}.`;
    } else {
      if (mapperState.currentFloor === 0) {
        guidanceEl.textContent = `Destination is on ${ev ? ev.floor : 'upper'} Floor. On Ground Floor, plot path from Entrance to the Central LIFT or Stairs, then switch tabs!`;
      } else if (mapperState.currentFloor === evFloor) {
        guidanceEl.textContent = `You are on ${ev ? ev.floor : ''} Floor! Plot path from the LIFT or Stairs to Room ${mapperState.targetRoom} (red pin).`;
      } else {
        guidanceEl.textContent = `Switch to Ground Floor or Floor ${evFloor} to plot the route.`;
      }
    }
  }

  renderMapperChecklist();
}

function renderMapperChecklist() {
  const grid = document.getElementById('mapperChecklistGrid');
  const entranceNameEl = document.getElementById('checklistEntranceName');
  const progressBadge = document.getElementById('checklistProgressBadge');
  if (!grid) return;

  const entrance = eventsData.entrances.find(e => e.id === mapperState.startId);
  if (entranceNameEl) entranceNameEl.textContent = entrance ? entrance.name : mapperState.startId;

  let allCustom = {};
  try {
    const raw = localStorage.getItem('ieee_custom_routes');
    if (raw) allCustom = JSON.parse(raw);
  } catch (e) {}

  let mappedCount = 0;
  grid.innerHTML = '';

  eventsData.events.forEach(ev => {
    const key = `${mapperState.startId}_${ev.room}`;
    const custom = allCustom[key];
    const isMapped = !!custom;
    if (isMapped) mappedCount++;

    const isCurrent = String(ev.room) === String(mapperState.targetRoom);

    const card = document.createElement('div');
    card.className = `checklist-card ${isCurrent ? 'active-target' : ''}`;
    card.onclick = () => {
      mapperState.targetRoom = String(ev.room);
      const targetSelect = document.getElementById('mapperTargetSelect');
      if (targetSelect) targetSelect.value = String(ev.room);
      loadRouteIntoMapper();
      updateMapperUI();
    };

    card.innerHTML = `
      <div class="checklist-pin">${ev.pin}</div>
      <div class="checklist-info">
        <h5>${ev.title}</h5>
        <p>Room ${ev.room} • ${ev.floor} Floor</p>
      </div>
      <div class="checklist-status">${isMapped ? '✅' : '⚪'}</div>
    `;
    grid.appendChild(card);
  });

  if (progressBadge) {
    progressBadge.textContent = `${mappedCount} / 14 Mapped`;
  }
}

function toggleMapperChecklist() {
  const grid = document.getElementById('mapperChecklistGrid');
  const btn = document.getElementById('checklistToggleBtn');
  if (!grid) return;
  const isHidden = grid.style.display === 'none';
  grid.style.display = isHidden ? 'grid' : 'none';
  if (btn) btn.textContent = isHidden ? '▲ Hide Checklist' : '▼ View All 14 Event Routes';
}

function zoomMapperMap(factor) {
  mapperMapZoom = Math.max(0.7, Math.min(3.5, mapperMapZoom * factor));
  applyMapperMapTransform();
}

function resetMapperMapZoom() {
  mapperMapZoom = 1.0;
  mapperMapPan = { x: 0, y: 0 };
  applyMapperMapTransform();
}

function applyMapperMapTransform() {
  const container = document.getElementById('mapperCanvasContainer');
  if (container) {
    container.style.transform = `translate(${mapperMapPan.x}px, ${mapperMapPan.y}px) scale(${mapperMapZoom})`;
  }
}

function initMapperGestureControls() {
  const wrapper = document.getElementById('mapperCanvasWrapper');
  if (!wrapper || wrapper._mapperGestureInitialized) return;
  wrapper._mapperGestureInitialized = true;

  let isDown = false;
  let didDrag = false;
  let downX = 0, downY = 0;

  wrapper.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    isDown = true;
    didDrag = false;
    downX = e.clientX;
    downY = e.clientY;

    mapperPanStart.x = e.clientX - mapperMapPan.x;
    mapperPanStart.y = e.clientY - mapperMapPan.y;
  });

  wrapper.addEventListener('pointermove', (e) => {
    const svg = document.getElementById('mapperSvg');
    if (svg) {
      try {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse());
        const x = Math.round(cursorPt.x);
        const y = Math.round(cursorPt.y);
        const hud = document.getElementById('mapperCoordHud');
        if (hud && x >= 0 && x <= 1754 && y >= 0 && y <= 1241) {
          hud.textContent = `📍 Blueprint: (${x}, ${y})`;
        }
      } catch (err) {}
    }

    if (!isDown) return;
    const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (dist > 7) {
      didDrag = true;
      if (mapperState.mode === 'pan' || e.buttons === 4 || e.shiftKey) {
        mapperMapPan.x = e.clientX - mapperPanStart.x;
        mapperMapPan.y = e.clientY - mapperPanStart.y;
        applyMapperMapTransform();
      }
    }
  });

  wrapper.addEventListener('pointerup', (e) => {
    if (!isDown) return;
    isDown = false;

    if (!didDrag && mapperState.mode === 'draw') {
      const svg = document.getElementById('mapperSvg');
      if (svg) {
        try {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse());
          const x = Math.round(cursorPt.x);
          const y = Math.round(cursorPt.y);
          if (x >= 0 && x <= 1754 && y >= 0 && y <= 1241) {
            addMapperWaypoint(x, y);
          }
        } catch (err) {}
      }
    }
  });
}

function openRouteJsonModal() {
  const modal = document.getElementById('routeJsonModal');
  const textarea = document.getElementById('routeJsonTextarea');
  if (!modal || !textarea) return;

  let allRoutes = {};
  try {
    const raw = localStorage.getItem('ieee_custom_routes');
    if (raw) allRoutes = JSON.parse(raw);
  } catch (e) {}

  textarea.value = JSON.stringify(allRoutes, null, 2);
  modal.classList.add('active');
}

function closeRouteJsonModal() {
  closeModal('routeJsonModal');
}

function copyRoutesJson() {
  const textarea = document.getElementById('routeJsonTextarea');
  if (!textarea) return;
  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    showToast('📋 All Custom Routes JSON copied to clipboard!');
  }).catch(() => {
    document.execCommand('copy');
    showToast('📋 Copied to clipboard!');
  });
}

function downloadRoutesJson() {
  const textarea = document.getElementById('routeJsonTextarea');
  if (!textarea) return;
  const blob = new Blob([textarea.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ieee_day_custom_routes.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('💾 routes.json file downloaded!');
}

function importRoutesJson() {
  const textarea = document.getElementById('routeJsonTextarea');
  if (!textarea) return;
  try {
    const parsed = JSON.parse(textarea.value);
    localStorage.setItem('ieee_custom_routes', JSON.stringify(parsed));
    showToast('📥 Routes imported and saved successfully!');
    closeRouteJsonModal();
    loadRouteIntoMapper();
    updateMapperUI();
  } catch (err) {
    showToast('❌ Invalid JSON syntax. Please check formatting.');
  }
}

function clearAllCustomRoutes() {
  if (confirm('Are you sure you want to delete ALL custom visual routes and revert to default graph paths?')) {
    localStorage.removeItem('ieee_custom_routes');
    showToast('🗑️ Cleared all custom routes.');
    closeRouteJsonModal();
    loadRouteIntoMapper();
    updateMapperUI();
  }
}

