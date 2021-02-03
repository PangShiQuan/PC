import isPrimeNumber from '../isPrimeNumber';

export function bigSmall(value, threshold) {
  return value > threshold;
}

export function oddEven(value) {
  return value % 2 !== 0;
}

export function primeComposite(value) {
  return isPrimeNumber(value);
}

export function zeroOneTwo(value) {
  return value % 3;
}

export function bigSmallRatio(nums, threshold) {
  const result = {true: 0, false: 0};

  for (const current of nums) result[bigSmall(current, threshold)] += 1;

  return Object.values(result).join(':');
}

export function oddEvenRatio(nums) {
  const result = {true: 0, false: 0};

  for (const current of nums) result[oddEven(current)] += 1;

  return Object.values(result).join(':');
}

export function primeCompositeRatio(nums) {
  const result = {true: 0, false: 0};

  for (const current of nums) result[primeComposite(current)] += 1;

  return Object.values(result).join(':');
}
