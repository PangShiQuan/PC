/* eslint-disable camelcase, quote-props */
import initializeArrayWithRange from './initializeArrayWithRange';
import addLeadingZero from './addLeadingZero';

export const title = '亲';
export const SIG = 'c6Web';
export const username = `${SIG}:username`;
export const expiredTime = `${SIG}:expiredTime`;
export const accessToken = `${SIG}:accessToken`;
export const sessionId = `${SIG}:sessionId`;
export const popupDidUnmount = `${SIG}:popupDidUnmount`;
export const COMBO_DUPLEX = 'combo_duplex';
export const DIRECT_COMBINE = 'combine_3';
export const DUPLEX = 'duplex';
export const GRAND_PRIZE = '头等奖';
export const DISTRIBUTION = '分布';
export const STRAIGHT = '直选';
export const LAST_COUNT = '尾数';
export const GROUP = '组';
export const GROUP_2 = 'group_2';
export const GROUP_2__OPEN = 'group_2__open';
export const GROUP_3 = 'group_3';
export const GROUP_3__SINGLE = 'group_3__single';
export const GROUP_3__OPEN = 'group_3__open';
export const GROUP_6 = 'group_6';
export const GROUP_6__OPEN = 'group_6__open';
export const GROUP_PICK_12 = 'group_pick_12';
export const GROUP_PICK_12__OPEN = 'group_pick_12__open';
export const GROUP_PICK_24 = 'group_pick_24';
export const GROUP_PICK_24__OPEN = 'group_pick_24__open';
export const GROUP_PICK_4 = 'group_pick_4';
export const GROUP_PICK_4__OPEN = 'group_pick_4__open';
export const GROUP_PICK_6 = 'group_pick_6';
export const GROUP_PICK_6__OPEN = 'group_pick_6__open';
export const NORMAL = '普通';
export const SINGLE = 'single';
export const SUM = 'open_pick_sum';
export const SUM__OPEN = 'sum__open';
export const BUNDLING_THREE = 'bundling_three';
export const TOP_THREE_BET = 'top_three_bet';
export const TOP_TWO_BET = 'top_two_bet';
export const DIRECT_PICK_PULL_BET = 'direct_pick_pull_bet';
export const DIRECT_MULTIPLY = 'direct_multiply';
export const SYMBOLICS_BINGO = 'symbolics_bingo';
export const SYMBOLIC_CONNECT_FOUR = 'symbolic_connect_four';
export const CONNECT_NUM_3 = 'connect_num__3';
export const CONNECT_NUM_2 = 'connect_num__2';
export const CONNECT_NUM_4 = 'connect_num__4';

export const UNITS = {
  元: 1,
  角: 0.1,
  分: 0.01,
};

// Symbolics
export const SYMBOLIC_SA_NOT_SET = 0;
export const SYMBOLIC_SHU = '鼠';
export const SYMBOLIC_NIU = '牛';
export const SYMBOLIC_HU = '虎';
export const SYMBOLIC_TU = '兔';
export const SYMBOLIC_LONG = '龙';
export const SYMBOLIC_SHE = '蛇';
export const SYMBOLIC_MA = '马';
export const SYMBOLIC_YANG = '羊';
export const SYMBOLIC_HOU = '猴';
export const SYMBOLIC_JI = '鸡';
export const SYMBOLIC_GOU = '狗';
export const SYMBOLIC_ZHU = '猪';
export const SYMBOLIC_CURRENT_YEAR = '当年肖';

export const TAIL0 = '0尾';
export const TAIL1 = '1尾';
export const TAIL2 = '2尾';
export const TAIL3 = '3尾';
export const TAIL4 = '4尾';
export const TAIL5 = '5尾';
export const TAIL6 = '6尾';
export const TAIL7 = '7尾';
export const TAIL8 = '8尾';
export const TAIL9 = '9尾';

export const HEAD0 = '0头';
export const HEAD1 = '1头';
export const HEAD2 = '2头';
export const HEAD3 = '3头';
export const HEAD4 = '4头';

// label sets
export const UNITS_W_Q_B_S_G = ['万位', '千位', '百位', '十位', '个位'];
export const UNITS_W_Q_B = ['万位', '千位', '百位'];
export const UNITS_Q_B_G = ['千位', '百位', '十位'];
export const UNITS_Q_B_G_S = ['千位', '百位', '十位', '个位'];
export const UNITS_B_S_G = ['百位', '十位', '个位'];
export const UNITS_W_Q = ['万位', '千位'];
export const UNITS_Q_B = ['千位', '百位'];
export const UNITS_B_S = ['百位', '十位'];
export const UNITS_S_G = ['十位', '个位'];
export const UNITS_W = ['万位'];
export const UNITS_Q = ['千位'];
export const UNITS_B = ['百位'];
export const UNITS_S = ['十位'];
export const UNITS_G = ['个位'];
export const PICK_NUM = ['选码'];
export const PICK_NUMBER = ['号码'];
export const PICK_CARD = ['选卡'];
export const UNFIX = ['不定位'];
export const TOTAL_SUMS = ['总和'];
export const SUM_VALUES = ['和值'];
export const PICK_GROUP = ['组选'];
export const PICK_GROUP_24 = ['组选24'];
export const TRIPLE_SINGLE_NUM = ['二重号'];
export const DOUBLE_SINGLE_NUM = ['二重号', '单号'];
export const DOUBLE_NUM = ['三重号', '单号'];
export const RANKS = [
  '第一名',
  '第二名',
  '第三名',
  '第四名',
  '第五名',
  '第六名',
  '第七名',
  '第八名',
  '第九名',
  '第十名',
];
export const PLACES = [
  '第一位',
  '第二位',
  '第三位',
  '第四位',
  '第五位',
  '第六位',
  '第七位',
  '第八位',
  '第九位',
  '第十位',
];
export const TOP_ONE_RANK = ['冠军'];
export const TOP_TWO_RANK = ['冠军', '亚军'];
export const TOP_THREE_RANK = ['冠军', '亚军', '季军'];
export const ALL_RANK = [
  '冠军',
  '亚军',
  '季军',
  RANKS[3],
  RANKS[4],
  RANKS[5],
  RANKS[6],
  RANKS[7],
  RANKS[8],
  RANKS[9],
];
export const BACK_FIRST_RANK = ALL_RANK.slice(-1);
export const BACK_TWO_RANK = ALL_RANK.slice(-2);
export const BACK_THREE_RANK = ALL_RANK.slice(-3);
export const DIRECT_PICK = ['胆拖'];
export const DIRECT_PICK_PULL = ['胆码', '拖码'];
export const FIRST = ['首位'];
export const PUPOLAR_PICK = ['红投'];
export const FRONT_BACK = ['前位', '后位'];
export const GROUP_TWO = ['二连组'];
export const GROUP_THREE = ['三连组'];
export const TOP_THREE_PLACE = [PLACES[0], PLACES[1], PLACES[2]];
export const HAPPY_TWO = ['快乐二'];
export const HAPPY_THREE = ['快乐三'];
export const HAPPY_FOUR = ['快乐四'];
export const HAPPY_FIVE = ['快乐五'];
export const LEOPARD = ['豹子'];
export const SP = ['散牌'];
export const DUIZI = ['对子'];
export const SUNZI = ['顺子'];
export const TONGHUA = ['同花'];
export const TONGHUASUN = ['同花顺'];
export const SPAN = ['跨度'];
export const CATEGORY = ['种类'];
export const COLOR_BALL = ['波色'];
export const BUNDLE_THREE = ['包三'];
export const SPECIAL_NUM = ['特码'];
export const MIX = ['混合'];
export const SAME_UNSAME = ['同号', '不同号'];
export const PICK_ALL = ['通选'];
export const NUM_ONE = ['一码'];
export const NUM_TWO = ['二码'];
export const DRAGON_AND_TIGER = ['龙虎'];
export const FRONT_THREE = ['前三'];
export const CENTER_THREE = ['中三'];
export const BACK_THREE = ['后三'];
export const COW = ['斗牛'];
export const LUNPAN = ['轮盘'];

export const POSITION = {
  FRONT: '前',
  MID: '中',
  REAR: '后',
};

// index range of result to be sliced according to the combination of both num sequence and map
export const NUM_SEQUENCE = {
  [POSITION.FRONT]: 0,
  [POSITION.MID]: 0.5,
  [POSITION.REAR]: -1,
};
export const NUM_MAP = new Map([
  ['二', 2],
  ['三', 3],
  ['四', 4],
  ['五', 5],
  ['拾', 10],
]);

// buttons sets
export const NUM_0_9 = initializeArrayWithRange(9);
export const NUM_1_10 = initializeArrayWithRange(10, 1);
export const NUM_1_6 = initializeArrayWithRange(6, 1);
export const NUM_0_18 = initializeArrayWithRange(18);
export const NUM_3_18 = initializeArrayWithRange(18, 3);
export const NUM_3_19 = initializeArrayWithRange(19, 3);
export const NUM_0_27 = initializeArrayWithRange(27);
export const NUM_1_26 = initializeArrayWithRange(26, 1);
export const NUM_3_24 = initializeArrayWithRange(24, 3);
export const LEADNUM_19_20 = initializeArrayWithRange(20, 19);
export const LEADNUM_1_10 = initializeArrayWithRange(10, 1).map(addLeadingZero);
export const LEADNUM_1_11 = initializeArrayWithRange(11, 1).map(addLeadingZero);
export const LEADNUM_1_18 = initializeArrayWithRange(18, 1).map(addLeadingZero);
export const LEADNUM_1_20 = initializeArrayWithRange(20, 1).map(addLeadingZero);
export const LEADNUM_1_49 = initializeArrayWithRange(49, 1).map(addLeadingZero);

export const POKER_DZDX_DISPLAY_TEXT = [
  ['1', '1'],
  ['2', '2'],
  ['3', '3'],
  ['4', '4'],
  ['5', '5'],
  ['6', '6'],
  ['7', '7'],
  ['8', '8'],
  ['9', '9'],
  ['10', '10'],
  ['11', '11'],
  ['12', '12'],
  ['13', '13'],
];
export const POKER_DZDX = [
  'AA',
  '22',
  '33',
  '44',
  '55',
  '66',
  '77',
  '88',
  '99',
  '1010',
  'JJ',
  'QQ',
  'KK',
];
export const POKER_BZDX_DISPLAY_TEXT = [
  ['1', '1', '1'],
  ['2', '2', '2'],
  ['3', '3', '3'],
  ['4', '4', '4'],
  ['5', '5', '5'],
  ['6', '6', '6'],
  ['7', '7', '7'],
  ['8', '8', '8'],
  ['9', '9', '9'],
  ['10', '10', '10'],
  ['11', '11', '11'],
  ['12', '12', '12'],
  ['13', '13', '13'],
];
export const POKER_BZDX = [
  'AAA',
  '222',
  '333',
  '444',
  '555',
  '666',
  '777',
  '888',
  '999',
  '101010',
  'JJJ',
  'QQQ',
  'KKK',
];
export const POKER_THSDX_DISPLAY_TEXT = [['100'], ['200'], ['300'], ['400']];
export const POKER_THSDX = ['黑桃顺子', '红桃顺子', '梅花顺子', '方块顺子'];
export const POKER_SZDX_DISPLAY_TEXT = [
  ['1', '2', '3'],
  ['2', '3', '4'],
  ['3', '4', '5'],
  ['4', '5', '6'],
  ['5', '6', '7'],
  ['6', '7', '8'],
  ['7', '8', '9'],
  ['8', '9', '10'],
  ['9', '10', '11'],
  ['10', '11', '12'],
  ['11', '12', '13'],
  ['12', '13', '1'],
];
export const POKER_SZDX = [
  'A23',
  '234',
  '345',
  '456',
  '567',
  '678',
  '789',
  '8910',
  '910J',
  '10JQ',
  'JQK',
  'QKA',
];
export const POKER_THDX_DISPLAY_TEXT = [...POKER_THSDX_DISPLAY_TEXT];
export const POKER_THDX = ['黑桃', '红桃', '梅花', '方块'];
export const POKER_BX_DISPLAY_TEXT = [
  ['201', '401', '311'],
  ['201', '401', '301'],
  ['201', '203', '207'],
  ['201', '402', '303'],
  ['201', '202', '203'],
];
export const POKER_BX = [
  '对子包选',
  '豹子包选',
  '同花包选',
  '顺子包选',
  '同花顺包选',
];
export const POKER_LM = [
  '黑',
  '红',
  '黑单',
  '红单',
  '全黑',
  '全红',
  '一黑',
  '一红',
  '二花',
  '三花',
  '同花',
];
export const POKER_NRX_SPADES = [
  '黑桃A',
  '黑桃2',
  '黑桃3',
  '黑桃4',
  '黑桃5',
  '黑桃6',
  '黑桃7',
  '黑桃8',
  '黑桃9',
  '黑桃10',
  '黑桃J',
  '黑桃Q',
  '黑桃K',
];
export const POKER_NRX_CLUBS = [
  '梅花A',
  '梅花2',
  '梅花3',
  '梅花4',
  '梅花5',
  '梅花6',
  '梅花7',
  '梅花8',
  '梅花9',
  '梅花10',
  '梅花J',
  '梅花Q',
  '梅花K',
];
export const POKER_NRX_HEARTS = [
  '红桃A',
  '红桃2',
  '红桃3',
  '红桃4',
  '红桃5',
  '红桃6',
  '红桃7',
  '红桃8',
  '红桃9',
  '红桃10',
  '红桃J',
  '红桃Q',
  '红桃K',
];
export const POKER_NRX_DIAMONDS = [
  '方块A',
  '方块2',
  '方块3',
  '方块4',
  '方块5',
  '方块6',
  '方块7',
  '方块8',
  '方块9',
  '方块10',
  '方块J',
  '方块Q',
  '方块K',
];
export const POKER_NRX = [
  ...POKER_NRX_SPADES,
  ...POKER_NRX_HEARTS,
  ...POKER_NRX_CLUBS,
  ...POKER_NRX_DIAMONDS,
];
export const POKER_NRX_DISPLAY_TEXT = [
  ['101'],
  ['102'],
  ['103'],
  ['104'],
  ['105'],
  ['106'],
  ['107'],
  ['108'],
  ['109'],
  ['110'],
  ['111'],
  ['112'],
  ['113'],
  ['201'],
  ['202'],
  ['203'],
  ['204'],
  ['205'],
  ['206'],
  ['207'],
  ['208'],
  ['209'],
  ['210'],
  ['211'],
  ['212'],
  ['213'],
  ['301'],
  ['302'],
  ['303'],
  ['304'],
  ['305'],
  ['306'],
  ['307'],
  ['308'],
  ['309'],
  ['310'],
  ['311'],
  ['312'],
  ['313'],
  ['401'],
  ['402'],
  ['403'],
  ['404'],
  ['405'],
  ['406'],
  ['407'],
  ['408'],
  ['409'],
  ['410'],
  ['411'],
  ['412'],
  ['413'],
];
export const NEW_RX_MIXBETSTRING = {
  '101': '黑桃A',
  '102': '黑桃2',
  '103': '黑桃3',
  '104': '黑桃4',
  '105': '黑桃5',
  '106': '黑桃6',
  '107': '黑桃7',
  '108': '黑桃8',
  '109': '黑桃9',
  '110': '黑桃10',
  '111': '黑桃J',
  '112': '黑桃Q',
  '113': '黑桃K',
  '201': '红桃A',
  '202': '红桃2',
  '203': '红桃3',
  '204': '红桃4',
  '205': '红桃5',
  '206': '红桃6',
  '207': '红桃7',
  '208': '红桃8',
  '209': '红桃9',
  '210': '红桃10',
  '211': '红桃J',
  '212': '红桃Q',
  '213': '红桃K',
  '301': '梅花A',
  '302': '梅花2',
  '303': '梅花3',
  '304': '梅花4',
  '305': '梅花5',
  '306': '梅花6',
  '307': '梅花7',
  '308': '梅花8',
  '309': '梅花9',
  '310': '梅花10',
  '311': '梅花J',
  '312': '梅花Q',
  '313': '梅花K',
  '401': '方块A',
  '402': '方块2',
  '403': '方块3',
  '404': '方块4',
  '405': '方块5',
  '406': '方块6',
  '407': '方块7',
  '408': '方块8',
  '409': '方块9',
  '410': '方块10',
  '411': '方块J',
  '412': '方块Q',
  '413': '方块K',
};
export const POKER_A_K_DISPLAY_TEXT = [
  ['1'],
  ['2'],
  ['3'],
  ['4'],
  ['5'],
  ['6'],
  ['7'],
  ['8'],
  ['9'],
  ['10'],
  ['11'],
  ['12'],
  ['13'],
];
export const POKER_A_K = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];
export const DRAGON_TIGER_SUM = ['龙', '虎', '和'];
export const FORMS = ['大小形态', '单双形态', '质合形态', '012形态'];
export const T_NAME = {
  BIG: '大',
  SMALL: '小',
  XBIG: '极大',
  XSMALL: '极小',
  ODD: '单',
  EVEN: '双',
  PRIME: '质',
  COMPOSITE: '合',
};
export const BSOE = [T_NAME.BIG, T_NAME.SMALL, T_NAME.ODD, T_NAME.EVEN];
export const DX_DS = ['大单', '大双', '小单', '小双'];
export const BS_DS = [...BSOE, ...DX_DS];
export const BS_DS_EXTEND = [...BSOE, ...DX_DS, T_NAME.XBIG, T_NAME.XSMALL];
export const DRAGON_TIGER_BSOE = [...BSOE, '龙', '虎'];
export const DRAGON_TIGER_BS_DS = [...BS_DS, '龙', '虎'];
export const POSITIVE_NUM = [
  '单码',
  '双码',
  '大码',
  '小码',
  '合单',
  '合双',
  '合大',
  '合小',
  '红波',
  '蓝波',
  '绿波',
  '尾大',
  '尾小',
];
export const MIX_TWO = [
  '红单',
  '红双',
  '红大',
  '红小',
  '蓝单',
  '蓝双',
  '蓝大',
  '蓝小',
  '绿单',
  '绿双',
  '绿大',
  '绿小',
];
export const MIX_THREE = [
  '红大单',
  '红大双',
  '红小单',
  '红小双',
  '蓝大单',
  '蓝大双',
  '蓝小单',
  '蓝小双',
  '绿大单',
  '绿大双',
  '绿小单',
  '绿小双',
];
export const SPECIAL_SYMBOLICS = [
  '特大',
  '特小',
  '特尾大',
  '特尾小',
  '特单',
  '特双',
  '特大单',
  '特大双',
  '特合大',
  '特合小',
  '特小单',
  '特小双',
  '特合单',
  '特合双',
  '特天肖',
  '特地肖',
  '特前肖',
  '特后肖',
  '特家肖',
  '特野肖',
  '总大',
  '总小',
  '总单',
  '总双',
];
export const COLOR_THREE = ['红波', '蓝波', '绿波'];
export const DRAW = '和局';
export const COLOR_THREE_DRAW = [...COLOR_THREE, DRAW];
export const COLOR_NUM = [
  {
    displayText: '红波',
    color: 'red',
    numberArrays: [
      '01',
      '02',
      '07',
      '08',
      '12',
      '13',
      '18',
      '19',
      '23',
      '24',
      '29',
      '30',
      '34',
      '35',
      '40',
      '45',
      '46',
    ],
  },
  {
    displayText: '蓝波',
    color: 'blue',
    numberArrays: [
      '03',
      '04',
      '09',
      '10',
      '14',
      '15',
      '20',
      '25',
      '26',
      '31',
      '36',
      '37',
      '41',
      '42',
      '47',
      '48',
    ],
  },
  {
    displayText: '绿波',
    color: 'green',
    numberArrays: [
      '05',
      '06',
      '11',
      '16',
      '17',
      '21',
      '22',
      '27',
      '28',
      '32',
      '33',
      '38',
      '39',
      '43',
      '44',
      '49',
    ],
  },
];
export const SYMBOLICS = [
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
];
export const SYMBOLICS_NUMS = ['2肖', '3肖', '4肖', '5肖', '6肖', '7肖'];
export const TOTAL_SYMBOLICS = [...SYMBOLICS_NUMS, '总肖单', '总肖双'];
export const HEAD_NUM = [HEAD0, HEAD1, HEAD2, HEAD3, HEAD4];
export const TAIL_NUM = [
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
];
export const HEAD_TAIL_NUM = [...HEAD_NUM, ...TAIL_NUM];
export const ELEMENT = {
  METAL: '金',
  WOOD: '木',
  WATER: '水',
  FIRE: '火',
  EARTH: '土',
};
export const FIVE_ELEMENTS = Object.values(ELEMENT);
export const DOUBLE_SAME_1_6 = ['11', '22', '33', '44', '55', '66'];
export const DOUBLE_SAME_1_6__SINGLE = [
  '1|1|*',
  '2|2|*',
  '3|3|*',
  '4|4|*',
  '5|5|*',
  '6|6|*',
];
export const TRIPLE_SAME_1_6 = ['111', '222', '333', '444', '555', '666'];
export const OPEN_OPTION_STRINGS = {
  万位: 'W',
  千位: 'Q',
  百位: 'B',
  十位: 'S',
  个位: 'G',
  [PLACES[0]]: 'P1',
  [PLACES[1]]: 'P2',
  [PLACES[2]]: 'P3',
  [PLACES[3]]: 'P4',
  [PLACES[4]]: 'P5',
  [PLACES[5]]: 'P6',
  [PLACES[6]]: 'P7',
  [PLACES[7]]: 'P8',
  [PLACES[8]]: 'P9',
  [PLACES[9]]: 'P10',
};
export const TRIPLE_PICK_ALL = ['*|*|*'];
export const SSC_POKER = ['豹子', '顺子', '对子', '半顺', '杂六'];
export const FIGHT_COW = [
  '牛牛',
  '牛九',
  '牛八',
  '牛七',
  '牛六',
  '牛五',
  '牛四',
  '牛三',
  '牛二',
  '牛一',
  '无牛',
];
export const KUA_NUM = ['1跨', '2跨', '3跨', '4跨', '5跨'];
export const LUNPAN_NUM_INDICATOR = ['小', '大', '黑', '红', '单', '双'];
export const LUNPAN_NUM_SPECIAL_INDICATOR = ['第一打', '第二打', '第三打'];
export const LUNPAN_NUM_SPECIAL_DIVIDE_INDICATOR = [
  '除3余0',
  '除3余2',
  '除3余1',
];
export const LUNPAN_NUM = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
];
export const LUNPAN_BYROW = {
  FIRST_ROW: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  SECOND_ROW: [0, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  THIRD_ROW: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
};
export const LUNPAN_NUM_PICK_SIX = {
  0: [0, 1, 2, 3],
  1: [1, 2, 3, 4, 5, 6],
  2: [4, 5, 6, 7, 8, 9],
  3: [7, 8, 9, 10, 11, 12],
  4: [10, 11, 12, 13, 14, 15],
  5: [13, 14, 15, 16, 17, 18],
  6: [16, 17, 18, 19, 20, 21],
  7: [19, 20, 21, 22, 23, 24],
  8: [22, 23, 24, 25, 26, 27],
  9: [25, 26, 27, 28, 29, 30],
  10: [28, 29, 30, 31, 32, 33],
  11: [31, 32, 33, 34, 35, 36],
};
export const LUNPAN_NUM_PICK_FOUR_FIRST = {
  0: [2, 3, 5, 6],
  1: [5, 6, 8, 9],
  2: [8, 9, 11, 12],
  3: [11, 12, 14, 15],
  4: [14, 15, 17, 18],
  5: [17, 18, 20, 21],
  6: [20, 21, 23, 24],
  7: [23, 24, 26, 27],
  8: [26, 27, 29, 30],
  9: [29, 30, 32, 33],
  10: [32, 33, 35, 36],
};
export const LUNPAN_NUM_PICK_FOUR_SECOND = {
  0: [1, 2, 4, 5],
  1: [4, 5, 7, 8],
  2: [7, 8, 10, 11],
  3: [10, 11, 13, 14],
  4: [13, 14, 16, 17],
  5: [16, 17, 19, 20],
  6: [19, 20, 22, 23],
  7: [22, 23, 25, 26],
  8: [25, 26, 28, 29],
  9: [28, 29, 31, 32],
  10: [31, 32, 34, 35],
};

export const LUNPAN_SET = [
  ...Object.values(LUNPAN_NUM_PICK_SIX),
  ...Object.values(LUNPAN_NUM_PICK_FOUR_FIRST),
  ...Object.values(LUNPAN_NUM_PICK_FOUR_SECOND),
  ...LUNPAN_NUM_INDICATOR,
  ...LUNPAN_NUM_SPECIAL_INDICATOR,
  ...LUNPAN_NUM_SPECIAL_DIVIDE_INDICATOR,
  ...LUNPAN_NUM,
];

export const VALUE_REF = {
  R2Z_HZ: {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 9,
    9: 10,
    10: 9,
    11: 8,
    12: 7,
    13: 6,
    14: 5,
    15: 4,
    16: 3,
    17: 2,
    18: 1,
  },
  R2C_HZ: {
    0: 1,
    1: 1,
    2: 2,
    3: 2,
    4: 3,
    5: 3,
    6: 4,
    7: 4,
    8: 5,
    9: 5,
    10: 5,
    11: 4,
    12: 4,
    13: 3,
    14: 3,
    15: 2,
    16: 2,
    17: 1,
    18: 1,
  },
  R3Z_HZ: {
    0: 1,
    1: 3,
    2: 6,
    3: 10,
    4: 15,
    5: 21,
    6: 28,
    7: 36,
    8: 45,
    9: 55,
    10: 63,
    11: 69,
    12: 73,
    13: 75,
    14: 75,
    15: 73,
    16: 69,
    17: 63,
    18: 55,
    19: 45,
    20: 36,
    21: 28,
    22: 21,
    23: 15,
    24: 10,
    25: 6,
    26: 3,
    27: 1,
  },
  R3C_HZ: {
    0: 1,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 7,
    7: 8,
    8: 10,
    9: 12,
    10: 13,
    11: 14,
    12: 15,
    13: 15,
    14: 15,
    15: 15,
    16: 14,
    17: 13,
    18: 12,
    19: 10,
    20: 8,
    21: 7,
    22: 5,
    23: 4,
    24: 3,
    25: 2,
    26: 1,
    27: 1,
  },
  G3S: {
    1: 1,
    2: 2,
    3: 1,
    4: 3,
    5: 3,
    6: 3,
    7: 4,
    8: 5,
    9: 4,
    10: 5,
    11: 5,
    12: 4,
    13: 5,
    14: 5,
    15: 4,
    16: 5,
    17: 5,
    18: 4,
    19: 5,
    20: 4,
    21: 3,
    22: 3,
    23: 3,
    24: 1,
    25: 2,
    26: 1,
  },
  G6S: {
    3: 1,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
    8: 5,
    9: 7,
    10: 8,
    11: 9,
    12: 10,
    13: 10,
    14: 10,
    15: 10,
    16: 9,
    17: 8,
    18: 7,
    19: 5,
    20: 4,
    21: 3,
    22: 2,
    23: 1,
    24: 1,
  },
};

VALUE_REF.NS3 = Object.assign({}, VALUE_REF.R3Z_HZ);
export const GUEST_REGISTER = 'GUEST_REGISTER';
export const REGISTER = 'REGISTER';
export const LOGIN = 'LOGIN';
export const PASSWORD = 'PASSWORD';
export const SECURITY_PASSWORD = 'SECURITY_PASSWORD';
export const withdrawal = '提款';
export const account = '账号';
export const user = '用户';
export const bank = '银行卡';
export const dateFormat = 'YYYY-MM-DD HH:mm:ss';
export const inputFieldRefs = {
  affCode: '邀请码',
  affCodeStatus: '邀请码状态',
  affCodeUrl: '邀请码链接',
  bankAccountName: '银行卡开户姓名',
  bankAddress: '开户支行地址',
  bankCardNo: '收款账号',
  aliPayName: '姓名',
  aliPayCardNoName: '支付宝账户姓名',
  aliPayCardNo: '支付宝账号',
  bankCode: '银行代码',
  bankName: '开户银行',
  bankValue: '支付银行',
  cardType: '银行卡类型',
  cardNo: '收款账号',
  charge: '手续费',
  email: '电邮地址',
  identityNumber: '身份证号',
  newPassword: '新密码',
  nickname: '昵称',
  password: '密码',
  phoneNumber: '手机号码',
  prizeGroup: '彩票返点',
  QQ: 'QQ号',
  realName: '真实姓名',
  receiptName: '收款人姓名',
  remarks: '备注',
  repeatNewPassword: '确认新密码',
  repeatPassword: '确认密码',
  repeatSecurityPassword: '确认提现密码',
  securityPassword: '提现密码',
  topupAmount: '存款金额',
  topupCardRealname: '存款人姓名',
  topupCode: '充值码',
  topupDate: '存款日期',
  topupTime: '存款时间',
  transferAmount: '转账金额',
  transferTopupType: '存款方式',
  username: '用户名',
  varifyCode: '验证码',
  withdrawalAmount: '提款金额',
  vcCardNo: '钱包地址',
  vcNewCardNo: '钱包地址',
  vcSecurityPassword: '提现密码',
  repeatVcSecurityPassword: '确认提现密码',
};
export const extraInputFieldRefs = {
  bankCardNo: {
    label: inputFieldRefs.bankCardNo,
    min: 16,
    max: 19,
    pattern: '^[0-9]{0,}$',
  },
  QQ: {
    label: inputFieldRefs.QQ,
    min: 5,
    max: 11,
  },
  phoneNumber: {
    label: inputFieldRefs.phoneNumber,
    min: 11,
    max: 11,
    pattern:
      '^19[8,9]\\d{8}$|^134[0-8][\\d]{7}$|^13[0-35-9]\\d{8}$|^14[5,6,7,8,9]\\d{8}$|^15[^4]\\d{8}$|^16[6]\\d{8}$|^17[0,1,2,3,4,5,6,7,8]\\d{8}$|^18[\\d]{9}$',
  },
  identityNumber: {
    label: inputFieldRefs.identityNumber,
    min: 15,
    max: 18,
  },
  email: {
    label: inputFieldRefs.email,
    min: 0,
    max: 30,
  },
};
export const moneyOperationTypeRefs = {
  BONUS: '优惠',
  CANC_BON: '取消优惠',
  CANC_FEE: '取消手续费',
  CANC_ORDER: '撤单',
  CANC_WD: '取消提现',
  CANC_WIN: '取消派彩',
  CHARGE: '购彩',
  COMMISSION: '返佣',
  FEE: '手续费',
  REBATE: '返点',
  BONUS_BON_REB: '返水',
  TOPUP: '充值',
  TRANS_IN: '转入',
  TRANS_OUT: '转出',
  WIN: '中奖',
  WITHDRAW: '提现',
};
export const transactionStateRefs = {
  ORDER_ALL: '全部',
  WIN: '中奖',
  LOSS: '未中奖',
  CANCELLED: '已取消',
  'WIN,LOSS': '已开奖',
  PENDING: '待开奖',
  CO_COMPLETE: '追号完成',
  CO_IN_PROGRESS: '追号中',
  CO_CANCELLED: '系统取消',
  CO_CANCELLED_MANUAL: '人工取消',
};
export const coTransactionStateRefs = {
  CO_SUB_WIP: '待开奖',
  CO_SUB_WIN: '中奖',
  CO_SUB_LOSS: '未中奖',
  CO_SUB_CANCELLED: '系统取消',
  CO_SUB_CANCELLED_MANUAL: '人工取消',
};
export const transactionStateRefsValue = {
  BET: {
    WIN: '中奖',
    LOSS: '未中奖',
    CANCELLED: '已取消',
    PENDING: '待开奖',
    CO_COMPLETE: '追号完成',
    CO_IN_PROGRESS: '追号中',
    CO_CANCELLED: '取消追号',
    CO_CANCELLED_MANUAL: '人工取消',
    CO_SUB_CANCELLED_MANUAL: '人工取消',
  },
  MG: {
    WIN: '赢',
    LOSS: '输',
  },
  IMSPORT: {
    WIN: '赢',
    LOSS: '输',
    PENDING: '未结算',
    DRAW: '平局',
  },
  FG: {
    WIN: '赢',
    LOSS: '输',
  },
  CR: {
    WIN: '赢',
    LOSS: '输',
    PENDING: '未有结果',
    DRAW: '和',
  },
  SSSPORT: {
    WIN: '赢',
    LOSS: '输',
    PENDING: '未结算',
    DRAW: '平局',
  },
  SB: {
    WON: '赢',
    LOSE: '输',
    DRAW: '平局',
    WAITING: '等待中',
    RUNNING: '进行中',
    VOID: '作废',
    REFUND: '退款',
    REJECT: '已取消',
    'HALF WON': '半赢',
    'HALF LOSE': '半输',
  },
};
export const transferStateRefs = {
  '': '全部',
  true: '完成',
  false: '失败',
};
export const transferTypeRefs = {
  ALL: '全部',
  TOPUP: '充值',
  WITHDRAWAL: '提款',
  UNRECOGNIZED: '其他',
};
export const transferSubTypeRefs = {
  ALL: '全部',
  BANK_TRANSFER_TOPUP: '银行转账',
  BANK_TRANSFER_WITHDRAWAL: '银行转账',
  WECHAT_TOPUP: '微信',
  ALIPAY_TOPUP: '支付宝',
  THRIDPARTY_TOPUP: '代理',
  MANUAL_TOPUP: '其他',
  MANUAL_WITHDRAWAL: '其他',
  UNRECOGNIZED: '其他',
};
export const messageTypeRefs = {
  ALL: '全部',
  NORMAL: '普通',
  PROMOTE: '优惠',
  MONEY_RELATED: '出入款',
};
export const operatorTypeRefs = {
  TOPUP_PREFERENTIAL: '充值优惠',
  REGISTER_PREFERENTIAL: '注册优惠',
  WITHDRAWAL_ERROR: '出款错误',
  TOPUP_ERROR: '入款错误',
};
export const defaultAmountOptions = [
  100,
  500,
  1000,
  3000,
  5000,
  10000,
  30000,
  50000,
];
export const transferTopupTypeRefs = {
  BANK_TRANSFER: 'BANK_ONLINE',
  ZHB: 'ALIPAY',
  WX: 'WECHATPAY',
  QQ: 'QQ_PAY',
  JD: 'JD_PAY',
  OTHER: 'OTHER_PAY',
};
export const cardTypeRefs = {
  DC: '储蓄卡',
  CC: '信用卡',
};
export const frequencyRefs = {
  HIGH: '高频彩',
  LOW: '低频彩',
};
// 这个定义展示彩种类顺序
export const GAME_CATEGORY = {
  SHISHICAI: 'SHISHICAI',
  PK10: 'PK10',
  PCDANDAN: 'PCDANDAN',
  FIVE11: 'FIVE11',
  KUAI3: 'KUAI3',
  HAPPY10: 'HAPPY10',
  NONE: 'NONE',
};
// 自定义彩种类
export const CUSTOM_GAME_CATEGORY = {
  G1: 'G1',
  PK: 'PK',
  QXC: 'QXC',
  XYPK: 'XYPK',
  SIX: 'SIX',
  XY: 'XY',
};
export const categoriesRefs = {
  [GAME_CATEGORY.SHISHICAI]: '时时彩',
  [GAME_CATEGORY.PK10]: 'PK拾',
  [GAME_CATEGORY.PCDANDAN]: 'PC蛋蛋',
  [GAME_CATEGORY.FIVE11]: '11选5',
  [GAME_CATEGORY.KUAI3]: '快3',
  [GAME_CATEGORY.HAPPY10]: '快乐十分',
  [GAME_CATEGORY.NONE]: '其他彩票',
};
export const paymentTypeRefs = {
  ZHB: '支付宝',
  WX: '微信支付',
  JD: '京东支付',
  QQ: 'QQ支付',
  OTHER: '相应支付平台',
  THIRD_PARTY: '网银支付',
  BANK: '银行卡转账',
};
export const paymentMethodRefs = {
  ALIPAY_QR: '支付宝',
  WX_QR: '微信支付',
  JD_QR: '京东支付',
  QQ_QR: 'QQ支付',
  WECHAT_QR: '微信支付',
  OTHER_QR: '相应支付平台',
};
export const memberTypeRefs = {
  PLAYER: '会员',
  AGENT: '代理',
};
export const commissionStatusRefs = {
  ALL: '全部',
  INIT: '未发',
  COMPLETE: '已发',
};
export const timeframeRefs = [
  {displayText: '今天', value: 0},
  {displayText: '一天', value: 1},
  {displayText: '一周', value: 7},
  {displayText: '两周', value: 15},
  {displayText: '四周', value: 30},
];
export const DateTimeframeQuickRefs = [
  {displayText: '今天', value: 'Today'},
  {displayText: '昨天', value: 'Yesterday'},
  {displayText: '本周', value: 'ThisWeek'},
  {displayText: '上周', value: 'LastWeek'},
  {displayText: '本月', value: 'ThisMonth'},
  {displayText: '上月', value: 'LastMonth'},
];
export const resultHistoryDateCount = [
  {displayText: '今天', dayCounts: 0},
  {displayText: '昨天', dayCounts: -1},
  {displayText: '前天', dayCounts: -2},
];

export const resultHistoryDisplayCodeType = [
  {displayText: '显示号码', type: 0},
  {displayText: '显示大小', type: 1},
  {displayText: '显示单双', type: 2},
];

export const userProfileNavsFirst = {
  tradingCenter: [
    {
      navKey: 'topupCtrl',
      displayName: '充值',
      icon: 'bank',
      notForGuest: true,
    },
    {
      navKey: 'withdrawalCtrl',
      displayName: '提款',
      icon: 'cash-multiple',
      notForGuest: true,
    },
    {
      navKey: 'transferCtrl',
      displayName: '转账',
      icon: 'wallet',
      notForGuest: true,
      isDsf: true,
    },
    {
      navKey: 'topupRecord',
      displayName: '充值记录',
      notForGuest: true,
    },
    {
      navKey: 'withdrawalRecord',
      displayName: '提款记录',
      notForGuest: true,
    },
    {
      navKey: 'transferReport',
      displayName: '转账记录',
      icon: 'clipboard-outline',
      notForGuest: true,
      isDsf: true,
    },
    {
      navKey: 'orderRecord',
      displayName: '投注记录',
      icon: 'ticket-confirmation',
    },
    {
      navKey: 'myCashFlow',
      displayName: '账户明细',
    },
    {
      navKey: 'personalReport',
      displayName: '个人报表',
      icon: 'account',
    },
    {
      navKey: 'missionReport',
      displayName: '任务领取记录',
    },
    {
      navKey: 'sosFundReport',
      displayName: '救济金记录',
    },
  ],
  securityCenter: [
    {
      navKey: 'basicInfo',
      displayName: '基本资料',
      icon: 'account-card-details',
    },
    {
      navKey: 'securityInfo',
      displayName: '修改密码',
      icon: 'account-key',
    },
    {
      navKey: 'drawInfo',
      displayName: '银行卡信息',
      icon: 'credit-card-plus',
      notForGuest: true,
    },
  ],
  messageCenter: [
    {
      navKey: 'msgInbox',
      displayName: '我的消息',
      icon: 'inbox',
    },
    {
      navKey: 'feedback',
      displayName: '意见反馈',
      icon: 'information-outline',
    },
  ],
  agentCenter: [
    {
      navKey: 'memberManage',
      displayName: '用户管理',
      icon: 'account-settings-variant',
    },
    {
      navKey: 'affCodeManage',
      displayName: '推广管理',
      icon: 'message-bulleted',
    },
    {
      navKey: 'commissionReport',
      displayName: '代理佣金',
      icon: 'clipboard-account',
    },
    {
      navKey: 'teamOverallReport',
      displayName: '团队报表',
      icon: 'account-network',
      isBase: true,
    },
    {
      navKey: 'teamReport',
      displayName: '彩票团队报表',
      icon: 'account-network',
      isDsf: true,
    },
    {
      navKey: 'agentPersonalReport',
      displayName: '个人报表',
      icon: 'account',
      isBase: true,
    },
  ],
};

export const paymentAmounts = [50, 100, 300, 500, 1000, 2000, 3000, 5000];

export const commissionMode = {
  PRIZE_GROUP: 'PRIZE_GROUP',
  COMMISSION_RATIO: 'COMMISSION_RATIO',
};

// 参考 http://tool.fxunion.com/SwiftCode.html
export const banksOptions = {
  zgyh: {
    displayName: '中国银行',
    cardNumberLength: 11,
    website: 'www.boc.cn',
  },
  zggs: {
    displayName: '工商银行',
    cardNumberLength: 11,
    website: 'www.icbc.com.cn',
  },
  nyyh: {
    displayName: '农业银行',
    cardNumberLength: 11,
    website: 'www.abchina.com',
  },
  jsyh: {
    displayName: '建设银行',
    cardNumberLength: 11,
    website: 'www.ccb.com',
  },
  jtyh: {
    displayName: '交通银行',
    cardNumberLength: 11,
    website: 'www.bankcomm.com',
  },
  zgyz: {
    displayName: '中国邮政',
    cardNumberLength: 11,
    website: 'www.psbc.com',
  },
  zxyh: {
    displayName: '中信银行',
    cardNumberLength: 11,
    website: 'www.citicbank.com',
  },
  gdyh: {
    displayName: '光大银行',
    cardNumberLength: 11,
    website: 'www.cebbank.com',
  },
  hxyh: {
    displayName: '华夏银行',
    cardNumberLength: 11,
    website: 'www.hxb.com.cn',
  },
  msyh: {
    displayName: '民生银行',
    cardNumberLength: 11,
    website: 'www.cmbc.com.cn',
  },
  gfyh: {
    displayName: '广发银行',
    cardNumberLength: 11,
    website: 'www.cgbchina.com.cn',
  },
  zgpa: {
    displayName: '平安银行',
    cardNumberLength: 11,
    website: 'bank.pingan.com',
  },
  zsyh: {
    displayName: '招商银行',
    cardNumberLength: 11,
    website: 'www.cmbchina.com',
  },
  pfyh: {
    displayName: '兴业银行',
    cardNumberLength: 11,
    website: 'www.cib.com.cn',
  },
  bhyh: {
    displayName: '浦发银行',
    cardNumberLength: 11,
    website: 'www.spdb.com.cn',
  },
  shyh: {
    displayName: '上海银行',
    cardNumberLength: 11,
    website: 'www.bankofshanghai.com',
  },
  bjyh: {
    displayName: '北京银行',
    cardNumberLength: 11,
    website: 'www.bankofbeijing.com.cn',
  },
  bjns: {
    displayName: '北京农商银行',
    cardNumberLength: 11,
    website: 'www.bjrcb.com',
  },
  shns: {
    displayName: '上海农商银行',
    cardNumberLength: 11,
    website: 'www.srcb.com',
  },
};

export const gamePlatformType = {
  ALL: 'ALL',
  BET: 'BET',
  MG: 'MG',
  AG: 'AG',
  IMSPORT: 'IMSPORT',
  AVIA: 'AVIA',
  KY: 'KY',
  FG: 'FG',
  RMG: 'RMG',
  CR: 'CR',
  SSSPORT: 'SSSPORT',
  THQP: 'THQP',
  LC: 'LC',
  BBLQP: 'BBLQP',
  CQ9: 'CQ9',
  NWG: 'NWG',
  BG: 'BG',
  JDB: 'JDB',
  SB: 'SB',
  BBIN: 'BBIN',
};

export const PLATFORM_TYPE = {
  OWN: 2,
  THIRD_PARTY: 1,
  HIDE: -1,
};

export const PLATFORM = {
  SPORT: 'SPORT',
  GAME: 'GAME',
  CARD: 'CARD',
  REALI: 'REALI',
  FISH: 'FISH',
};

export const PLATFORM_API_PROP = {
  dsfSportInfos: PLATFORM.SPORT,
  dsfEGameInfos: PLATFORM.GAME,
  dsfCardInfos: PLATFORM.CARD,
  dsfVGameInfos: PLATFORM.REALI,
  dsfFishInfos: PLATFORM.FISH,
};

export const gamePlatformList = {
  BET: {
    gamePlatform: gamePlatformType.BET,
    gameNameInChinese: '彩票',
    idText: '期号',
    resultIdText: '状态',
  },
  MG: {
    gamePlatform: gamePlatformType.MG,
    gameNameInChinese: 'MG电子',
    idText: '投注单号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  AG: {
    gamePlatform: gamePlatformType.AG,
    gameNameInChinese: 'AG视讯',
    idText: '投注单号',
    resultIdText: '类型',
    hideSelectStatusList: true,
    noAllType: true, // 投注记录 -> 类型 -> 没有“全部”
  },
  AVIA: {
    gamePlatform: gamePlatformType.AVIA,
    gameNameInChinese: '泛亚电竞',
    idText: '投注单号',
    resultIdText: '类型',
    hideSelectStatusList: true,
  },
  IMSPORT: {
    gamePlatform: gamePlatformType.IMSPORT,
    gameNameInChinese: 'IM体育',
    idText: '游戏订单',
    resultIdText: '状态',
    desc: '世界杯来临, 全球一同参与体育热潮',
    url: 'https://imsb-mtgames-staging.roshan88.com/?LanguageCode=CHS',
  },
  KY: {
    gamePlatform: gamePlatformType.KY,
    gameNameInChinese: '开元棋牌',
    idText: '牌局编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  FG: {
    gamePlatform: gamePlatformType.FG,
    gameNameInChinese: 'FG电子',
    idText: '场景编号',
    resultIdText: '类型',
    hideSelectStatusList: true,
    noAllType: true, // 投注记录 -> 类型 -> 没有“全部”
  },
  RMG: {
    gamePlatform: gamePlatformType.RMG,
    gameNameInChinese: '大富翁',
    idText: '牌局编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  CR: {
    gamePlatform: gamePlatformType.CR,
    gameNameInChinese: '皇冠体育',
    idText: '注单编号',
    resultIdText: '状态',
    desc: '世界杯来临, 全球一同参与体育热潮',
  },
  SSSPORT: {
    gamePlatform: gamePlatformType.SSSPORT,
    gameNameInChinese: '新三昇体育',
    idText: '注单编号',
    resultIdText: '状态',
    desc: '世界杯来临, 全球一同参与体育热潮',
  },
  THQP: {
    gamePlatform: gamePlatformType.THQP,
    gameNameInChinese: '天豪棋牌',
    idText: '牌局编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  LC: {
    gamePlatform: gamePlatformType.LC,
    gameNameInChinese: '凯旋棋牌',
    idText: '牌局编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  BBLQP: {
    gamePlatform: gamePlatformType.BBLQP,
    gameNameInChinese: '博博乐棋牌',
    idText: '牌局编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  CQ9: {
    gamePlatform: gamePlatformType.CQ9,
    gameNameInChinese: 'CQ9',
    idText: '牌局编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  NWG: {
    gamePlatform: gamePlatformType.NWG,
    gameNameInChinese: '新世界棋牌',
    idText: '牌局编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  BG: {
    gamePlatform: gamePlatformType.BG,
    gameNameInChinese: 'BG视讯',
    idText: '注单号',
    resultIdText: '状态',
    hideSelectStatusList: true,
    noAllType: true, // 投注记录 -> 类型 -> 没有“全部”
  },
  JDB: {
    gamePlatform: gamePlatformType.JDB,
    gameNameInChinese: 'JDB电子',
    idText: '注单号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  SB: {
    gamePlatform: gamePlatformType.SB,
    gameNameInChinese: '沙巴体育',
    idText: '注单编号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
  BBIN: {
    gamePlatform: gamePlatformType.BBIN,
    gameNameInChinese: '宝盈',
    idText: '注单号',
    resultIdText: '状态',
    hideSelectStatusList: true,
  },
};

export const gameOddsType = {
  HK: {
    name: '香港盘',
    id: 'HK',
  },
  EURO: {
    name: '欧洲盘',
    id: 'EURO',
  },
  MALAY: {
    name: '马来盘',
    id: 'MALAY',
  },
  INDO: {
    name: '印尼盘',
    id: 'INDO',
  },
};

export const gameSportsType = {
  Badminton: {
    name: '羽毛球',
    type: 'Badminton',
  },
  Soccer: {
    name: '足球',
    type: 'Soccer',
  },
  IceHockey: {
    name: '冰球',
    type: 'IceHockey',
  },
  Basketball: {
    name: '印尼盘',
    type: 'Basketball',
  },
  Rugby: {
    name: '橄榄球',
    type: 'Rugby',
  },
  Volleyball: {
    name: '排球',
    type: 'Volleyball',
  },
  Golf: {
    name: '高尔夫球',
    type: 'Golf',
  },
};

export const gameWagerType = {
  Single: {
    name: '单一',
    type: 'Single',
  },
  COMBO: {
    name: '混合过关',
    type: 'COMBO',
  },
};
export const reportType = {
  TransferReport: 'TransferReport',
  TeamReport: 'TeamReport',
  PersonalReport: 'PersonalReport',
  BetRecordReport: 'BetRecordReport',
  CashFlowReport: 'CashFlowReport',
};

export const specialBetType = {
  SCO: {shortDesc: '普', desc: '普通追号'},
  ICO: {shortDesc: '智', desc: '智能追号'},
};

export const levelBetType = {
  PARENT: {shortDesc: '父', desc: '父订单'},
  CHILD: {shortDesc: '子', desc: '子订单'},
};

export const sportsBetWagerType = {
  Single: 'Single',
  Combo: 'Combo',
};

export const ReportSearchMaxDays = 60;

export const ACTIVE_STATUS = 'NORMAL';

export const withdrawalMethods = {
  BankCard: 'BankCard',
  AliPay: 'AliPay',
  VirtualCoin: 'VirtualCoin',
};
