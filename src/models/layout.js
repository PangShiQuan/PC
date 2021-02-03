import {isEmpty, pick} from 'lodash';
import queryString from 'query-string';
import moment from 'moment';
import {apiRequest as request} from 'services';
import {API, type as TYPE} from 'utils';

const INITIAL_STATE = {
  iosAppLink: null,
  androidAppLink: null,
  qrDisplay: 'ios',
  activeTab: '',
  redirectFrom: null,
  redirectTo: null,
  shouldShowProfileModal: false,
  shouldShowAuthModel: false,
  profileGroupNav: '我的信息',
  profileSelectedNav: 'basicInfo',
  floatWindowIsOpen: true,
  shouldShowPopupModal: false,
  shouldHongbaoDisplay: false,
  festivalTheme: null,
};

export default {
  namespace: 'layoutModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload};
    },
    initializeState(state, {payload}) {
      const initialState = pick(INITIAL_STATE, payload);
      return {...state, ...initialState};
    },
    initializeAll(state) {
      return {...INITIAL_STATE};
    },
    setSideNavVisibility(state, {payload}) {
      return {...state, shouldShowSideNav: payload};
    },
  },
  effects: {
    *getFestivalTheme(payload, {call, put, select}) {
      const {appModel} = yield select(state => state);
      const {
        adminBrand: {brand},
      } = appModel;
      const response = yield call(request.to, {
        url: `${API.festivalTheme}/${brand}`,
        method: 'get',
      });
      const {data, err} = response;
      if (data) {
        yield put({
          type: 'updateState',
          payload: {festivalTheme: data},
        });
      } else if (err) {
        throw new Error(`无法获取网站主题, ${err.message}`);
      }
    },
    *getHbDisplay(payload, {call, put, select}) {
      const {appModel} = yield select(state => state);
      const {
        adminBrand: {adminId},
        deviceToken,
      } = appModel;
      const response = yield call(request.to, {
        url: `${API.HbInfos}/${adminId}`,
        method: 'get',
        headers: {device_token: deviceToken},
      });
      const {data} = response;
      if (data && data.display) {
        yield put({
          type: 'updateState',
          payload: {shouldHongbaoDisplay: data.display},
        });
      }
    },
    *getDownloadLink(payloadObj, {call, put, select}) {
      const domain = window.location.hostname;
      const {appModel} = yield select(state => state);
      const response = yield call(request.to, {
        url: API.downloadLink,
        method: 'get',
        headers: {device_token: appModel.deviceToken},
      });
      const {data} = response;
      if (data && data[domain]) {
        const {iosDown, androidDown} = data[domain];
        yield put({
          type: 'updateState',
          payload: {iosAppLink: iosDown, androidAppLink: androidDown},
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {iosAppLink: domain, androidAppLink: domain},
        });
      }
    },
    *showPopupNotice(payloadObj, {call, put, select}) {
      const popupDidUnmountTime = localStorage.getItem(TYPE.popupDidUnmount);
      const popupDidUnmountSession = sessionStorage.getItem(
        TYPE.popupDidUnmount,
      );

      if (
        !popupDidUnmountTime ||
        (!popupDidUnmountSession &&
          popupDidUnmountTime &&
          moment() > moment(popupDidUnmountTime))
      ) {
        yield put({
          type: 'updateState',
          payload: {shouldShowPopupModal: true},
        });
      }

      // if (popupDidUnmount !== 'true') {
      //   yield put({
      //     type: 'updateState',
      //     payload: {shouldShowPopupModal: true},
      //   });
      // }
    },
    *hidePopupNotice(_, {put}) {
      yield put({
        type: 'updateState',
        payload: {shouldShowPopupModal: false},
      });

      localStorage.setItem(TYPE.popupDidUnmount, moment().add(60, 'minutes'));
      sessionStorage.setItem(TYPE.popupDidUnmount, 'true');
    },
    *toggleAuth(payloadObj, {call, put, select}) {
      const {appModel} = yield select(state => state);
      const {hash} = payloadObj;
      const isGuestRegisterEx = /\b(guest)\b/.test(hash);
      let authenticationState;
      const authStates = {
        '#login': TYPE.LOGIN,
        '#register': TYPE.REGISTER,
        '#guest': TYPE.GUEST_REGISTER,
      };
      authenticationState = authStates[hash] || '';
      if (isGuestRegisterEx) {
        const {gameInfosModel: infosModel} = yield select(state => state);
        let guestAllowed;
        if (isEmpty(infosModel.otherSettings)) {
          const {data} = yield call(request.getHomeInfos, appModel);
          const {
            otherSettings: {paySwitch = ''},
          } = data;
          guestAllowed = paySwitch;
        } else {
          guestAllowed = infosModel.otherSettings.paySwitch;
        }
        authenticationState = guestAllowed ? authenticationState : '';
      }
      if (authenticationState) {
        yield put({
          type: 'updateState',
          payload: {
            shouldShowProfileModal: false,
            shouldShowAuthModel: true,
          },
        });
        yield put({
          type: 'userModel/unauthenticate',
          payload: {
            msg: '',
            authenticationState,
            showAuth: true,
          },
        });
      }
    },
  },
  subscriptions: {
    setup({history, dispatch}) {
      const {action} = history;
      return history.listen(({hash, search}) => {
        const query = queryString.parse(search);

        if (query.redirectFrom) {
          dispatch({
            type: 'updateState',
            payload: {
              redirectFrom: query.redirectFrom,
            },
          });
        }

        dispatch({type: 'toggleAuth', hash});
        if (action === 'POP') {
          dispatch({type: 'showPopupNotice'});
        }
      });
    },
  },
};
