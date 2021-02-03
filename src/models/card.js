import {omit, pick, filter} from 'lodash';
import {API, newWindow} from 'utils';
import {apiRequest as request} from 'services';

const INITIAL_STATE = {
  currentPage: 1,
  cardCategoryId: 0,
  cardId: '',
  cardListandCategoryFull: [],
  cardList: [],
  cardListCount: 0,
  searchTerm: '',
  isDemo: false,
  MODE: null,
  pageSize: 10,
};

function slicedCardList(cardList, currentPage, pageSize) {
  return cardList;
}

function filterActiveGame(card) {
  return card.cardId !== '' && card.status.toLowerCase() === 'normal';
}

function getFullCardList(cardListandCategoryFull) {
  const allGameList = cardListandCategoryFull.flatMap(cardCategory =>
    Array.prototype.filter.call(
      (cardCategory.category === 'all' && cardCategory.games) || [],
      filterActiveGame,
    ),
  );

  return allGameList;
}
export default {
  namespace: 'cardModel',
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
    getCardList(state) {
      const {
        currentPage,
        cardCategoryId,
        cardListandCategoryFull,
        pageSize,
      } = state;
      let cardList = [];

      if (cardCategoryId === 0) {
        cardList = getFullCardList(cardListandCategoryFull);
      } else {
        const selectedGameCategory = cardListandCategoryFull.find(
          cardCategory => cardCategory.categoryId === cardCategoryId,
        );

        if (selectedGameCategory)
          cardList = Array.prototype.filter.call(
            selectedGameCategory.games || [],
            filterActiveGame,
          );
      }

      const cardListSliced =
        cardList.length && currentPage
          ? slicedCardList(cardList, currentPage, pageSize)
          : [];

      return {
        ...state,
        cardList: cardListSliced,
        cardListCount: cardList.length,
      };
    },
    getSearchCardList(state) {
      const {
        currentPage,
        pageSize,
        cardListandCategoryFull,
        searchTerm,
      } = state;
      let allCardList = getFullCardList(cardListandCategoryFull);

      if (allCardList.length) {
        allCardList = searchTerm
          ? allCardList.filter(game =>
              game.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : allCardList;
        const allCardListSliced = slicedCardList(
          allCardList,
          currentPage,
          pageSize,
        );

        return {
          ...state,
          cardListCount: allCardList.length,
          cardList: allCardListSliced,
        };
      }

      return state;
    },
  },
  effects: {
    *getAllCardListByCategory(payloadObj, {put, call, select}) {
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

      const cardListandCategoryFull = [];

      const {data, err} = yield call(request.to, {
        url: `${
          API.getDsfAllGamesByCategory
        }?platformType=CARD&starterCategory=Pc&brand=${brand}`,
        method: 'get',
      });

      if (data) {
        cardListandCategoryFull.push(data.find(x => x.category === 'all'));

        yield put({
          type: 'updateState',
          payload: {
            cardListandCategoryFull,
          },
        });
        yield put.resolve({type: 'getCardList'});
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
    *getFullCardListAndCategory(payloadObj, {put, call, select}) {
      const {cardModel, appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
      } = appModel;

      yield put({
        type: 'updateState',
        payload: {
          listIsLoading: true,
        },
      });

      const cardListandCategoryFull = [];
      const {data, err} = yield call(request.to, {
        url: `${API.getDsfGames}?gamePlatform=${
          cardModel.MODE
        }&platformType=CARD&starterCategory=Pc&brand=${brand}`,
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
            cardListandCategoryFull.push(gameCategory);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            cardListandCategoryFull,
          },
        });
        yield put.resolve({type: 'getCardList'});
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
    *postCardLoginUrl(payloadObj, {put, call, select}) {
      const {userModel, cardModel, appModel} = yield select(state => state);
      const requestObj = {
        method: 'get',
        headers: {
          gamePlatform: cardModel.MODE,
          device_token: appModel.deviceToken,
        },
      };

      if (cardModel.isDemo)
        requestObj.url = `${API.playerStartDemoGame}/${cardModel.cardId}`;
      else {
        requestObj.url = `${API.playerStartGame}/${cardModel.cardId}`;
        requestObj.headers.authorization = `bearer ${userModel.accessToken}`;
      }

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        const {gameUrl, shouldOpenNewTab} = data;

        if (gameUrl) {
          const params = {
            url: gameUrl,
            trimUrl: `cards/${cardModel.MODE}`,
            id: cardModel.cardId,
            isDemo: cardModel.isDemo,
            platform: cardModel.MODE,
            name: cardModel.cardName,
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
