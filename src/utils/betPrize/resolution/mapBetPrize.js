import sliceBet from '../sliceBet';

export function byReference({prizeSetting, reference}, betString) {
  const betItemSlice = sliceBet(betString);
  const betItemPrizes = {};

  betItemSlice.forEach(value => {
    betItemPrizes[value] = prizeSetting[value === reference];
  });

  return betItemPrizes;
}

export function byValue(prizeSetting, betString) {
  const betItemSlice = sliceBet(betString);
  const betItemPrizes = {};

  betItemSlice.forEach(value => {
    betItemPrizes[value] = prizeSetting[value];
  });

  return betItemPrizes;
}

export function byCount(prizeSetting, betString) {
  const betItemSlice = sliceBet(betString);

  return prizeSetting[betItemSlice.length];
}

export function byCountXYPKRZ1(prizeSetting, betString) {
  const betItemSlice = sliceBet(betString);

  if (betItemSlice.length == 2) {
    return prizeSetting[betItemSlice.length]*2;
  }
  if (betItemSlice.length >= 3) {
    return prizeSetting[betItemSlice.length]*3;
  }
  return prizeSetting[betItemSlice.length];
}

export function byCountXYPKRZ2(prizeSetting, betString) {
  const betItemSlice = sliceBet(betString);

  if (betItemSlice.length >= 3) {
    return prizeSetting[betItemSlice.length]*3;
  }
  return prizeSetting[betItemSlice.length];
}
