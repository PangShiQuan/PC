import * as type from './type.config';
import {GAME_CATEGORY_FN} from './codeResult/game';
import {form, is, reduce, span} from './calculation';

const {
  GAME_CATEGORY: {SHISHICAI, PK10, PCDANDAN, FIVE11, KUAI3, HAPPY10, NONE},
  CUSTOM_GAME_CATEGORY: {G1, QXC, SIX, XYPK},
} = type;

export const NUM_DISTRIBUTION = '号码分布';
export const SPAN_DISTRIBUTION = '跨度分布';

export const GAME_CATEGORY = {
  SHISHICAI,
  PK10,
  PCDANDAN,
  FIVE11,
  KUAI3,
  HAPPY10,
  NONE,
};

export const GAME_RESULT_CATEGORY = {
  HF_SHSSL: G1,
  PL3: G1,
  PL5: G1,
  X3D: G1,
  HF_JS3D: G1,
  MARK_SIX: SIX,
  MC_MARK_SIX: SIX,
  SG_MARK_SIX: SIX,
  TW_MARK_SIX: SIX,
  HF_JSMS: SIX,
  QXC,
  HF_XYPK: XYPK,
};
/* ---------------------------- */

export const DEFAULT_RESULT_CATEGORY = {
  methods: [],
  names: [],
  nums: [],
  units: [],
};

export const DEFAULT_METHOD = {
  numRange: [],
  resultsFn: [],
  post: [],
  trends: [],
  units: [],
};

// implicit mapping between this methods with the game methods group
const {
  [G1]: FN_G1,
  [HAPPY10]: FN_KL10F,
  [QXC]: FN_QXC,
  [PCDANDAN]: FN_PCDD,
  [SHISHICAI]: FN_SSC,
  [SIX]: FN_SIX,
} = GAME_CATEGORY_FN;

export const RESULT_CATEGORY_MAP = new Map([
  [
    FIVE11,
    {
      names: ['五星走势图'],
      nums: type.LEADNUM_1_11,
      units: type.UNITS_W_Q_B_S_G,
      methods: new Map([[['五星走势图'], {trends: [NUM_DISTRIBUTION]}]]),
    },
  ],
  [
    HAPPY10,
    {
      names: ['快乐十分走势图'],
      nums: type.LEADNUM_1_20,
      units: [],
      methods: new Map([
        [
          '快乐十分走势图',
          {
            resultsFn: {
              跨度: {fn: span},
              '012路': {
                fn: FN_KL10F.groupZeroOneTwo,
                group: [
                  {key: 0, label: '0路'},
                  {key: 1, label: '1路'},
                  {key: 2, label: '2路'},
                ],
              },
            },
            trends: [
              {
                group: {
                  小区: {color: '#bed4ff', nums: type.NUM_1_10},
                  大区: {color: '#ffcccc', nums: type.LEADNUM_1_20.slice(10)},
                },
              },
            ],
          },
        ],
      ]),
    },
  ],
  [
    G1,
    {
      names: ['三星', '前二', '后二'],
      nums: type.NUM_0_9,
      units: type.UNITS_B_S_G,
      methods: new Map([
        [
          ['三星'],
          {
            post: [type.LEOPARD[0]],
            resultsFn: {
              大小形态: {fn: FN_G1.getBigSmallThree},
              单双形态: {fn: FN_G1.getOddEven},
              质合形态: {fn: FN_G1.getPrimeComposite},
              '012形态': {fn: FN_G1.getZeroOneTwo},
              豹子: {fn: is.leopard},
              组三: {fn: is.groupThree},
              组六: {fn: is.groupSix},
              跨度: {fn: span},
              直选和值: {fn: reduce.getSum},
              和值尾数: {fn: reduce.getSumTail},
            },
            trends: [NUM_DISTRIBUTION],
          },
        ],
        [
          ['前二', '后二'],
          {
            post: ['对子'],
            resultsFn: {
              对子: {fn: is.pair},
              和值: {fn: reduce.getSum},
            },
            slice: true,
            trends: [NUM_DISTRIBUTION, SPAN_DISTRIBUTION],
          },
        ],
      ]),
    },
  ],
  [
    KUAI3,
    {
      names: ['快3走势图'],
      nums: type.NUM_1_6,
      units: type.UNITS_B_S_G,
      methods: new Map([
        [
          ['快3走势图'],
          {
            post: ['豹子', '对子'],
            resultsFn: {
              豹子: {fn: is.leopard},
              和值: {fn: reduce.getSum},
              对子: {fn: is.pair},
            },
            trends: [NUM_DISTRIBUTION],
          },
        ],
      ]),
    },
  ],
  [
    PCDANDAN,
    {
      names: ['PC蛋蛋走势图'],
      nums: type.NUM_0_27,
      units: ['开奖号'],
      openCode: {
        value(data) {
          return reduce.getSum(data);
        },
        view(data) {
          const view = [];
          let sum = 0;

          for (const [key, val] of data.entries()) {
            const concatChar = key !== 0 ? '+' : '';

            sum += parseInt(val);
            view.push(`${concatChar}${val}`);
          }

          view.push(`=${sum}`);

          return view;
        },
      },
      methods: new Map([
        [
          'PC蛋蛋走势图',
          {
            resultsFn: {
              大小单双: {fn: FN_PCDD.getTotalBigSmallOddEven},
              波色: {fn: FN_PCDD.getNumColor},
            },
          },
        ],
      ]),
    },
  ],
  [
    PK10,
    {
      names: ['PK拾走势图'],
      nums: type.NUM_1_10,
      units: type.PLACES,
    },
  ],
  [
    SHISHICAI,
    {
      names: ['五星', '四星', '前三', '中三', '后三', '前二', '后二'],
      nums: type.NUM_0_9,
      units: type.UNITS_W_Q_B_S_G,
      methods: new Map([
        ['五星', {trends: [NUM_DISTRIBUTION]}],
        ['四星', {slice: true, trends: [NUM_DISTRIBUTION]}],
        [
          ['前三', '中三', '后三'],
          {
            post: ['豹子'],
            resultsFn: {
              大小形态: {fn: FN_SSC.getBigSmall},
              单双形态: {fn: FN_SSC.getOddEven},
              质合形态: {fn: FN_SSC.getPrimeComposite},
              '012形态': {fn: FN_SSC.getZeroOneTwo},
              豹子: {fn: is.leopard},
              组三: {fn: is.groupThree},
              组六: {fn: is.groupSix},
              跨度: {fn: span},
              直选和值: {fn: reduce.getSum},
              和值尾数: {fn: reduce.getSumTail},
            },
            slice: true,
            trends: [NUM_DISTRIBUTION],
          },
        ],
        [
          ['前二', '后二'],
          {
            post: ['对子'],
            resultsFn: {
              对子: {fn: is.pair},
              和值: {fn: reduce.getSum},
            },
            slice: true,
            trends: [NUM_DISTRIBUTION, SPAN_DISTRIBUTION],
          },
        ],
      ]),
    },
  ],
  [
    SIX,
    {
      names: ['六合彩走势图'],
      nums: [],
      units: [],
      methods: new Map([
        [
          '六合彩走势图',
          {
            resultsFn: {
              平码: {
                fn: FN_SIX.getFlatCode,
                colorCodeFn: FN_SIX.getNumColor,
              },
              特码: {
                fn: FN_SIX.getSpecialCode,
                colorCodeFn: FN_SIX.getNumColor,
              },
              生肖: {fn: FN_SIX.getZodiacName},
              单双: {fn: FN_SIX.getOddEven},
              波色: {fn: FN_SIX.getSpecialNumColor},
              五行: {fn: FN_SIX.getElement},
              特头: {fn: FN_SIX.getSpecialHead},
              尾数: {fn: FN_SIX.getTailSum},
              合数单双: {fn: FN_SIX.getTotalOddEven},
            },
          },
        ],
      ]),
    },
  ],
  [
    QXC,
    {
      names: ['七星彩走势图'],
      nums: type.NUM_0_9,
      units: type.PLACES.slice(0, 4),
      methods: new Map([
        [
          '七星彩走势图',
          {
            resultsFn: {
              和值: {fn: reduce.getSum},
              跨度: {fn: span},
              大小比: {fn: FN_QXC.getBigSmallRatio},
              奇偶比: {fn: form.oddEvenRatio},
              质合比: {fn: form.primeCompositeRatio},
              和值尾数: {fn: reduce.getSumTail},
            },
            trends: [NUM_DISTRIBUTION, SPAN_DISTRIBUTION],
          },
        ],
      ]),
    },
  ],
  [
    XYPK,
    {
      names: ['新幸运扑克走势图'],
      nums: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
      isXPK: true,
      units: [],
      methods: new Map([
        [
          '新幸运扑克走势图',
          {
            post: [
              type.SP[0],
              type.DUIZI[0],
              type.LEOPARD[0],
              type.SUNZI[0],
              type.TONGHUA[0],
              type.TONGHUASUN[0],
            ],
            resultsFn: {
              散牌: {fn: is.leopard2},
              顺子: {fn: is.sunZi},
              同花: {fn: is.tongHua},
              同花顺: {fn: is.tongHuaSun},
              对子: {fn: is.duiZi},
              豹子: {fn: is.baoZi},
            },
            trends: [NUM_DISTRIBUTION],
          },
        ],
      ]),
    },
  ],
]);
