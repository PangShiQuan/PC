const {trimString} = require('./trimString');

test('trimString test', () => {
  expect(trimString("12345 this is long", 5)).toBe("12345...");
});