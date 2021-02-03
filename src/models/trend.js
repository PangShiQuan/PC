import _ from 'lodash';
import {apiRequest as request} from 'services';
import {API} from 'utils';

const INITIAL_STATE = {
  awaitingResponse: false,
  resultData: [],
  gameUniqueId: null,
  limit: 30,
};

export default {
  namespace: 'trendModel',
  state: {...INITIAL_STATE},
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload};
    },
    initializeState(state, {payload}) {
      const initialStates = _.pick(INITIAL_STATE, payload);
      return {...state, ...initialStates};
    },
    initializeAll(state) {
      return {...state, ...INITIAL_STATE};
    },
  },
  effects: {
    *getHistoryList(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {trendModel, appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
        deviceToken,
      } = appModel;
      const {gameUniqueId, limit} = trendModel;
      const response = yield call(request.to, {
        url: `${
          API.uniqueGameHistory
        }/${gameUniqueId}?limit=${limit}&brand=${brand}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data, err} = response;

      yield put({type: 'updateState', payload: {awaitingResponse: false}});
      if (data)
        yield put({type: 'updateState', payload: {resultData: data.reverse()}});
      else if (err) throw new Error(`无法获取开彩信息, ${err.message}`);
    },
  },
};
