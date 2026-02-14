import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { formatPost, formatDate } from './post.js';

describe('formatDate', () => {
    it('converts MM-DD to short month and day', () => {
        assert.equal(formatDate('01-01'), 'Jan 1');
        assert.equal(formatDate('02-10'), 'Feb 10');
        assert.equal(formatDate('12-25'), 'Dec 25');
    });

    it('strips leading zeros from the day', () => {
        assert.equal(formatDate('03-05'), 'Mar 5');
    });
});

describe('formatPost', () => {
    it('formats event with year', () => {
        const text = formatPost({
            date: '02-10',
            event: 'Fire extinguisher patented',
            year: '1863',
        });
        assert.equal(
            text,
            'Feb 10, 1863: Fire extinguisher patented #OnThisDay',
        );
    });

    it('formats event without year', () => {
        const text = formatPost({
            date: '06-21',
            event: 'Summer Solstice',
            year: undefined,
        });
        assert.equal(text, 'Jun 21: Summer Solstice #OnThisDay');
    });

    it('includes the hashtag', () => {
        const text = formatPost({ date: '01-01', event: 'Test', year: '2000' });
        assert.ok(text.endsWith('#OnThisDay'));
    });

    it('truncates long event text to fit 300 graphemes', () => {
        const longEvent = 'A'.repeat(300);
        const text = formatPost({
            date: '01-01',
            event: longEvent,
            year: '2000',
        });
        assert.ok(text.includes('…'));
        assert.ok(text.endsWith('#OnThisDay'));
        assert.ok([...text].length <= 300);
    });

    it('does not truncate text that exactly fits', () => {
        // "Jan 1: " (7) + event + " #OnThisDay" (11) = 300
        const event = 'X'.repeat(300 - 7 - 11);
        const text = formatPost({ date: '01-01', event, year: undefined });
        assert.ok(!text.includes('…'));
        assert.equal([...text].length, 300);
    });
});
