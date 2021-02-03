/* eslint-disable import/first */
// https://github.com/ant-design/ant-design/issues/9876
import 'polyfill/NodeList-forEach';
// https://github.com/umijs/umi/issues/413
import 'polyfill/setPrototypeOf';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import dva from 'dva';
import moment from 'moment';
import 'moment/locale/zh-cn';
import {createBrowserHistory} from 'history';
import createLoading from 'dva-loading';
import {setRandomFallback} from 'bcryptjs';
import {message} from 'antd';
import Maintenance from './maintenance';
import {get} from 'lodash';

import {
  entropyRandom,
  logTranslate,
  validate,
  getServerTimeGap,
  API,
} from 'utils';
import {apiRequest as request} from 'services';
import 'styles/index.less';

if (!(window.crypto || window.msCrypto)) setRandomFallback(entropyRandom);

moment.locale('zh-cn');
const app = dva({
  ...createLoading({
    effects: false,
  }),
  history: createBrowserHistory(),
  onError(e, dispatch) {
    const msgs = document.querySelectorAll('.ant-message-notice');
    if (msgs.length < 1) {
      const errMsg = logTranslate(e);
      // message.error(errMsg, /* duration */ 3);
      dispatch({
        type: 'formModel/postErrorMessage',
        payload: {
          msg: errMsg,
        },
      });
    }
  },
});

app.model(require('./models/chatbox').default);
app.model(require('./models/user').default);
app.model(require('./models/gameInfos').default);
app.model(require('./models/layout').default);
app.model(require('./models/betCenter').default);
app.model(require('./models/trend').default);
app.model(require('./models/promotions').default);
app.model(require('./models/helpCenter').default);
app.model(require('./models/sport').default);
app.model(require('./models/reali').default);
app.model(require('./models/game').default);
app.model(require('./models/card').default);
app.model(require('./models/fishing').default);
app.model(require('./models/player').default);
app.model(require('./models/instructions').default);
app.model(require('./models/form').default);
app.model(require('./models/transfer').default);
app.model(require('./models/dataTable').default);
app.model(require('./models/order').default);
app.model(require('./models/transaction').default);
app.model(require('./models/team').default);
app.model(require('./models/report').default);
app.model(require('./models/feedback').default);
app.model(require('./models/statisticsReport').default);
app.model(require('./models/missionCenter').default);
app.model(require('./models/sosFund').default);

const getServerTime = new Promise((resolve, reject) => {
  request
    .to({url: API.getServerTime, method: 'get'})
    .then(({data}) => resolve(data))
    .catch(err => reject(err));
});

const getAdminBrand = new Promise((resolve, reject) => {
  request
    .to({url: API.userAdminId, method: 'get'})
    .then(({data, err}) => {
      if (err) throw new Error(`无法获取品牌信息, ${err.message}`);
      return resolve(data);
    })
    .catch(err => reject(err));
});

const getMaintenanceState = getAdminBrand.then(function(value) {
  const {adminId, brand} = value;
  return new Promise((resolve, reject) => {
    request
      .to({url: `${API.systemMaintenance}/${brand}.json`, method: 'get'})
      .then(({data, err}) => {
        if (err) return resolve(err);
        else return resolve(data);
      })
      .catch(err => reject(err));
  });
});

function startAppWithState(appState) {
  const maintenanceStatusCode = get(appState, 'maintenanceState.status', 0);
  if (maintenanceStatusCode === 1) {
    app.router(() => <Maintenance data={appState.maintenanceState} />);
  } else {
    app.router(require('./router').default);
  }
  app.model({namespace: 'appModel', state: appState});
  return app.start('#root');
}

function setupAppState([
  adminBrand,
  serverTime,
  deviceToken,
  maintenanceState,
]) {
  return {
    adminBrand,
    deviceToken,
    currentServerTime: getServerTimeGap(serverTime),
    maintenanceState,
  };
}

document.addEventListener('DOMContentLoaded', event => {
  Promise.all([
    getAdminBrand,
    getServerTime,
    validate.getDeviceToken,
    getMaintenanceState,
  ])
    .then(setupAppState)
    .then(startAppWithState)
    .catch(err => {
      message.error(logTranslate(err.message || err), /* duration */ 5);
    });
});
