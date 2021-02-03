import {omit, pick, filter} from 'lodash';
import {API, newWindow} from 'utils';
import {apiRequest as request} from 'services';

const INITIAL_STATE = {
  currentPage: 1,
  gameCategoryId: 0,
  gameId: '',
  gameListandCategoryFull: [],
  gameList: [],
  gameListCount: 0,
  searchTerm: '',
  isDemo: false,
  MODE: null,
  pageSize: 10,
};

function slicedGameList(gameList, currentPage, pageSize) {
  return gameList;
}

function filterActiveGame(game) {
  return game.gameId !== '' && game.status.toLowerCase() === 'normal';
}

function getFullGameList(gameListandCategoryFull) {
  const allGameList = gameListandCategoryFull.flatMap(gameCategory =>
    Array.prototype.filter.call(
      (gameCategory.category === 'all' && gameCategory.games) || [],
      filterActiveGame,
    ),
  );

  return allGameList;
}
export default {
  namespace: 'gameModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
    removeState(state, {payload}) {
      const newState = omit(state, payload);
      return {
        ...newState,
      };
    },
    initializeState(state, {payload}) {
      const initialStates = pick(INITIAL_STATE, payload);
      return {
        ...state,
        ...initialStates,
      };
    },
    initializeAll(state, {payload}) {
      let newState = {};
      if (payload) {
        newState = omit(INITIAL_STATE, payload);
      } else {
        newState = INITIAL_STATE;
      }

      return {
        ...state,
        ...newState,
      };
    },
    getGameList(state) {
      const {
        currentPage,
        gameCategoryId,
        gameListandCategoryFull,
        pageSize,
      } = state;
      let gameList = [];

      if (gameCategoryId === 0) {
        gameList = getFullGameList(gameListandCategoryFull);
      } else {
        const selectedGameCategory = gameListandCategoryFull.find(
          gameCategory => gameCategory.categoryId === gameCategoryId,
        );

        if (selectedGameCategory)
          gameList = Array.prototype.filter.call(
            selectedGameCategory.games || [],
            filterActiveGame,
          );
      }

      const gameListSliced =
        gameList.length && currentPage
          ? slicedGameList(gameList, currentPage, pageSize)
          : [];

      return {
        ...state,
        gameList: gameListSliced,
        gameListCount: gameList.length,
      };
    },
    getSearchGameList(state) {
      const {
        currentPage,
        pageSize,
        gameListandCategoryFull,
        searchTerm,
      } = state;
      let allGameList = getFullGameList(gameListandCategoryFull);

      if (allGameList.length) {
        allGameList = searchTerm
          ? allGameList.filter(game =>
              game.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : allGameList;
        const allGameListSliced = slicedGameList(
          allGameList,
          currentPage,
          pageSize,
        );

        return {
          ...state,
          gameListCount: allGameList.length,
          gameList: allGameListSliced,
        };
      }

      return state;
    },
  },
  effects: {
    *getAllGameListByCategory(payloadObj, {put, call, select}) {
      const {appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
      } = appModel;

      yield put({
        type: 'updateState',
        payload: {
          listIsLoading: true,
        },
      });

      const gameListandCategoryFull = [];

      const {data, err} = yield call(request.to, {
        url: `${
          API.getDsfAllGamesByCategory
        }?platformType=EGAME&starterCategory=Pc&brand=${brand}`,
        method: 'get',
      });

      if (data) {
        gameListandCategoryFull.push(data.find(x => x.category === 'all'));

        yield put({
          type: 'updateState',
          payload: {
            gameListandCategoryFull,
          },
        });
        yield put.resolve({type: 'getGameList'});
      } else if (err) {
        yield put({
          type: 'formModel/postErrorMessage',
          payload: {
            msg: '请求获取棋牌游戏列表失败',
            description: err.message,
          },
        });
      }
      yield put({
        type: 'removeState',
        payload: ['listIsLoading'],
      });
    },
    *getFullGameListAndCategory(payloadObj, {put, call, select}) {
      const {gameModel, appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
      } = appModel;
      yield put({
        type: 'updateState',
        payload: {
          listIsLoading: true,
        },
      });
      const gameListandCategoryFull = [];
      const {data, err} = yield call(request.to, {
        url: `${API.getDsfGames}?gamePlatform=${
          gameModel.MODE
        }&platformType=EGAME&starterCategory=Pc&brand=${brand}`,
        method: 'get',
      });
      if (data) {
        data.forEach(gameCategory => {
          if (
            Array.prototype.some.call(
              gameCategory.games || [],
              filterActiveGame,
            )
          ) {
            gameListandCategoryFull.push(gameCategory);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            gameListandCategoryFull,
          },
        });
        yield put.resolve({type: 'getGameList'});
      } else if (err) {
        yield put({
          type: 'formModel/postErrorMessage',
          payload: {
            msg: '请求获取电子游戏列表失败',
            description: err.message,
          },
        });
      }
      yield put({
        type: 'removeState',
        payload: ['listIsLoading'],
      });
    },
    *postGameLoginUrl(payloadObj, {put, call, select}) {
      const {userModel, gameModel, appModel} = yield select(state => state);
      const requestObj = {
        method: 'get',
        headers: {
          gamePlatform: gameModel.MODE,
          device_token: appModel.deviceToken,
        },
      };

      if (gameModel.isDemo)
        requestObj.url = `${API.playerStartDemoGame}/${gameModel.gameId}`;
      else {
        requestObj.url = `${API.playerStartGame}/${gameModel.gameId}`;
        requestObj.headers.authorization = `bearer ${userModel.accessToken}`;
      }

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        const {gameUrl, shouldOpenNewTab} = data;

        if (gameUrl) {
          const params = {
            url: gameUrl,
            trimUrl: `games/${gameModel.MODE}`,
            id: gameModel.gameId,
            isDemo: gameModel.isDemo,
            platform: gameModel.MODE,
            name: gameModel.gameName,
            shouldOpenNewTab,
          };
          const popUp = newWindow(params);
          if (!popUp) {
            yield put({
              type: 'formModel/postErrorMessage',
              payload: {
                msg: '浏览器阻止了弹出式窗口功能。请设置浏览器以允许弹出窗口',
              },
            });
          }
        } else {
          yield put({
            type: 'formModel/postErrorMessage',
            payload: {
              msg: '获取游戏链接失败，请稍后再试',
            },
          });
        }
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/secureAuthentication',
            payload: {
              msg: err.message,
            },
          });
        } else {
          yield put({
            type: 'formModel/postErrorMessage',
            payload: {
              msg: '获取游戏链接失败，请稍后再试',
              description: err.message,
            },
          });
        }
      }
    },
  },
};
