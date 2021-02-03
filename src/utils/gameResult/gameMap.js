import {
  DEFAULT_METHOD,
  GAME_RESULT_CATEGORY,
  RESULT_CATEGORY_MAP,
} from '../trend.config';

export function getGameResultConfig(gameUniqueId, categoryId) {
  let referenceCategory;

  if (GAME_RESULT_CATEGORY[gameUniqueId])
    referenceCategory = GAME_RESULT_CATEGORY[gameUniqueId];
  else if (RESULT_CATEGORY_MAP.has(categoryId)) referenceCategory = categoryId;
  else throw new Error(`${gameUniqueId}走势还未配置`);

  return RESULT_CATEGORY_MAP.get(referenceCategory);
}

export function getGameMethods(gameUniqueId, gameResultType, categoryId) {
  const {methods} = getGameResultConfig(gameUniqueId, categoryId);
  let gameMethods = DEFAULT_METHOD;

  if (methods) {
    for (const [key, value] of methods.entries()) {
      if (key.includes(gameResultType)) {
        const {resultsFn: resultsFnObj} = value;
        const resultsFn =
          (resultsFnObj &&
            Object.entries(resultsFnObj).map(([result, fnProp]) => [
              result,
              fnProp,
            ])) ||
          DEFAULT_METHOD.resultsFn;
        gameMethods = {...gameMethods, ...value, resultsFn};
        break;
      }
    }
  }
  return gameMethods;
}
