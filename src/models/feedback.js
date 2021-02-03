import {message} from 'antd';
import {isEmpty, pick} from 'lodash';
import qs from 'query-string';

import {apiRequest as request} from '../services';
import {API} from '../utils';

const INITIAL_STATE = {
  awaitingResponse: false,
  datas: [],
  status: 'ALL',
  totalCount: 0,
};

export default {
  namespace: 'feedbackModel',
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
    *getFeedbackHistory({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});

      const {appModel, dataTableModel, feedbackModel, userModel} = yield select(
        state => state,
      );
      const {pageSize, start, startTime, endTime} = dataTableModel;
      const {status} = feedbackModel;
      const params = qs.stringify(
        {
          createTimeFrom: `${startTime.format('YYYY-MM-DD')} 00:00:00`,
          createTimeTo: `${endTime.format('YYYY-MM-DD')} 23:59:59`,
          pageSize,
          status: status === 'ALL' ? '' : status,
          start,
        },
        {encode: false},
      );
      const response = yield call(request.to, {
        url: `${API.playerListQa}?${params}`,
        method: 'get',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;

      if (data) {
        if (isEmpty(data))
          yield put({
            type: 'initializeState',
            payload: ['datas', 'totalCount'],
          });
        else yield put({type: 'updateState', payload: data});
      } else if (err) {
        message.error(`${err.message}`);
      }

      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *postNewQA({payload}, {call, put, select}) {
      const {appModel, formModel, userModel} = yield select(state => state);
      const {
        feedbackContent: {value: content},
        feedbackTitle: {value: title},
      } = formModel;

      const {err} = yield call(request.to, {
        url: API.qa,
        method: 'post',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
        body: {
          content,
          title,
          source: 'PC',
        },
      });

      if (!err) {
        yield put({
          type: 'formModel/initializeState',
          payload: ['feedbackContent', 'feedbackTitle'],
        });
        yield put({type: 'getFeedbackHistory'});
      } else {
        message.error(`${err.message}`);
      }
    },
  },
};
