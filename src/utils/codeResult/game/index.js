import {gamesMap} from '../../settingMap.config';
import {CUSTOM_GAME_CATEGORY, GAME_CATEGORY} from '../../type.config';
import * as FIVE11 from './FIVE11';
import * as G1 from './G1';
import * as K3 from './K3';
import * as KL10F from './KL10F';
import * as PCDD from './PCDD';
import * as PK from './PK';
import * as QXC from './QXC';
import * as SIX from './SIX';
import * as SSC from './SSC';

const GAME_METHODS_MAP = new Map();
const GAME_CATEGORIES = [FIVE11, G1, K3, KL10F, PCDD, PK, QXC, SIX, SSC];
export const GAME_CATEGORY_FN = {
  [GAME_CATEGORY.FIVE11]: FIVE11,
  [GAME_CATEGORY.PCDANDAN]: PCDD,
  [GAME_CATEGORY.KUAI3]: K3,
  [GAME_CATEGORY.HAPPY10]: KL10F,
  [GAME_CATEGORY.SHISHICAI]: SSC,
  [CUSTOM_GAME_CATEGORY.G1]: G1,
  [CUSTOM_GAME_CATEGORY.QXC]: QXC,
  [CUSTOM_GAME_CATEGORY.PK]: PK,
  [CUSTOM_GAME_CATEGORY.SIX]: SIX,
};

gamesMap.forEach(({gameUniqueId, gameSettingsMap}) => {
  GAME_METHODS_MAP.set(gameUniqueId, gameSettingsMap);
});

function getGameCategory({gameId, methodMapId}) {
  let category = methodMapId;

  if (!category && GAME_METHODS_MAP.has(gameId))
    category = GAME_METHODS_MAP.get(gameId);
  if (!category && process.env.NODE_ENV === 'development')
    console.error(`无法辨认${gameId}彩种类型`);

  return category;
}

/**
 * @param {string} fnName - (duck)function to be call on the relevant game category
 * @param {object} resolveObj - abitary variable that used in resolve to targeted game group
 * @param {any} input - parameter to pass into the executing function
 * @return {any} - result of executed function
 */
function proxy(fnName) {
  return function exec(resolveObj, ...input) {
    const category = getGameCategory(resolveObj);
    const fn = (GAME_CATEGORY_FN[category] || {[fnName]: null})[fnName];

    if (typeof fn === 'function') return fn(...input);
    else if (category && process.env.NODE_ENV === 'development') {
      console.error(`${category}不存在名为${fnName}函数`);
    }
    return '';
  };
}

// polymorphism
function proxyFn() {
  const fnSet = {};

  GAME_CATEGORIES.forEach(gameCat => {
    Object.entries(gameCat).forEach(([fnName, fn]) => {
      if (typeof fn === 'function' && !fnSet[fnName]) {
        fnSet[fnName] = proxy(fnName);
      }
    });
  });

  return fnSet;
}

export default proxyFn();
