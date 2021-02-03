import {CUSTOM_GAME_CATEGORY, GAME_CATEGORY, UNITS} from './type.config';
import * as settingMap from './settingMap.config';
import {map, filter, forEach, keys, find, difference} from 'lodash';
import {isDisabledGame} from './retrieveGame';

const {gameSettingsMap: GAME_SETTING} = settingMap;
const availableGames = {
    SHISHICAI: {
      expandedCategory: GAME_CATEGORY.SHISHICAI,
      ...GAME_SETTING[GAME_CATEGORY.SHISHICAI][3],
    },
    FIVE11: {
      expandedCategory: GAME_CATEGORY.FIVE11,
      ...GAME_SETTING[GAME_CATEGORY.FIVE11][12],
    },
    KUAI3: {
      expandedCategory: GAME_CATEGORY.KUAI3,
      ...GAME_SETTING[GAME_CATEGORY.KUAI3][0],
    },
    PCDANDAN: {
      expandedCategory: GAME_CATEGORY.PCDANDAN,
      units: {元: 1},
      ...GAME_SETTING[GAME_CATEGORY.PCDANDAN][0],
    },
    PK10: {
      expandedCategory: GAME_CATEGORY.PK10,
      ...GAME_SETTING[GAME_CATEGORY.PK10][3],
    },
    HAPPY10: {
      expandedCategory: GAME_CATEGORY.HAPPY10,
      ...GAME_SETTING[GAME_CATEGORY.HAPPY10][4],
    },
    MARK_SIX: {
      expandedCategory: GAME_CATEGORY.NONE,
      units: {元: 1},
      ...GAME_SETTING[CUSTOM_GAME_CATEGORY.SIX][0],
    },
    X3D: {
      expandedCategory: GAME_CATEGORY.NONE,
      ...GAME_SETTING[CUSTOM_GAME_CATEGORY.G1][0],
    },
    QXC: {
      expandedCategory: GAME_CATEGORY.NONE,
      ...GAME_SETTING[CUSTOM_GAME_CATEGORY.QXC][15],
    },
    PK: {
      expandedCategory: GAME_CATEGORY.NONE,
      ...GAME_SETTING[CUSTOM_GAME_CATEGORY.PK][0],
    },
  };
  const availableGame = {};

export function getHotGameList({gameInfos,allGamesPrizeSettings,thisGameId}) {
    let listHot = [...gameInfos];
    listHot = filter(listHot, ['recommendType', 'HOT']);
    if (listHot.length === 0) {
      availableGame['HF_CQSSC'] = availableGames['SHISHICAI'];
    }

    map(listHot, (gameInfo, gameIndex) => {
      if (gameInfo.playGroup === 'SIX') {
        listHot[gameIndex].category = 'MARK_SIX';
      }
      if (gameInfo.playGroup === 'QXC') {
        listHot[gameIndex].category = 'QXC';
      }
      if (gameInfo.playGroup === 'PK') {
        listHot[gameIndex].category = 'PK';
      }
      if (gameInfo.playGroup === '3D') {
        listHot[gameIndex].category = 'X3D';
      }
    });

     map(listHot, (gameInfo) => {
       map(availableGames, (game, index) => {
        if (gameInfo.category === index) {
              availableGame[gameInfo.gameUniqueId] = game;
            };
       })
    });

    return availableGame;
}

export function getHotGameListsFilter(gameInfos, allGamesPrizeSettings, thisGameId) {
  let listHot = [...gameInfos];
  listHot = filter(listHot, ['recommendType', 'HOT']);
  if (find(listHot, ['gameUniqueId', 'HF_CQSSC']) === undefined && listHot.length > 0) {
    delete availableGame.HF_CQSSC;
  }
  const gamesIds = keys(availableGame);
  const list = map(gamesIds, gameId =>
    find(gameInfos, ["gameUniqueId", gameId]),
  );
  let onList = [];
  let disabledGameList = [];
  let disabledPlayList = [];

  if (list[0] !== undefined) {
    const filtered = list.filter(item => {
      return item != null;
    });
    map(filtered, (listItem) => {
      if (!isDisabledGame(listItem, {allGamesPrizeSettings})) {
          onList.push(listItem);
        }
      });
  }

  forEach(allGamesPrizeSettings, (item, index) => {
    if (availableGame[index] && availableGame[index].methodId) {
      if (item.singleGamePrizeSettings[availableGame[index].methodId] && item.singleGamePrizeSettings[availableGame[index].methodId].gameplayState && item.singleGamePrizeSettings[availableGame[index].methodId].gameplayState === 'OFF') {
          disabledGameList.push(index);
      };
    }
})

 map(onList, (item) => {
    for (let i = 0 ; i < onList.length ; i++) {
      if (item.gameUniqueId === disabledGameList[i]) {
        disabledPlayList.push(item);
      }
    }
  })

  const finalList = difference(onList, disabledPlayList);
  finalList.sort((a, b) => a.order - b.order);

  return finalList;
}
