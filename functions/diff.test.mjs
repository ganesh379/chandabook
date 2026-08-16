// Exercises the array-diff logic the trigger depends on. Mirrors newEntries()
// in index.js. Run: node functions/diff.test.mjs
const newEntries = (before = [], after = []) => {
  const seen = new Set((before || []).map((e) => e && e.id).filter(Boolean));
  const added = (after || []).filter((e) => e && e.id && !seen.has(e.id));
  if (added.length > 0) return added;
  const growth = (after || []).length - (before || []).length;
  return growth > 0 ? (after || []).slice(0, growth) : [];
};

let pass = 0, fail = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) console.log(`   expected ${JSON.stringify(expected)}\n   actual   ${JSON.stringify(actual)}`);
  ok ? pass++ : fail++;
};

// The app PREPENDS new entries: [newItem, ...existing]
check('single new donation (prepended)',
  newEntries([{ id: 'a' }], [{ id: 'b' }, { id: 'a' }]).map(e => e.id), ['b']);

check('two new donations at once',
  newEntries([{ id: 'a' }], [{ id: 'c' }, { id: 'b' }, { id: 'a' }]).map(e => e.id), ['c', 'b']);

check('first ever entry (empty before)',
  newEntries([], [{ id: 'a' }]).map(e => e.id), ['a']);

check('no change -> nothing', newEntries([{ id: 'a' }], [{ id: 'a' }]), []);

check('deletion must NOT notify',
  newEntries([{ id: 'a' }, { id: 'b' }], [{ id: 'b' }]), []);

check('edit in place must NOT notify',
  newEntries([{ id: 'a', amount: 100 }], [{ id: 'a', amount: 500 }]), []);

check('undefined arrays (new group)', newEntries(undefined, undefined), []);

check('field-only change on group (arrays untouched)',
  newEntries([{ id: 'a' }], [{ id: 'a' }]), []);

// Legacy rows without ids fall back to length growth
check('legacy entries without ids',
  newEntries([{ donorName: 'X' }], [{ donorName: 'Y' }, { donorName: 'X' }]).map(e => e.donorName), ['Y']);

check('replaced-not-grown legacy array stays quiet',
  newEntries([{ donorName: 'X' }], [{ donorName: 'Y' }]), []);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
