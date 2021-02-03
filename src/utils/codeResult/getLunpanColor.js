export default function getLunpanColor(num) {
  const greenNum = [0];
  const redNum = [
    1,
    3,
    5,
    7,
    9,
    12,
    14,
    16,
    18,
    19,
    21,
    23,
    25,
    27,
    30,
    32,
    34,
    36,
    '红',
  ];
  const blackNum = [
    2,
    4,
    6,
    8,
    10,
    11,
    13,
    15,
    17,
    20,
    22,
    24,
    26,
    28,
    29,
    31,
    33,
    35,
    '黑',
  ];
  if (greenNum.includes(num)) {
    return 'green';
  }
  if (blackNum.includes(num)) {
    return 'black';
  }
  if (redNum.includes(num)) {
    return 'red';
  }
}
