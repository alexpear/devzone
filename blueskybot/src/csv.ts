import { readFileSync } from 'node:fs';

export interface HistoricalEvent {
  date: string;
  event: string;
  year: string | undefined;
}

/** Parse a single CSV row into fields, respecting quoted fields (RFC 4180). */
export function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  let field = '';
  let inQuotes = false;

  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else if (ch === '"') {
      inQuotes = true;
      i++;
    } else if (ch === ',') {
      fields.push(field);
      field = '';
      i++;
    } else {
      field += ch;
      i++;
    }
  }
  fields.push(field);
  return fields;
}

/**
 * Extract date, event, and optional year from parsed CSV fields.
 * - 2 fields → date, event (no year)
 * - 3 fields → date, event, year
 * - 4+ fields → date is first, year is last, middle fields rejoin with ','
 */
export function fieldsToEvent(fields: string[]): HistoricalEvent | undefined {
  if (fields.length < 2) return undefined;

  const date = fields[0].trim();
  if (!date) return undefined;

  if (fields.length === 2) {
    return { date, event: fields[1].trim(), year: undefined };
  }

  const yearRaw = fields[fields.length - 1].trim();
  const year = yearRaw || undefined;
  const event = fields.slice(1, -1).join(',').trim();
  return { date, event, year };
}

export function loadEvents(filePath: string): HistoricalEvent[] {
  const text = readFileSync(filePath, 'utf-8');
  const lines = text.split('\n').slice(1); // skip header

  const events: HistoricalEvent[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const fields = parseCsvRow(trimmed);
    const event = fieldsToEvent(fields);
    if (event) events.push(event);
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
