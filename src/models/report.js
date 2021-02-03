import moment from 'moment';
import queryString from 'query-string';
import {apiRequest as request} from 'services';
import {API, type} from 'utils';
import _ from 'lodash';

const {
  gamePlatformType: {ALL, BET},
} = type;

const INITIAL_STATE = {
  awaitingResponse: false,
  data: null,
  username: null,
  usernameList: [],
  displayList: {},
  displayListTemp: [],
  displayListPersonalReport: [],
  displayListDownline: [],
  memberList: [],
  selectedTimeframeQuickLink: '',
  startDatetime: moment(new Date()).add(-7, 'days'),
  endDatetime: moment(new Date()),
  selectedGamePlatform: ALL,
  selectedGamePlatformFromTable: '',
  selectedGamePlatformFromTableDetails: {},
  currentSubPage: '',
  isMain: false,
  originPage: null,
  paginationCurrentPage: 1,
  size: 1,
  pageSize: 10,
  searchText: '',
  agentId: '',
  sortedInfo: {
    order: 'descend',
    columnKey: '',
  },
};

function createEmptyTeamDataObj({username, directAgent}) {
  return {
    bonus: 0,
    charge: 0,
    commission: 0,
    directAgent,
    fee: 0,
    grantTotal: 0,
    pnl: 0,
    rebate: 0,
    topup: 0,
    transferIn: 0,
    transferOut: 0,
    uniqueActiveChild: 0,
    username,
    win: 0,
    withdrawal: 0,
  };
}

function createEmptyTeamGamePlateformDataObj({
  username,
  directAgent,
  gamePlatform,
}) {
  return {
    betCount: 0,
    totalDsfWin: 0,
    totalPayout: 0,
    totalTopUp: 0,
    actualBet: 0,
    totalWithdraw: 0,
    totalBet: 0,
    rebateAmount: 0,
    totalNotSettled: 0.0,
    playerWinLoss: 0,
    userCount: 0,
    gamePlatform,
    username,
    queryTime: '',
    directAgent,
    uniqueId: '',
  };
}

export default {
  namespace: 'reportModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
    initializeState(state, {payload}) {
      const initialStates = _.pick(INITIAL_STATE, payload);
      return {
        ...state,
        ...initialStates,
      };
    },
    initializeAll(state, {payload}) {
      let newState = {};
      if (payload) {
        newState = _.omit(INITIAL_STATE, payload);
      } else {
        newState = INITIAL_STATE;
      }

      return {
        ...state,
        ...newState,
      };
    },
  },
  effects: {
    *getTeamListSummary(payloadObj, {call, put, select}) {
      const {reportModel} = yield select(state => state);
      const {selectedGamePlatform} = reportModel;
      if (selectedGamePlatform === BET) {
        yield put({
          type: 'getMemberList',
          *isSuccess() {
            yield put({type: 'getTeamListLotterySummary'});
          },
        });
      } else {
        yield put({
          type: 'getMemberList',
          *isSuccess() {
            yield put({type: 'getTeamListGameSummary'});
          },
        });
      }
    },
    *getTeamListLotterySummary(payloadObj, {call, put, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {userModel, appModel, reportModel} = yield select(state => state);
      const {accessToken, username} = userModel;
      const {
        startDatetime,
        endDatetime,
        username: selectedUsername,
        isMain,
        memberList,
      } = reportModel;
      const body = {
        startDateInclusive: `${startDatetime.format('YYYY-MM-DD')}`,
        endDateInclusive: `${endDatetime.format('YYYY-MM-DD')}`,
        summaryPeriod: 'DAY',
        start: 0,
        pageSize: 10000,
        username: '',
        summaryType: 'TEAM',
      };
      if (selectedUsername) {
        body.directAgent = selectedUsername;
      } else {
        body.username = username;
      }

      const response = yield call(request.to, {
        url: API.teamReportQuery,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body,
      });

      if (response.data) {
        const displayListWithBet = {};
        if (response.data.totalCount <= 1 && !selectedUsername) {
          let dataToInsert = {};
          if (response.data.datas.length > 0) {
            [dataToInsert] = response.data.datas;
          } else {
            dataToInsert = createEmptyTeamDataObj({
              username,
              directAgent: reportModel.username || '',
            });
          }
          dataToInsert.directAgent = '-';
          dataToInsert.userId = userModel.id;
          dataToInsert.teamMemberCount = memberList.length;

          displayListWithBet.BET = {
            gamePlatform: BET,
            data: _.cloneDeep([dataToInsert]),
            count: 1,
          };

          if (selectedUsername && !isMain) {
            yield put({
              type: 'updateState',
              payload: {
                displayListDownline: _.cloneDeep(displayListWithBet),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                displayList: _.cloneDeep(displayListWithBet),
                displayListTemp: _.cloneDeep(displayListWithBet),
              },
            });
          }

          yield put({
            type: 'updateState',
            payload: {
              awaitingResponse: false,
            },
          });
          return;
        }

        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          const datas = _.map(
            memberList,
            ({username: memberUsername, userId, teamMemberCount}) => {
              let returnValue = {};
              const value = _.filter(
                response.data.datas,
                data => data.username === memberUsername,
              );

              if (value && value.length > 0) {
                [returnValue] = value;
              } else {
                returnValue = createEmptyTeamDataObj({
                  username: memberUsername,
                  directAgent: selectedUsername || '',
                });
              }
              returnValue.userId = userId;
              returnValue.teamMemberCount = teamMemberCount;
              return returnValue;
            },
          );
          displayListWithBet.BET = {
            gamePlatform: BET,
            data: _.cloneDeep(datas),
            count: datas.length,
            statements: _.cloneDeep(response.data.userStatementSummaryDto),
          };
          if (selectedUsername && !isMain) {
            yield put({
              type: 'updateState',
              payload: {
                displayListDownline: _.cloneDeep(displayListWithBet),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                displayList: _.cloneDeep(displayListWithBet),
                displayListTemp: _.cloneDeep(displayListWithBet),
              },
            });
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
        } else {
          throw new Error(`无法获取报表记录，${response.err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
    *getTeamListGameSummary(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {userModel, appModel, reportModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        selectedGamePlatform,
        startDatetime,
        endDatetime,
        username,
        isMain,
        memberList,
      } = reportModel;

      let response = null;
      let params = null;

      params = {
        startTime: `${startDatetime.format('YYYY-MM-DD')}`,
        endTime: `${endDatetime.format('YYYY-MM-DD')}`,
        start: 0,
        size: 100000,
      };

      if (username) {
        params.directAgent = username;
      }

      response = yield call(request.to, {
        url: `${API.playerTeamCalc}?${queryString.stringify(params)}`,
        method: 'get',
        headers: {
          gamePlatform: selectedGamePlatform,
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (response.data) {
        const isOwnself = response.data.count <= 1 && !username;
        if (isOwnself) {
          let dataToInsert = {};
          if (response.data.data.length > 0) {
            [dataToInsert] = response.data.data;
          } else {
            dataToInsert = createEmptyTeamGamePlateformDataObj({
              username: userModel.username,
              directAgent: '',
              gamePlatform: selectedGamePlatform,
            });
          }
          dataToInsert.directAgent = '-';
          dataToInsert.userId = userModel.id;
          dataToInsert.teamMemberCount = memberList.length;
          const displayListTemp = {};
          displayListTemp[selectedGamePlatform] = {
            data: _.cloneDeep([dataToInsert]),
            count: 1,
          };
          displayListTemp.currentPage = 1;

          if (username && !isMain) {
            yield put({
              type: 'updateState',
              payload: {
                displayListDownline: displayListTemp,
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                displayList: displayListTemp,
                displayListTemp: _.cloneDeep(displayListTemp),
              },
            });
          }
          yield put({
            type: 'updateState',
            payload: {
              awaitingResponse: false,
            },
          });
          return;
        }

        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          const datas = _.map(
            memberList,
            ({username: memberUsername, userId, teamMemberCount}) => {
              let returnValue = {};
              const value = _.filter(
                response.data.data,
                data => data.username === memberUsername,
              );

              if (value && value.length > 0) {
                [returnValue] = value;
              } else {
                returnValue = createEmptyTeamGamePlateformDataObj({
                  memberUsername,
                  directAgent: reportModel.username || '',
                });
              }
              returnValue.userId = userId;
              returnValue.teamMemberCount = teamMemberCount;
              return returnValue;
            },
          );

          const displayListTemp = {};
          displayListTemp[selectedGamePlatform] = {
            data: _.cloneDeep(datas),
            count: datas.length,
            statements: _.cloneDeep(response.data.statements),
          };
          displayListTemp.currentPage = 1;

          if (username && !isMain) {
            yield put({
              type: 'updateState',
              payload: {
                displayListDownline: displayListTemp,
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                displayList: displayListTemp,
                displayListTemp: _.cloneDeep(displayListTemp),
              },
            });
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
        } else {
          throw new Error(`无法获取报表记录，${response.err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
    *getTeamPersonalListStatement(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {userModel, appModel, reportModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        selectedTimeframeQuickLink,
        selectedGamePlatform,
        startDatetime,
        endDatetime,
      } = reportModel;

      let response = null;
      let params = null;
      if (payloadObj.username) {
        params = {
          username: payloadObj.username,
          summaryQueryType: selectedTimeframeQuickLink || null,
          startTime: `${startDatetime.format('YYYY-MM-DD')}`,
          endTime: `${endDatetime.format('YYYY-MM-DD')}`,
        };
      } else {
        params = {
          summaryQueryType: selectedTimeframeQuickLink || null,
          startTime: `${startDatetime.format('YYYY-MM-DD')}`,
          endTime: `${endDatetime.format('YYYY-MM-DD')}`,
        };
      }
      const headers = {
        authorization: `bearer ${accessToken}`,
        device_token: appModel.deviceToken,
      };

      if (selectedGamePlatform !== ALL) {
        headers.gamePlatform = selectedGamePlatform;
      }
      response = yield call(request.to, {
        url: `${API.playerStatementsPersonalTotal}?${queryString.stringify(
          params,
        )}`,
        method: 'get',
        headers,
      });
      // yield put({
      //   type: "initializeState",
      //   payload: ["displayList"]
      // });
      if (response.data) {
        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          yield put({
            type: 'updateState',
            payload: {
              displayListPersonalReport: _.cloneDeep(response.data),
            },
          });
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
    *getTeamPersonalLotteryListStatement(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {userModel, appModel, reportModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {startDatetime, endDatetime} = reportModel;

      let response = null;
      const body = {
        startDateInclusive: `${startDatetime.format('YYYY-MM-DD')}`,
        pageSize: 10000,
        start: 0,
        endDateInclusive: `${endDatetime.format('YYYY-MM-DD')}`,
        username: payloadObj.username,
      };

      const {deviceToken} = appModel;
      response = yield call(request.to, {
        url: API.personalReport,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
        },
        body,
      });
      if (response.data) {
        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          const displayListPersonalReport = {};
          displayListPersonalReport.BET = _.cloneDeep(
            response.data.userStatementSummaryDto,
          );
          yield put({
            type: 'updateState',
            payload: {
              displayListPersonalReport,
            },
          });
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
    *getPersonalLotteryStatement(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {appModel, reportModel, userModel} = yield select(state => state);
      const {startDatetime, endDatetime, displayList, username} = reportModel;

      let response = null;
      let body = null;

      if (username) {
        body = {
          startDateInclusive: `${startDatetime.format('YYYY-MM-DD')}`,
          pageSize: 10000,
          start: 0,
          endDateInclusive: `${endDatetime.format('YYYY-MM-DD')}`,
          username,
        };
      } else {
        body = {
          startDateInclusive: `${startDatetime.format('YYYY-MM-DD')}`,
          pageSize: 10000,
          start: 0,
          endDateInclusive: `${endDatetime.format('YYYY-MM-DD')}`,
          username: userModel.username,
        };
      }

      const {deviceToken} = appModel;
      const {accessToken} = userModel;
      response = yield call(request.to, {
        url: API.personalReport,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: deviceToken,
        },
        body,
      });
      if (response.data) {
        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          const responseData = _.cloneDeep(response.data);
          const displayListTemp = {};
          displayListTemp.BET = _.cloneDeep(
            responseData.userStatementSummaryDto,
          );
          displayListTemp.BET.details = _.cloneDeep(responseData.datas);
          displayListTemp.BET.gamePlatform = BET;
          displayList.BET = _.cloneDeep(displayListTemp.BET);
          yield put({
            type: 'initializeState',
            payload: ['displayList'],
          });

          if (payloadObj.onlyBet) {
            yield put({
              type: 'updateState',
              payload: {
                displayList: displayListTemp,
              },
            });
          } else {
            yield put({
              type: 'updateDisplayList',
              displayList,
            });
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
        } else {
          throw new Error(`无法获取报表记录，${response.err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
    *getPersonalListStatement(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });
      const {userModel, appModel, reportModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        selectedTimeframeQuickLink,
        selectedGamePlatform,
        startDatetime,
        endDatetime,
        username,
      } = reportModel;

      let response = null;
      let params = null;

      params = {
        summaryQueryType: selectedTimeframeQuickLink || null,
        startTime: `${startDatetime.format('YYYY-MM-DD')}`,
        endTime: `${endDatetime.format('YYYY-MM-DD')}`,
        start: 0,
        size: 100000,
      };
      if (username) {
        params.username = username;
      }
      const headers = {
        authorization: `bearer ${accessToken}`,
        device_token: appModel.deviceToken,
      };

      if (selectedGamePlatform !== ALL) {
        headers.gamePlatform = selectedGamePlatform;
      }
      response = yield call(request.to, {
        url: `${API.playerStatementsPersonalTotal}?${queryString.stringify(
          params,
        )}`,
        method: 'get',
        headers,
      });
      if (response.data) {
        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          yield put({
            type: 'updateState',
            payload: {
              displayList: _.cloneDeep(response.data),
            },
          });
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
        } else {
          throw new Error(`无法获取报表记录，${response.err.message}`);
        }
      }
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
    *getPersonalListDetailStatement(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {userModel, appModel, reportModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        selectedTimeframeQuickLink,
        selectedGamePlatformFromTable,
        displayList,
        startDatetime,
        endDatetime,
        username,
      } = reportModel;

      let params = null;
      if (username) {
        params = {
          username,
          summaryQueryType: selectedTimeframeQuickLink || null,
          startTime: `${startDatetime.format('YYYY-MM-DD')}`,
          endTime: `${endDatetime.format('YYYY-MM-DD')}`,
          start: 0,
          size: 100000,
        };
      } else {
        params = {
          summaryQueryType: selectedTimeframeQuickLink || null,
          startTime: `${startDatetime.format('YYYY-MM-DD')}`,
          endTime: `${endDatetime.format('YYYY-MM-DD')}`,
          start: 0,
          size: 100000,
        };
      }

      const response = yield call(request.to, {
        url: `${API.playerStatementsPersonalList}?${queryString.stringify(
          params,
        )}`,
        method: 'get',
        headers: {
          gamePlatform: selectedGamePlatformFromTable,
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (response.data) {
        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          displayList[selectedGamePlatformFromTable].details =
            response.data.data;
          displayList[selectedGamePlatformFromTable].currentPage = 1;
          yield put({
            type: 'updateDisplayList',
            displayList: _.cloneDeep(displayList),
          });
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
    *getPersonalBetLog(payloadObj, {put, call, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {userModel, appModel, reportModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        selectedGamePlatformFromTable,
        selectedGamePlatformFromTableDetails,
        displayList,
      } = reportModel;
      let params = null;
      params = {
        startTime:
          selectedGamePlatformFromTableDetails.gamePlatformDisplayListDetail
            .startTime,
        endTime:
          selectedGamePlatformFromTableDetails.gamePlatformDisplayListDetail
            .startTime,
        pageSize: 2000, // backend max only accepts 2000
      };

      const response = yield call(request.to, {
        url: `${API.playerGetBetLog}?${queryString.stringify(params)}`,
        method: 'get',
        headers: {
          gamePlatform: selectedGamePlatformFromTable,
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (response.data) {
        const statusOK = typeof response.data === 'object';
        if (statusOK) {
          displayList[selectedGamePlatformFromTable].details[
            selectedGamePlatformFromTableDetails.key
          ].betLogs = _.cloneDeep(response.data);
          displayList[selectedGamePlatformFromTable].details[
            selectedGamePlatformFromTableDetails.key
          ].currentPage = 1;
          yield put({
            type: 'updateDisplayList',
            displayList,
          });
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
    *updateDisplayList(payloadObj, {put}) {
      yield put({
        type: 'updateState',
        payload: {
          displayList: _.cloneDeep(payloadObj.displayList),
        },
      });
    },
    *getSearchDisplayListItem(payloadObj, {put, select}) {
      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: true,
        },
      });

      const {reportModel} = yield select(state => state);
      const {
        displayList,
        displayListTemp,
        selectedGamePlatform,
        searchText,
      } = reportModel;

      const searchDataList = _.filter(
        displayListTemp[selectedGamePlatform].data,
        item => item.username.toLowerCase().indexOf(searchText) > -1,
      );
      displayList[selectedGamePlatform].data = searchDataList;
      yield put({
        type: 'updateState',
        payload: {
          displayList,
        },
      });

      yield put({
        type: 'updateState',
        payload: {
          awaitingResponse: false,
        },
      });
    },
    *getPlayerGetTransfer({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, reportModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        selectedGamePlatform,
        startDatetime,
        endDatetime,
        paginationCurrentPage,
        size,
      } = reportModel;

      const pageSize = 1000;

      const params = {
        startTime: `${startDatetime.format('YYYY-MM-DD')}`,
        endTime: `${endDatetime.format('YYYY-MM-DD')}`,
        start: 0,
        size: pageSize,
      };
      // transferType: '',
      // transferStateType: '',
      const response = yield call(request.to, {
        url: `${API.playerGetTransfer}?${queryString.stringify(params)}`,
        method: 'get',
        headers: {
          gamePlatform:
            selectedGamePlatform === ALL ? '' : selectedGamePlatform,
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      if (response.data) {
        const transferList = response.data;

        yield put({
          type: 'updateState',
          payload: {
            displayList: _.cloneDeep(transferList),
          },
        });
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
    *getMemberList(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, reportModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {agentId, username} = reportModel;
      let params = null;

      if (username === '') {
        yield put({
          type: 'updateState',
          payload: {
            memberList: [
              {
                userId: userModel.id,
                username: userModel.username,
                teamMemberCount: 1,
              },
            ],
          },
        });
      } else {
        params = {
          pageSize: 20000,
          start: 0,
        };
      }

      if (agentId && agentId !== '') {
        params.agentId = agentId;
      }
      const response = yield call(request.to, {
        url: `${API.memberList}?${queryString.stringify(params)}`,
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
            memberList: _.map(data.datas, member => ({
              userId: member.userId,
              username: member.username,
              teamMemberCount: member.teamMemberCount,
            })),
          },
        });
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
        if (payloadObj.isSuccess) {
          yield payloadObj.isSuccess();
        }
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/secureAuthentication',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(err.message);
        }
      }
    },
  },
};
