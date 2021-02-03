import {join, pick} from 'lodash';
import {apiRequest as request} from 'services';
import {API} from 'utils';

const INITIAL_STATE = {
  awaitingResponse: false,
  pendingAction: null,
  state: 'ALL',
  subType: 'ALL',
  transactionHistory: [],
  type: 'ALL',
};

export default {
  namespace: 'transactionModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload};
    },
    initializeState(state, {payload}) {
      const initialStates = pick(INITIAL_STATE, payload);
      return {...state, ...initialStates};
    },
    initializeAll(state) {
      return {...state, ...INITIAL_STATE};
    },
  },
  effects: {
    *cancelTransaction({payload}, {call, put, select}) {
      const {appModel, userModel} = yield select(state => state);
      const {err} = yield call(request.to, {
        url: `${API.cancelTransaction}/${payload.transactionNo}`,
        method: 'put',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (err) {
        throw new Error(`取消取款失败, ${err.message}`);
      } else {
        yield put({type: 'getTransactionHistory', payload});
        yield put({type: 'initializeState', payload: ['pendingAction']});
      }
    },
    *getTransactionHistory({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {
        userModel,
        dataTableModel,
        appModel,
        transactionModel,
      } = yield select(state => state);
      const {accessToken} = userModel;
      const {pageSize, currentPage} = dataTableModel;

      const {subType, success} = transactionModel;
      const url = [
        `${API.transactionHistory}`,
        `?pageSize=${pageSize * 10}`,
        `&currentPage=${currentPage}`,
      ];
      if (payload.type !== 'ALL') url.push(`&type=${payload.type}`);
      if (subType !== 'ALL') url.push(`&subType=${subType}`);
      if (success) url.push(`&success=${success}`);

      const response = yield call(request.to, {
        url: join(url, ''),
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
        yield put({
          type: 'updateState',
          payload: {transactionHistory: data},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获取交易记录, ${err.message}`);
        }
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      }
    },
  },
};
