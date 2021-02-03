import 'noty/lib/noty.css';
import 'noty/lib/themes/sunset.css';
import 'polyfill/closest';
import 'polyfill/origin';
import SearchParams from '@ungap/url-search-params';

import 'hb_stylesheets/style.less';
import 'hb_stylesheets/popup.less';
import animateCss from 'hb_utils/animateCss';
import importFiles from 'hb_utils/importFiles';
import * as message from 'hb_utils/Message';
import * as request from './hbApi';

const targetEl = {
  FU: 'flHongbao',
  TJ: 'tjHongbao',
};
const referrer =
  process.env.NODE_ENV === 'development'
    ? document.referrer
    : `${window.location.origin}/`;

const credential = (function credential() {
  const Params = !('URLSearchParams' in window)
    ? SearchParams
    : window.URLSearchParams;
  const url = new Params(window.location.search);
  const accessToken =
    url.get('accessToken') || sessionStorage.getItem('accessToken');
  const deviceToken =
    url.get('deviceToken') || sessionStorage.getItem('deviceToken');
  window.history.replaceState({}, document.title, window.location.pathname);

  if (accessToken) sessionStorage.setItem('accessToken', accessToken);
  if (deviceToken) sessionStorage.setItem('deviceToken', deviceToken);

  return {accessToken, deviceToken};
})();
Object.freeze(credential);

const subPathName = (function subPathName(links) {
  const u = navigator.userAgent;
  const linksMap = {};
  const isWAP = !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/mobi/i);

  links.forEach(link => {
    const linkName = link.replace(/#/g, '');
    if (isWAP) linksMap[linkName] = `?action=${linkName}`;
    else linksMap[linkName] = link;
  });

  linksMap.isWAP = isWAP;

  return linksMap;
})(['#register', '#login', '#topup']);
Object.freeze(subPathName);

function handleUnauthorize() {
  sessionStorage.clear();
  renderHBPlaceholder();
  hideRankingList();
  toggleMyHBEntrance(false);
  hideDrawChance();
}

function getDate({dateTime, date, time}) {
  const thisDate = date || dateTime.split(' ')[0];
  const [year, month, day] = thisDate.split('-');
  const thisTime = time || dateTime.split(' ')[1];
  const [hour, min, sec] = thisTime.split(':');

  return new Date(year, month - 1, day, hour, min, sec);
}

function getCurrentTime({currentDateTime}) {
  const today =
    (currentDateTime && getDate({dateTime: currentDateTime})) || new Date();
  const currentTimeString = today.toTimeString().split(' ')[0];

  return {
    currentTimeSince: today.getTime(),
    currentTime: timeString2ms(currentTimeString),
    today: today.setHours(0, 0, 0, 0),
  };
}

function initCountdown({accessToken, deviceToken}, currentEvent) {
  const [hour, minute, second] = currentEvent.hongbaoStartTime.split(':');
  const endTime = timeString2ms(currentEvent.hongbaoEndTime);
  const eventStartDate = getDate({
    date: currentEvent.eventStartDate,
    time: '00:00:00',
  });
  const eventStartTime = eventStartDate.getTime();
  const {currentTimeSince, currentTime, today} = getCurrentTime(currentEvent);
  const currentDate = today > eventStartTime ? new Date(today) : eventStartDate;

  if (currentTime >= endTime && today >= eventStartTime)
    currentDate.setDate(currentDate.getDate() + 1);

  const startTime = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hour,
    minute,
    second,
  ).getTime();

  renderCountdown(
    currentEvent,
    {currentTimeSince, startTime},
    onEventCommencement({accessToken, deviceToken}),
  );
}

async function informUser(text, type = 'alert', queueName) {
  if (!informUser.Noty) {
    const pkg = await import(/* webpackChunkName:"noty" */ 'noty');
    informUser.Noty = pkg.default;
  }
  const {Noty} = informUser;
  const setting = {
    animation: {
      open: 'noty_open',
      close: 'noty_close',
    },
    closeWith: ['click', 'button'],
    layout: 'center',
    text,
    theme: 'sunset',
    type,
    visibilityControl: true,
  };

  if (queueName) {
    Noty.setMaxVisible(1, queueName);
    setting.queue = queueName;
  }
  new Noty(setting)
    .on('onClose', function close() {
      if (this.options.queue) Noty.clearQueue(this.options.queue);
    })
    .show();
}

function getEventStatus(dateTime) {
  const defaultEventStatus = {
    isEventOngoing: false,
    isPostEvent: true,
  };

  if (!dateTime) return defaultEventStatus;

  const startDate = getDate({
    date: dateTime.eventStartDate,
    time: '00:00:00',
  }).getTime();
  const endDate = getDate({
    date: dateTime.eventEndDate,
    time: '00:00:00',
  }).getTime();
  const {currentTime, today} = getCurrentTime(dateTime);

  if (today >= startDate || today <= endDate) {
    const startTime = timeString2ms(dateTime.hongbaoStartTime);
    const endTime = timeString2ms(dateTime.hongbaoEndTime);

    if (currentTime >= startTime && currentTime < endTime)
      return {isEventOngoing: true, isPostEvent: false};

    return {
      isEventOngoing: false,
      isPostEvent: today === endDate && currentTime >= endTime,
    };
  }

  return defaultEventStatus;
}

function timeString2ms(timeStr) {
  const [hour, minute, second] = timeStr.split(':');
  return (Number(hour) * 60 * 60 + Number(minute) * 60 + Number(second)) * 1000;
}

function handleDisqualifyDraw({target}) {
  if (target.hasAttribute('data-disqualify')) {
    const rulePopup = document.getElementById('readrule');

    rulePopup.classList.remove('hide');
  }
}

function onError(err, showPlaceholder = false) {
  informUser(err.message, 'error', err.statusCode);

  if (err.statusCode === '401') {
    handleUnauthorize();
    return true;
  }
  if (showPlaceholder) renderHBPlaceholder();

  return false;
}

function initEvent({accessToken, deviceToken}) {
  const hbCurrent = request.fetchHBCurrent(deviceToken);
  const handleEvent = handleCurrentEvent(accessToken, deviceToken);
  hbCurrent.then(handleEvent).catch(onError);
}

function onEventCommencement({accessToken, deviceToken}) {
  if (!accessToken) return null;

  return function init(currentEvent) {
    renderHBDraw({accessToken, deviceToken}, currentEvent);
  };
}

function onEventEnd({accessToken, deviceToken}, {type}) {
  const hbChances = document.getElementById(`${type}_chances`);
  const hbBtn = document.getElementById(type);
  const drawResult = document.getElementById('drawResult');

  if (!drawResult.classList.contains('hide')) onPopupClose(drawResult);

  hbBtn.classList.add('hide');

  hbChances.classList.add('hide');
  hbChances.getElementsByTagName('strong').item(0).textContent = '';

  if (informUser.Noty) informUser.Noty.closeAll();
  initEvent({accessToken, deviceToken});
}

function onPopupClose(target) {
  const popupContainer = target.closest('.popup');
  popupContainer.classList.add('hide');

  if (popupContainer.id === 'drawResult') {
    const drawResultEl = document.getElementById('hb_result');
    const contBtn = document.getElementById('hb_continue');
    const hbType = contBtn.getAttribute('data-hbtype');
    const hbChanceEl = document.querySelector(
      `#${targetEl[hbType]}_chances strong`,
    );

    drawResultEl.removeAttribute('data-result');
    contBtn.removeAttribute('data-hbtype');
    animateCss(hbChanceEl, 'data-updated');
  }
}

async function setDataInfoReference(accessToken) {
  const info = await request.fetchSiteInfo(accessToken);

  Array.from(document.querySelectorAll('[data-info]')).forEach(el => {
    const elProp = el instanceof HTMLAnchorElement ? 'href' : 'textContent';

    // eslint-disable-next-line no-param-reassign
    el[elProp] = info[el.getAttribute('data-info')];
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const registerEl = document.getElementById('register');
  const topupEl = document.getElementById('topup');

  registerEl.href = referrer + subPathName.register;
  topupEl.href = referrer + subPathName.topup;

  if (navigator.userAgent.match(/Android|webOS|iPhone|iPod|Blackberry/i)) {
    document.getElementById('logo').addEventListener("click", () => {
      window.postMessage(JSON.stringify({ action: "home_back" }), "*");
    });
    document.getElementById('main_page').addEventListener("click", () => {
      window.postMessage(JSON.stringify({ action: "home_back" }), "*");
    })
  } else {
    document.getElementById('logo').href = referrer;
    document.getElementById('main_page').href = referrer;
  }

  toggleMyHBEntrance(credential.accessToken);
  initEvent(credential);
  setupEventHandler(credential);
  setDataInfoReference(credential.accessToken);
});

function detectOn(event) {
  const {target} = event;
  if (!document.body.contains(target) || target.closest('.wrapper')) {
    return;
  }
  onPopupClose(target);
  event.stopPropagation();
}

// assumming all handler required to make async call in sequence
// return err
function sequenceHandler(handlers) {
  const handling = async function handling(event) {
    let index = 0;
    while (index < handlers.length) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await Promise.resolve(handlers[index](event));
      if (resp && resp.statusCode === '401') index = handlers.length;
      else index++;
    }
  };
  return handling;
}

function renderHBDetails(accessToken, deviceToken) {
  const renderMyHb = async function renderMyHb() {
    const render = await import(/* webpackChunkName:"history" */ './history');

    render.default(accessToken, deviceToken);
  };
  return renderMyHb;
}

async function setupEventHandler({accessToken, deviceToken}) {
  const popupCloseEls = Array.from(document.querySelectorAll('[role="close"]'));
  const loginEl = document.getElementById('login');

  popupCloseEls.forEach(closeEl => {
    closeEl.addEventListener('click', detectOn);
  });
  loginEl.addEventListener('click', prepareRedirect);

  if (accessToken) {
    const drawHandler = draw.bind({accessToken, deviceToken});
    const hbContEl = document.getElementById('hb_continue');
    const hbEls = Array.from(document.getElementsByClassName('hongbao-btn'));
    // 就算没资格抢红包, 仍然允许抢红包请求, 以查询重叠登陆事件的发生
    const handler = sequenceHandler([drawHandler, handleDisqualifyDraw]);

    hbContEl.addEventListener('click', drawHandler);
    hbEls.forEach(hbEl => {
      hbEl.addEventListener('click', handler);
    });

    const myHbEl = document.getElementById('myHB');
    const onClickMyHb = renderHBDetails(accessToken, deviceToken);
    myHbEl.addEventListener('click', onClickMyHb);

    if (/Android/.test(navigator.appVersion)) {
      window.addEventListener('resize', () => {
        if (
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA'
        ) {
          document.activeElement.scrollIntoView();
        }
      });
    }
  }
}

function toggleMyHBEntrance(isAuthorize) {
  const loginBtn = document.getElementById('login');
  const regBtn = document.getElementById('register');
  const myHBBtn = document.getElementById('myHB');
  const topupBtn = document.getElementById('topup');

  if (isAuthorize) {
    loginBtn.classList.add('hide');
    regBtn.classList.add('hide');
    myHBBtn.classList.remove('hide');
    topupBtn.classList.remove('hide');
  } else {
    loginBtn.classList.remove('hide');
    myHBBtn.classList.add('hide');
    regBtn.classList.remove('hide');
    topupBtn.classList.add('hide');
  }
}

async function renderCountdown(
  currentEvent,
  {currentTimeSince, startTime},
  onfinish,
) {
  const {
    Timer,
  } = await import(/* webpackChunkName:"easytimer" */ 'easytimer.js');
  const timer = new Timer();
  const countdownEl = document.getElementById(`${currentEvent.type}_current`);
  const prefixMsg = `距离${countdownEl.getAttribute(
    'data-type',
  )}红包开始还有 <br />`;
  const newTimeSince = currentTimeSince;
  const highPrecisionTimestampSupport =
    window.performance && typeof window.performance.now === 'function';
  const addDecimal = n => (n < 10 ? `0${n}` : n);
  const currentTime = highPrecisionTimestampSupport
    ? currentTimeSince + window.performance.now()
    : newTimeSince;
  function renderCurrentCountdown() {
    function countdownComplete() {
      if (typeof onfinish === 'function') {
        onfinish(currentEvent);
      }
      countdownEl.textContent = '';
      countdownEl.classList.add('hide');
    }
    timer.start({
      countdown: true,
      startValues: {seconds: (startTime - currentTime) / 1000},
      callback: () => {
        const {days, hours, minutes, seconds} = timer.getTimeValues();
        const timeString = `${
          days > 0 ? `<span>${addDecimal(days)}</span><em></em>` : ''
        }<span>${addDecimal(
          hours,
        )}</span><em class="delim">:</em><span>${addDecimal(
          minutes,
        )}</span><em class="delim">:</em><span>${addDecimal(seconds)}</span>`;
        countdownEl.innerHTML = prefixMsg + timeString;
      },
    });
    timer.addEventListener('targetAchieved', countdownComplete);
  }
  countdownEl.classList.remove('hide');
  renderCurrentCountdown();
}

function renderDrawChance(data, type) {
  const hbChances = document.getElementById(`${type}_chances`);
  const leftChances = data.chances - data.usedChances;
  hbChances.classList.remove('hide');
  hbChances.getElementsByTagName('strong').item(0).textContent = leftChances;
}

function hideDrawChance() {
  const chancesEls = Array.from(document.querySelectorAll('[id*="_chances"]'));
  chancesEls.forEach(el => {
    el.classList.add('hide');
  });
}

function renderDrawResult(drawResult, type) {
  const popupMask = document.getElementById('popup_mask');
  const drawResultEl = document.getElementById('hb_result');
  const descriptionEl = document.getElementById('result_desc');
  const leftChanceEl = document.getElementById('chances_desc');
  const contBtn = document.getElementById('hb_continue');
  const leftChances =
    drawResult.hongbaoFinal.chances - drawResult.hongbaoFinal.usedChances;
  if (drawResult.hasResult) {
    popupMask.classList.add('win');
    drawResultEl.setAttribute('data-result', 'bingo');
    descriptionEl.setAttribute('data-result', 'bingo');
    descriptionEl.innerHTML = `<strong>${
      drawResult.winAmount
    }<span>元</span></strong>`;
  } else {
    popupMask.classList.remove('win');
    drawResultEl.setAttribute('data-result', 'fail');
    descriptionEl.setAttribute('data-result', 'fail');
    descriptionEl.textContent = '再接再厉';
  }
  leftChanceEl.textContent = `您还有 ${leftChances} 次抢红包机会哦`;

  contBtn.disabled = leftChances === 0;
  contBtn.setAttribute('data-hbtype', type);

  if (leftChances === 0) contBtn.classList.add('hide');
  else contBtn.classList.remove('hide');
}

function renderEventPlaceholder(display) {
  const eventEl = document.getElementById('event');
  const eventDetailsEl = document.getElementById('event-details');

  eventEl.setAttribute('data-off', display);

  if (display) eventDetailsEl.classList.add('hide');
  else eventDetailsEl.classList.remove('hide');
}

function renderHbRuleBtn(data) {
  data.forEach(dat => {
    if (dat) {
      const ruleBtn = document.getElementById(`${dat.type}_rule`);
      ruleBtn.href = dat.url;
    }
  });
}

async function renderHBBtn(type, disqualify = false) {
  const hbBtn = document.getElementById(type);
  const src = hbBtn.getAttribute('data-src');

  renderHBPlaceholder(false);

  if (src) {
    // require.context does not support variable. https://github.com/webpack/webpack/issues/4772#issuecomment-296798125
    // so have to do it manually for each hb - not ideal solution
    let images;

    switch (src) {
      case 'fl_hb.png':
        images = importFiles(
          require.context('hb_assets/images/web/', false, /fl_hb.png$/),
        );
        break;
      case 'yq_hb.png':
        images = importFiles(
          require.context('hb_assets/images/web/', false, /yq_hb.png$/),
        );
        break;
      default:
        break;
    }
    hbBtn.removeAttribute('data-src');
    hbBtn.src = images[src];
  }

  hbBtn.classList.remove('hide');

  if (disqualify) hbBtn.setAttribute('data-disqualify', true);
}

function hideHBBtn() {
  const HBs = document.getElementsByClassName('hongbao-btn');
  const HBsArray = Array.from(HBs);
  HBsArray.forEach(HB => {
    HB.classList.add('hide');
  });
}

async function renderHBDraw({accessToken, deviceToken}, hb) {
  if (accessToken) {
    const {data = {}, err: error} = await request.fetchHBQuota(
      accessToken,
      deviceToken,
    );

    if (error) onError(error);

    const quota = data.dataAvailable && data[hb.type];
    if (quota) renderDrawChance(quota, hb.type);

    renderHBBtn(hb.type, !quota);
  }

  setTimeout(() => {
    onEventEnd({accessToken, deviceToken}, hb);
  }, timeString2ms(hb.hongbaoEndTime) - getCurrentTime(hb).currentTime);
}

function renderHBPlaceholder(display = true) {
  const placeholderEl = document.querySelector(
    '[data-placeholder="hongbao-row"]',
  );

  renderEventPlaceholder(false);

  if (display) {
    hideHBBtn();
    if (placeholderEl) placeholderEl.classList.remove('hide');
    else {
      const imgEl = document.createElement('img');
      // const hbPlaceholderEl = document.getElementsByClassName('hongbao-row');
      // const images = importFiles(
      //   require.context('../assets/images/web/', false, /renwu.png$/),
      // );
      // imgEl.src = images['renwu.png'];
      // imgEl.classList.add('hb-empty');
      imgEl.setAttribute('data-placeholder', 'hongbao-row');
      // hbPlaceholderEl.item(0).insertAdjacentElement('afterbegin', imgEl);
    }
  } else if (placeholderEl) placeholderEl.classList.add('hide');
}

function renderRanking(rankEl, dataLength) {
  const docFragment = document.createDocumentFragment();
  const upperOl = document.createElement('table');
  const lowerOl = document.createElement('table');
  let rankIndex = 0;

  upperOl.classList.add('hb_resultRank');
  upperOl.classList.add('top_three');
  lowerOl.classList.add('hb_resultRank');
  lowerOl.start = dataLength / 2;
  docFragment.appendChild(upperOl);
  docFragment.appendChild(lowerOl);

  while (rankEl.lastChild) {
    rankEl.removeChild(rankEl.lastChild);
  }

  const tableHead = document.createElement('thead');
  ['排名', '账号', '红包类型', '金额'].forEach(title => {
    const th = document.createElement('th');
    th.textContent = title;
    tableHead.appendChild(th);
  });

  upperOl.appendChild(tableHead.cloneNode(true));

  if (window.matchMedia('(min-width: 780px)').matches)
    lowerOl.appendChild(tableHead.cloneNode(true));

  return function render(data) {
    const tr = document.createElement('tr');
    const rankTd = document.createElement('td');
    const nameTd = document.createElement('td');
    const hbTypeTd = document.createElement('td');
    const amountTd = document.createElement('td');
    const rankSpan = document.createElement('span');
    rankSpan.textContent = data.rank;
    rankSpan.classList.add('rank');
    nameTd.textContent = data.usernameMask;
    nameTd.classList.add('ellipsis');
    nameTd.setAttribute('data-size', '25');
    hbTypeTd.textContent = data.hongbaoType;
    amountTd.textContent = data.amount;

    if (rankIndex < dataLength / 2) upperOl.appendChild(tr);
    else lowerOl.appendChild(tr);
    tr.appendChild(rankTd);
    tr.appendChild(nameTd);
    tr.appendChild(hbTypeTd);
    tr.appendChild(amountTd);
    rankTd.appendChild(rankSpan);

    if (rankIndex === dataLength - 1) rankEl.appendChild(docFragment);
    rankIndex++;
  };
}

async function draw({currentTarget}) {
  const drawResulEl = document.getElementById('drawResult');
  const type = currentTarget.getAttribute('data-hbtype');
  const {accessToken, deviceToken} = this; // eslint-disable-line babel/no-invalid-this
  // not sure might as well skipping this when out of draw chances
  let {data: quota = {}, err: error} = await request.fetchHBQuota(
    accessToken,
    deviceToken,
  );
  const hb = quota[targetEl[type]];

  drawResulEl.classList.add('hide');

  if (!error && hb) {
    // skip unnecessary call
    if (hb.chances - hb.usedChances <= 0) {
      informUser(message.OUT_OF_HB, 'alert', 'OUT_OF_HB');
      return;
    }
    // skip unnecessary call

    const {data, err} = await request.fetchHBDraw(
      accessToken,
      deviceToken,
      type,
    );
    error = err;

    if (!err) {
      drawResulEl.classList.remove('hide');
      renderDrawResult(data, type);
      renderDrawChance(data.hongbaoFinal, targetEl[type]);
    }
  } else hideDrawChance();

  // 不处理没资格抢红包事件
  if (error && error.statusCode !== '400') onError(error);
}

// due to the webpack build insert'use strict' directive for module prior babel transformation
// nodent which used by fast-async will raise function block scope hoisting syntax error
// reference to https://github.com/MatAtBread/nodent/issues/22#issuecomment-270866643 for description
async function displayEvtStatusQuo({accessToken, deviceToken}, data) {
  const {flHongbao, tjHongbao} = data;
  const noHongbao = {type: 'noHongbao'};

  if (flHongbao) {
    flHongbao.type = 'flHongbao';
    noHongbao.url = flHongbao.url;
  }
  if (tjHongbao) {
    tjHongbao.type = 'tjHongbao';
    noHongbao.url = tjHongbao.url;
  }

  const eventStatus = [flHongbao, tjHongbao].map(getEventStatus);
  let pendingEvent = eventStatus.length;

  [flHongbao, tjHongbao].forEach((hbDateTime, index) => {
    if (hbDateTime) {
      const {isEventOngoing, isPostEvent} = eventStatus[index];

      if (isEventOngoing) {
        --pendingEvent;
        renderHBDraw({accessToken, deviceToken}, hbDateTime);
      } else if (!isPostEvent) {
        initCountdown({accessToken, deviceToken}, hbDateTime);
      }
    } else --pendingEvent;
  });

  if (pendingEvent) renderHBPlaceholder();
  renderHbRuleBtn([flHongbao, tjHongbao, noHongbao]);

  if (accessToken) {
    const hbRank = await request.fetchHBRank(accessToken, deviceToken);
    updateRanking(hbRank);
  } else updateRanking();
}

function handleCurrentEvent(accessToken, deviceToken) {
  return function handling({data, err}) {
    if (err) onError(err, true);
    else if (data.display) {
      displayEvtStatusQuo({accessToken, deviceToken}, data);
    } else renderEventPlaceholder(true);
  };
}

function prepareRedirect(event) {
  event.preventDefault();

  const query = `${referrer}${
    !subPathName.isWAP ? `?redirectFrom=${window.location.pathname}` : ''
  }${subPathName.login}`;
  window.location.replace(query);
}

function updateRanking({data, err} = {}) {
  const parentEl = document.getElementById('rank');
  const rankEl = document.getElementById('rank_content');

  if (err) onError(err);
  else if (data) {
    const refreshRankingDom = renderRanking(rankEl, data.length);

    parentEl.classList.remove('hide');
    data.forEach(refreshRankingDom);
    return true;
  }

  parentEl.classList.add('hide');

  return false;
}

function hideRankingList() {
  const parentEl = document.getElementById('rank');
  const rankEl = document.getElementById('rank_content');

  parentEl.classList.add('hide');

  while (rankEl.lastChild) {
    rankEl.removeChild(rankEl.lastChild);
  }
}

export default handleUnauthorize;
