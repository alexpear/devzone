import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { formatPost } from './post.js';

describe('formatPost', () => {
  it('formats event with year', () => {
    const text = formatPost({ date: '02-10', event: 'Fire extinguisher patented', year: '1863' });
    assert.equal(text, 'On this day in 1863: Fire extinguisher patented #OnThisDay');
  });

  it('formats event without year', () => {
    const text = formatPost({ date: '06-21', event: 'Summer Solstice', year: undefined });
    assert.equal(text, 'On this day: Summer Solstice #OnThisDay');
  });

  it('includes the hashtag', () => {
    const text = formatPost({ date: '01-01', event: 'Test', year: '2000' });
    assert.ok(text.endsWith('#OnThisDay'));
  });

  it('truncates long event text to fit 300 graphemes', () => {
    const longEvent = 'A'.repeat(300);
    const text = formatPost({ date: '01-01', event: longEvent, year: '2000' });
    assert.ok(text.includes('…'));
    assert.ok(text.endsWith('#OnThisDay'));
    // "On this day in 2000: " (21) + truncated + "…" (1) + " #OnThisDay" (11) ≤ 300
    assert.ok([...text].length <= 300);
  });

  it('does not truncate text that exactly fits', () => {
    // "On this day: " (13) + event + " #OnThisDay" (11) = 300
    const event = 'X'.repeat(300 - 13 - 11);
    const text = formatPost({ date: '01-01', event, year: undefined });
    assert.ok(!text.includes('…'));
    assert.equal([...text].length, 300);
  });
});
