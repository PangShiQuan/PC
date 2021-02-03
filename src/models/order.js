import _ from 'lodash';
import queryString from 'query-string';
import {API, type as TYPE} from 'utils';
import {apiRequest as request} from 'services';
import {betRecordReportS} from 'services/gameReport/';
import {version} from 'config';

const {
  AVIA,
  BET,
  MG,
  IMSPORT,
  KY,
  FG,
  CR,
  SSSPORT,
  THQP,
  LC,
  BBLQP,
  CQ9,
  NWG,
  BG,
  JDB,
  RMG,
  SB,
  BBIN,
} = TYPE.gamePlatformType;

const INITIAL_STATE = {
  awaitingResponse: false,
  orderHistory: [],
  orderHistoryCount: 0,
  orderHistoryTemp: [],
  orderInfo: '',
  state: 'ORDER_ALL',
  subOrders: [],
  coChildOrderList: [],
  transactionTimeuuid: '',
  selectedGamePlatform: BET,
  selectedTimeframeQuickLink: '',
  pageSize: 10,
  sortedInfo: {
    order: 'descend',
    columnKey: '',
  },
  searchText: '',
  filteredStatus: 'ALL',
  platformType: null,
};

export default {
  namespace: 'orderModel',
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
    *getOrderHistoryDsf(payloadObj, {call, put, select}) {
      const {orderModel} = yield select(state => state);
      const {selectedGamePlatform} = orderModel;
      let selectedPlatformType;
      const {payload = {}} = payloadObj;
      if (payload && payload.platformType) {
        selectedPlatformType = payload.platformType;
      }
      if (selectedGamePlatform === BET) {
        yield put({
          type: 'getLotteryBetLog',
          runAnother: payloadObj.runAnother,
        });
      } else {
        yield put({
          type: 'getGameBetLog',
          platformType: selectedPlatformType,
          runAnother: payloadObj.runAnother,
        });
      }
    },
    *getOrderHistoryFirst(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, dataTableModel, orderModel, appModel} = yield select(
        state => state,
      );
      const {accessToken} = userModel;
      const {pageSize, currentPage} = dataTableModel;
      const {state} = orderModel;

      // get records count
      const countResponse = yield call(request.to, {
        url: `${API.orderHistoryCount}?state=${state}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (countResponse) {
        const {data, err} = countResponse;
        if (err) {
          if (err.statusCode === '401') {
            yield put({
              type: 'userModel/unauthenticate',
              payload: {msg: err.message},
            });
          } else {
            throw new Error(`无法获取购彩记录，${err.message}`);
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {orderHistoryCount: data},
          });
        }
      }

      // get records
      const response = yield call(request.to, {
        url: `${
          API.orderHistory
        }?pageSize=${pageSize}&currentPage=${currentPage}&state=${state}`,
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
          payload: {orderHistory: data.datas},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获取购彩记录，${err.message}`);
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getLotteryBetLog(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, orderModel, appModel, dataTableModel} = yield select(
        state => state,
      );

      const {accessToken} = userModel;
      const {state, pageSize} = orderModel;
      const {endTime, startTime, currentPage} = dataTableModel;

      // get records count
      const countParams = {
        startTime: `${startTime.format('YYYY-MM-DD')} 00:00:00`,
        endTime: `${endTime.format('YYYY-MM-DD')} 23:59:59`,
        state,
      };
      const countResponse = yield call(request.to, {
        url: `${API.orderHistoryCount}?${queryString.stringify(countParams)}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (countResponse) {
        const {data, err} = countResponse;
        if (err) {
          if (err.statusCode === '401') {
            yield put({
              type: 'userModel/unauthenticate',
              payload: {msg: err.message},
            });
          } else {
            throw new Error(`无法获取购彩记录，${err.message}`);
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {orderHistoryCount: data},
          });
        }
      }

      const params = {
        startTime: `${startTime.format('YYYY-MM-DD')} 00:00:00`,
        endTime: `${endTime.format('YYYY-MM-DD')} 23:59:59`,
        pageSize,
        currentPage,
        state,
      };
      const response = yield call(request.to, {
        url: `${API.orderHistory}?${queryString.stringify(params)}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        const orderHistory = {};
        orderHistory.BET = {
          betLogs: data.datas,
          currentPage,
        };
        yield put({
          type: 'updateOrderHistory',
          orderHistory,
        });
        yield put({
          type: 'updateState',
          payload: {
            orderHistoryTemp: _.cloneDeep(orderHistory),
          },
        });
        if (payloadObj.runAnother) {
          payloadObj.runAnother();
        }
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获取购彩记录，${err.message}`);
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getGameBetLog(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {
        userModel,
        appModel,
        orderModel,
        dataTableModel,
        playerModel,
      } = yield select(state => state);
      const {accessToken} = userModel;
      const {selectedGamePlatform, platformType} = orderModel;
      const {endTime, startTime} = dataTableModel;
      const {gamePlatformList} = playerModel;

      let selectedPlatformType = null;
      if (payloadObj && payloadObj.platformType) {
        selectedPlatformType = payloadObj.platformType;
      }

      let defaultCMSPlatformType;

      // filter 类型 -> default auto select first option where gamePlatform no "全部" option
      if (
        !platformType &&
        !selectedPlatformType &&
        gamePlatformList[selectedGamePlatform] &&
        gamePlatformList[selectedGamePlatform].noAllType &&
        gamePlatformList[selectedGamePlatform].listOfSupportedPlatformType
      ) {
        defaultCMSPlatformType =
          gamePlatformList[selectedGamePlatform].listOfSupportedPlatformType[0]
            .cmsPlatformType;
      }

      let cmsPlatformType = platformType;
      if (defaultCMSPlatformType) {
        cmsPlatformType = defaultCMSPlatformType;
      } else if (selectedPlatformType) {
        cmsPlatformType =
          selectedPlatformType === 'All' ? null : selectedPlatformType;
      }

      const params = {
        startTime: `${startTime.format('YYYY-MM-DD')}`,
        endTime: `${endTime.format('YYYY-MM-DD')}`,
        cmsPlatformType,
        pageSize: 2000, // backend max only accepts 2000
      };

      const response = yield call(request.to, {
        url: `${API.playerGetBetLog}?${queryString.stringify(params)}`,
        method: 'get',
        headers: {
          gamePlatform: selectedGamePlatform,
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (response.data) {
        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          const orderHistory = {};
          orderHistory[selectedGamePlatform] = {
            betLogs: response.data,
            currentPage: 1,
          };
          yield put.resolve({
            type: 'updateOrderHistory',
            orderHistory,
          });
          yield put.resolve({
            type: 'updateState',
            payload: {
              orderHistoryTemp: _.cloneDeep(orderHistory),
              platformType: cmsPlatformType,
              searchText: '',
            },
          });
          yield put.resolve({type: 'getFilterOrderItem'});

          if (payloadObj.runAnother) {
            payloadObj.runAnother();
          }
        }
      } else if (response.err) {
        if (response.err.statusCode === '401') {
          yield put({
            type: 'userModel/secureAuthentication',
            payload: {
              msg: response.err.message,
            },
          });
        }
      }
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
    *getChildOrderList({payload}, {call, put, select}) {
      const {userModel, appModel, orderModel} = yield select(state => state);
      const {parentTransactionTimeuuid} = payload;
      if (
        orderModel.parentTransactionTimeuuid === parentTransactionTimeuuid &&
        orderModel.coChildOrderList.length
      ) {
        return;
      }
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: `${
          API.orderDetail
        }?transactionTimeuuid=${parentTransactionTimeuuid}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data} = response;

      if (data) {
        const {coChildOrderList} = data;
        const {orderInfo} = data;
        const isContinueOrder = !!coChildOrderList && !!coChildOrderList.length;
        let newChildOrderList;
        if (isContinueOrder) {
          newChildOrderList = coChildOrderList.map(childOrder => ({
            ...orderInfo,
            gameIssueNo: childOrder.issueNo,
            multiplier: childOrder.multiplier,
            rebate: childOrder.rebate,
            transactionAmount: childOrder.cost,
            transactionState: childOrder.childOrderState,
            transactionTimeuuid: childOrder.transactionTimeuuid,
            winningAmount: childOrder.winningAmount,
          }));
          yield put({
            type: 'updateState',
            payload: {coChildOrderList: newChildOrderList},
          });
        }
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *getOrderDetails({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {transactionTimeuuid} = payload;
      const {accessToken} = userModel;
      yield put({type: 'storeUuid', payload});
      const response = yield call(request.to, {
        url: `${API.orderDetail}?transactionTimeuuid=${transactionTimeuuid}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err, data} = response;
      if (data) {
        const {coChildOrderList, ...newPayload} = data;
        const {orderInfo} = data;
        const isContinueOrder = !!coChildOrderList && !!coChildOrderList.length;
        let newChildOrderList;
        if (data.parentTransactionTimeuuid) {
          yield put({
            type: 'getChildOrderList',
            payload: {
              parentTransactionTimeuuid: data.parentTransactionTimeuuid,
            },
          });
        }
        if (isContinueOrder) {
          newChildOrderList = coChildOrderList.map(childOrder => ({
            ...orderInfo,
            gameIssueNo: childOrder.issueNo,
            multiplier: childOrder.multiplier,
            rebate: childOrder.rebate,
            transactionAmount: childOrder.cost,
            transactionState: childOrder.childOrderState,
            transactionTimeuuid: childOrder.transactionTimeuuid,
            winningAmount: childOrder.winningAmount,
          }));
          newPayload.coChildOrderList = newChildOrderList;
        }
        yield put({
          type: 'updateState',
          payload: newPayload,
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获取订单详情, ${err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *putCancelOrder(payloadObj, {call, put, select}) {
      const {userModel, orderModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {orderInfo} = orderModel;
      const {transactionTimeuuid} = orderInfo;
      const response = yield call(request.to, {
        url: `${API.cancelOrder}/${transactionTimeuuid}`,
        method: 'put',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err} = response;
      if (!err) {
        if (version === 'Dsf') {
          yield put({type: 'getOrderHistoryDsf'});
        }
        if (version === 'Base') {
          yield put({type: 'getOrderHistoryFirst'});
        }
        yield put({type: 'getOrderDetails', payload: {transactionTimeuuid}});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '取消订单成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
      } else if (err) {
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: err.message,
              icon: 'checkbox-marked-circle-outline',
              color: 'red',
            },
          },
        });
      }
    },
    *updateOrderHistory(payloadObj, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          orderHistory: _.cloneDeep(payloadObj.orderHistory),
        },
      });
    },
    *getSearchOrderItem(payloadObj, {put, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      yield put.resolve({type: 'getFilterOrderItem'});

      const {orderModel} = yield select(state => state);
      const {
        orderHistory,
        selectedGamePlatform,
        searchText,
        platformType,
      } = orderModel;

      const searchDataList = _.filter(
        orderHistory[selectedGamePlatform].betLogs,
        item => {
          let selectedId;
          switch (selectedGamePlatform) {
            case AVIA:
              selectedId = item.orderId;
              break;
            case BET:
              selectedId = item.gameIssueNo;
              break;
            case MG:
              selectedId = item.rowId;
              break;
            case IMSPORT:
              selectedId = item.betId;
              break;
            case BG:
              platformType === 'FISH'
                ? (selectedId = item.betId)
                : (selectedId = item.orderId);
              break;
            case FG:
            case CR:
            case THQP:
              selectedId = item.transactionId;
              break;
            case SSSPORT:
              selectedId = item.wagerId;
              break;
            case SB:
            case NWG:
            case JDB:
            case BBIN:
              selectedId = item.betlog_id;
              break;
            case KY:
            case LC:
              selectedId = item.gameId;
              break;
            case BBLQP:
              selectedId = item.orderId;
              break;
            case CQ9:
              selectedId = item.round;
              break;
            case RMG:
              selectedId = item.gameNo;
              break;
            default:
              selectedId = item.billNo;
              break;
          }
          return selectedId && selectedId.toString().indexOf(searchText) > -1;
        },
      );
      orderHistory[selectedGamePlatform].betLogs = searchDataList;
      yield put.resolve({
        type: 'updateState',
        payload: {
          orderHistory: _.cloneDeep(orderHistory),
        },
      });
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
    *getFilterOrderItem(payloadObj, {put, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });
      const {orderModel} = yield select(state => state);
      const {
        orderHistory,
        orderHistoryTemp,
        selectedGamePlatform,
        filteredStatus,
      } = orderModel;

      const {transactionState, amount, settled} = payloadObj;
      const searchDataList = betRecordReportS[
        selectedGamePlatform
      ].gameReportStatusFilterRules({
        display: orderHistoryTemp,
        transactionState,
        selectedGamePlatform,
        amount,
        settled,
        filteredStatus,
      });
      orderHistory[selectedGamePlatform].betLogs = searchDataList;
      yield put({
        type: 'updateState',
        payload: {
          orderHistory,
        },
      });
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
  },
};
