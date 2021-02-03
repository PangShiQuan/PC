import {byValue} from './mapBetPrize';

function specialNum({prizeSettings}) {
  const thisPrizeSetting = {};

  prizeSettings.forEach(({prizeAmount, prizeNameForDisplay}) => {
    thisPrizeSetting[prizeNameForDisplay] = Number(
      (prizeAmount * 0.9).toFixed(2),
    );
  });

  return byValue.bind(null, thisPrizeSetting);
}

export default {
  SA: {fn: specialNum},
};
