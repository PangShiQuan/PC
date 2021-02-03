import {gamesMap} from './settingMap.config';
import {GAME_CATEGORY as GAME_CAT, GAME_RESULT_CATEGORY} from './trend.config';
import {GAME_CATEGORY} from './type.config';

const EXCLUDED_GAME = new Set(['HF_BJ5FC']);

function hasTrendChart(id, gameInfos) {
  if (!id || EXCLUDED_GAME.has(id)) return false;
  if (GAME_RESULT_CATEGORY[id]) return true;

  const game = (gameInfos || gamesMap).find(
    ({gameUniqueId}) => gameUniqueId === id,
  );
  if (!game || game.category === GAME_CATEGORY.NONE || !GAME_CAT[game.category])
    return false;

  return true;
}

export default hasTrendChart;
