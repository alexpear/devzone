// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;

// --- Map setup ---

const map = L.map('map').setView([37.77, -122.42], 15); // Default: San Francisco

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// --- Player marker ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let playerMarker: Record<string, any> | null = null;
let firstFix = true;

function onPosition(pos: GeolocationPosition): void {
    const { latitude, longitude } = pos.coords;
    if (playerMarker) {
        playerMarker.setLatLng([latitude, longitude]);
    } else {
        playerMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.9,
            weight: 2,
        }).addTo(map);
    }
    if (firstFix) {
        map.setView([latitude, longitude], 16);
        firstFix = false;
    }
}

function onPositionError(err: GeolocationPositionError): void {
    console.error('Geolocation error:', err.message);
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(onPosition, onPositionError, {
        enableHighAccuracy: true,
    });
}

// --- Objectives grid ---

const GRID_STEP = 0.01;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderedObjectives: Map<string, Record<string, any>> = new Map();

function snapToGrid(val: number): number {
    return Math.round(val / GRID_STEP) * GRID_STEP;
}

function updateObjectives(): void {
    const bounds = map.getBounds();
    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const west = bounds.getWest();
    const east = bounds.getEast();

    const latMin = snapToGrid(south);
    const latMax = snapToGrid(north);
    const lngMin = snapToGrid(west);
    const lngMax = snapToGrid(east);

    // Track which keys are in the current viewport
    const visibleKeys = new Set<string>();

    for (let lat = latMin; lat <= latMax + GRID_STEP / 2; lat += GRID_STEP) {
        for (
            let lng = lngMin;
            lng <= lngMax + GRID_STEP / 2;
            lng += GRID_STEP
        ) {
            // Round to avoid floating point drift
            const rlat = Math.round(lat * 100) / 100;
            const rlng = Math.round(lng * 100) / 100;
            const key = rlat + ',' + rlng;
            visibleKeys.add(key);

            if (!renderedObjectives.has(key)) {
                const marker = L.circleMarker([rlat, rlng], {
                    radius: 6,
                    color: '#000',
                    fillColor: '#000',
                    fillOpacity: 0.8,
                    weight: 1,
                }).addTo(map);
                renderedObjectives.set(key, marker);
            }
        }
    }

    // Remove markers outside viewport
    for (const [key, marker] of renderedObjectives) {
        if (!visibleKeys.has(key)) {
            map.removeLayer(marker);
            renderedObjectives.delete(key);
        }
    }
}

map.on('moveend', updateObjectives);
updateObjectives();

// --- localStorage stubs (for future game mechanics) ---

/* eslint-disable @typescript-eslint/no-unused-vars */
function saveState(state: object): void {
    localStorage.setItem('mapgame', JSON.stringify(state));
}

function loadState(): object | null {
    const raw = localStorage.getItem('mapgame');
    if (raw) {
        return JSON.parse(raw);
    }
    return null;
}
/* eslint-enable @typescript-eslint/no-unused-vars */
