import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseCsvRow, fieldsToEvent, loadEvents } from './csv.js';

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
    const jan1 = events.find(e => e.date === '01-01');
    assert.ok(jan1);
    assert.equal(jan1.year, '1863');
    assert.ok(jan1.event.includes('Emancipation Proclamation'));
  });

  it('parses a row without a year correctly', () => {
    const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);
    const mar19 = events.find(e => e.date === '03-19');
    assert.ok(mar19);
    assert.equal(mar19.year, undefined);
  });

  it('parses a row whose event text contains commas', () => {
    const events = loadEvents(new URL('../data/events.csv', import.meta.url).pathname);
    // "03-23,Patrick Henry delivers his "Give me liberty, or give me death!" speech,1775"
    const mar23 = events.find(e => e.date === '03-23');
    assert.ok(mar23);
    assert.ok(mar23.event.includes('liberty'));
    assert.equal(mar23.year, '1775');
  });
});
