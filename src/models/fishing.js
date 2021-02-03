import {omit, pick, filter} from 'lodash';
import {API, newWindow} from 'utils';
import {apiRequest as request} from 'services';

const INITIAL_STATE = {
  currentPage: 1,
  fishingCategoryId: 0,
  fishingId: '',
  fishingListandCategoryFull: [],
  fishingList: [],
  fishingListCount: 0,
  searchTerm: '',
  isDemo: false,
  MODE: null,
  pageSize: 10,
};

function slicedFishingList(fishingList, currentPage, pageSize) {
  return fishingList;
}

function filterActiveGame(fishing) {
  return fishing.gameId !== '' && fishing.status.toLowerCase() === 'normal';
}

function getFullFishingList(fishingListandCategoryFull) {
  const allGameList = fishingListandCategoryFull.flatMap(fishingCategory => {
    return Array.prototype.filter.call(
      (fishingCategory.category === 'all' && fishingCategory.games) || [],
      filterActiveGame,
    );
  });

  return allGameList;
}

export default {
  namespace: 'fishingModel',
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
    getFishingList(state) {
      const {
        currentPage,
        fishingCategoryId,
        fishingListandCategoryFull,
        pageSize,
      } = state;
      let fishingList = [];

      if (fishingCategoryId === 0) {
        fishingList = getFullFishingList(fishingListandCategoryFull);
      } else {
        const selectedGameCategory = fishingListandCategoryFull.find(
          fishingCategory => fishingCategory.categoryId === fishingCategoryId,
        );

        if (selectedGameCategory)
          fishingList = Array.prototype.filter.call(
            selectedGameCategory.games || [],
            filterActiveGame,
          );
      }

      const fishingListSliced =
        fishingList.length && currentPage
          ? slicedFishingList(fishingList, currentPage, pageSize)
          : [];

      return {
        ...state,
        fishingList: fishingListSliced,
        fishingListCount: fishingList.length,
      };
    },
    getSearchFishingList(state) {
      const {
        currentPage,
        pageSize,
        fishingListandCategoryFull,
        searchTerm,
      } = state;
      let allFishingList = getFullFishingList(fishingListandCategoryFull);

      if (allFishingList.length) {
        allFishingList = searchTerm
          ? allFishingList.filter(game =>
              game.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : allFishingList;
        const allFishingListSliced = slicedFishingList(
          allFishingList,
          currentPage,
          pageSize,
        );

        return {
          ...state,
          fishingListCount: allFishingList.length,
          fishingList: allFishingListSliced,
        };
      }

      return state;
    },
  },
  effects: {
    *getAllFishingListByCategory(payloadObj, {put, call, select}) {
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

      const fishingListandCategoryFull = [];

      const {data, err} = yield call(request.to, {
        url: `${
          API.getDsfAllGamesByCategory
        }?platformType=FISH&starterCategory=Pc&brand=${brand}`,
        method: 'get',
      });

      if (data) {
        fishingListandCategoryFull.push(data.find(x => x.category === 'all'));

        yield put({
          type: 'updateState',
          payload: {
            fishingListandCategoryFull,
          },
        });
        yield put.resolve({type: 'getFishingList'});
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
    *getFullFishingListAndCategory(payloadObj, {put, call, select}) {
      const {fishingModel, appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
      } = appModel;

      yield put({
        type: 'updateState',
        payload: {
          listIsLoading: true,
        },
      });

      const fishingListandCategoryFull = [];
      const {data, err} = yield call(request.to, {
        url: `${API.getDsfGames}?gamePlatform=${
          fishingModel.MODE
        }&platformType=FISH&starterCategory=Pc&brand=${brand}`,
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
            fishingListandCategoryFull.push(gameCategory);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            fishingListandCategoryFull,
          },
        });
        yield put.resolve({type: 'getFishingList'});
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
    *postFishingLoginUrl(payloadObj, {put, call, select}) {
      const {userModel, fishingModel, appModel} = yield select(state => state);
      const requestObj = {
        method: 'get',
        headers: {
          gamePlatform: fishingModel.MODE,
          device_token: appModel.deviceToken,
        },
      };

      if (fishingModel.isDemo)
        requestObj.url = `${API.playerStartDemoGame}/${fishingModel.fishingId}`;
      else {
        requestObj.url = `${API.playerStartGame}/${fishingModel.fishingId}`;
        requestObj.headers.authorization = `bearer ${userModel.accessToken}`;
      }

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        const {gameUrl, shouldOpenNewTab} = data;

        if (gameUrl) {
          const params = {
            url: gameUrl,
            trimUrl: `fishing/${fishingModel.MODE}`,
            id: fishingModel.fishingId,
            isDemo: fishingModel.isDemo,
            platform: fishingModel.MODE,
            name: fishingModel.fishingName,
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
              msg: err.message || '获取游戏链接失败，请稍后再试',
              description: err.message,
            },
          });
        }
      }
    },
  },
};
