import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEvents, getEventsForToday } from './csv.js';
import { formatPost } from './post.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = resolve(__dirname, '..', 'data', 'events.csv');
const events = loadEvents(csvPath);

const random = process.argv.includes('--random');

if (random) {
    const pick = events[Math.floor(Math.random() * events.length)];
    console.log(formatPost(pick));
} else {
    const today = getEventsForToday(events, undefined);
    if (today.length === 0) {
        console.log('No events found for today.');
    } else {
        for (const e of today) console.log(formatPost(e));
    }
}
