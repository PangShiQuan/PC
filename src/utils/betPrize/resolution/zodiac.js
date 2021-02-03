import {
  SYMBOLIC_SHU,
  SYMBOLIC_NIU,
  SYMBOLIC_HU,
  SYMBOLIC_TU,
  SYMBOLIC_LONG,
  SYMBOLIC_SHE,
  SYMBOLIC_MA,
  SYMBOLIC_YANG,
  SYMBOLIC_HOU,
  SYMBOLIC_JI,
  SYMBOLIC_GOU,
  SYMBOLIC_ZHU,
  TAIL0,
  TAIL1,
  TAIL2,
  TAIL3,
  TAIL4,
  TAIL5,
  TAIL6,
  TAIL7,
  TAIL8,
  TAIL9,
} from '../../type.config';
import {byReference} from './mapBetPrize';

const SYMBOLIC = {
  SHU: SYMBOLIC_SHU,
  NIU: SYMBOLIC_NIU,
  HU: SYMBOLIC_HU,
  TU: SYMBOLIC_TU,
  LONG: SYMBOLIC_LONG,
  SHE: SYMBOLIC_SHE,
  MA: SYMBOLIC_MA,
  YANG: SYMBOLIC_YANG,
  HOU: SYMBOLIC_HOU,
  JI: SYMBOLIC_JI,
  GOU: SYMBOLIC_GOU,
  ZHU: SYMBOLIC_ZHU,
};
const TAIL = {
  TAIL0,
  TAIL1,
  TAIL2,
  TAIL3,
  TAIL4,
  TAIL5,
  TAIL6,
  TAIL7,
  TAIL8,
  TAIL9,
};

function zodiac(reference, setting, prop) {
  const thisPrizeSetting = {};
  const currentSymbolic = reference[setting[prop]];

  setting.prizeSettings.forEach(({prizeAmount, prizeType}) => {
    thisPrizeSetting[prizeType.indexOf('_CUR') > -1] = prizeAmount;
  });

  return byReference.bind(null, {
    prizeSetting: thisPrizeSetting,
    reference: currentSymbolic,
  });
}

export default {
  GST: {fn: zodiac.bind(null, TAIL), prop: 'symbolic'},
  GSX: {fn: zodiac.bind(null, SYMBOLIC), prop: 'symbolic'},
  SX: {fn: zodiac.bind(null, SYMBOLIC), prop: 'symbolic'},
  XB2: {fn: zodiac.bind(null, SYMBOLIC), prop: 'symbolic'},
  XB3: {fn: zodiac.bind(null, SYMBOLIC), prop: 'symbolic'},
  XB4: {fn: zodiac.bind(null, SYMBOLIC), prop: 'symbolic'},
  XB5: {fn: zodiac.bind(null, SYMBOLIC), prop: 'symbolic'},
  TB2: {fn: zodiac.bind(null, TAIL), prop: 'symbolic'},
  TB3: {fn: zodiac.bind(null, TAIL), prop: 'symbolic'},
  TB4: {fn: zodiac.bind(null, TAIL), prop: 'symbolic'},
  TB5: {fn: zodiac.bind(null, TAIL), prop: 'symbolic'},
};
