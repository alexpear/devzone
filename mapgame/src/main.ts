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
let playerMarker: Record<string, any> | undefined = undefined;

let locationKnown = false;

function updateAfterGPS(pos: GeolocationPosition): void {
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
    if (!locationKnown) {
        map.setView([latitude, longitude], 16);
        locationKnown = true;
    }
    // TODO Collect all points from the nearest objective. Update its timestamp.
}

function gpsError(err: GeolocationPositionError): void {
    console.error('Geolocation error:', err.message);
}

// TODO is the ordering of funcs here good? Should i wrap in a init()?
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateAfterGPS, gpsError, {
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

const MIN_OBJECTIVE_ZOOM = 12;

function objectiveRadius(): number {
    const zoom = map.getZoom();
    // Scale from 2px at zoom 12 to 8px at zoom 18+
    return Math.min(8, Math.max(2, zoom - 12 + 2));
}

function updateObjectives(): void {
    const zoom = map.getZoom();

    // Too zoomed out — remove all objectives and bail
    if (zoom < MIN_OBJECTIVE_ZOOM) {
        for (const [key, marker] of renderedObjectives) {
            map.removeLayer(marker);
            renderedObjectives.delete(key);
        }
        return;
    }

    const radius = objectiveRadius();
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
        // LATER inconsistent whitespace, prettier forces the above for() onto 1 line
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
                    radius,
                    color: '#000',
                    fillColor: '#000',
                    fillOpacity: 0.8,
                    weight: 1,
                }).addTo(map);

                // TODO also display the number of available points for this objective

                renderedObjectives.set(key, marker);
            } else {
                renderedObjectives.get(key).setRadius(radius);
            }
        }
    }

    // Remove any existing circle objects that are now outside the viewport
    for (const [key, marker] of renderedObjectives) {
        if (!visibleKeys.has(key)) {
            map.removeLayer(marker);
            renderedObjectives.delete(key);
        }
    }
}

map.on('moveend', updateObjectives);
updateObjectives();
// TODO once again, it feels weird to have this func call be naked out here.

// LATER button to scroll & zoom to player location.
// LATER How To Play '?' button

// --- localStorage stubs (for future game mechanics) ---

/* eslint-disable @typescript-eslint/no-unused-vars */
function saveState(state: object): void {
    localStorage.setItem('mapgame', JSON.stringify(state));
}

function loadState(): object | undefined {
    const raw = localStorage.getItem('mapgame');
    if (raw) {
        return JSON.parse(raw);
    }
    return undefined;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// TODO unit tests about gamestate, saving & loading to storage format, player actions, visiting a place twice in same day.
