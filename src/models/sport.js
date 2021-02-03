import {API} from 'utils';
import {apiRequest as request} from 'services';

const INITIAL_STATE = {
  currentUrl: null,
  MODE: null,
};

export default {
  namespace: 'sportModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
    initializeAll(state, {payload}) {
      return {
        ...state,
        ...INITIAL_STATE,
      };
    },
  },
  effects: {
    *postSportsUrlFrame(payloadObj, {put, call, select}) {
      const {userModel, sportModel, appModel} = yield select(state => state);
      const {data, err} = yield call(request.to, {
        url: API.playerStartGame,
        method: 'get',
        headers: {
          gamePlatform: sportModel.MODE,
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });

      if (data) {
        const {gameUrl} = data;

        if (gameUrl) {
          yield put({
            type: 'updateState',
            payload: {
              currentUrl: gameUrl,
            },
          });
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
            },
          });
        }
      }
    },
  },
};
