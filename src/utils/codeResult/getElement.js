import {ELEMENT} from '../type.config';

const {EARTH, FIRE, METAL, WATER, WOOD} = ELEMENT;

const ELEMENTS_DECADE_MAP = new Map([
  [
    2017,
    {
      endTime: 128,
      ELEMENTS: {
        [EARTH]: [11, 12, 19, 20, 27, 28, 41, 42, 49],
        [FIRE]: [1, 2, 9, 10, 23, 24, 31, 32, 39, 40],
        [METAL]: [3, 4, 17, 18, 25, 26, 33, 34, 47, 48],
        [WATER]: [5, 6, 13, 14, 21, 22, 35, 36, 43, 44],
        [WOOD]: [7, 8, 15, 16, 29, 30, 37, 38, 45, 46],
      },
    },
  ],
  [
    2018,
    {
      endTime: 216,
      ELEMENTS: {
        [EARTH]: [12, 13, 20, 21, 28, 29, 42, 43],
        [FIRE]: [2, 3, 10, 11, 24, 25, 32, 33, 40, 41],
        [METAL]: [4, 5, 18, 19, 26, 27, 34, 35, 48, 49],
        [WATER]: [6, 7, 14, 15, 22, 23, 36, 37, 44, 45],
        [WOOD]: [1, 8, 9, 16, 17, 30, 31, 38, 39, 46, 47],
      },
    },
  ],
  [
    2019,
    {
      endTime: 205,
      ELEMENTS: {
        [EARTH]: [13, 14, 21, 22, 29, 30, 43, 44],
        [FIRE]: [3, 4, 11, 12, 25, 26, 33, 34, 41, 42],
        [METAL]: [5, 6, 19, 20, 27, 28, 35, 36, 49],
        [WATER]: [7, 8, 15, 16, 23, 24, 37, 38, 45, 46],
        [WOOD]: [1, 2, 9, 10, 17, 18, 31, 32, 39, 40, 47, 48],
      },
    },
  ],
  [
    2020,
    {
      endTime: 125,
      ELEMENTS: {
        [EARTH]: [1, 14, 15, 22, 23, 30, 31, 44, 45],
        [FIRE]: [4, 5, 12, 13, 26, 27, 34, 35, 42, 43],
        [METAL]: [6, 7, 20, 21, 28, 29, 36, 37],
        [WATER]: [8, 9, 16, 17, 24, 25, 38, 39, 46, 47],
        [WOOD]: [2, 3, 10, 11, 18, 19, 32, 33, 40, 41, 48, 49],
      },
    },
  ],
  [
    2021,
    {
      endTime: 212,
      ELEMENTS: {
        [EARTH]: [1, 2, 15, 16, 23, 24, 31, 32, 45, 46],
        [FIRE]: [5, 6, 13, 14, 27, 28, 35, 36, 43, 44],
        [METAL]: [7, 8, 21, 22, 29, 30, 37, 38],
        [WATER]: [9, 10, 17, 18, 25, 26, 39, 40, 47, 48],
        [WOOD]: [3, 4, 11, 12, 19, 20, 33, 34, 41, 42, 49],
      },
    },
  ],
  [
    2022,
    {
      endTime: 201,
      ELEMENTS: {
        [EARTH]: [1, 2, ,3 ,16, 17, 24, 25, 32, 33, 46, 47],
        [FIRE]: [6, 7, 14, 15, 28, 29, 36, 37, 44, 45],
        [METAL]: [8, 9, 22, 23, 30, 31, 38, 39],
        [WATER]: [10, 11, 18, 19, 26, 27, 40, 41, 48, 49],
        [WOOD]: [4, 5, 12, 13, 20, 21, 34, 35, 42, 43],
      },
    },
  ],
  [
    2023,
    {
      endTime: 122,
      ELEMENTS: {
        [EARTH]: [2, 3, 4, 17, 18, 25, 26, 33, 34, 47, 48],
        [FIRE]: [7, 8, 15, 16, 29, 30, 37, 38, 45, 46],
        [METAL]: [1, 9, 10, 23, 24, 31, 32, 39, 40],
        [WATER]: [11, 12, 19, 20, 27, 28, 41, 42, 49],
        [WOOD]: [5, 6, 13, 14, 21, 22, 35, 36, 43, 44],
      },
    },
  ],
  [
    2024,
    {
      endTime: 210,
      ELEMENTS: {
        [EARTH]: [3, 4, 5, 18, 19, 26, 27, 34, 35, 48, 49],
        [FIRE]: [8, 9, 16, 17, 30, 31, 38, 39, 46, 47],
        [METAL]: [1, 2, 10, 11, 24, 25, 32, 33, 40, 41],
        [WATER]: [12, 13, 20, 21, 28, 29, 42, 43],
        [WOOD]: [6, 7, 14, 15, 22, 23, 36, 37, 44, 45],
      },
    },
  ],
  [
    2025,
    {
      endTime: 129,
      ELEMENTS: {
        [EARTH]: [4, 5, 6, 19, 20, 27, 28, 35, 36, 49],
        [FIRE]: [1, 9, 10, 17, 18, 31, 32, 39, 40, 47, 48],
        [METAL]: [2, 3, 11, 12, 25, 26, 33, 34, 41, 42],
        [WATER]: [13, 14, 21, 22, 29, 30, 43, 44],
        [WOOD]: [7, 8, 15, 16, 23, 24, 37, 38, 45, 46],
      },
    },
  ],
  [
    2026,
    {
      endTime: 217,
      ELEMENTS: {
        [EARTH]: [5, 6, 7, 20, 21, 28, 29, 36, 37],
        [FIRE]: [1, 2, 10, 11, 18, 19, 32, 33, 40, 41, 48, 49],
        [METAL]: [3, 4, 12, 13, 26, 27, 34, 35, 42, 43],
        [WATER]: [14, 15, 22, 23, 30, 31, 44, 45],
        [WOOD]: [8, 9, 16, 17, 24, 25, 38, 39, 46, 47],
      },
    },
  ],
  [
    2027,
    {
      endTime: 206,
      ELEMENTS: {
        [EARTH]: [6, 7, 8, 21, 22, 29, 30, 37, 38],
        [FIRE]: [2, 3, 11, 12, 19, 20, 33, 34, 41, 42, 49],
        [METAL]: [4, 5, 13, 14, 27, 28, 35, 36, 43, 44],
        [WATER]: [1, 15, 16, 23, 24, 31, 32, 45, 46],
        [WOOD]: [9, 10, 17, 18, 25, 26, 39, 40, 47, 48],
      },
    },
  ],
]);

export default function getElementName({
  currentTimeEpoch = Math.floor(Date.now() / 1000),
  openCode = '',
}) {
  if (!openCode || openCode < 0 || openCode > 49) return false;

  const baseDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
  baseDate.setUTCSeconds(currentTimeEpoch);

  const year = baseDate.getFullYear();

  if (!ELEMENTS_DECADE_MAP.has(year) || !ELEMENTS_DECADE_MAP.has(year - 1))
    throw new Error(`缺失该${year - 1}-${year}年份五行对应号码的数据, 请更新.`);

  const code = parseInt(openCode);
  const elementYear = ELEMENTS_DECADE_MAP.get(year);
  const monthDay = parseInt(
    `${baseDate.getMonth() + 1}${baseDate
      .getDate()
      .toString()
      .padStart(2, '0')}`,
  );
  const {ELEMENTS} =
    monthDay < elementYear.endTime
      ? ELEMENTS_DECADE_MAP.get(year - 1)
      : elementYear;

  return Object.entries(ELEMENTS).find(([element, nums]) =>
    nums.includes(code),
  )[0];
}
