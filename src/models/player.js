import _ from 'lodash';
import {Modal} from 'antd';
import qs from 'query-string';
import {delay} from 'dva/saga';

import {API, type as TYPE} from 'utils';
import {apiRequest as request} from 'services';
import {PLATFORM_TYPE} from 'utils/type.config';
import {version} from 'config';

const PLATFORM_DEFAULT_PROP = {balance: -1, isLoading: false};
const {
  gamePlatformList: gamePlatformListType,
  gamePlatformType: {BET},
  PLATFORM_API_PROP,
} = TYPE;
const INITIAL_STATE = {
  balanceIsLoading: false,
  balanceTransferIsLoading: false,
  balanceTransferAllIsLoading: false,
  balanceTransferAllToMainWalletIsLoading: false,
  currentSelectedGamePlatform: '',
  gamePlatformList: {[BET]: gamePlatformListType[BET]}, // 排除已禁闭平台
  acquireLock: false,
  extURL: '',
  platformCode: '',
  responseMsg: {title: '', msg: ''},
};
const NORMAL = 'Normal';
const OFF = 'OFF';

export default {
  namespace: 'playerModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
    removeState(state, {payload}) {
      const newState = _.omit(state, payload);
      return {
        ...newState,
      };
    },
    initializeState(state, {payload}) {
      const initialStates = _.pick(INITIAL_STATE, payload);
      return {
        ...state,
        ...initialStates,
      };
    },
    gamePlatformIsLoading(state, {payload}) {
      const {gamePlatformList} = state;
      const {gamePlatform, status} = payload;
      const newGamePlatformList = _.cloneDeep(gamePlatformList);

      newGamePlatformList[gamePlatform].isLoading = status;

      return {
        ...state,
        balanceIsLoading: status,
        gamePlatformList: newGamePlatformList,
      };
    },
    resetBalance(state, {payload}) {
      let updated = false;
      const gamePlatformList = {};

      Object.entries(state.gamePlatformList).forEach(
        ([platform, {balance, ...prop}]) => {
          if (balance >= 0) {
            updated = true;
            gamePlatformList[platform] = {
              ...prop,
              balance: PLATFORM_DEFAULT_PROP.balance,
            };
          } else gamePlatformList[platform] = {balance, ...prop};
        },
      );

      if (updated)
        return {
          ...state,
          gamePlatformList,
        };

      return state;
    },
  },
  effects: {
    *startExternalUrl({payload}, {put, call, select}) {
      const {locationSearch, platformCode} = payload;
      const {appModel, userModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {startUrl} = qs.parse(locationSearch);
      const queries = {
        token: accessToken,
        platformCode,
        clientId: appModel.adminBrand.adminId,
      };
      const {data} = yield call(request.to, {
        url: `${decodeURIComponent(startUrl)}?${qs.stringify(queries)}`,
      });
      if (data) {
        yield put({
          type: 'updateState',
          payload: {extURL: data.url},
        });
      }
    },

    *balanceTransfer(payloadObj, {put, call, select}) {
      const {
        amount,
        gamePlatform,
        loadingProp,
        successProp,
        transferType,
      } = payloadObj;
      yield put({
        type: 'updateState',
        payload: {
          [loadingProp]: true,
          balanceTransferAllToMainWalletIsLoading: true,
        },
      });
      const {userModel, appModel} = yield select(state => state);
      const {err} = yield call(request.to, {
        url: API.playerBalanceTransfer,
        method: 'post',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
        body: {
          gamePlatform,
          transferType,
          amount,
        },
      });

      if (!err) {
        yield put({
          type: 'updateState',
          payload: {
            responseMsg: {
              title: '转账成功！',
              ...successProp,
              transferType,
              gamePlatform,
            },
          },
        });

        yield put({
          type: 'userModel/getUserTotalBalance',
        });
        yield put({
          type: 'getBalanceOfGamePlatform',
          payload: {
            gamePlatform,
            showErrMsg: true,
          },
        });
        yield put({
          type: 'formModel/initializeState',
          payload: ['transferAmount'],
        });
      } else {
        let msg = '资金转移失败；';
        if (err.message) msg += err.message;
        yield put({
          type: 'updateState',
          payload: {
            balanceTransferAllToMainWalletIsLoading: false,
          },
        });
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/secureAuthentication',
            payload: {msg},
          });
        } else {
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
        }
      }

      yield put({
        type: 'removeState',
        payload: [loadingProp],
      });
    },

    *manualBalanceTransfer({runAfterPost}, {put, call, select}) {
      const {formModel, playerModel} = yield select(state => state);
      const {transferAmount, transferSelectFrom, transferSelectTo} = formModel;
      const {gamePlatformList} = playerModel;
      const defaultWallet = {gameNameInChinese: '中心钱包'};
      const platformName = {
        FROM: gamePlatformList[transferSelectFrom] || defaultWallet,
        TO: gamePlatformList[transferSelectTo] || defaultWallet,
      };
      const modelProps = {
        content: `您的资金已成功从${platformName.FROM.gameNameInChinese}转入${
          platformName.TO.gameNameInChinese
        }`,
      };

      if (runAfterPost) modelProps.onOk = runAfterPost;

      yield put({
        type: 'balanceTransfer',
        loadingProp: 'balanceTransferIsLoading',
        successProp: modelProps,
        gamePlatform:
          transferSelectFrom === 'CENTER'
            ? transferSelectTo
            : transferSelectFrom,
        amount: transferAmount.value,
        transferType: transferSelectFrom === 'CENTER' ? 'TopUp' : 'Withdraw',
      });
    },
    *balanceTransferOneToCenter(
      {gamePlatform, runAfterPost},
      {put, call, select},
    ) {
      const {playerModel} = yield select(state => state);
      const game = playerModel.gamePlatformList[gamePlatform];
      let {balance} = game;

      if (balance < 0) {
        yield put.resolve({
          type: 'getBalanceOfGamePlatform',
          payload: {
            gamePlatform,
            showErrMsg: true,
          },
        });

        const {playerModel: updated} = yield select(state => state);
        const {gamePlatformList} = updated;
        const {balance: gamePlatformBalance} = gamePlatformList[gamePlatform];
        balance = gamePlatformBalance;
      }
      if (balance > 0) {
        const modelProps = {
          content: `您${game.gameNameInChinese}的资金已成功转入中心钱包`,
        };

        if (runAfterPost) modelProps.onOk = runAfterPost;

        yield put({
          type: 'balanceTransfer',
          loadingProp: 'balanceTransferAllIsLoading',
          successProp: modelProps,
          gamePlatform,
          amount: balance,
          transferType: 'Withdraw',
        });
      }
    },
    *transferAllBacktoMainWallet(payload, {put, select, call}) {
      const {
        loadingProp,
        data: {message},
      } = payload;
      yield put({
        type: 'userModel/getUserTotalBalance',
      });
      yield put({
        type: 'formModel/initializeState',
        payload: ['transferAmount'],
      });
      yield put({
        type: 'getAllBalance',
      });
      yield put({
        type: 'updateState',
        payload: {
          [loadingProp]: false,
        },
      });
      const modelProps = {
        content: `${message} ( 未成功回收的平台请手动转账 )`,
      };
      Modal.success({title: '处理成功！', okText: '确定', ...modelProps});
    },
    *balanceTransferAllToCenter({payload}, {put, select, call}) {
      const {userModel, appModel} = yield select(state => state);
      yield put({
        type: 'updateState',
        payload: {
          balanceTransferAllToMainWalletIsLoading: true,
        },
      });
      const response = yield call(request.to, {
        url: API.collectDsfBalanceAndTransToCentral,
        method: 'post',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (response && response.data) {
        yield put({
          type: 'transferAllBacktoMainWallet',
          loadingProp: 'balanceTransferAllToMainWalletIsLoading',
          data: response.data,
        });
      } else {
        yield put({
          type: 'formModel/postErrorMessage',
          payload: response.msg,
        });
      }
    },
    *getAllBalance({payload}, {put, select, call}) {
      const {userModel, appModel, playerModel} = yield select(state => state);
      const {gamePlatformList} = playerModel;
      const response = yield call(request.to, {
        url: API.getAllBalance,
        method: 'get',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (response && response.data) {
        const {platformBalances} = response.data;
        const newGamePlatformList = _.cloneDeep(gamePlatformList);
        platformBalances.forEach(item => {
          if (
            newGamePlatformList &&
            newGamePlatformList[item.gamePlatform] &&
            newGamePlatformList[item.gamePlatform].balance > -1
          ) {
            newGamePlatformList[item.gamePlatform].balance = item.balance;
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            gamePlatformList: newGamePlatformList,
          },
        });
      }
    },
    *balanceTransferAll({gamePlatform}, {put, select, call}) {
      const {playerModel, userModel} = yield select(state => state);

      yield put({
        type: 'balanceTransfer',
        loadingProp: 'balanceTransferAllIsLoading',
        successProp: {
          content: `您中心钱包的资金已成功转入${
            playerModel.gamePlatformList[gamePlatform].gameNameInChinese
          }`,
        },
        gamePlatform,
        amount: userModel.balance,
        transferType: 'TopUp',
      });
    },
    *getBalanceOfGamePlatform({payload}, {call, put, select}) {
      const {userModel, playerModel, appModel} = yield select(state => state);
      const {gamePlatformList} = playerModel;

      if (payload.enableLoading) {
        yield put({
          type: 'gamePlatformIsLoading',
          payload: {
            gamePlatform: payload.gamePlatform,
            status: true,
          },
        });
      }
      const response = yield call(request.to, {
        url: API.playerGetBalance,
        method: 'get',
        headers: {
          authorization: `bearer ${userModel.accessToken}`,
          gamePlatform: payload.gamePlatform,
          device_token: appModel.deviceToken,
        },
      });

      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            balanceTransferAllToMainWalletIsLoading: false,
          },
        });
      }

      if (response.data) {
        const {gamePlatform, balance} = response.data;
        const newGamePlatformList = _.cloneDeep(gamePlatformList);

        if (newGamePlatformList && newGamePlatformList[gamePlatform]) {
          newGamePlatformList[gamePlatform].balance = balance;
        } else {
          newGamePlatformList[gamePlatform] = {};
        }

        yield put({
          type: 'updateState',
          payload: {
            gamePlatformList: newGamePlatformList,
          },
        });
      } else if (response.err && payload.showErrMsg) {
        let errMsg = `刷新${
          gamePlatformList[payload.gamePlatform].gameNameInChinese
        }金额出了问题，请稍后再试`;

        if (response.err.message.includes('(AG1001)')) {
          errMsg = response.err.message.slice(0, -8); // remove error code
        }

        yield put({
          type: 'formModel/postErrorMessage',
          payload: {
            msg: errMsg,
          },
        });
      }
      if (payload.enableLoading) {
        yield put({
          type: 'gamePlatformIsLoading',
          payload: {
            gamePlatform: payload.gamePlatform,
            status: false,
          },
        });
      }
    },
    *getGamePlatforms({runAfter}, {put, call}) {
      if (version === 'Dsf') {
        yield put.resolve({
          type: 'getAdminGamePlatforms',
        });
        yield put({
          type: 'getCMSGamePlatforms',
          runAfter,
        });
      }
    },
    *resetBalance({payload}, {call, put, select}) {
      const {playerModel} = yield select(state => state);
      const {gamePlatformList} = playerModel;

      const newGamePlatformList = _.cloneDeep(gamePlatformList);
      _.map(Object.keys(newGamePlatformList), key => {
        newGamePlatformList[key].balance = -1;
      });

      yield put.resolve({
        type: 'updateState',
        payload: {
          gamePlatformList: newGamePlatformList,
        },
      });
    },
    getAdminGamePlatforms: [
      function* getAdminGamePlatforms({payload}, {put, call, select}) {
        yield call(delay, 250);
        const {appModel, playerModel} = yield select(state => state);
        const {
          adminBrand: {adminId},
          deviceToken,
        } = appModel;
        const {
          [BET]: bet,
          ...oldGamePlatformList
        } = playerModel.gamePlatformList;
        const prevGamePlatformList = _.cloneDeep(oldGamePlatformList);
        const platform = {
          [BET]: bet || gamePlatformListType[BET],
        };
        const {data} = yield call(request.to, {
          url: `${API.playerOpenPlatform}/?clientId=${adminId}`,
          method: 'get',
          headers: {
            device_token: deviceToken,
          },
        });

        if (data) {
          Object.entries(data).forEach(([id, status]) => {
            if (status) {
              const {
                [id]: prop = {
                  ...gamePlatformListType[id],
                  ...PLATFORM_DEFAULT_PROP,
                },
              } = prevGamePlatformList;

              platform[id] = {...prop, rootEnabled: status === NORMAL};
            }

            delete prevGamePlatformList[id];
          });
        }

        yield put({
          type: 'updateState',
          payload: {
            gamePlatformList: {
              ...platform,
              ...prevGamePlatformList,
            },
          },
        });
      },
      {type: 'takeLatest'},
    ],
    getCMSGamePlatforms: [
      function* getCMSGamePlatforms({runAfter}, {put, call, select}) {
        // 尝试模拟 debounce 效果, 以限制面内组件调这个 dispatch 导致发重复而不必要的接口请求, debounce 0.25 秒
        if (!runAfter) yield call(delay, 250);
        const {playerModel, appModel} = yield select(state => state);

        const {data: chineseNames} = yield call(request.to, {
          url: `${API.getDsfGamesChineseName}?brand=${
            appModel.adminBrand.brand
          }`,
          method: 'get',
        });

        if (!chineseNames) {
          return;
        }

        const {data, err} = yield call(request.to, {
          url: `${API.getAllDsfGamesAndCategories}?brand=${
            appModel.adminBrand.brand
          }&starterCategory=Pc`,
          method: 'get',
        });

        if (data) {
          const {
            [BET]: bet,
            ...oldGamePlatformList
          } = playerModel.gamePlatformList;
          const transferList = _.cloneDeep(oldGamePlatformList);

          if (
            Object.entries(transferList).some(
              ([platform, vendor]) => vendor.platforms,
            )
          ) {
            return;
          }

          const oldPlaformsRemoval = new Set(Object.keys(oldGamePlatformList));
          const newGamePlatformList = {
            [BET]: bet || gamePlatformListType[BET],
          };

          Object.entries(data).forEach(([category, platforms]) => {
            if (platforms) {
              platforms
                .sort((a, b) => a.platformOrder - b.platformOrder)
                .forEach(platform => {
                  const gamePlatform =
                    transferList[platform.gamePlatform] || {};
                  const status =
                    gamePlatform.rootEnabled === false ? OFF : platform.status;

                  // 删除将更新的游戏, 仅存已不显示的平台以供禁闭
                  oldPlaformsRemoval.delete(platform.gamePlatform);

                  // newGamePlatformList[
                  //   `${platform.gamePlatform}_${PLATFORM_API_PROP[category]}`
                  // ] = {
                  //   ...PLATFORM_DEFAULT_PROP,
                  //   platform: PLATFORM_API_PROP[category],
                  //   ...gamePlatform,
                  //   ...platform,
                  //   status,
                  // };

                  // const gamePlatformBalance = gamePlatform.balance;
                  // const gamePlatformIsLoading = gamePlatform.isLoading;
                  // delete gamePlatform.balance;
                  // delete gamePlatform.isLoading;

                  if (newGamePlatformList[platform.gamePlatform]) {
                    newGamePlatformList[platform.gamePlatform].platforms.push({
                      platform: PLATFORM_API_PROP[category],
                      ...platform,
                      gamePlatformType: 1,
                      status,
                    });
                  } else {
                    const dsfPlatform = chineseNames.find(
                      x => x.gamePlatform === platform.gamePlatform,
                    );
                    const gameNameInChinese =
                      dsfPlatform && dsfPlatform.platformName;

                    if (
                      dsfPlatform &&
                      dsfPlatform.listOfSupportedPlatformType
                    ) {
                      const {listOfSupportedPlatformType} = dsfPlatform;

                      newGamePlatformList[platform.gamePlatform] = {
                        ...PLATFORM_DEFAULT_PROP,
                        ...gamePlatform,
                        ...platform,
                        gameNameInChinese,
                        listOfSupportedPlatformType,
                        gamePlatformType: 1,
                        platforms: [
                          {
                            platform: PLATFORM_API_PROP[category],
                            ...platform,
                            gamePlatformType: 1,
                            status,
                          },
                        ],
                      };
                    }
                  }
                });
            }
          });

          // console.log('newGamePlatformList', _.cloneDeep(newGamePlatformList));

          // deprecate hidden platform
          Array.from(oldPlaformsRemoval).forEach(gamePlatform => {
            const prevInfo = transferList[gamePlatform];

            if (prevInfo)
              newGamePlatformList[gamePlatform] = {
                ...prevInfo,
                gamePlatformType: PLATFORM_TYPE.HIDE,
                status: OFF,
              };
          });

          yield put({
            type: 'updateState',
            payload: {
              gamePlatformList: newGamePlatformList,
            },
          });
          yield put({
            type: 'gameInfosModel/updateState',
            payload: data,
          });
        }

        if (typeof runAfter === 'function') yield runAfter();
      },
      {type: 'takeLatest'},
    ],
  },
};
