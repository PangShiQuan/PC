import {byCount, byCountXYPKRZ1, byCountXYPKRZ2} from './mapBetPrize';

function count(prizeTypePrefix = '', {prizeSettings}) {
  const thisPrizeSetting = {};

  prizeSettings.forEach(({prizeAmount, prizeType}) => {
    thisPrizeSetting[prizeType.replace(prizeTypePrefix, '')] = prizeAmount;
  });
  switch (prizeTypePrefix) {
    case 'XYPK_R1_':
      return byCountXYPKRZ1.bind(null, thisPrizeSetting);
    case 'XYPK_R2_':
      return byCountXYPKRZ2.bind(null, thisPrizeSetting);
    default:
      return byCount.bind(null, thisPrizeSetting);
  }
}

export default {
  GRPX: {fn: count.bind(null, 'MARKSIX_GROUP_XIAO_')},
  NR1: {fn: count.bind(null, 'XYPK_R1_')},
  NR2: {fn: count.bind(null, 'XYPK_R2_')},
  NR3: {fn: count.bind(null, 'XYPK_R3_')},
};
