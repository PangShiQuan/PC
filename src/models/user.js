import {message} from 'antd';
import {pick, camelCase, concat} from 'lodash';
import {routerRedux} from 'dva/router';
import {delay} from 'dva/saga';

/* eslint-disable import/first */
import 'polyfill/origin';
import AuthChannel, {COMMAND} from 'messaging/handler/auth';
import {type as TYPE, API, encodePassword, getDeviceInfo} from 'utils';
import {apiRequest as request} from 'services';
import {version, edition, GET_CS_LIVECHAT_LINK} from 'config';

const {ALL} = TYPE.gamePlatformType;
const INITIAL_STATE = {
  accessToken: null,
  authenticationState: TYPE.LOGIN,
  awaitingResponse: false,
  bankAccounts: [],
  withdrawalSetting: {},
  commissionDetail: [],
  commissionDetailCount: 0,
  dailyWithdrawWithAdminSettingsResult: '',
  generatedVarifyCode: '',
  messageType: 'ALL',
  myCashFlow: [],
  myCashFlowPagingState: '',
  myCashFlowIsEnd: true,
  myCommissionHistory: [],
  myLoginHistory: [],
  currentLevel: {
    displayOrder: 0, // VIP等级数
  },
  balance: 0, // 查询+回收 钱包余额度
  openState: false, // 是否开启VIP
  myMessages: [],
  myMessagesCount: 0,
  password: '',
  passwordInputMsg: '',
  sessionId: '',
  standalonePass: false, // PrivateRoute 组件独立运作
  status: 'ALL',
  taskIdentifier: '',
  totalBetsSum: 0,
  totalCommission: 0,
  userAgreed: true,
  userData: null,
  userIdExist: null,
  userCheckedIn: false,
  role: 'USER',
  userCheckedInCount: 0,
  requiredRegInfos: [],
  selectedTimeframeQuickLink: '',
  selectedGamePlatform: ALL,
  sortedInfo: {
    order: 'descend',
    columnKey: '',
  },
  searchText: '',
};

export default {
  namespace: 'userModel',
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
      return {...INITIAL_STATE};
    },
    getCardsAndWithdrawDetailSuccess(state, {payload}) {
      return {...state, ...payload};
    },
    getUserTotalRecoverBalanceSuccess(state, {payload}) {
      return {...state, ...payload};
    },
    getAlipayAndBankSettingsSuccess(state, {payload}) {
      return {...state, ...payload};
    },
    getUserRewardTogetInfoSuccess(state, {payload}) {
      return {...state, ...payload};
    },
    updateInfoSuccess(state, {payload}) {
      const {target} = payload;
      return {
        ...state,
        [`${target}InfosFormResponse`]: {
          icon: 'checkbox-marked-circle-outline',
          color: 'green',
          message: `${TYPE[target]}信息更新成功`,
        },
      };
    },
    updateInfoFailed(state, {payload}) {
      const {target} = payload;
      return {
        ...state,
        [`${target}InfosFormResponse`]: {
          icon: 'close-circle-outline',
          color: 'red',
          message: payload.message,
        },
      };
    },
    toggleAgree(state) {
      const {userAgreed} = state;
      return {...state, userAgreed: !userAgreed};
    },
    toggleAccountInfoTarget(state, {payload}) {
      return {
        ...state,
        accountInfoEditTarget: payload,
        withdrawalInfosFormResponse: INITIAL_STATE.withdrawalInfosFormResponse,
        accountInfosFormResponse: INITIAL_STATE.accountInfosFormResponse,
      };
    },
  },
  effects: {
    *authenticate(payloadObj, {put, select, call}) {
      const {appModel, layoutModel} = yield select(state => state);
      const {redirectFrom} = layoutModel;
      let accessToken, sessionId;
      const deviceInfo = getDeviceInfo();
      const splitAllUserCookies = document.cookie.split('; ');
      const splitedCookies = [];
      splitAllUserCookies.forEach(item => {
        splitedCookies.push(item.split('=')[0]);
      });
      const now = new Date();
      now.setUTCDate(now.getUTCDate() + 1);
      now.setUTCHours(0);
      now.setUTCMinutes(0);
      now.setUTCSeconds(0);

      if (!payloadObj.payload || !payloadObj.payload.trigger) {
        accessToken = payloadObj.oauthToken.access_token;
        sessionId = payloadObj.sessionId;
        localStorage.setItem(TYPE.accessToken, accessToken);
        localStorage.setItem(TYPE.sessionId, sessionId);
        AuthChannel.post({
          command: COMMAND.AUTH,
          pkg: {accessToken, sessionId},
        });
      } else {
        accessToken = payloadObj.payload.accessToken;
        sessionId = payloadObj.payload.sessionId;
      }

      yield put({
        type: 'formModel/initializeState',
        payload: ['responseMsg'],
      });
      yield put({type: 'updateState', payload: {accessToken, sessionId}});
      yield put({type: 'getCurrentUser'});
      yield put({type: 'transferModel/getTopupGroups'});
      yield put({
        type: 'layoutModel/updateState',
        payload: {shouldShowAuthModel: false},
      });

      if (redirectFrom) {
        const query = `${window.location.origin}${redirectFrom}?deviceToken=${
          appModel.deviceToken
        }&accessToken=${accessToken}`;
        window.location.replace(query);

        yield put({
          type: 'layoutModel/initializeState',
          payload: ['redirectFrom'],
        });
      }

      if (
        document.cookie === null ||
        document.cookie === '' ||
        !splitedCookies.includes(payloadObj.username)
      ) {
        document.cookie = `${payloadObj.username}=${
          deviceInfo.browser
        };expires=${now.toGMTString()};path=/`;
        yield call(request.to, {
          url: `${API.getDeviceInfo}?access_token=${accessToken}`,
          method: 'post',
          body: deviceInfo,
        });
      }
    },
    *unauthenticate({payload = {}}, {put}) {
      const {authenticationState, msg, showAuth, trigger = false} = payload;

      if (!trigger) {
        localStorage.removeItem(TYPE.accessToken);
        localStorage.removeItem(TYPE.sessionId);
        AuthChannel.post({command: COMMAND.UNAUTH});
      }

      yield put.resolve({
        type: 'clearUserData',
      });

      if (
        authenticationState &&
        authenticationState !== INITIAL_STATE.authenticationState
      ) {
        yield put({
          type: 'updateState',
          payload: {authenticationState},
        });
      }
      yield put({
        type: 'layoutModel/initializeState',
        payload: ['shouldShowProfileModal'],
      });

      if (GET_CS_LIVECHAT_LINK) {
        yield put({
          type: 'gameInfosModel/updateLiveChatLink',
        });
      }

      if (showAuth !== undefined) {
        yield put({
          type: 'layoutModel/updateState',
          payload: {
            shouldShowAuthModel: showAuth,
          },
        });
      }
      if (showAuth) {
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg,
              icon: 'close-circle-outline',
              color: 'red',
            },
          },
        });
      } else if (msg) {
        throw new Error(msg);
      }
    },
    *clearUserData(payloadObj, {put}) {
      yield put({type: 'initializeAll'});
      yield put({type: 'teamModel/initializeAll'});
      yield put({type: 'transactionModel/initializeAll'});
      yield put({type: 'orderModel/initializeAll'});
      yield put({type: 'transferModel/initializeAll'});
      yield put({
        type: 'formModel/initializeState',
        payload: [
          'password',
          'securityPassword',
          'repeatSecurityPassword',
          'newPassword',
          'repeatPassword',
          'repeatNewPassword',
          'responseMsg',
        ],
      });
    },
    *getUserMessage(payloadObj, {call, put, select}) {
      const {userModel, dataTableModel, appModel} = yield select(
        state => state,
      );
      const {start, pageSize} = dataTableModel;
      const {accessToken, messageType} = userModel;
      const response = yield call(request.to, {
        url: `${API.messageList}?pageSize=${pageSize}&start=${start}${
          messageType === 'ALL' ? '' : `&type=${messageType}`
        } `,
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
          payload: {
            myMessages: data.datas,
            myMessagesCount: data.totalCount,
          },
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        }
      }
    },
    *getUserMessageCount(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: `${API.playerMessageCount}?access_token=${accessToken}`,
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
          payload: {
            myMessagesUnreadCount: data.messageCount,
          },
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        }
      }
    },
    *getMyLoginHistory(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: `${API.loginHistory}?pageSize=20&access_token=${accessToken}`,
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
          payload: {myLoginHistory: data.datas},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        }
      }
    },
    *getMyCommission(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, dataTableModel, appModel} = yield select(
        state => state,
      );
      const {accessToken, status} = userModel;
      const {start, startTime, endTime, pageSize} = dataTableModel;
      const body = {
        status: status === 'ALL' ? '' : status,
        start,
        pageSize: pageSize * 10,
        startTime: `${startTime.format('YYYY-MM-DD')} 00:00:00`,
        endTime: `${endTime.format('YYYY-MM-DD')} 23:59:59`,
      };
      const response = yield call(request.to, {
        url: API.myCommissions,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });
      const {data, err} = response;
      if (data) {
        const {datas, totalBetsSum, totalCommission} = data;
        yield put({
          type: 'updateState',
          payload: {
            myCommissionHistory: datas,
            totalBetsSum,
            totalCommission,
          },
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获取佣金历史, ${err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *getCommissionDetail(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, dataTableModel, appModel} = yield select(
        state => state,
      );
      const {accessToken, taskIdentifier} = userModel;
      const {pageSize} = dataTableModel;
      const response = yield call(request.to, {
        url: `${API.commissionDetail}?pageSize=${pageSize *
          10}&currentPage=1&access_token=${accessToken}&taskIdentifier=${taskIdentifier}`,
        method: 'get',
        headers: {device_token: appModel.deviceToken},
      });
      const {data, err} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            commissionDetail: data.datas,
            commissionDetailCount: data.totalCount,
          },
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获取佣金详情，${err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *getUserLogout({payload}, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;

      if (accessToken) {
        const response = yield call(request.to, {
          url: API.logout,
          method: 'get',
          headers: {
            authorization: `bearer ${accessToken}`,
            device_token: appModel.deviceToken,
          },
        });
        const {err, data} = response;

        if (data) {
          sessionStorage.removeItem('prizeGroup');
          const logoutMsg = payload || '用户登出成功';

          sessionStorage.removeItem(TYPE.popupDidUnmount);
          yield put({type: 'unauthenticate'});
          message.success(logoutMsg, 1);

          yield put({
            type: 'chatboxModel/updateToInitialState',
          });
          yield put({
            type: 'chatboxModel/getChatStatus',
          });
          yield put.resolve({
            type: 'playerModel/resetBalance',
          });
        } else if (err) {
          message.error(`用户登出 ${err.message}`);
        }
      } else {
        yield put({type: 'unauthenticate'});
      }
    },
    *getUserAccess(payloadObj, {call, put, select}) {
      const accessToken = localStorage.getItem(TYPE.accessToken);
      const sessionId = localStorage.getItem(TYPE.sessionId);
      const {userModel} = yield select(state => state);

      if (accessToken && sessionId) {
        yield put({type: 'updateState', payload: {accessToken, sessionId}});
        yield put({type: 'getCurrentUser'});
        yield put({type: 'getCardsAndWithdrawDetail'});
        yield put({type: 'getUserTotalBalance'});
        yield put({type: 'getAlipayAndBankSettings'});
      } else {
        yield put({
          type: 'initializeState',
          payload: ['accessToken', 'sessionId'],
        });
        localStorage.removeItem(TYPE.accessToken);
        localStorage.removeItem(TYPE.sessionId);
      }

      if (userModel.standalonePass) {
        // delay for standalonePass to take effect
        yield call(delay, 0);
        yield put({
          type: 'updateState',
          payload: {standalonePass: false},
        });
      }
    },
    *getCurrentUser(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const response = yield call(request.to, {
        url: API.userInfo,
        method: 'get',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err, data} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {...data, userData: data},
        });
        yield put({
          type: 'initializeState',
          payload: ['userIdExist'],
        });
        yield put({type: 'getAlipayAndBankSettings'});
        yield put({type: 'getUserRewardTogetInfo'});
        if (GET_CS_LIVECHAT_LINK) {
          yield put({type: 'gameInfosModel/updateLiveChatLink'});
        }
        const {prizeGroup} = data;
        if (prizeGroup !== +sessionStorage.getItem('prizeGroup')) {
          sessionStorage.removeItem('prizeGroup');
          sessionStorage.setItem('prizeGroup', prizeGroup);
          localStorage.removeItem('UserlotteryPriceList');
          yield put({type: 'gameInfosModel/getAllGamesSetting', prizeGroup});
          return;
        }
        sessionStorage.setItem('prizeGroup', prizeGroup);
        yield put({type: 'gameInfosModel/getAllGamesSetting', prizeGroup});
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          message.warning(`登陆失败，${err.message}`);
        }
      }
    },
    *getMyCashFlow(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, dataTableModel, appModel} = yield select(
        state => state,
      );
      const {accessToken, myCashFlowPagingState, myCashFlow} = userModel;
      const {date, moneyOperationType, targetUser, pageSize} = dataTableModel;
      let moneyOperationTypeInput = '';
      let moneyOperationSubTypeInput = null;
      switch (moneyOperationType) {
        case 'ALL':
          moneyOperationTypeInput = null;
          break;
        case 'BONUS_BON_REB':
          moneyOperationTypeInput = 'BONUS';
          moneyOperationSubTypeInput = 'BON_REB';
          break;
        default:
          moneyOperationTypeInput = moneyOperationType;
      }

      const body = {
        moneyOperationType: moneyOperationTypeInput,
        moneyOperationSubType: moneyOperationSubTypeInput,
        pagingState: myCashFlowPagingState,
        pageSize,
        date: date.format('YYYY-MM-DD'),
      };
      if (targetUser) {
        body.username = targetUser;
      }
      const response = yield call(request.to, {
        url: API.userBalance,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });
      const {data, err} = response;
      if (data) {
        const isEnd = data.datas.length < pageSize;
        yield put({
          type: 'updateState',
          payload: {
            myCashFlow: myCashFlowPagingState
              ? concat(myCashFlow, data.datas)
              : data.datas,
            myCashFlowIsEnd: isEnd,
            myCashFlowPagingState: data.pagingState,
          },
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获取账户明细，${err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *getCardsAndWithdrawDetail(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.userBanksAccount,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err, data} = response;
      if (data) {
        yield put({
          type: 'getCardsAndWithdrawDetailSuccess',
          payload: data,
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          // throw new Error(`无法获取银行卡信息, ${err.message}`);
          return;
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getUserTotalRecoverBalance({callback}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.userTotalRecoverBalance,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err, data} = response;
      if (data) {
        if (callback) {
          callback();
        }
        yield put({
          type: 'getUserTotalRecoverBalanceSuccess',
          payload: data,
        });
      } else if (err) {
        if (err.statusCode === '401' && accessToken !== null) {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else if (accessToken !== null) {
          throw new Error(`无法余额信息, ${err.message}`);
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getUserTotalBalance(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.userTotalBalance,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err, data} = response;
      if (data) {
        yield put({
          type: 'getUserTotalRecoverBalanceSuccess',
          payload: data,
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法余额信息, ${err.message}`);
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getAlipayAndBankSettings(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.alipayAndBankSetting,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err, data} = response;
      if (data) {
        yield put({
          type: 'getAlipayAndBankSettingsSuccess',
          payload: {withdrawalSetting: data},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'secureAuthentication',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(`无法获数据信息, ${err.message}`);
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getUserRewardTogetInfo(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.userRewardTogetInfo,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err, data} = response;
      if (data) {
        yield put({
          type: 'getUserRewardTogetInfoSuccess',
          payload: data,
        });
      } else if (err) {
        // throw new Error(`无法获数据信息, ${err.message}`);
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getUserCheckIn(Null, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {appModel, userModel} = yield select(state => state);
      const response = yield call(request.to, {
        url: API.userCheckIn,
        method: 'get',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            userCheckedIn: data.isSigned,
            userCheckedInCount: data.keepSignInDays,
          },
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *postUserCheckIn(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const response = yield call(request.to, {
        url: API.userCheckIn,
        method: 'post',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err} = response;
      if (!err) {
        yield put({
          type: 'getUserCheckIn',
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *putUserLogin({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {routing} = yield select(state => state);
      const {
        location: {pathname},
      } = routing;
      const {successData} = payload;
      localStorage.setItem('commissionMode', successData.commissionMode);

      if (successData) {
        yield put(routerRedux.replace(pathname));
        // const {strongPwd} = successData;
        // 取消了强密码校验
        window.history.replaceState(
          {},
          document.title,
          window.location.href.split('#')[0],
        );
        yield put({type: 'authenticate', ...successData});
        message.success('用户登录成功', 1);

        yield put({
          type: 'chatboxModel/updateToInitialState',
        });
        yield put({
          type: 'chatboxModel/getChatStatus',
        });

        // if (!strongPwd) {
        //   yield put({
        //     type: 'layoutModel/updateState',
        //     payload: {
        //       profileSelectedNav: 'securityInfo',
        //       shouldShowProfileModal: true,
        //     },
        //   });
        //   yield put({
        //     type: 'formModel/updateState',
        //     payload: {
        //       responseMsg: {
        //         msg:
        //           '系统检测到您的账号登录密码安全系数过低，请修改密码强度提高账户安全！',
        //         color: 'red',
        //         icon: 'alert-circle-outline',
        //       },
        //     },
        //   });
        // }
      }

      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *putUserRealName(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, formModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {realName} = formModel;
      const response = yield call(request.to, {
        url: `${API.updateRealName}?realName=${realName.value}`,
        method: 'put',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err} = response;
      if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
      } else {
        yield put({type: 'getCurrentUser'});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg:
                '修改已提交，请等待管理员审核，您可联系在线客服咨询审核进度。',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *putUserInfo(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, formModel, appModel} = yield select(state => state);
      const {accessToken, userData} = userModel;
      const {email, nickname, phoneNumber} = formModel;
      const body = {
        email: email.value,
        nickname: nickname.value,
        phoneNumber: phoneNumber.value,
        username: userData.username,
      };
      const response = yield call(request.to, {
        url: `${API.updateUserInfo}/`,
        method: 'put',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });
      const {err} = response;
      if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
      } else {
        yield put.resolve({type: 'getCurrentUser'});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '用户基本信息绑定成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({type: 'formModel/getBasicDetails'});
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *putRegisterInfo(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {formModel, userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        realName,
        securityPassword,
        bankAccountName,
        bankAddress,
        bankCode,
        bankName,
        vcCode,
        vcName,
      } = formModel;

      const encodedPassword = encodePassword(securityPassword.value);
      const body = {
        realName: realName.value || bankAccountName.value,
        securityPassword: encodedPassword,
        userBankCardDto: {
          bankAccountName: bankAccountName.value || realName.value,
          bankAddress:
            payloadObj.withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
              ? '虚拟币'
              : bankAddress.value,
          bankCardNo: payloadObj.bankCardNo.value,
          bankCode:
            payloadObj.withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
              ? vcCode.value
              : bankCode.value,
          bankName:
            payloadObj.withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
              ? vcName.value
              : bankName.value,
        },
      };
      const response = yield call(request.to, {
        url: API.updateBankInfo,
        method: 'put',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });
      const {err} = response;
      if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
      } else {
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '添加成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({type: 'getCurrentUser'});
        yield put({type: 'getCardsAndWithdrawDetail'});
        yield put({type: 'getUserTotalRecoverBalance'});
        yield put({type: 'getAlipayAndBankSettings'});
        yield put({
          type: 'formModel/initializeState',
          payload: [
            'bankName',
            'bankCode',
            'bankAddress',
            'bankCardNo',
            'securityPassword',
            'repeatSecurityPassword',
            'remarks',
          ],
        });
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *putRegisterCardsInfo(payloadObj, {call, put, select}) {
      const {formModel, userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        realName,
        securityPassword,
        bankAccountName,
        bankAddress,
        bankCode,
        bankName,
        vcCode,
        vcName,
      } = formModel;
      const encodedPassword = encodePassword(securityPassword.value);
      const body = {
        securityPassword: encodedPassword,
        bankAccountName: bankAccountName.value || realName.value,
        bankAddress:
          payloadObj.withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
            ? ''
            : bankAddress.value,
        bankCardNo: payloadObj.bankCardNo.value,
        bankCode:
          payloadObj.withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
            ? vcCode.value
            : bankCode.value,
        bankName:
          payloadObj.withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
            ? vcName.value
            : bankName.value,
      };
      const response = yield call(request.to, {
        url: API.updateCardInfo,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });
      const {err} = response;
      if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'secureAuthentication',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
      } else {
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '添加成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({type: 'getCurrentUser'});
        yield put({type: 'getCardsAndWithdrawDetail'});
        yield put({type: 'getUserTotalRecoverBalance'});
        yield put({type: 'getAlipayAndBankSettings'});
        yield put({
          type: 'formModel/initializeState',
          payload: [
            'bankName',
            'bankCode',
            'bankAddress',
            'bankCardNo',
            'securityPassword',
            'repeatSecurityPassword',
            'remarks',
          ],
        });
      }
    },
    *postBindNewVc({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {
        formModel: {bankAccountName, vcSecurityPassword, vcNewCardNo},
        userModel: {accessToken},
        appModel,
      } = yield select(state => state);
      const {selectedVc} = payload;
      const encodedPassword = encodePassword(vcSecurityPassword.value);
      const body = {
        securityPassword: encodedPassword,
        bankAccountName: bankAccountName.value,
        bankAddress: '虚拟币',
        bankCardNo: vcNewCardNo.value,
        bankCode: selectedVc.code,
        bankName: selectedVc.name,
      };
      const response = yield call(request.to, {
        url: API.updateCardInfo,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });

      const {err} = response;
      if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'secureAuthentication',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
          yield put({
            type: 'formModel/initializeState',
            payload: [
              'vcNewCardNo',
              'vcSecurityPassword',
              'repeatVcSecurityPassword',
            ],
          });
        }
      } else {
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '添加成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({type: 'getCurrentUser'});
        yield put({type: 'getCardsAndWithdrawDetail'});
        yield put({type: 'getUserTotalRecoverBalance'});
        yield put({type: 'getAlipayAndBankSettings'});
        yield put({
          type: 'formModel/initializeState',
          payload: [
            'bankName',
            'bankCode',
            'bankAddress',
            'bankCardNo',
            'securityPassword',
            'repeatSecurityPassword',
            'remarks',
            'vcNewCardNo',
            'vcSecurityPassword',
            'repeatVcSecurityPassword',
          ],
        });
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *postRegistration({payload}, {put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {routing} = yield select(state => state);
      const {
        location: {pathname},
      } = routing;
      const {successData} = payload;

      if (successData) {
        yield put(routerRedux.replace(pathname));
        yield put({type: 'authenticate', ...successData});
        message.success('恭喜您已注册成功！', 1);
      }
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: false},
      });
    },
    *postPasswordInfo(payloadObj, {call, put, select}) {
      const {userModel, formModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {newPassword, securityMode} = formModel;
      const passwordTarget = camelCase(securityMode);
      const password = formModel[passwordTarget].value;
      const encodedPassword = encodePassword(password);
      const encodedNewPassword = encodePassword(newPassword.value);
      const body = {
        mode: securityMode,
        newPassword: encodedNewPassword,
        password: encodedPassword,
      };
      const response = yield call(request.to, {
        url: API.changePwd,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });

      const {err} = response;
      if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
      } else {
        yield put({
          type: 'formModel/initializeState',
          payload: [passwordTarget, 'newPassword', 'repeatNewPassword'],
        });
        if (securityMode === TYPE.SECURITY_PASSWORD) {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: '提款密码更换成功',
                icon: 'checkbox-marked-circle-outline',
                color: 'green',
              },
            },
          });
        } else {
          sessionStorage.removeItem('prizeGroup');
          sessionStorage.removeItem(TYPE.popupDidUnmount);
          yield put({type: 'unauthenticate'});
          yield put({
            type: 'layoutModel/updateState',
            payload: {shouldShowAuthModel: true},
          });
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                msg: '您的密码已经修改成功，请重新登录。',
                icon: 'checkbox-marked-circle-outline',
                color: 'green',
              },
            },
          });
          message.success('您的密码已经修改成功，请重新登录。', 1);
        }
      }
    },
  },
};
