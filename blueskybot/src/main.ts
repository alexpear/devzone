import 'dotenv/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEvents, getEventsForToday } from './csv.js';
import { formatPost, postToBluesky } from './post.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = resolve(__dirname, '..', 'data', 'events.csv');

const events = loadEvents(csvPath);
const todayEvents = getEventsForToday(events, 'UTC');

if (todayEvents.length === 0) {
    console.log('No events found for today.');
    process.exit(0);
}

for (const event of todayEvents) {
    const text = formatPost(event);
    await postToBluesky(text);
}
