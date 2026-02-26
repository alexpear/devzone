// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;
const GRID_STEP = 0.01;
const GOALS_MIN_ZOOM = 10;

class MapGame {
    map = L.map('map').setView([37.77, -122.42], 15); // Default: San Francisco

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerMarker: Record<string, any> | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderedGoals: Map<string, Record<string, any>> = new Map();
    locationKnown = false;

    constructor() {
        // --- Map setup ---
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this.map);

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                this.updateAfterGPS,
                this.gpsError,
                {
                    enableHighAccuracy: true,
                },
            );
        }

        this.map.on('moveend', this.updateGoals);
        this.updateGoals();
    }

    updateAfterGPS(pos: GeolocationPosition): void {
        const { latitude, longitude } = pos.coords;
        if (this.playerMarker) {
            this.playerMarker.setLatLng([latitude, longitude]);
        } else {
            this.playerMarker = L.circleMarker([latitude, longitude], {
                radius: 8,
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.9,
                weight: 2,
            }).addTo(this.map);
        }
        if (!this.locationKnown) {
            this.map.setView([latitude, longitude], 16);
            this.locationKnown = true;
        }
        // TODO Collect all points from the nearest goal. Update its timestamp.
    }

    gpsError(err: GeolocationPositionError): void {
        console.error('Geolocation error:', err.message);
    }

    snapToGrid(val: number): number {
        return Math.round(val / GRID_STEP) * GRID_STEP;
    }

    goalRadius(): number {
        const zoom = this.map.getZoom();
        // Scale from 2px at zoom 12 to 8px at zoom 18+
        return Math.min(8, Math.max(2, zoom - 12 + 2));
    }

    updateGoals(): void {
        const zoom = this.map.getZoom();

        // Too zoomed out — remove all goals and bail
        if (zoom < GOALS_MIN_ZOOM) {
            for (const [key, marker] of this.renderedGoals) {
                this.map.removeLayer(marker);
                this.renderedGoals.delete(key);
            }
            return;
        }

        const radius = this.goalRadius();
        const bounds = this.map.getBounds();
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();

        const latMin = this.snapToGrid(south);
        const latMax = this.snapToGrid(north);
        const lngMin = this.snapToGrid(west);
        const lngMax = this.snapToGrid(east);

        // Track which keys are in the current viewport
        const visibleKeys = new Set<string>();
        // const today = new Date();

        for (
            let lat = latMin;
            lat <= latMax + GRID_STEP / 2;
            lat += GRID_STEP
        ) {
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

                if (!this.renderedGoals.has(key)) {
                    const marker = L.circleMarker([rlat, rlng], {
                        radius,
                        color: '#000',
                        fillColor: '#000',
                        fillOpacity: 0.8,
                        weight: 1,
                    }).addTo(this.map);

                    // TODO also display the number of available points for this goal

                    // TODO use a Goal object in this func, not just a circleMarker.
                    this.renderedGoals.set(key, marker);
                } else {
                    this.renderedGoals.get(key).setRadius(radius);
                }
            }
        }

        // Remove any existing circle objects that are now outside the viewport
        for (const [key, marker] of this.renderedGoals) {
            if (!visibleKeys.has(key)) {
                this.map.removeLayer(marker);
                this.renderedGoals.delete(key);
            }
        }
    }

    // LATER button to scroll & zoom to player location.
    // LATER How To Play '?' button

    // --- localStorage stubs (for future game mechanics) ---

    saveState(state: object): void {
        localStorage.setItem('mapgame', JSON.stringify(state));
    }

    // LATER menu option to download a save file. Also option to import a save file (merging it into current state).

    loadState(): object | undefined {
        const raw = localStorage.getItem('mapgame');
        if (raw) {
            return JSON.parse(raw);
        }
        return undefined;
    }

    static run(): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const game = new MapGame();
    }
}

// One of many locations that you get points for visiting.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Goal {
    lat: number;
    long: number;

    daysSinceVisited(): number {
        // todo
        return Infinity;
    }

    pointsAvailable(): number {
        // todo

        return 999;
    }
}

// TODO unit tests about gamestate, saving & loading to storage format, player actions, visiting a place twice in same day.

MapGame.run();
