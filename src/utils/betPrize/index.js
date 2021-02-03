import assemble from './factory';

function getBetPrize(gameMethodId, betString, prizeSetting) {
  const applyPrizeSetting = assemble(gameMethodId, prizeSetting);
  const betPrize = applyPrizeSetting(betString);

  return betPrize;
}

function calculateBetPrize(gameMethodId, betString, prizeSetting) {
  return getBetPrize(gameMethodId, betString, prizeSetting);
}

export default {
  calculateBetPrize,
  getBetPrize,
};
