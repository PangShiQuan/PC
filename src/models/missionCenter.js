import {API} from 'utils';
import queryString from 'query-string';
import {apiRequest as request} from 'services';
import _ from 'lodash';

const INITIAL_STATE = {
  taskPlanRewards: null,
  msg: null,
  data: null,
  enableDailyTask: null,
  enableWeeklyTask: null,
  userBlacklisted: null,
  explainUrlPc: null,
};

const setupGetTaskPlanRewards = accessToken => {
  const params = {
    access_token: accessToken,
  };
  const requestObj = {
    method: 'get',
    url: `${API.taskPlanRewards}?${queryString.stringify(params)}`,
  };
  return requestObj;
};

const setupRedeemRewards = (accessToken, id) => {
  const params = {
    availableTaskRewardId: id,
    access_token: accessToken,
  };
  const requestObj = {
    method: 'get',
    url: `${API.receiveAvailableTaskRewards}?${queryString.stringify(params)}`,
  };
  return requestObj;
};

const setupGetMissionHistory = (accessToken, from, to) => {
  const params = {
    receivedTimeFrom: `${from.format('YYYY-MM-DD')} 00:00:00`,
    receivedTimeTo: `${to.format('YYYY-MM-DD')} 23:59:59`,
    access_token: accessToken,
  };
  const requestObj = {
    method: 'get',
    url: `${API.getMissionHistory}?${queryString.stringify(params)}`,
  };
  return requestObj;
};

export default {
  namespace: 'missionCenterModel',
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
    *getTaskPlanRewards(payloadObj, {put, call, select}) {
      const {userModel} = yield select(state => state);

      const requestObj = setupGetTaskPlanRewards(userModel.accessToken);
      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            taskPlanRewards: data.taskRewardDisplayMap,
            enableDailyTask: data.enableDailyTask,
            enableWeeklyTask: data.enableWeeklyTask,
            userBlacklisted: data.userBlacklisted,
            explainUrlPc: data.explainUrlPc,
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
    *redeemReward(payloadObj, {put, call, select}) {
      const {userModel} = yield select(state => state);
      const {id} = payloadObj.payload;

      const requestObj = setupRedeemRewards(userModel.accessToken, id);
      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put.resolve({
          type: 'updateState',
          payload: {
            msg: '恭喜您！领取成功！',
          },
        });
        yield put({
          type: 'missionCenterModel/getTaskPlanRewards',
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
    *getMissionHistory(payloadObj, {put, call, select}) {
      const {userModel, dataTableModel} = yield select(state => state);

      const requestObj = setupGetMissionHistory(
        userModel.accessToken,
        dataTableModel.startTime,
        dataTableModel.endTime,
      );

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        const arr = [];
        Object.keys(data).map(item => {
          data[item].map(ele => {
            arr.push({...ele, type: item});
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
