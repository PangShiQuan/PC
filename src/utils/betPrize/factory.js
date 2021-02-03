import compile from './resolution';

const PRIMARY_PRIZE = 'FIRST_PRIZE';

function extractRespectivePrize(prizeSettings, gameMethodId) {
  const resolveBetPrize = compile(prizeSettings, gameMethodId);

  return betString => resolveBetPrize(betString);
}

function extractOnlyPrize(prizeSetting, betString) {
  return prizeSetting.prizeAmount;
}

export default function assemble(gameMethodId, prizeSetting) {
  const {prizeSettings} = prizeSetting;
  const defaultPrize =
    prizeSettings.length === 1
      ? [prizeSettings[0]]
      : prizeSettings.filter(({prizeType}) => prizeType === PRIMARY_PRIZE);

  if (defaultPrize.length === 1)
    return extractOnlyPrize.bind(null, defaultPrize[0]);

  return extractRespectivePrize(prizeSetting, gameMethodId);
}
