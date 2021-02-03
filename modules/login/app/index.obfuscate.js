import 'polyfill/origin';
import debounce from 'debounce';
import fingerprint from 'helper/fingerprint';
import request from 'moduleUtils/request';
import * as API from 'moduleUtils/API';
import * as Msg from 'moduleUtils/Message';
import siteInfo from 'moduleUtils/getSiteInfo';
import {withInitEncry} from 'moduleUtils/getSystemsApi';
import findSearchText from 'moduleUtils/findSearchText';
import {encodePassword, awaitHash} from 'moduleUtils/concealed.min';
import gtInfo from '../../utils/getGteInfo';
import encryptGeetest from '../../utils/encryptGeetest';
import './style.less';
import '../../utils/gt';
// 测试
const acquireDeviceToken = new Promise(resolve => {
  const token = findSearchText('registerId');
  const appVersion = findSearchText('appVersion');
  if (appVersion) {
    sessionStorage.setItem('appVersionData', appVersion);
  }
  if (token) {
    resolve(token);
  } else if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      fingerprint(resolve);
    });
  } else {
    setTimeout(() => {
      fingerprint(resolve);
    }, 100);
  }
});

function getOrigin() {
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : window.location.origin;
}

async function getValidatePic() {
  const validateInput = document.getElementById('validateCode');
  validateInput.removeEventListener('focus', initValidateCode);
  validateInput.removeEventListener('touchstart', initValidateCode);
  const deviceToken = await acquireDeviceToken;

  if (deviceToken) {
    try {
      const response = await fetch(`${API.GET_VALIDATE_PIC}${deviceToken}`, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
          Accept: 'image/*, image/png, image/jpeg',
          device_token: deviceToken,
        },
      });

      if (response.status >= 200 && response.status < 400) {
        const data = await response.blob();
        const validatePic = document.getElementById('validatePic');
        const imgSrc = URL.createObjectURL(data);
        validatePic.src = imgSrc;
        validatePic.style.display = 'inline-block';
        validatePic.style.borderWidth = 0;
      } else {
        tellUser({
          msg: Msg.INVALID_VERIFICATION_CODE,
          type: 'err',
        });
      }
    } catch (err) {
      tellUser({
        msg: err,
        type: 'err',
      });
    }
  }
}

function postLogin(submission) {
  const gtObjData = JSON.parse(localStorage.getItem('gtData'));
  const loginAuthwayData = localStorage.getItem('loginAuthWay');
  const deviceToken = submission.webUniqueCode;
  let apiAdress, bodyConten, geeTest;
  geeTest = encryptGeetest(deviceToken);
  if (loginAuthwayData === 'GEETEST') {
    apiAdress = API.GT_LOGIN_USER;
    bodyConten = {
      ...submission,
      ...gtObjData,
    };
  } else {
    apiAdress = API.LOGIN_USER;
    bodyConten = submission;
  }
  return request(`${apiAdress}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      device_token: submission.webUniqueCode,
      ...geeTest,
    },
    body: JSON.stringify(bodyConten),
  }).then(({data, err}) => {
    if (
      (data && data.status === 428) ||
      (data && Object.keys(data).length <= 2)
    ) {
      return {error: '服务异常，请重新刷新登录页面'};
    }
    if (err) {
      if (err.message.includes('Failed to fetch')) {
        return {error: '等待验证，请稍后再试！'};
      }
      return {error: err.message};
    }
    localStorage.setItem('username', submission.username);
    window.parent.postMessage(
      JSON.stringify({
        action: 'login_success',
        payload: data,
        commId: submission.password,
      }),
      getOrigin(),
    );
    localStorage.setItem('commissionMode', data.commissionMode);

    return {data};
  });
}

async function compileSubmission(validateInfo) {
  const submission = Object.assign({}, validateInfo);
  const deviceToken = await acquireDeviceToken;
  const appVersion = sessionStorage.getItem('appVersionData');
  // sessionStorage.removeItem('appVersionData');
  if (deviceToken) {
    const encodedPassword = encodePassword(submission.password);
    const hash = await awaitHash({
      username: submission.username,
      password: submission.password,
      doubleHash: deviceToken,
    });
    submission.hash = hash;
    submission.password = encodedPassword;
    submission.webUniqueCode = deviceToken;
    submission.appVersion = appVersion;

    return submission;
  }
}

function inputValidation(checkAll) {
  const messageContainer = document.getElementById('err-msg');
  const targets1 = document.querySelectorAll('.form-input[required]');
  const messages = {};
  let showtargets = [];
  const loginAuthway = localStorage.getItem('loginAuthWay');
  if (loginAuthway === 'GEETEST') {
    showtargets = Array.from(targets1).slice(0, 2);
  } else {
    showtargets = Array.from(targets1);
  }
  messageContainer.addEventListener('click', () => {
    hideMsg(messageContainer);
  });
  const validate = function validate(inputEl) {
    const {value, name, id, required} = inputEl;
    const hint = inputEl.getAttribute('data-hint');
    // eslint-disable-next-line
    const targets = document.querySelector(`#${id}Label`);
    if (value) {
      const validity = isValid(inputEl);
      if (!validity) {
        messages[id] = `${name}${Msg.VERIFICATION_FAIL}，${hint}`;
        targets.style.border = '1px solid #cb3f53';
      } else {
        targets.style.border = 'none';
        delete messages[id];
      }
    } else if (!value && required) {
      messages[id] = `${name}是${Msg.VALUE_REQUIRED}`;
      targets.style.border = '1px solid #cb3f53';
    }
    tellUser({msgMap: messages, type: 'err'});
  };
  showtargets.forEach(target => {
    if (checkAll) {
      validate(target);
    } else {
      target.addEventListener(
        'input',
        debounce(() => {
          validate(target);
        }, 1000),
      );
    }
  });
  return [messages, Object.keys(messages).length < 1];
}

function validateForm() {
  const [msgMap, validForm] = inputValidation(true);
  if (validForm) {
    const targets = document.querySelectorAll('.form-input');
    let targetsArr = [];
    const loginAuthway = localStorage.getItem('loginAuthWay');
    if (loginAuthway === 'GEETEST') {
      targetsArr = Array.from(targets).slice(0, 2);
    } else {
      targetsArr = Array.from(targets);
    }
    const body = {};
    body.options = {};
    targetsArr.forEach(target => {
      let {value} = target;
      const {id} = target;
      const isOptional = target.getAttribute('data-optional') === 'true';
      if (value.trim) value = value.trim();
      if (isOptional) {
        body.options[id] = value;
      } else {
        body[id] = value;
      }
    });
    return [null, body];
  }
  return [msgMap, null];
}

function togglePassword(toggleBtn) {
  const passwordInput = document.getElementById('password');

  if (passwordInput.type === 'password') {
    toggleBtn.setAttribute('data-active', true);
    passwordInput.type = 'text';
  } else {
    toggleBtn.setAttribute('data-active', false);
    passwordInput.type = 'password';
  }
}

function isValid(inputEl) {
  const {id, value} = inputEl;
  if (id === 'affCode' && !value) return true;

  const pattern = inputEl.getAttribute('pattern');
  const reg = new RegExp(pattern);
  const validatePassed = reg.test(value);
  return validatePassed;
}

function hideMsg(target) {
  const el = target;
  el.setAttribute('data-show', false);
  el.style.display = 'none';
  el.textContent = '';
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function tellUser({countdown, msg, msgMap, type}) {
  let message = [];
  if (msg) {
    message = [msg];
  } else {
    Object.values(msgMap).forEach(msgItem => {
      const span = document.createElement('span');
      span.textContent = msgItem;
      message.push(span);
    });
  }

  const messageDiv = document.getElementById(`${type}-msg`);
  while (messageDiv.hasChildNodes()) {
    messageDiv.removeChild(messageDiv.lastChild);
  }
  if (!message || message.length === 0) hideMsg(messageDiv);
  else {
    message.forEach(mssg => {
      const isNodeType = mssg.nodeType === Node.ELEMENT_NODE;
      if (!isNodeType) {
        const span = document.createElement('span');
        span.textContent = mssg;
        messageDiv.appendChild(span);
      } else messageDiv.appendChild(mssg);
    });
    messageDiv.style.display = 'block';
    messageDiv.setAttribute('data-show', true);

    if (countdown) {
      setTimeout(() => {
        hideMsg(messageDiv);
      }, countdown);
    }
  }
}

function initValidateCode() {
  const validateInput = document.getElementById('validateCode');
  validateInput.value = '';
  getValidatePic();
}

function watchPasswordToggle() {
  const toggleBtn = document.getElementById('password-toggle');
  toggleBtn.addEventListener('click', () => {
    togglePassword(toggleBtn);
  });
}

function watchRegisterBtn() {
  const {search} = window.location;
  const toggleBtn = document.getElementById('register-toggle');
  const direction = `/register/${search}`;
  const action = 'to_register';

  toggleBtn.addEventListener('click', () => {
    window.parent.postMessage(
      JSON.stringify({
        action,
      }),
      getOrigin(),
    );
    window.location.href = direction;
  });
}
function watchGuestRegisterBtn() {
  const {search} = window.location;
  const toggleBtn = document.getElementById('guest-register-toggle');

  if (toggleBtn) {
    const direction = `/register/guest/${search}`;
    const action = 'to_guest_register';

    toggleBtn.addEventListener('click', () => {
      window.parent.postMessage(
        JSON.stringify({
          action,
        }),
        getOrigin(),
      );
      window.location.href = direction;
    });
  }
}

function watchValidatePic() {
  const validatePic = document.getElementById('validatePic');
  validatePic.addEventListener('click', initValidateCode);
}

function watchValidateInput() {
  // 优化验证码
  // const validateInput = document.getElementById('validateCode');
  // validateInput.addEventListener('focus', initValidateCode);
  // validateInput.addEventListener('touchstart', initValidateCode);
  getValidatePic();
}

function watchEnter() {
  const regForm = document.getElementById('login-form');
  const inputs = regForm.getElementsByTagName('input');
  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index];
    input.addEventListener('keypress', e => {
      const key = e.which || e.keyCode;
      if (key === 13) {
        e.target.blur();
        onSubmit();
      }
    });
  }
}
// 事件委托
let geeTestTipFunction = function() {
  tellUser({
    msg: '等待验证，请稍后再试！',
    type: 'err',
  });
};

async function intiGt() {
  const deviceToken = await acquireDeviceToken;
  const {challenge, gt, success} = await gtInfo(deviceToken);
  /* global initGeetest:true */
  initGeetest(
    {
      gt,
      challenge,
      offline: !success,
      new_captcha: true,
      product: 'bind',
    },
    captchaObj => {
      captchaObj.onReady(function() {
        // 验证码ready之后才能调用verify方法显示验证码
        geeTestTipFunction = function() {
          captchaObj.verify();
        };
      });
      captchaObj.onSuccess(() => {
        const resultInfo = captchaObj.getValidate();
        localStorage.setItem('gtData', JSON.stringify(resultInfo));
        const geets = 'Getest';
        const [err] = validateForm();
        if (err) {
          tellUser({
            msgMap: err,
            type: 'err',
          });
          captchaObj.reset();
        } else {
          captchaObj.reset();
          onSubmit(geets);
        }
      });
    },
  );
}

function watchSubmitBtn() {
  const submitBtn = document.getElementById('submit');
  submitBtn.addEventListener('click', () => {
    onSubmit();
  });
}

function onSubmit(geets) {
  const gt = geets || 'okGetest';
  const regForm = document.getElementById('login-form');
  const [err, testResult] = validateForm();
  const loginAuthway = localStorage.getItem('loginAuthWay');
  if (err) {
    tellUser({
      msgMap: err,
      type: 'err',
    });
    if (loginAuthway !== 'GEETEST') {
      initValidateCode();
    }
  } else if (testResult) {
    if (gt === 'okGetest' && loginAuthway === 'GEETEST') {
      geeTestTipFunction();
    } else {
      const {username, password} = testResult;
      if (!/^.{4,12}$/.test(username)) {
        const error = '用户名由数字和字母组成，长度在4-11位之间';
        return tellUser({
          msg: error,
          type: 'err',
        });
      }
      if (!/^.{6,16}$/.test(password)) {
        const error = '密码不能包含中文和空白符,长度在6-15之间';
        return tellUser({
          msg: error,
          type: 'err',
        });
      }
      return compileSubmission(testResult)
        .then(postLogin)
        .then(({data, error}) => {
          if (error) {
            initValidateCode();
            return tellUser({
              msg: error,
              type: 'err',
            });
          }

          tellUser({
            countdown: 3000,
            msg: Msg.LOGIN_SUCCESS,
            type: 'success',
          });
          regForm.reset();
          return data;
        });
    }
  }
}

function getDocHeight() {
  const height = 475;

  if (height) {
    window.parent.postMessage(
      JSON.stringify({
        action: 'set_height',
        payload: Math.round(height),
      }),
      getOrigin(),
    );
  }
}
async function toggleGuestRegisterAvailability() {
  const toggleBtn = document.getElementById('guest-register-toggle');
  if (toggleBtn) {
    const {
      otherSettings: {paySwitch},
    } = await siteInfo;

    toggleBtn.setAttribute('hidden', !paySwitch);
  }
}
async function setSiteInfo() {
  const siteNameEl = document.getElementById('siteName');
  const validationNameEl = document.getElementById('validateCodeLabel');

  const deviceToken = await acquireDeviceToken;
  if (deviceToken) {
    localStorage.setItem('appDeviceToken', deviceToken);
  }
  const initencry = await withInitEncry(API.INITENCRY);
  localStorage.setItem('appEncryptionData', initencry);
  const {
    pcOtherInfo: {siteName},
    otherSettings: {loginAuth},
  } = await siteInfo;
  if (loginAuth === 'GEETEST') {
    localStorage.setItem('loginAuthWay', loginAuth);
    intiGt();
  } else {
    validationNameEl.setAttribute('style', 'display: block !important');
    localStorage.removeItem('loginAuthWay');
    localStorage.removeItem('gtData');
  }
  siteNameEl.textContent = siteName;
}

document.addEventListener('DOMContentLoaded', function ready() {
  const usernameInput = document.getElementById('username');
  const cacheUsername = localStorage.getItem('username');
  if (usernameInput && cacheUsername) {
    usernameInput.value = cacheUsername;
  }
  toggleGuestRegisterAvailability();
  setSiteInfo();
  watchPasswordToggle();
  watchRegisterBtn();
  watchGuestRegisterBtn();
  watchValidateInput();
  watchValidatePic();
  inputValidation(false);
  watchSubmitBtn();
  getDocHeight();
  watchEnter();
});
