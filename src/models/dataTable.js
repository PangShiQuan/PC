import {pick} from 'lodash';
import moment from 'moment';

const INITIAL_STATE = {
  currentPage: 1,
  pageSize: 20,
  start: 0,
  dayCounts: 7,
  date: moment(new Date()),
  startTime: moment(new Date()).add(-7, 'days'),
  endTime: moment(new Date()),
  moneyOperationType: null,
  targetUser: '',
  orderByLoginTime: '',
};

export default {
  namespace: 'dataTableModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload};
    },
    initializeAll(state) {
      return {...state, ...INITIAL_STATE};
    },
    initializeState(state, {payload}) {
      const initialStates = pick(INITIAL_STATE, payload);
      return {...state, ...initialStates};
    },
  },
  effects: {},
  subscriptions: {},
};
