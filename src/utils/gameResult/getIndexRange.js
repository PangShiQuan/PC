import {NUM_MAP, NUM_SEQUENCE, POSITION} from '../type.config';

function createIndexRangeRegex(item, optional = false) {
  let str = '[';

  for (let index = 0; index < item.length; index++) {
    str += item[index];
  }

  str += `]${optional ? '?' : ''}`;

  return str;
}

const REGEX_NUM_SEQ = createIndexRangeRegex(
  Object.keys(NUM_SEQUENCE),
  true,
).concat(createIndexRangeRegex([...NUM_MAP.keys()]));
const regexList = [REGEX_NUM_SEQ];

// get index ranges based on the defined units and the selected game result view for the lotto
function getIndexRange(units, gameResultView) {
  const numCount = Array.isArray(units)
    ? units.length
    : units.toString().length;
  let start = null;
  let end = null;

  for (let index = 0; index < regexList.length; index++) {
    const regex = regexList[index];
    const match = gameResultView.match(regex);

    if (match) {
      switch (regex) {
        case REGEX_NUM_SEQ:
          {
            const matchStr = match[0].split('');
            const endIndex = matchStr.length === 2 ? 1 : 0;
            const startMap = NUM_SEQUENCE[matchStr[endIndex - 1]];
            const endMap = NUM_MAP.get(matchStr[endIndex]);

            switch (startMap) {
              case NUM_SEQUENCE[POSITION.FRONT]: {
                start = startMap;
                end = endMap - 1;
                break;
              }
              case NUM_SEQUENCE[POSITION.MID]: {
                const totalHalf = Math.floor(numCount * startMap);
                const rangeHalf = endMap * startMap;

                start = totalHalf - Math.floor(rangeHalf / 2) - 1;
                end = totalHalf + Math.floor(Math.ceil(rangeHalf) / 2);
                break;
              }
              case NUM_SEQUENCE[POSITION.REAR]: {
                end = endMap * startMap;
                break;
              }
              default: {
                start = numCount - endMap;
                end = numCount - 1;
              }
            }
          }
          break;
        default:
          throw new Error(
            `无法辨认此单位:${gameResultView}, 缺失相关单位处理逻辑`,
          );
      }
      break;
    }
  }
  return {start, end};
}

export default getIndexRange;
