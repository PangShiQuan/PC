export default function isPrimeNumber(num) {
  if (num === 0) return false;
  if (num === 1 || num === 2) return true;
  const divisor = Math.floor(num / 2);
  if (divisor === 1) return true;
  for (let i = 2; i <= divisor; i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}
