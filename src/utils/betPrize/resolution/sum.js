import {byValue} from './mapBetPrize';

function sum({prizeSettings}) {
  const thisPrizeSetting = {};

  prizeSettings.forEach(({prizeAmount, prizeNameForDisplay}) => {
    const betNum = prizeNameForDisplay.replace(/[^\d]+/g, '');
    thisPrizeSetting[betNum] = prizeAmount;
  });

  return byValue.bind(null, thisPrizeSetting);
}

export default {
  HZ: {fn: sum},
};
