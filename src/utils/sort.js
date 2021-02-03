import {gamesMap} from './settingMap.config';

const GAME_CATEGORY_MAP = {};

gamesMap.forEach(game => {
  GAME_CATEGORY_MAP[game.gameUniqueId] = game.gameSettingsMap;
});

export function ByGame(items, filter) {
  const list = new Map();
  const map = {};

  items.forEach(item => {
    const category = GAME_CATEGORY_MAP[item.gameUniqueId];
    let include = true;

    if (typeof filter === 'function') include = filter(item);
    if (include) {
      map[category] = Array.prototype.concat.call(map[category] || [], item);
      list.set(category, map[category]);
    }
  });

  return Array.from(list).flatMap(([category, games]) => games);
}
