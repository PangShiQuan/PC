import count from './count';
import specialNum from './specialNum';
import sum from './sum';
import zodiac from './zodiac';
import {byValue} from './mapBetPrize';

const resolution = {...count, ...specialNum, ...sum, ...zodiac};

export default function tryResolve(setting, methodId) {
  const resolve = resolution[methodId];

  if (resolve) return resolve.fn(setting, resolve.prop);

  const thisPrizeSetting = {};
  setting.prizeSettings.forEach(({prizeAmount, prizeNameForDisplay}) => {
    thisPrizeSetting[prizeNameForDisplay] = prizeAmount;
  });

  return byValue.bind(null, thisPrizeSetting);
}
