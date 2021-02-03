import _ from 'lodash';
import queryString from 'query-string';
import { preflightRequest } from 'utils';

const INITIAL_STATE = {
  isLoading: false,
  loadedDocs: [],
  selectedGame: null,
  src: null,
};

export default {
  namespace: 'instructionsModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
    initializeAll(state) {
      return { ...state, ...INITIAL_STATE };
    },
    initializeState(state, { payload }) {
      const initialStates = _.pick(INITIAL_STATE, payload);
      return { ...state, ...initialStates };
    },
  },
  effects: {
    *getInstruction(actionObj, { call, put, select }) {
      const { gameInfosModel, instructionsModel } = yield select(state => state);
      const { gameInfos } = gameInfosModel;
      const { loadedDocs, selectedGame } = instructionsModel;
      const src = (
        gameInfos.find(gameInfo => gameInfo.gameUniqueId === selectedGame) || {
          guideUrl: '',
        }
      ).guideUrl;

      if (src) yield put({ type: 'updateState', payload: { isLoading: true } });

      if (loadedDocs.includes(src))
        yield put({ type: 'updateState', payload: { src, isLoading: false } });
      else if (src) {
        // 初次加载, 需检测相对文件是否存在于服务器.
        const ok = yield call(preflightRequest, src);
        const newLoadedDocs = [...loadedDocs, src];
        const payload = !ok ? { src: null } : { src };
        payload.loadedDocs = newLoadedDocs;
        payload.isLoading = false;
        yield put({
          type: 'updateState',
          payload,
        });
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname, search }) => {
        if (pathname === '/instructions') {
          const { gameUniqueId } = queryString.parse(search);

          if (gameUniqueId) {
            dispatch({
              type: 'updateState',
              payload: { selectedGame: gameUniqueId },
            });
          }
        }
      });
    },
  },
};
