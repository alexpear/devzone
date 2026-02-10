import { AtpAgent, RichText } from '@atproto/api';
import type { HistoricalEvent } from './csv.js';

const MAX_GRAPHEMES = 300;
const HASHTAG = ' #OnThisDay';

export function formatPost(event: HistoricalEvent): string {
  const prefix = event.year
    ? `On this day in ${event.year}: `
    : 'On this day: ';

  let text = `${prefix}${event.event}${HASHTAG}`;

  const rt = new RichText({ text });
  if (rt.graphemeLength > MAX_GRAPHEMES) {
    const overhead = prefix.length + HASHTAG.length + 1; // +1 for "…"
    const available = MAX_GRAPHEMES - overhead;
    const truncated = [...event.event].slice(0, available).join('');
    text = `${prefix}${truncated}…${HASHTAG}`;
    console.error(`Warning: Post truncated to fit ${MAX_GRAPHEMES} graphemes`);
  }

  return text;
}

export async function postToBluesky(text: string): Promise<void> {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !password) {
    console.error('Error: BLUESKY_HANDLE and BLUESKY_APP_PASSWORD must be set');
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
