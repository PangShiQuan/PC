import {join, toNumber, pick} from 'lodash';
import {API, encodePassword, type as TYPE} from 'utils';
import {apiRequest as request} from 'services';

const INITIAL_STATE = {
  awaitingResponse: false,
  agentId: '',
  agentName: '',
  usernameSearchString: '',
  affCodeList: [],
  directMemberList: [],
  memberList: [],
  memberListLength: 0,
  userListDownloadURL: '',
  breadcrumbs: [],
};

export default {
  namespace: 'teamModel',
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
    *getAffCodeList(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, dataTableModel, appModel} = yield select(
        state => state,
      );
      const {accessToken} = userModel;
      const {pageSize} = dataTableModel;
      const response = yield call(request.to, {
        url: API.affCodeList,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body: {pageSize: pageSize * 10},
      });
      const {data, err} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {affCodeList: data.datas},
        });
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      } else if (err) {
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(err.message);
        }
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      }
    },
    *getMemberList(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, dataTableModel, teamModel, appModel} = yield select(
        state => state,
      );
      const {accessToken} = userModel;
      const {pageSize, start, currentPage, orderByLoginTime} = dataTableModel;
      const {agentId, directMemberList, usernameSearchString} = teamModel;
      const url = [
        `${API.memberList}`,
        `?pageSize=${pageSize}`,
        `&start=${start}`,
        `&currentPage=${currentPage}`,
        `&orderByLoginTime=${orderByLoginTime}`,
      ];
      if (agentId) yield url.push(`&agentId=${agentId}`);
      else if (usernameSearchString) {
        yield url.push(`&username=${usernameSearchString}`);
      }
      if (orderByLoginTime !== '')
        yield url.push(`&orderByLoginTime=${orderByLoginTime}`);
      const response = yield call(request.to, {
        url: join(url, ''),
        method: 'get',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {data, err} = response;
      if (data) {
        const memberIds = [];
        const updatedMemberList = data.datas.map(user => {
          const updatedUser = user;
          memberIds.push(updatedUser.userId);
          updatedUser.isDirectTeamMember =
            !directMemberList.length ||
            directMemberList.includes(updatedUser.userId);
          return updatedUser;
        });
        const updates = {
          memberList: updatedMemberList,
          memberListLength: data.totalCount,
        };

        if (!directMemberList.length) {
          updates.directMemberList = memberIds;
        }

        yield put({
          type: 'updateState',
          payload: {...updates},
        });
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      } else if (err) {
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
        if (err.statusCode === '401') {
          yield put({
            type: 'userModel/unauthenticate',
            payload: {msg: err.message},
          });
        } else {
          throw new Error(err.message);
        }
      }
    },
    *deleteAffCode({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {id} = payload;
      const response = yield call(request.to, {
        url: `${API.affCode}/${id}`,
        method: 'delete',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
      });
      const {err} = response;
      if (err) {
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
                msg: `无法删除邀请码，${err.message}`,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      } else {
        yield put({type: 'getAffCodeList'});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '邀请码已被删除',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      }
    },
    *postUser(payloadObj, {call, put, select}) {
      const {userModel, formModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        username,
        password,
        memberType,
        prizeGroup,
        realName,
        phoneNumber,
        QQ,
        email,
      } = formModel;
      const encodedPassword = encodePassword(password.value);
      const body = {
        username: username.value,
        password: encodedPassword,
        memberType,
        prizeGroup: toNumber(prizeGroup.value),
        realName: realName.value,
        qq: QQ.value,
      };
      if (email.value) body.email = email.value;
      if (phoneNumber.value) body.phoneNumber = phoneNumber.value;

      const response = yield call(request.to, {
        url: API.createDownline,
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
            type: 'userModel/unauthenticate',
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
        yield put({type: 'getMemberList'});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '创建用户成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
      }
    },
    *postAffCode(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, formModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {affCode, affCodeStatus, prizeGroup, memberType} = formModel;
      const response = yield call(request.to, {
        url: API.affCode,
        method: 'post',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body: {
          affCode: affCode.value,
          memberType,
          status: affCodeStatus.value,
          registerUrl: window.location.hostname,
          prizeGroup: toNumber(prizeGroup.value),
        },
      });
      const {err} = response;
      if (err) {
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
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      } else {
        yield put({type: 'getAffCodeList'});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '创建邀请码成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      }
    },
    *putAffCode({payload}, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, formModel, appModel} = yield select(state => state);
      const {id} = payload;
      const {accessToken} = userModel;
      const {affCodeStatus, prizeGroup, memberType} = formModel;
      const response = yield call(request.to, {
        url: `${API.affCode}/${id}`,
        method: 'put',
        headers: {
          authorization: `bearer ${accessToken}`,
          device_token: appModel.deviceToken,
        },
        body: {
          memberType,
          status: affCodeStatus.value,
          prizeGroup: toNumber(prizeGroup.value),
        },
      });
      const {err} = response;
      if (err && err.statusCode) {
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
                msg: err.message,
                icon: 'close-circle-outline',
                color: 'red',
              },
            },
          });
        }
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      } else {
        yield put({type: 'getAffCodeList'});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '修改邀请码成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      }
    },
    *putUserInfo(payloadObj, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {userModel, formModel, appModel} = yield select(state => state);
      const {accessToken} = userModel;
      const {
        email,
        identityNumber,
        nickname,
        phoneNumber,
        QQ,
        username,
        prizeGroup,
        memberType,
      } = formModel;
      const body = {
        memberType,
        prizeGroup: toNumber(prizeGroup.value),
        identityNumber: `${identityNumber.value}`,
        nickname: nickname.value,
        username: username.value,
        qq: QQ.value,
      };
      if (email.value) body.email = email.value;
      if (phoneNumber.value) body.phoneNumber = phoneNumber.value;
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
            type: 'userModel/unauthenticate',
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
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      } else {
        yield put({type: 'getMemberList'});
        yield put({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: '修改用户成功',
              icon: 'checkbox-marked-circle-outline',
              color: 'green',
            },
          },
        });
        yield put({
          type: 'updateState',
          payload: {awaitingResponse: false},
        });
      }
    },
    *getDownloadUserListURL(_, {call, put, select}) {
      yield put({type: 'updateState', payload: {awaitingResponse: true}});
      const {teamModel, appModel, userModel} = yield select(state => state);
      const {agentId, agentName} = teamModel;
      const {data} = yield call(request.getUserListDownloadURL, {
        agentId,
        accessToken: userModel.accessToken,
        deviceToken: appModel.deviceToken,
      });
      if (data) {
        const link = document.createElement('a');
        link.href = data;
        link.download = `${agentName ? `${agentName}_` : ''}用户列表.xlsx`;
        link.click();

        yield put({
          type: 'updateState',
          payload: {userListDownloadURL: data},
        });
      }
      yield put({type: 'updateState', payload: {awaitingResponse: false}});
    },
  },
  subscriptions: {},
};
