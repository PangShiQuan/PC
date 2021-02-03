import _ from 'lodash';
import {apiRequest as request} from '../services';
import {API} from '../utils';

const INITIAL_STATE = {
  awaitingResponse: false,
  data: null,
  username: null,
};

export default {
  namespace: 'statisticsReportModel',
  state: INITIAL_STATE,
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
    *getPersonalReport({payload}, {call, put, select}) {
      if (payload && payload.username) {
        yield put({type: 'updateState', payload: {awaitingResponse: true}});

        const {appModel, dataTableModel, userModel} = yield select(
          state => state,
        );
        const {deviceToken} = appModel;
        const {endTime, pageSize, start, startTime} = dataTableModel;
        const {accessToken} = userModel;
        const body = {
          endDateInclusive: `${endTime.format('YYYY-MM-DD')}`,
          pageSize,
          start,
          startDateInclusive: `${startTime.format('YYYY-MM-DD')}`,
          username: payload.username,
        };
        const response = yield call(request.to, {
          url: API.personalReport,
          method: 'post',
          headers: {
            authorization: `bearer ${accessToken}`,
            device_token: deviceToken,
          },
          body,
        });

        const {data, err} = response;

        if (data)
          yield put({
            type: 'updateState',
            payload: {
              awaitingResponse: false,
              data: data.datas,
              totalCount: data.totalCount,
            },
          });
        else {
          yield put({
            type: 'updateState',
            payload: {awaitingResponse: false, data: null, totalCount: 0},
          });
          throw new Error(err.message);
        }
      } else {
        yield put({
          type: 'updateState',
          payload: {data: null, totalCount: 0},
        });
      }
    },
    *getTeamOverallReport(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});

      const {appModel, dataTableModel, userModel} = yield select(
        state => state,
      );
      const {deviceToken} = appModel;
      const {endTime, startTime} = dataTableModel;
      const {accessToken, username} = userModel;
      const body = {
        agentUsername: username,
        endDateInclusive: `${endTime.format('YYYY-MM-DD')}`,
        startDateInclusive: `${startTime.format('YYYY-MM-DD')}`,
      };
      const response = yield call(request.to, {
        url: API.teamReport,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
        },
        body,
      });

      const {data, err} = response;

      if (data)
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false, data: {...data}},
        });
      else {
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
        throw new Error(err.message);
      }
    },
  },
};
