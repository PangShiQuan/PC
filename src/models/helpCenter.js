import _ from 'lodash';
import {apiRequest as request} from 'services';
import {API} from 'utils';

const INITIAL_STATE = {
  awaitingResponse: false,
  selectedCategory: null,
  selectedQuestionId: -1,
  helpDocs: '',
};

export default {
  namespace: 'helpCenterModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload};
    },
    initializeAll(state) {
      return {...state, ...INITIAL_STATE};
    },
    initializeState(state, {payload}) {
      const initialStates = _.pick(INITIAL_STATE, payload);
      return {...state, ...initialStates};
    },
  },
  effects: {
    *getHelpList(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});

      const {appModel} = yield select(state => state);
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const response = yield call(request.to, {
        url: `${API.helpList}/${adminId}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data} = response;
      if (data) {
        yield put({type: 'updateState', payload: {helpDocs: [...data]}});
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
  },
  subscriptions: {},
};
