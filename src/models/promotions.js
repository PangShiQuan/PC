import _ from 'lodash';
import {apiRequest as request} from 'services';
import {API} from 'utils';

const INITIAL_STATE = {
  promotionList: '',
  pcPromotionTopImage: '',
  selectedCategory: 'ALL',
  selectedPromotion: '',
};

export default {
  namespace: 'promotionsModel',
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
    *getSpecialOfferList(payloadObj, {call, put, select}) {
      const {appModel} = yield select(state => state);
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const response = yield call(request.to, {
        url: `${API.specialOfferList}&adminId=${adminId}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data} = response;
      yield put({type: 'updateState', payload: {...data}});
    },
  },
  subscriptions: {},
};
