import {pick, head, size, has} from 'lodash';
import {apiRequest as request} from 'services';
import {API, encodePassword, type as TYPE} from 'utils';

const {transferTopupTypeRefs} = TYPE;
const INITIAL_STATE = {
  adminBankId: '',
  amount: '',
  awaitingResponse: false,
  bankList: [],
  banksOptions: [],
  foundMatchBank: false,
  selectableBankOptions: [],
  bankTopupResponse: '',
  bankTypeList: [],
  data: '',
  dataImg: '',
  dataImgUrl: '',
  loadingBank: false,
  maximumTopupAmount: 0,
  merchantName: '',
  methodInfo: '',
  methodName: '',
  minimumTopupAmount: 0,
  topupAgentAnnouncement: null,
  topupAgentList: [],
  paymentBankList: [],
  paymentId: '',
  paymentJumpTypeEnum: '',
  paymentList: [],
  paymentMethod: '',
  paymentPlatformCode: '',
  paymentType: '',
  receiptName: '',
  remainQuota: null,
  selectedTopupGroup: '',
  topupAmount: '',
  topupCode: '',
  topupGroups: '',
  topupRemarks: '',
  topupType: 'ZHB',
  isBankTransfer: false,
  transactionId: '',
  transactionNo: '',
  transactionTimeuuid: '',
  transferNo: '',
  userBankId: '',
  userPrompt: '',
  webview: false,
};

export default {
  namespace: 'transferModel',
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
    updateOddTransferInfo(state, {payload}) {
      const {
        isOdd,
        adminBankId,
        bankCode,
        realNameReq,
        receiptName,
        bankCardNo,
        remarks,
        paymentKey,
      } = payload;
      const updates = {
        isOdd,
        paymentId: adminBankId,
        paymentKey,
        realNameReq,
        receiptName,
        dataImgUrl: bankCardNo,
        merchantName: receiptName,
        paymentType: 'SCAN',
        topupType: bankCode,
        topupRemarks: remarks,
      };

      return {...state, ...updates};
    },
  },
  effects: {
    *getTopupGroups(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: `${API.topupGroups}?version=7&access_token=${accessToken}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        yield put({type: 'updateState', payload: {topupGroups: data}});
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error('无法获取充值列表', err.message);
        }
      }
    },
    *getBankOptions(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.userBankOptions,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        const selectableBankOptions = data.filter(({code}) => !code);
        yield put({
          type: 'updateState',
          payload: {banksOptions: data, selectableBankOptions},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error('无法银行卡列表', err.message);
        }
      }
    },
    *getTopupAgentAnnouncement(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.topupAgentAnnouncement,
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
          payload: {topupAgentAnnouncement: data},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error('无法获取充值信息', err.message);
        }
      }
    },
    *getTopupAgentList(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.topupAgentList,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        yield put({type: 'updateState', payload: {topupAgentList: data}});
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error('无法获取充值信息', err.message);
        }
      }
    },
    *getPaymentList(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: API.paymentList,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
          pos: 'PC',
        },
      });
      const {data, err} = response;
      if (data) {
        yield put({type: 'updateState', payload: {paymentList: data}});
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error('无法获取充值信息', err.message);
        }
      }
    },
    *getPaymentBankList({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const shouldGetPaymentBankList = payload.topupType === 'THIRD_PARTY';
      if (!shouldGetPaymentBankList) yield put({type: 'updateState', payload});
      else {
        const {platform} = payload;
        const response = yield call(request.to, {
          url: `${
            API.paymentBankList
          }?paymentSetId=${platform}&access_token=${accessToken}`,
          method: 'get',
          headers: {
            authorization: `bearer ${accessToken}`,
            device_token: appModel.deviceToken,
          },
        });
        const {data, err} = response;
        if (data) {
          let bankTypeList = [];
          let paymentBank = '';
          const paymentBankList = data;
          const formPayload = {};
          if (size(paymentBankList)) {
            paymentBank = head(paymentBankList);
            formPayload.bankValue = {value: paymentBank.bankValue};
          }
          if (paymentBank && size(paymentBank.bankType)) {
            bankTypeList = paymentBank.bankType;
            formPayload.cardType = {value: head(bankTypeList)};
          }
          yield put({
            type: 'updateState',
            payload: {
              ...payload,
              paymentBankList,
              bankTypeList,
            },
          });
          if (size(formPayload)) {
            yield put({
              type: 'formModel/updateState',
              payload: formPayload,
            });
          }
        } else if (err) {
          if (err.statusCode === '401') {
            yield put({
              type: 'userModel/unauthenticate',
              payload: {msg: err.message},
            });
          } else {
            throw new Error(err.message);
          }
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *getBankList(payloadObj, {call, put, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: `${API.bankList}?id=${adminId}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        yield put({type: 'updateState', payload: {bankList: data}});
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error('无法获取提款信息', err.message);
        }
      }
    },
    *getOddTransferInfo({payload}, {call, put, select}) {
      const {oddObject} = payload;
      const {
        adminBankId,
        isOdd,
        realNameReq,
        receiptName,
        bankCode,
      } = oddObject;
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
          isOdd,
          paymentId: adminBankId,
          paymentKey: bankCode,
          realNameReq,
          receiptName,
        },
      });
      const {appModel, userModel} = yield select(state => state);
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const {accessToken} = userModel;
      const response = yield call(request.to, {
        url: `${
          API.oddTransferInfo
        }/${adminBankId}?id=${adminId}&access_token=${accessToken}`,
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            isOdd,
            paymentId: data.adminBankId,
            dataImgUrl: data.bankCardNo,
            merchantName: data.receiptName,
            paymentType: 'SCAN',
            topupType: data.bankCode,
            topupRemarks: data.remarks,
          },
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/secureAuthentication',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                color: 'red',
                icon: 'close-circle-outline',
                msg: err.message,
              },
            },
          });
          if (err.message.indexOf('停用')) {
            yield put({type: 'getBankList'});
          }
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *putOddTransferQuery(_, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, transferModel, formModel, appModel} = yield select(
        state => state,
      );
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const {accessToken, userData} = userModel;
      const {username} = userData;
      const {paymentId, paymentKey, topupType, dataImgUrl} = transferModel;
      const {topupAmount, topupCardRealname} = formModel;
      const transferToupType = transferTopupTypeRefs[topupType] || paymentKey;
      const body = {
        adminBankId: paymentId,
        id: adminId,
        topupAmount: topupAmount.value,
        depositorName: topupCardRealname.value || username,
        transferToupType,
      };
      const response = yield call(request.to, {
        url: API.bankTransfers,
        method: 'put',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
        },
        body,
      });
      const {err, data} = response;
      if (data) {
        const {amount, transactionNo} = data;
        yield put({
          type: 'updateState',
          payload: {dataImg: dataImgUrl, amount, transferNo: transactionNo},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                color: 'red',
                icon: 'close-circle-outline',
                msg: err.message,
              },
            },
          });
          if (err.message.indexOf('停用')) {
            yield put({type: 'getBankList'});
          }
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *putBankTransferConfirmation(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, formModel, transferModel, appModel} = yield select(
        state => state,
      );
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const {realName, accessToken} = userModel;
      const {adminBankId} = transferModel;
      const {topupAmount, topupCardRealname} = formModel;
      const body = {
        adminBankId,
        id: adminId,
        topupAmount: topupAmount.value,
        depositorName: topupCardRealname.value || realName,
        transferTopupType: transferTopupTypeRefs.BANK_TRANSFER,
      };
      const response = yield call(request.to, {
        url: API.bankTransfers,
        method: 'put',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
        },
        body,
      });
      const {err, data} = response;
      if (data) {
        yield put({type: 'updateState', payload: {bankTopupResponse: data}});
        yield put({
          type: 'formModel/initialzeState',
          payload: ['topupAmount', 'topupCardRealname'],
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                color: 'red',
                icon: 'close-circle-outline',
                msg: err.message,
              },
            },
          });
          if (err.message.indexOf('停用')) {
            yield put({type: 'getBankList'});
          }
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *postTopups(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, formModel, transferModel, appModel} = yield select(
        state => state,
      );
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const {realName, accessToken} = userModel;
      const {paymentId, paymentType} = transferModel;
      const {
        topupAmount,
        bankValue,
        cardType,
        cardNoReq,
        mobileNoReq,
        realNameReq,
        cardNo,
        mobileNo,
        realName: formRealName,
      } = formModel;
      let {bankCode} = transferModel || '';
      if (has(bankValue, 'value')) bankCode = bankValue.value;
      const body = {
        id: adminId,
        bankCode,
        depositor: realName,
        paymentId,
        paymentType,
        topupAmount: topupAmount.value,
      };
      if (cardNoReq) body.cardNo = cardNo.value;
      if (mobileNoReq) body.mobileNo = mobileNo.value;
      if (realNameReq) body.realName = formRealName.value;
      if (cardType) body.cardType = cardType.value;
      const response = yield call(request.to, {
        url: API.topups,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
          pos: 'PC',
        },
        body,
      });
      const {data, err} = response;
      if (data) {
        yield put({type: 'updateState', payload: data});
        const {webview, paymentJumpTypeEnum, transactionId} = data;
        if (has(data, 'data')) {
          if (webview) {
            let wnd = '';
            wnd = window.open('about:blank', '', '_blank');
            if (wnd) {
              if (
                paymentJumpTypeEnum === 'FROM' ||
                paymentJumpTypeEnum === 'HTML'
              ) {
                wnd.document.write(`<html><body>${data.data}</body></html>`);
              } else {
                wnd.close();
                wnd = window.open(data.data, transactionId, '_blank');
              }
              yield put({
                type: 'formModel/updateState',
                payload: {
                  responseMsg: {
                    color: 'green',
                    icon: 'checkbox-marked-circle-outline',
                    msg: '请在跳转页面完成转账工序',
                  },
                },
              });
              yield put({type: 'initializeState', payload: ['merchantName']});
              yield put({
                type: 'formModel/initializeState',
                payload: ['topupAmount', 'realName', 'cardNo', 'mobileNo'],
              });
            } else {
              yield put({
                type: 'initializeState',
                payload: ['data', 'transferNo'],
              });
              yield put({
                type: 'formModel/updateState',
                payload: {
                  responseMsg: {
                    color: 'red',
                    icon: 'window-restore',
                    msg:
                      '浏览器无法打开跳转页面，请先解除浏览器对弹出信息的拦阻再继续下一步',
                  },
                },
              });
            }
          }
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                color: 'red',
                icon: 'close-circle-outline',
                msg: '此支付对象暂时无法使用，请选择别的支付对象',
              },
            },
          });
        }
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                color: err ? 'red' : 'green',
                icon: err
                  ? 'close-circle-outline'
                  : 'checkbox-marked-circle-outline',
                msg: err.message,
              },
            },
          });
          if (
            err.message.indexOf('您不在该支付层级') >= 0 ||
            err.message.indexOf('停用') >= 0
          ) {
            yield put({type: 'getPaymentList'});
          }
        }
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *postWithdrawalRequest({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, transferModel, formModel, appModel} = yield select(
        state => state,
      );
      const {accessToken} = userModel;
      const {userBankId} = transferModel;
      const {withdrawalAmount, charge, securityPassword} = formModel;
      const encodedPassword = encodePassword(securityPassword.value);
      const {withdrawalMethod, vcWithdrawalAmount, vcFee} = payload;
      const body = {
        amount:
          withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
            ? vcWithdrawalAmount
            : withdrawalAmount.value,
        charge:
          withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
            ? vcFee
            : charge.value,
        version: 'V2',
        userBankId,
        withDrawCode: encodedPassword,
      };
      const response = yield call(request.to, {
        url: API.userWithDraw,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });
      const {data, err} = response;
      if (data) {
        const {transactionTimeuuid} = data;
        yield put({type: 'updateState', payload: {transactionTimeuuid}});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              color: 'green',
              icon: 'checkbox-marked-circle-outline',
              msg: `订单 ${transactionTimeuuid} 已经开始进行处理`,
            },
          },
        });
        yield put({type: 'userModel/getCardsAndWithdrawDetail'});
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          yield put({
            type: 'formModel/updateState',
            payload: {
              responseMsg: {
                color: 'red',
                icon: 'close-circle-outline',
                msg: `提款申请失败, ${err.message}`,
              },
            },
          });
        }
      }
      yield put.resolve({
        type: 'formModel/initializeState',
        payload: ['withdrawalAmount', 'securityPassword', 'charge'],
      });
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
    *identifyBank(payloadObj, {call, put, select}) {
      yield put({
        type: 'updateState',
        payload: {
          foundMatchBank: false,
          loadingBank: true,
        },
      });
      yield put({
        type: 'formModel/toggleFormValue',
        payload: {bankName: '', bankCode: ''},
      });
      const {formModel, transferModel} = yield select(state => state);
      let foundMatchBank = false;
      const {
        bankCardNo: {value},
      } = formModel;
      const {data = {}, err} = yield call(request.to, {
        url: `${API.bankCardIdentification}?cardNo=${value}&cardBinCheck=true`,
        method: 'get',
      });

      if (data.validated && data.stat === 'ok') {
        const {banksOptions} = transferModel;
        const {bankName, bankCode} =
          banksOptions.find(options => options.code === data.bank) || {};

        if (bankName && bankCode) {
          foundMatchBank = true;
          yield put({
            type: 'formModel/toggleFormValue',
            payload: {
              bankName,
              bankCode,
            },
          });
        }
      } else if (err) {
        yield put({
          type: 'formModel/postErrorMessage',
          payload: {
            msg: err.message,
          },
        });
      }

      yield put({
        type: 'updateState',
        payload: {foundMatchBank, loadingBank: false},
      });
    },
  },
  subscriptions: {},
};
