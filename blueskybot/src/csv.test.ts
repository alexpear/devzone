import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseCsvRow, fieldsToEvent, loadEvents, getEventsForToday } from './csv.js';

// --------------- parseCsvRow ---------------

describe('parseCsvRow', () => {
  it('splits simple comma-separated fields', () => {
    assert.deepEqual(parseCsvRow('a,b,c'), ['a', 'b', 'c']);
  });

  it('handles a single field with no commas', () => {
    assert.deepEqual(parseCsvRow('hello'), ['hello']);
  });

  it('handles empty fields', () => {
    assert.deepEqual(parseCsvRow('a,,c'), ['a', '', 'c']);
  });

  it('handles trailing empty field', () => {
    assert.deepEqual(parseCsvRow('a,b,'), ['a', 'b', '']);
  });

  it('handles quoted field containing commas', () => {
    assert.deepEqual(
      parseCsvRow('01-02,"Granada, the last Moorish stronghold, surrenders",1492'),
      ['01-02', 'Granada, the last Moorish stronghold, surrenders', '1492'],
    );
  });

  it('handles quoted field with escaped double quotes', () => {
    assert.deepEqual(
      parseCsvRow('01-01,"He said ""hello"" to them",1900'),
      ['01-01', 'He said "hello" to them', '1900'],
    );
  });

  it('handles quoted field at the end of the row', () => {
    assert.deepEqual(
      parseCsvRow('01-01,"Event, with commas"'),
      ['01-01', 'Event, with commas'],
    );
  });

  it('handles a mix of quoted and unquoted fields', () => {
    assert.deepEqual(
      parseCsvRow('date,"event, text",1999'),
      ['date', 'event, text', '1999'],
    );
  });

  it('handles empty quoted field', () => {
    assert.deepEqual(parseCsvRow('a,"",c'), ['a', '', 'c']);
  });

  it('handles row from the custom calendar with commas in quotes', () => {
    assert.deepEqual(
      parseCsvRow('January 2,"1492: Granada, the last Moorish stronghold in España, surrenders"'),
      ['January 2', '1492: Granada, the last Moorish stronghold in España, surrenders'],
    );
  });

  it('handles multiple names in quoted field', () => {
    assert.deepEqual(
      parseCsvRow('April 26,"Marcus Aurelius, David Hume, Ludwig Wittgenstein"'),
      ['April 26', 'Marcus Aurelius, David Hume, Ludwig Wittgenstein'],
    );
  });

  it('handles parenthetical text in quoted field', () => {
    assert.deepEqual(
      parseCsvRow('January 13,"1910: First public radio broadcast (Met Opera, NYC)"'),
      ['January 13', '1910: First public radio broadcast (Met Opera, NYC)'],
    );
  });
});

// --------------- fieldsToEvent ---------------

describe('fieldsToEvent', () => {
  it('parses 3 fields into date, event, year', () => {
    assert.deepEqual(fieldsToEvent(['01-01', 'New Year', '2000']), {
      date: '01-01',
      event: 'New Year',
      year: '2000',
    });
  });

  it('parses 2 fields into date, event with no year', () => {
    assert.deepEqual(fieldsToEvent(['01-01', 'New Year']), {
      date: '01-01',
      event: 'New Year',
      year: undefined,
    });
  });

  it('treats empty year field as undefined', () => {
    assert.deepEqual(fieldsToEvent(['01-01', 'Some event', '']), {
      date: '01-01',
      event: 'Some event',
      year: undefined,
    });
  });

  it('rejoins 4+ fields: date is first, year is last, middle is event', () => {
    // Simulates unquoted commas in event text: "01-01,Granada falls, ending Reconquista,1492"
    assert.deepEqual(
      fieldsToEvent(['01-01', 'Granada falls', ' ending Reconquista', '1492']),
      {
        date: '01-01',
        event: 'Granada falls, ending Reconquista',
        year: '1492',
      },
    );
  });

  it('rejoins 4+ fields with empty year', () => {
    assert.deepEqual(
      fieldsToEvent(['01-01', 'A', ' B', '']),
      { date: '01-01', event: 'A, B', year: undefined },
    );
  });

  it('returns undefined for fewer than 2 fields', () => {
    assert.equal(fieldsToEvent(['lonely']), undefined);
  });

  it('returns undefined for empty date', () => {
    assert.equal(fieldsToEvent(['', 'some event']), undefined);
  });

  it('trims whitespace from all fields', () => {
    assert.deepEqual(fieldsToEvent([' 01-01 ', ' Some event ', ' 1863 ']), {
      date: '01-01',
      event: 'Some event',
      year: '1863',
    });
  });
});

// --------------- loadEvents (integration) ---------------

describe('loadEvents', () => {
  it('loads events.csv and returns all 366 entries', () => {
    const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);
    assert.equal(events.length, 366);
  });

  it('parses a row with a year correctly', () => {
    const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);
    const jan2 = events.find(e => e.date === '01-02');
    assert.ok(jan2);
    assert.equal(jan2.year, '1492');
    assert.ok(jan2.event.includes('Granada'));
  });

  it('parses a row without a year correctly', () => {
    const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);
    const jan1 = events.find(e => e.date === '01-01');
    assert.ok(jan1);
    assert.equal(jan1.year, undefined);
    assert.equal(jan1.event, "New Year's Day");
  });

  it('parses a quoted row whose event text contains commas', () => {
    const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);
    // 01-23,"Shaanxi earthquake, most lethal in history (830k dead)",1556
    const jan23 = events.find(e => e.date === '01-23');
    assert.ok(jan23);
    assert.ok(jan23.event.includes('Shaanxi earthquake'));
    assert.ok(jan23.event.includes('most lethal'));
    assert.equal(jan23.year, '1556');
  });

  it('parses a quoted row with commas and no year', () => {
    const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);
    // 04-26,"Marcus Aurelius, David Hume, Ludwig Wittgenstein born",
    const apr26 = events.find(e => e.date === '04-26');
    assert.ok(apr26);
    assert.ok(apr26.event.includes('Marcus Aurelius'));
    assert.ok(apr26.event.includes('Ludwig Wittgenstein'));
    assert.equal(apr26.year, undefined);
  });
});

// --------------- getEventsForToday (leap year & boundary) ---------------

describe('getEventsForToday — leap year and date boundaries', () => {
  const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);

  // Helper: create a UTC date for a specific month/day/year
  function utc(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month - 1, day));
  }

  it('returns Feb 28 entry on Feb 28 of a leap year', () => {
    const result = getEventsForToday(events, 'UTC', utc(2024, 2, 28));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '02-28');
  });

  it('returns Feb 29 entry on Feb 29 of a leap year', () => {
    const result = getEventsForToday(events, 'UTC', utc(2024, 2, 29));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '02-29');
    assert.ok(result[0].event.includes('Leap Day'));
  });

  it('returns Mar 1 entry on Mar 1 of a leap year', () => {
    const result = getEventsForToday(events, 'UTC', utc(2024, 3, 1));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '03-01');
  });

  it('returns Feb 28 entry on Feb 28 of a non-leap year', () => {
    const result = getEventsForToday(events, 'UTC', utc(2023, 2, 28));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '02-28');
  });

  it('returns Mar 1 entry on Mar 1 of a non-leap year', () => {
    const result = getEventsForToday(events, 'UTC', utc(2023, 3, 1));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '03-01');
  });

  it('returns no Feb 29 match on any day of a non-leap year', () => {
    // In a non-leap year, Feb 29 never occurs, so Leap Day is simply skipped
    for (let day = 1; day <= 28; day++) {
      const result = getEventsForToday(events, 'UTC', utc(2023, 2, day));
      assert.ok(result.every(e => e.date !== '02-29'), `Unexpected Feb 29 match on Feb ${day}`);
    }
  });

  it('returns Dec 31 entry on Dec 31', () => {
    const result = getEventsForToday(events, 'UTC', utc(2024, 12, 31));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '12-31');
  });

  it('returns Jan 1 entry on Jan 1 after a leap year', () => {
    const result = getEventsForToday(events, 'UTC', utc(2025, 1, 1));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '01-01');
  });

  it('returns Jan 1 entry on Jan 1 after a non-leap year', () => {
    const result = getEventsForToday(events, 'UTC', utc(2024, 1, 1));
    assert.equal(result.length, 1);
    assert.equal(result[0].date, '01-01');
  });
});
