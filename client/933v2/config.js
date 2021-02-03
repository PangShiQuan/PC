/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
/* eslint-disable babel/no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-rest-params */
/* eslint-disable func-names */
export const assets = {
  logo: 'assets/image/logo.png',
  logo_small: 'assets/image/logo.png',
  logo_invert: 'assets/image/logo-invert.png',
};

export const version = 'Dsf';
export const edition = 'New';

export const plugin = {
  HomePage: 3,
  Marquee: 3,
  TopTray: 2,
  ProfileNav: 2,
  Header: 2,
  Login: 2,
  Navigation: 2,
  UserQuickAccessBar: 2,
  Promotions: 2,
  Sports: 2,
  Cards: 2,
  Game: 2,
  Fishing: 2,
};

export const PATH_BINDING = {
  PAGE_BG: {
    '/promotions': '',
  },
};

export const CUSTOM_LIVECHAT_SCRIPT = (id, username) => {
  if (typeof _MKEFU !== 'undefined') {
    _MKEFU = undefined;
  }

  (function(x, i, ao, m, ei, j, s) {
    x[m] =
      x[m] ||
      function() {
        (x[m].ei = x[m].ei || []).push(arguments);
      };
    (j = i.createElement(ao)), (s = i.getElementsByTagName(ao)[0]);
    j.async = true;
    j.charset = 'UTF-8';
    j.id = 'MKEFU_WEBPLUGIN';
    j.src = 'https://tx01.comm800.com/js/mkefu.min.js';
    s.parentNode.insertBefore(j, s);
  })(window, document, 'script', '_MKEFU');

  _MKEFU('appId', '56020');
  // 设置用户ID
  _MKEFU('MKUserId', id || '');
  // 设置用户名称
  _MKEFU('MKUserName', username || '');
  // 设置自定义信息:自定义信息的格式为:key1:value1;key2:value2;
  // _MKEFU('MKUserInfo', '电话号码:13866666666;订单号码:2019121212666;');
  // 中文
  _MKEFU('MKLang', 'zhCN');
};

export const CUSTOM_LIVECHAT_TRIGGER = () => {
  _MKEFU.openMessageDialog(true);
};

export const GET_CS_LIVECHAT_LINK = (id, username) => {
  // const MKUserInfo = `MKUserId:${id};MKUserName:${username};电话号码:13866666666;订单号码:2019121212666;`;
  const MKUserInfo = `MKUserId:${id};MKUserName:${username};`;
  const data = encodeURIComponent(MKUserInfo);
  return `https://tx01.comm800.com/standalone.html?appId=56020&visitorInfo=${data}`;
};
