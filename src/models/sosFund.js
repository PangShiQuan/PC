import {API} from 'utils';
import queryString from 'query-string';
import {apiRequest as request} from 'services';
import _ from 'lodash';

const INITIAL_STATE = {
  msg: null,
  data: null,
  enableSosFund: null,
  sosFundReward: null,
  content: null,
  userBlacklisted: null,
  explainUrlPc: null,
  imageUrl: null,
  requiredTopUpAmount: null,
  requiredLossAmount: null,
  promotionUrl: null,
  title: null,
  successfulRedeem: null,
  popUpMsg: null,
};

const setupGetSosFundRewards = accessToken => {
  const params = {
    access_token: accessToken,
  };
  const requestObj = {
    method: 'get',
    url: `${API.sosFundRewards}?${queryString.stringify(params)}`,
  };
  return requestObj;
};

const setupRedeemSosFundRewards = (accessToken, id) => {
  const params = {
    availableSosRewardId: id,
    access_token: accessToken,
  };
  const requestObj = {
    method: 'get',
    url: `${API.receiveAvailableSosFundRewards}?${queryString.stringify(
      params,
    )}`,
  };
  return requestObj;
};

const setupGetSosFundHistory = (accessToken, from, to) => {
  const params = {
    receivedTimeFrom: `${from.format('YYYY-MM-DD')} 00:00:00`,
    receivedTimeTo: `${to.format('YYYY-MM-DD')} 23:59:59`,
    access_token: accessToken,
  };
  const requestObj = {
    method: 'get',
    url: `${API.getSosFundHistory}?${queryString.stringify(params)}`,
  };
  return requestObj;
};

export default {
  namespace: 'sosFundModel',
  state: INITIAL_STATE,
  reducers: {
    initializeState() {
      return {
        ...INITIAL_STATE,
      };
    },
    updateState(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    *getSosFundRewards(payloadObj, {put, call, select}) {
      const {userModel} = yield select(state => state);

      const requestObj = setupGetSosFundRewards(userModel.accessToken);
      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            enableSosFund: data.enableSosFund,
            sosFundReward: data.sosFundReward,
            content: data.content,
            userBlacklisted: data.userBlacklisted,
            explainUrlPc: data.explainUrlPc,
            imageUrl: data.imageUrl,
            requiredTopUpAmount: data.requiredTopUpAmount,
            requiredLossAmount: data.requiredLossAmount,
            promotionUrl: data.promotionUrl,
            title: data.title,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            msg: err.message,
          },
        });
      }
    },
    *redeemSosFundReward(payloadObj, {put, call, select}) {
      const {userModel, sosFundModel} = yield select(state => state);
      const {sosFundReward} = sosFundModel;

      if (!sosFundReward) {
        return yield put.resolve({
          type: 'updateState',
          payload: {
            successfulRedeem: false,
            popUpErrMsg:
              '你还没满足救济金的条件资格，请查看救济金具体规则，谢谢。',
          },
        });
      }

      const {rewardStatus} = sosFundReward;
      if (rewardStatus && rewardStatus === 'RECEIVED') {
        return yield put.resolve({
          type: 'updateState',
          payload: {
            successfulRedeem: false,
            popUpErrMsg: '今天已成功领取，请完成当日条件，明天才领取！谢谢。',
          },
        });
      }

      const requestObj = setupRedeemSosFundRewards(
        userModel.accessToken,
        sosFundReward.id,
      );
      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put.resolve({
          type: 'updateState',
          payload: {
            msg: '恭喜您！领取成功！',
            successfulRedeem: true,
          },
        });
        yield put.resolve({type: 'getSosFundRewards'});
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            msg: err.message,
            popUpErrMsg: err.message,
            successfulRedeem: false,
          },
        });
      }
    },
    *getSosFundHistory(payloadObj, {put, call, select}) {
      const {userModel, dataTableModel} = yield select(state => state);

      const requestObj = setupGetSosFundHistory(
        userModel.accessToken,
        dataTableModel.startTime,
        dataTableModel.endTime,
      );

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        const arr = [];
        data.forEach(item => {
          arr.push({
            receivedTime: item.receivedTime,
            rewardStatus: item.rewardStatus,
            fundAmount: item.fundAmount,
          });
        });

        yield put({
          type: 'updateState',
          payload: {
            data: _.orderBy(arr, ['receivedTime'], ['desc']),
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            msg: err.message,
          },
        });
      }
    },
  },
};
