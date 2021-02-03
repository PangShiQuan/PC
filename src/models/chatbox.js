import {API, getChatDomain, rounding} from 'utils';
import _ from 'lodash';
import queryString from 'query-string';
import {apiRequest as request} from 'services';
import PhotoHelper from 'helper/PhotoHelper.min';
import {delay} from 'dva/saga';

const receiptPrinter = new PhotoHelper();

const INITIAL_STATE = {
  chatLoading: false,
  enable: false,
  showChatbox: false,
  expandChatbox: false,
  chatToken: null,
  expiryDate: null,
  canShare: false,
  roomList: null,
  errMsg: null,
  responseMsg: null,
  allRooms: null,
  prevSelectedRoom: null,
  selectedRoom: null,
  userPrinciple: null,
  followOrderData: null,
  followOrderAlert: null,
  followOrderGameDetails: null,
  showFullScreenImage: null,
  chatHistory: null,
  disabledFollowBet: false, // 3 seconds cool down time
};

const setUpGetChatStatus = (adminId, brand) => {
  const params = {
    brand,
    adminId,
  };
  const requestObj = {
    method: 'get',
    url: `${window.location.origin}/${
      API.chatGetIsEnabled
    }?${queryString.stringify(params)}`,
  };
  return requestObj;
};

const setUpGetAllRooms = chatToken => {
  const requestObj = {
    method: 'get',
    headers: {
      ['X-Authorization-Chat']: `${chatToken}`,
    },
    url: API.chatGetAllRooms,
  };
  return requestObj;
};

const setUpUserShareDetailsRequest = accessToken => {
  const requestObj = {
    method: 'get',
    headers: {
      authorization: `bearer ${accessToken}`,
    },
    url: API.chatGetUserShareDetails,
  };
  return requestObj;
};

const setUpUserRequest = accessToken => {
  const requestObj = {
    method: 'get',
    headers: {
      authorization: `bearer ${accessToken}`,
    },
    url: API.chatGetUserChatToken,
  };
  return requestObj;
};

const setUpVisitorRequest = (adminId, brand) => {
  const params = {
    brand,
    clientId: adminId,
  };
  const requestObj = {
    method: 'get',
    url: `${API.chatGetVisitorChatToken}?${queryString.stringify(params)}`,
  };
  return requestObj;
};

const setUpShareBetToChat = (accessToken, orderId, roomId, chatToken) => {
  const body = {
    orderId,
    roomId: roomId.toString(),
    chatToken,
  };
  const requestObj = {
    method: 'post',
    headers: {
      authorization: `bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body,
    url: API.shareBetToChat,
  };
  return requestObj;
};

const setUpSendMessage = (domain, roomId, chatToken, message, imageFile) => {
  const properties = imageFile
    ? {
        files: [
          {
            name: imageFile.name,
            url: imageFile.imageURL,
          },
        ],
      }
    : null;

  const body = {
    content: message,
    kind: 'message',
    renderer: 'text',
    properties,
    to: {
      id: roomId.toString(),
      kind: 'room',
    },
  };
  const requestObj = {
    method: 'post',
    headers: {
      authorization: `bearer ${chatToken}`,
      'Content-Type': 'application/json',
    },
    body,
    url: `https://${domain}/${API.chatSendMessage}`,
  };
  return requestObj;
};

const setUpFollowOrder = (orderId, chatToken, betUserId, accessToken) => {
  const params = {
    orderId,
    access_token: accessToken,
    userId: betUserId,
  };
  const requestObj = {
    method: 'get',
    url: `${window.location.origin}/${
      API.chatFollowOrder
    }?${queryString.stringify(params)}`,
  };
  return requestObj;
};

const setUpGetBetGameDetails = (brand, deviceToken, gameId) => {
  const params = {
    brand,
  };
  const requestObj = {
    method: 'get',
    headers: {
      device_token: deviceToken,
    },
    url: `${API.getCurrentTwo}/${gameId}?${queryString.stringify(params)}`,
  };
  return requestObj;
};

const setUpOrder = (userModel, appModel, orderObj) => {
  const {accessToken, sessionId} = userModel;
  const {deviceToken} = appModel;
  const {
    betEntries,
    drawIdentifier,
    numberOfUnits,
    purchaseInfo,
    userSubmitTimestampMillis,
  } = orderObj.data;

  const isBetPlan = purchaseInfo.purchaseType !== 'METHOD_UNDEFINED';
  const newBetEntries = _.cloneDeep(betEntries);
  const newPurchaseInfo = _.cloneDeep(purchaseInfo);
  let betAmount = 0;

  if (isBetPlan) {
    betAmount = rounding.round(
      orderObj.pricePerUnit * orderObj.multiplier * betEntries[0].numberOfUnits,
    );
    newBetEntries[0].pricePerUnit = orderObj.pricePerUnit * orderObj.multiplier;
    newBetEntries[0].amount = betAmount;
    newPurchaseInfo.childOrder.eachChildOrders[0].multiplier = 1;
    newPurchaseInfo.childOrder.eachChildOrders[0].issueNum =
      drawIdentifier.issueNum;
  } else {
    betAmount = rounding.round(
      orderObj.pricePerUnit * orderObj.multiplier * betEntries[0].numberOfUnits,
    );
    newBetEntries[0].pricePerUnit = orderObj.pricePerUnit * orderObj.multiplier;
    newBetEntries[0].amount = betAmount;
  }

  const order = {
    betEntries: newBetEntries,
    drawIdentifier,
    numberOfUnits,
    purchaseInfo: newPurchaseInfo,
    source: 'pc',
    totalAmount: betAmount,
    userSubmitTimestampMillis,
  };

  const body = receiptPrinter.cropPhoto(sessionId, JSON.stringify(order));

  const requestObj = {
    method: 'post',
    headers: {
      authorization: `bearer ${accessToken}`,
      device_token: deviceToken,
    },
    body,
    url: API.ordercap,
    shouldStringify: false,
  };
  return requestObj;
};

const setUpGetUserPrinciple = chatToken => {
  const requestObj = {
    method: 'get',
    headers: {
      ['X-Authorization-Chat']: `${chatToken}`,
    },
    url: API.chatGetUserPrinciple,
  };
  return requestObj;
};

const setUpGetChatHistoryMessages = (domain, chatToken) => {
  const params = {
    max: 50,
  };
  const requestObj = {
    method: 'get',
    headers: {
      authorization: `bearer ${chatToken}`,
    },
    url: `https://${domain}/${API.chatHistoryMessages}?${queryString.stringify(
      params,
    )}`,
  };
  return requestObj;
};

export default {
  namespace: 'chatboxModel',
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
    updateToInitialState(state) {
      return {
        ...state,
        ...INITIAL_STATE,
      };
    },
  },
  effects: {
    *triggerShowChatbox(payloadObj, {put, call, select}) {
      const {payload} = payloadObj;

      if (payload.showChatbox) {
        // trigger show chatbox
        yield put({
          type: 'updateState',
          payload: {
            ...payload,
          },
        });
      } else {
        // trigger hide chatbox
        yield put({
          type: 'updateState',
          payload: {
            ...payload,
          },
        });
      }
    },
    *getAllRooms(payloadObj, {put, call, select}) {
      const {chatboxModel} = yield select(state => state);
      const requestObj = setUpGetAllRooms(chatboxModel.chatToken);

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            ...data,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *sendMessage(payloadObj, {put, call, select}) {
      const {chatboxModel, appModel} = yield select(state => state);

      const domain = getChatDomain(appModel);
      const requestObj = setUpSendMessage(
        domain,
        chatboxModel.selectedRoom.roomId,
        chatboxModel.chatToken,
        payloadObj.payload.message,
      );

      const {err} = yield call(request.to, requestObj);

      if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *uploadImageFile(payloadObj, {put, call, select}) {
      const {chatboxModel, appModel} = yield select(state => state);

      const domain = getChatDomain(appModel);
      const requestObj = setUpSendMessage(
        domain,
        chatboxModel.selectedRoom.roomId,
        chatboxModel.chatToken,
        payloadObj.payload.message,
        payloadObj.payload.imageFile,
      );

      const {err} = yield call(request.to, requestObj);

      if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *followOrder(payloadObj, {put, call, select}) {
      const {chatboxModel, userModel} = yield select(state => state);
      const {
        payload: {orderId, userId},
      } = payloadObj;

      yield put({
        type: 'updateState',
        payload: {chatLoading: true},
      });

      const requestObj = setUpFollowOrder(
        orderId,
        chatboxModel.chatToken,
        userId,
        userModel.accessToken,
      );

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            followOrderData: data,
            chatLoading: false,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
            chatLoading: false,
          },
        });
      }
    },
    *getBetGameDetails(payloadObj, {put, call, select}) {
      const {appModel, chatboxModel} = yield select(state => state);
      const {
        adminBrand: {brand},
        deviceToken,
      } = appModel;

      const {
        followOrderData: {
          drawIdentifier: {gameUniqueId},
        },
      } = chatboxModel;

      const requestObj = setUpGetBetGameDetails(
        brand,
        deviceToken,
        gameUniqueId,
      );

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            followOrderGameDetails: data,
            followOrderData: {
              ...chatboxModel.followOrderData,
              drawIdentifier: {
                ...chatboxModel.followOrderData.drawIdentifier,
                issueNum: data.current.uniqueIssueNumber,
              },
            },
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *getChatToken(payloadObj, {put, call, select}) {
      const {appModel, userModel} = yield select(state => state);
      const {
        adminBrand: {adminId, brand},
      } = appModel;

      const requestObj = userModel.accessToken
        ? setUpUserRequest(userModel.accessToken)
        : setUpVisitorRequest(adminId, brand);

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: data.token,
            expiryDate: data.expiryDate,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *getUserShareDetails(payloadObj, {put, call, select}) {
      const {userModel} = yield select(state => state);
      const requestObj = setUpUserShareDetailsRequest(userModel.accessToken);
      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            ...data,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *shareBetToChat(payloadObj, {put, call, select}) {
      const {payload} = payloadObj;
      const {userModel, chatboxModel} = yield select(state => state);

      const requestObj = setUpShareBetToChat(
        userModel.accessToken,
        payload.orderId,
        payload.roomId,
        chatboxModel.chatToken,
      );
      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            sharedToChat: true,
            responseMsg: data,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            errMsg: err.message,
          },
        });
      }
    },
    *getChatStatus(payloadObj, {put, call, select}) {
      const {appModel} = yield select(state => state);
      const {
        adminBrand: {adminId, brand},
      } = appModel;

      const requestObj = setUpGetChatStatus(adminId, brand);

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            ...data,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *submitFollowOrder(payloadObj, {put, call, select}) {
      const {payload} = payloadObj;
      const {chatboxModel, userModel, appModel} = yield select(state => state);

      if (chatboxModel.disabledFollowBet) {
        return yield put({
          type: 'updateState',
          payload: {
            followOrderAlert: {
              status: 'error',
              message: '重复下单，如想再次跟单请在3秒后再跟单',
            },
          },
        });
      }

      const requestObj = setUpOrder(userModel, appModel, payload);

      yield put({
        type: 'updateState',
        payload: {chatLoading: true},
      });

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            chatLoading: false,
            followOrderData: null,
            followOrderAlert: {
              status: 'success',
            },
            disabledFollowBet: true,
          },
        });

        yield call(delay, 3000); // 3 seconds cool down time

        yield put({
          type: 'updateState',
          payload: {
            disabledFollowBet: false,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatLoading: false,
            followOrderData: null,
            followOrderAlert: {
              status: 'error',
              message: err.message,
            },
          },
        });
      }
    },
    *getUserPrinciple(payloadObj, {put, call, select}) {
      const {chatboxModel} = yield select(state => state);
      const {chatToken} = chatboxModel;

      const requestObj = setUpGetUserPrinciple(chatToken);

      const {data, err} = yield call(request.to, requestObj);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            userPrinciple: data,
          },
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {
            chatToken: null,
            errMsg: err.message,
          },
        });
      }
    },
    *getChatHistoryMessages(payloadObj, {put, call, select}) {
      const {chatboxModel, appModel} = yield select(state => state);
      yield put({type: 'updateState', payload: {chatLoading: true}});

      const {
        selectedRoom: {roomId},
        chatToken,
      } = chatboxModel;

      const domain = getChatDomain(appModel);
      const requestObj = setUpGetChatHistoryMessages(domain, chatToken);

      const {data} = yield call(request.to, requestObj, {roomId});

      if (data) {
        yield put({
          type: 'updateState',
          payload: {chatHistory: _.reverse(data.messages)},
        });
      }

      if (
        payloadObj &&
        payloadObj.runAfter &&
        typeof payloadObj.runAfter === 'function'
      ) {
        yield payloadObj.runAfter();
      }

      yield put({type: 'updateState', payload: {chatLoading: false}});
    },
    *chatboxSwitchChange(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          ...INITIAL_STATE,
        },
      });
    },
  },
};
