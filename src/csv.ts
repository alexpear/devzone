import { readFileSync } from 'node:fs';

export interface HistoricalEvent {
  date: string;
  event: string;
  year: string | undefined;
}

export function loadEvents(filePath: string): HistoricalEvent[] {
  const text = readFileSync(filePath, 'utf-8');
  const lines = text.split('\n').slice(1); // skip header

  const events: HistoricalEvent[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lastComma = trimmed.lastIndexOf(',');
    if (lastComma === -1) continue;

    const beforeLast = trimmed.slice(0, lastComma);
    const afterLast = trimmed.slice(lastComma + 1).trim();

    const firstComma = beforeLast.indexOf(',');
    if (firstComma === -1) continue;

    const date = beforeLast.slice(0, firstComma).trim();
    const event = beforeLast.slice(firstComma + 1).trim();
    const year = afterLast || undefined;

    events.push({ date, event, year });
  }

  return events;
}

export function getEventsForToday(events: HistoricalEvent[]): HistoricalEvent[] {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });
  const now = new Date();
  const parts = formatter.formatToParts(now);
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  const todayKey = `${month}-${day}`;

  return events.filter(e => e.date === todayKey);
}
