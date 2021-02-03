import {forEach} from 'lodash';

export const getEachPicksLength = function({gameSections, thisBetObj}) {
  const picksLength = [];
  forEach(gameSections, section => {
    let length = 0;
    forEach(thisBetObj[section], string => {
      if (string !== '') {
        length++;
      }
    });
    picksLength.push(length);
  });
  return picksLength;
};
