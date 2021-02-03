import _ from 'lodash';

import {API} from 'utils';
import {apiRequest as request} from 'services';
import PhotoHelper from 'helper/PhotoHelper.min';

const receiptPrinter = new PhotoHelper();
const INITIAL_STATE = {
  allBetObj: {},
  allOpenOptions: {},
  amount: 0,
  amountUnit: 1,
  awaitingResponse: false,
  baseAmount: 2,
  betEntries: [],
  betPlanData: [],
  betPlan: null,
  tabPlanValue: 'profit',
  betPlanModalVisible: false,
  consecutivePeriodStore: '',
  betPlanIssueNumber: '',
  haltOnWin: true,
  disabledByDefault: true,
  gameClosed: false,
  gameMethod: '',
  gameNav: '',
  gameSubNav: '',
  initialAmount: 2,
  isMultipleBet: false,
  lastIssueNumber: '-',
  lastOpenCode: '',
  methodGroup: '',
  methodId: '',
  multiply: 1,
  nextUniqueIssueNumber: '-',
  numberOfUnits: 0,
  multipleNumberOfUnits: [],
  responseColor: '',
  responseMessage: '',
  resultLimit: 40,
  returnMoneyRatio: 0,
  thisBetObj: {},
  thisBetString: '',
  thisGameId: '',
  thisGamePrizeSetting: '',
  thisGameSetting: '',
  thisMethodPrizeSetting: '',
  thisMethodSetting: '',
  thisMultipleBet: [],
  thisMultipleBetString: [],
  thisOpenOption: '',
  uniqueIssueNumber: '-',
  homePageMethod: '',
  displayTableLayout: false,
};

const PERSIST_STATE = {
  expandedCategory: 'HOT',
};

export default {
  namespace: 'betCenter',
  state: {...INITIAL_STATE, ...PERSIST_STATE},
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
    clearBetPlan(state) {
      const initialStates = _.pick(INITIAL_STATE, [
        'betPlanData',
        'haltOnWin',
        'betPlanIssueNumber',
      ]);
      return {...state, ...initialStates};
    },
  },
  effects: {
    *getCurrentBetPlanNo(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {betCenter, appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
        deviceToken,
      } = appModel;
      const {thisGameId, uniqueIssueNumber, consecutivePeriodStore} = betCenter;
      const response = yield call(request.to, {
        url: `${
          API.betPlanGetResults
        }/${thisGameId}?currentIssueNumber=${uniqueIssueNumber}&limit=${consecutivePeriodStore}&gameUniqueId=${thisGameId}&brand=${brand}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data} = response;
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            betPlanIssueNumber: data,
          },
        });
      } else {
        throw new Error(`无法刷新彩种期号`);
      }
    },
    *postBetEntries(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {
        payload: {isBetPlan},
      } = payloadObj;
      const {betCenter, userModel, appModel} = yield select(state => state);
      let {
        betEntries,
        betPlanData,
        tabPlanValue,
        haltOnWin,
        betPlanIssueNumber,
      } = betCenter;
      let eachChildOrders = [];
      let purchaseType;
      let totalAmount = 0;
      let totalUnits = 0;
      _.forEach(betEntries, entry => {
        const {amount, numberOfUnits} = entry;
        totalAmount += amount;
        totalUnits += numberOfUnits;
      });
      if (tabPlanValue === 'profit') {
        purchaseType = 'ICO';
      } else purchaseType = 'SCO';
      const {
        uniqueIssueNumber,
        thisGameId,
        gameClosed,
        nextUniqueIssueNumber,
      } = betCenter;
      const {accessToken, sessionId} = userModel;
      const userSubmitTimestampMillis = +new Date();
      let issueNum = uniqueIssueNumber;
      let drawIdentifierBetPlan;
      if (gameClosed) {
        issueNum = nextUniqueIssueNumber;
      }
      if (betPlanIssueNumber[0] && betPlanIssueNumber[0].uniqueIssueNumber) {
        drawIdentifierBetPlan = {
          gameUniqueId: thisGameId,
          issueNum: betPlanIssueNumber[0].uniqueIssueNumber,
        };
        _.forEach(betPlanData, (data, index) => {
          const {multiply} = data;
          eachChildOrders.push({
            issueNum: betPlanIssueNumber[index].uniqueIssueNumber,
            multiplier: multiply,
          });
        });
      }
      const drawIdentifier = {
        gameUniqueId: thisGameId,
        issueNum,
      };
      const purchaseInfo = {
        childOrder: {
          eachChildOrders: eachChildOrders,
          stopAfterWin: haltOnWin,
        },
        purchaseType: purchaseType,
      };
      betEntries = _.map(betEntries, entry =>
        _.pick(entry, [
          'amount',
          'betString',
          'gameplayMethod',
          'numberOfUnits',
          'pricePerUnit',
          'returnMoneyRatio',
        ]),
      );
      const order = {
        betEntries,
        drawIdentifier,
        numberOfUnits: totalUnits,
        purchaseInfo: {
          purchaseType: 'METHOD_UNDEFINED',
        },
        totalAmount,
        userSubmitTimestampMillis,
      };
      const betPlanOrder = {
        betEntries,
        drawIdentifier: drawIdentifierBetPlan,
        numberOfUnits: totalUnits,
        purchaseInfo,
        source: 'pc',
        totalAmount,
        userSubmitTimestampMillis,
      };
      const body = receiptPrinter.cropPhoto(
        sessionId,
        JSON.stringify(isBetPlan ? betPlanOrder : order),
      );
      const response = yield call(request.to, {
        url: API.ordercap,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
        shouldStringify: false,
      });
      const {data, err} = response;
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
      if (data) {
        yield put({type: 'initializeState', payload: ['betEntries']});
        yield put({
          type: 'updateState',
          payload: {
            awaitingResponse: false,
            responseMessage: '投注成功祝您中奖',
            responseColor: 'green',
          },
        });
        yield put({type: 'userModel/getCardsAndWithdrawDetail'});
        yield put({type: 'userModel/getUserTotalRecoverBalance'});
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message, showAuth: true},
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              responseMessage: err.message,
              responseColor: 'red',
            },
          });
        }
      }
    },
  },
};
