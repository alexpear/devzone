import { AtpAgent, RichText } from '@atproto/api';
import type { HistoricalEvent } from './csv.js';

const MAX_GRAPHEMES = 300;
const HASHTAG = ' #OnThisDay';
const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

/** Convert "MM-DD" to "Jan 1" style. */
export function formatDate(mmdd: string): string {
    const [mm, dd] = mmdd.split('-');
    return `${MONTHS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;
}

export function formatPost(event: HistoricalEvent): string {
    const date = formatDate(event.date);
    const prefix = event.year ? `${date}, ${event.year}: ` : `${date}: `;

    let text = `${prefix}${event.event}${HASHTAG}`;

    const rt = new RichText({ text });
    if (rt.graphemeLength > MAX_GRAPHEMES) {
        const overhead = prefix.length + HASHTAG.length + 1; // +1 for "…"
        const available = MAX_GRAPHEMES - overhead;
        const truncated = [...event.event].slice(0, available).join('');
        text = `${prefix}${truncated}…${HASHTAG}`;
        console.error(
            `Warning: Post truncated to fit ${MAX_GRAPHEMES} graphemes`,
        );
    }

    return text;
}

export async function postToBluesky(text: string): Promise<void> {
    const handle = process.env.BLUESKY_HANDLE;
    const password = process.env.BLUESKY_APP_PASSWORD;

    if (!handle || !password) {
        console.error(
            'Error: BLUESKY_HANDLE and BLUESKY_APP_PASSWORD must be set',
        );
        process.exit(1);
    }

    const agent = new AtpAgent({ service: 'https://bsky.social' });
    await agent.login({ identifier: handle, password });

    const rt = new RichText({ text });
    rt.detectFacetsWithoutResolution();

    await agent.post({
        text: rt.text,
        facets: rt.facets,
    });

    console.log('Posted successfully:', text);
}
