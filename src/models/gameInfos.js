import {message} from 'antd';
import {
  pick,
  find,
  isNil,
  isEqual,
  reverse,
  isArray,
  merge,
  cloneDeep,
} from 'lodash';
import moment from 'moment';

import {apiRequest as request} from 'services';
import {API, sort, type as TYPE} from 'utils';
import {GET_CS_LIVECHAT_LINK, version} from 'config';

const INITIAL_STATE = {
  allGamesPrizeSettings: {},
  allResults: '',
  announcement: '',
  announcements: '',
  awaitingResponse: false,
  currentResults: '',
  gameInfos: [],
  sb: 'pc',
  generalContents: '',
  menuIcons: '',
  pcOtherInfo: '',
  popupAnnouncements: '',
  prizeGroup: '', // 只用于内部比较上个查阅结果的参数以当数值一致时避免触发重复请求
  promotionBanners: '',
  secondPassed: 1,
  selectedGame: '',
  selectedIssue: '',
  selectedResult: '',
  selectedDayCounts: 0,
  thisGameResults: '',
  winnerList: '',
  otherSettings: {},
};

export default {
  namespace: 'gameInfosModel',
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
    *getTopWinners(payload, {call, put, select}) {
      const {appModel} = yield select(state => state);
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const response = yield call(request.to, {
        url: `${API.findTopWinners}?clientId=${adminId}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data} = response;
      if (data) {
        yield put({type: 'updateState', payload: {winnerList: data}});
      }
    },
    *getHomepageInfo(c, {call, put, select}) {
      const {appModel} = yield select(state => state);
      localStorage.setItem('appDeviceToken', appModel.deviceToken);
      yield put({type: 'layoutModel/getHbDisplay'});
      yield put({type: 'layoutModel/getDownloadLink'});
      yield put({type: 'getContents'});
      if (version === 'Dsf') {
        yield put({type: 'layoutModel/getFestivalTheme'});
      }
    },
    *getContents(payload, {call, put, select}) {
      const {appModel} = yield select(state => state);
      const {data, err} = yield call(request.getHomeInfos, appModel);
      if (data) {
        const prizeGroup = data.otherSettings.visitorPrizeGroup;
        const hasData = sessionStorage.getItem('prizeGroup');
        if (!hasData) {
          yield put({
            type: 'getAllGamesSetting',
            prizeGroup,
          });
        }
        yield put({type: 'updateState', payload: data});
        if (GET_CS_LIVECHAT_LINK) {
          yield put({type: 'updateLiveChatLink'});
        }
      } else if (err) {
        message.error(`${err.message}`);
      } else if (!err && !data) {
        throw new Error('获取首页质询 payload', payload);
      }
    },
    *getAnnouncementList(payload, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {appModel, dataTableModel} = yield select(state => state);
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const {start} = dataTableModel;
      const response = yield call(request.to, {
        url: `${
          API.annoucementsList
        }?adminId=${adminId}&start=${start}&pageSize=10`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data, err} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            announcementList: data.datas,
            announcementListCount: data.totalCount,
            awaitingResponse: false,
          },
        });
      } else if (err) {
        throw new Error(`无法获取平台公告, ${err.message}`);
      }
    },
    *getAllResults(payload, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: false}}); // true修改为false 因为热门采种不能显示出上期开奖号码
      const {
        adminBrand: {brand},
        deviceToken,
      } = yield select(state => state.appModel);
      const response = yield call(request.to, {
        url: `${API.allResults}?brand=${brand}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data, err} = response;
      if (data) {
        const {gameInfos} = yield select(state => state.gameInfosModel);
        const allResults = sort.ByGame(
          data,
          ({gameUniqueId}) => !isNil(find(gameInfos, {gameUniqueId})),
        );
        yield put({type: 'updateState', payload: {allResults}});
      } else if (err) {
        throw new Error(`无法获取开奖结果 ${err.message}`);
      }
    },
    /**
     *
     * @param payload c传来参数 数组/字符串
     * @param call
     * @param put
     * @param select
     * @returns {IterableIterator<*>}
     */
    *getSingleCollections(payload, {call, put, select}) {
      const {appModel, gameInfosModel} = yield select(state => state);
      const {
        otherSettings: {visitorPrizeGroup},
      } = gameInfosModel;
      const userGroup =
        sessionStorage.getItem('prizeGroup') || visitorPrizeGroup;
      let {allGamesPrizeSettings} = gameInfosModel;
      const newTime = +new Date();
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const {thisGameId} = payload;
      if (thisGameId.includes('UNRECOGNIZED')) {
        // 历史遗留问题会返回两个这个玩法id
        const index = thisGameId.indexOf('UNRECOGNIZED');
        delete thisGameId[index];
      }
      if (thisGameId.includes('UNKNOWN_ID')) {
        const Index = thisGameId.indexOf('UNKNOWN_ID');
        delete thisGameId[Index];
      }
      const isArryLength = isArray(thisGameId) && thisGameId.length;
      // 当前这个字段还没有请求接口，没有数据返回
      if (Object.keys(allGamesPrizeSettings).length === 0) {
        return;
      }
      let parmsArr = [];
      let showTrue = false;
      if (isArryLength) {
        thisGameId.map(item => {
          if (allGamesPrizeSettings[item]) {
            const {updateTime = 0, localTime} = allGamesPrizeSettings[item];
            if (localTime < newTime - 300000) {
              const showupdateTime = updateTime;
              const obj = {
                gameUniqueId: item,
                updateTime: showupdateTime,
              };
              parmsArr.push(obj);
              showTrue = true;
            } else {
              showTrue = false;
            }
          } else {
            const obj = {
              gameUniqueId: item,
            };
            parmsArr.push(obj);
            showTrue = true;
          }
        });
      } else if (allGamesPrizeSettings[thisGameId]) {
        const {updateTime = 0, localTime} = allGamesPrizeSettings[thisGameId];
        if (localTime < newTime - 300000) {
          const showupdateTime = updateTime;
          parmsArr = [
            {
              gameUniqueId: thisGameId,
              updateTime: showupdateTime,
            },
          ];
          showTrue = true;
        } else {
          showTrue = false;
          return;
        }
      } else {
        parmsArr = [
          {
            gameUniqueId: thisGameId,
          },
        ];
        showTrue = true;
      }
      if (showTrue) {
        const body = {
          adminId,
          prizeGroup: userGroup,
          versionList: parmsArr,
        };
        const response = yield call(request.to, {
          url: `${API.SingleCollection}`,
          method: 'post',
          headers: {device_token: deviceToken},
          body,
        });
        const {data, err} = response;
        if (data) {
          if (Object.keys(data).length === 0) {
            if (isArryLength) {
              thisGameId.map(item => {
                allGamesPrizeSettings[item].localTime = +new Date();
              });
            } else {
              allGamesPrizeSettings[thisGameId].localTime = +new Date();
            }
            if (sessionStorage.getItem('prizeGroup')) {
              localStorage.setItem(
                'UserlotteryPriceList',
                JSON.stringify(allGamesPrizeSettings),
              );
            } else {
              localStorage.setItem(
                'GuestlotteryPriceList',
                JSON.stringify(allGamesPrizeSettings),
              );
            }
          } else {
            const updataAllGamesPrizeSettings = data.allGamesPrizeSettings;
            if (isArryLength) {
              thisGameId.map(item => {
                if (allGamesPrizeSettings[item]) {
                  allGamesPrizeSettings[item].localTime = +new Date();
                }
              });
            } else if (allGamesPrizeSettings[thisGameId]) {
              allGamesPrizeSettings[thisGameId].localTime = +new Date();
            }
            for (const i in updataAllGamesPrizeSettings) {
              updataAllGamesPrizeSettings[i].localTime = +new Date();
            }
            allGamesPrizeSettings = {
              ...allGamesPrizeSettings,
              ...updataAllGamesPrizeSettings,
            };
            yield put({
              type: 'updateState',
              payload: {allGamesPrizeSettings},
            });
            if (sessionStorage.getItem('prizeGroup')) {
              localStorage.setItem(
                'UserlotteryPriceList',
                JSON.stringify(allGamesPrizeSettings),
              );
            } else {
              localStorage.setItem(
                'GuestlotteryPriceList',
                JSON.stringify(allGamesPrizeSettings),
              );
            }
          }
        } else if (err) {
          throw new Error(`无法获取信息 ${err.message}`);
        }
      }
    },
    *getThisGameResults(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {betCenter, appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
        deviceToken,
      } = appModel;
      const {thisGameId, resultLimit} = betCenter;
      const response = yield call(request.to, {
        url: `${
          API.uniqueGameHistory
        }/${thisGameId}?limit=${resultLimit}&brand=${brand}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data, err} = response;
      yield put({type: 'updateState', payload: {awaitingResponse: false}});

      if (data) {
        yield put({type: 'updateState', payload: {thisGameResults: data}});
      } else if (err) {
        throw new Error(`无法获取该开彩信息, ${err.message}`);
      }
    },
    *getThisGameResultsByDate(payloadObj, {call, put, select}) {
      yield put({
        type: 'updateState',
        payload: {awaitingResponse: true, thisGameResults: ''},
      });
      const {betCenter, appModel, gameInfosModel} = yield select(
        state => state,
      );
      const {
        adminBrand: {brand},
        deviceToken,
      } = appModel;
      const {thisGameId} = betCenter;
      const {selectedDayCounts} = gameInfosModel;
      const date = moment()
        .add(selectedDayCounts, 'days')
        .format('YYYY-MM-DD');
      const response = yield call(request.to, {
        url: `${
          API.uniqueGameHistoryByDate
        }?gameUniqueId=${thisGameId}&date=${date}&brand=${brand}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data, err} = response;
      yield put({type: 'updateState', payload: {awaitingResponse: false}});

      if (data) {
        yield put({
          type: 'updateState',
          payload: {thisGameResults: reverse(data)},
        });
      } else if (err) {
        throw new Error(`无法获取该开彩信息, ${err.message}`);
      }
    },
    getAllGamesSetting: [
      function* getAllGamesSetting(payload, {call, put, select}) {
        const {appModel, gameInfosModel} = yield select(state => state);
        const UserprizeGroup = sessionStorage.getItem('prizeGroup');
        const UserPrizeSettings = JSON.parse(
          localStorage.getItem('UserlotteryPriceList'),
        );
        const GuestPrizeSettings = JSON.parse(
          localStorage.getItem('GuestlotteryPriceList'),
        );
        const {prizeGroup} = payload;
        if (UserprizeGroup && UserPrizeSettings) {
          const allGamesPrizeSettings = UserPrizeSettings;
          yield put({
            type: 'updateState',
            payload: {allGamesPrizeSettings},
          });
          return;
        }
        if (!UserprizeGroup && GuestPrizeSettings) {
          const allGamesPrizeSettings = GuestPrizeSettings;
          yield put({
            type: 'updateState',
            payload: {allGamesPrizeSettings},
          });
          return;
        }
        // 避免不必要的刷新
        if (
          !isEqual(prizeGroup, gameInfosModel.prizeGroup) ||
          !gameInfosModel.allGamesPrizeSettings
        ) {
          const {
            adminBrand: {adminId},
            deviceToken,
          } = appModel;
          const response = yield call(request.to, {
            url: `${API.gameSetting}?clientId=${adminId}${
              prizeGroup ? `&prizeGroup=${prizeGroup}` : ''
            }`,
            method: 'get',
            headers: {device_token: deviceToken},
          });
          const {data, err} = response;
          if (data) {
            const {allGamesPrizeSettings} = data;
            for (const i in allGamesPrizeSettings) {
              allGamesPrizeSettings[i].localTime = +new Date();
            }
            const hasGroup = sessionStorage.getItem('prizeGroup');
            if (!hasGroup) {
              localStorage.setItem(
                'GuestlotteryPriceList',
                JSON.stringify(allGamesPrizeSettings),
              );
            } else {
              localStorage.setItem(
                'UserlotteryPriceList',
                JSON.stringify(allGamesPrizeSettings),
              );
            }
            yield put({
              type: 'updateState',
              payload: {allGamesPrizeSettings, prizeGroup},
            });
          } else if (err) {
            throw new Error(`无法获取购彩信息 ${err.message}`);
          }
        }
      },
      {type: 'takeLatest'},
    ],
    *getCurrentResults(payloadObj, {call, put, select}) {
      const {
        adminBrand: {brand},
        deviceToken,
      } = yield select(state => state.appModel);
      const response = yield call(request.to, {
        url: `${API.currentResults}?brand=${brand}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data, err} = response;
      // console.dir(data);
      if (data) {
        const {betCenter, gameInfosModel} = yield select(state => state);
        const {gameInfos} = gameInfosModel;
        const {thisGameId} = betCenter;
        const currentResults = sort.ByGame(
          data,
          ({gameUniqueId}) => !isNil(find(gameInfos, {gameUniqueId})),
        );
        yield put({
          type: 'updateState',
          payload: {
            currentResults,
          },
        });
        const thisGameResult = find(data, ['gameUniqueId', thisGameId]);
        if (thisGameResult) {
          const {
            lastIssueNumber,
            lastOpenCode,
            nextUniqueIssueNumber,
            openStatus,
            uniqueIssueNumber,
          } = thisGameResult;
          yield put({
            type: 'updateState',
            payload: {
              secondPassed: 1,
              lastIssueNumber,
              lastOpenCode,
              nextUniqueIssueNumber,
              openStatus,
              uniqueIssueNumber,
            },
          });
          // yield put({
          //   type: 'betCenter/updateState',
          //   payload: {
          //     lastIssueNumber,
          //     nextUniqueIssueNumber,
          //     uniqueIssueNumber,
          //   },
          // });
        }
      } else if (err) {
        throw new Error(`无法获取彩种信息 ${err.message}`);
      }
    },
    *updateLiveChatLink(payloadObj, {call, put, select}) {
      const {gameInfosModel, userModel} = yield select(state => state);
      const {id, username} = userModel;
      const customLiveChatLink = {
        pcOtherInfo: {
          onlineServiceUrl: GET_CS_LIVECHAT_LINK(id || '', username || ''),
        },
      };
      const newData = cloneDeep(gameInfosModel);
      merge(newData, customLiveChatLink);
      yield put({type: 'updateState', payload: newData});
    },
  },
  subscriptions: {},
};
