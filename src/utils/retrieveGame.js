import {ACTIVE_STATUS} from './type.config';
import {gamesMap as GAMES} from './settingMap.config';

const gamesMap = {};

GAMES.forEach(game => {
  gamesMap[game.gameUniqueId] = game;
});

export function getGameSetup({gameUniqueId}) {
  return gamesMap[gameUniqueId];
}

export function isDisabledGame(
  {gameUniqueId, status},
  {allGamesPrizeSettings = {}} = {},
) {
  const {[gameUniqueId]: game} = allGamesPrizeSettings;
  return !gamesMap[gameUniqueId] || status !== ACTIVE_STATUS || false;
}
