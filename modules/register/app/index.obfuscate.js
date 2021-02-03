import 'polyfill/origin';
import debounce from 'debounce';

import fingerprint from 'helper/fingerprint';
import PhotoHelper from 'helper/PhotoHelper.min';
import request from 'moduleUtils/request';
import * as API from 'moduleUtils/API';
import * as Msg from 'moduleUtils/Message';
import siteInfo from 'moduleUtils/getSiteInfo';
import {withInitEncry} from 'moduleUtils/getSystemsApi';
import findSearchText from 'moduleUtils/findSearchText';
import './style.less';
import gtInfo from '../../utils/getGteInfo';
import '../../utils/gt';
import encryptGeetest from '../../utils/encryptGeetest';

const acquireDeviceToken = new Promise(resolve => {
  const token = findSearchText('registerId');
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

function getGuestUsername() {
  return fetch(API.PRE_REGISTER_GUEST, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
  })
    .then(response => {
      if (response.status >= 200 && response.status < 400) {
        return response.json();
      }
      setTimeout(getGuestUsername, 10000);
      throw new Error(Msg.GUEST_ACCOUNT_FAIL);
    })
    .then(data => {
      const inputEl = document.getElementById('username');
      inputEl.value = data.username;
      return inputEl;
    })
    .catch(err => {
      tellUser({
        msg: err,
        type: 'err',
      });
    });
}

function findInviteCode() {
  const permalinkText = findSearchText('pt');
  const affcodeValue = findSearchText('app');
  const affcode = document.querySelector("label[for='affCode']");
  const affcodeInput = document.getElementById('affCode');
  if (affcodeValue || permalinkText) {
    affcode.style.display = 'none';
    affcodeInput.disabled = true;
    affcodeInput.value = affcodeValue || permalinkText;
  }
}

function postRegistration({submission}) {
  const {isGuest} = window;
  const {payload, deviceToken, commId, registrationId} = submission;
  const registerAuthWay = localStorage.getItem('registerAuthWay');
  let requestUrl, body, geeTest;
  geeTest = encryptGeetest(deviceToken);
  if (isGuest) {
    requestUrl = API.REGISTER_NEW_GUEST;
    body = `{"payload":"${payload}","registrationId":"${registrationId}"}`;
  } else if (registerAuthWay === 'GEETEST') {
    requestUrl = API.REGISTER_NEW_USER2;
    body = `{"payload":"${payload}","registrationId":"${registrationId}"}`;
  } else {
    requestUrl = API.REGISTER_NEW_USER;
    body = `{"payload":"${payload}","registrationId":"${registrationId}"}`;
  }
  return request(requestUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      device_token: deviceToken,
      ...geeTest,
    },
    body,
  }).then(({data, err}) => {
    if (
      (data && data.status === 428) ||
      (data && Object.keys(data).length <= 2)
    ) {
      return {error: '服务异常，请重新刷新注册页面'};
    }
    if (err) {
      if (err.message === Msg.INVALID_INVITE_CODE) {
        const affcode = document.querySelector("label[for='affCode']");
        const affcodeInput = document.getElementById('affCode');
        affcode.style.display = 'block';
        affcodeInput.disabled = false;
        affcodeInput.value = '';
      }

      if (err.message.includes('Failed to fetch')) {
        return {error: '等待验证，请稍后再试！'};
      }
      return {error: err.message};
    }
    window.parent.postMessage(
      JSON.stringify({
        action: 'register_success',
        payload: data,
        commId: isGuest ? commId : '',
        isGuest,
      }),
      getOrigin(),
    );

    localStorage.setItem('commissionMode', data.commissionMode);
    return {data};
  });
}

async function compileSubmission(validateInfo) {
  const gtObjData = JSON.parse(localStorage.getItem('registerGtData'));
  let submission = Object.assign({}, validateInfo, gtObjData);
  const pic = new PhotoHelper();
  const deviceToken = await acquireDeviceToken;

  if (deviceToken) {
    const tmpToken = deviceToken;
    const userRequestTimeMillis = new Date().getTime();
    const registrationInfo = JSON.stringify({
      userRequestTimeMillis,
      deviceToken,
    });
    const payload = pic.rotatePhoto(deviceToken, registrationInfo);

    return request(API.CALIBRATE, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        device_token: tmpToken,
      },
      body: `{"payload":"${payload}"}`,
    }).then(({data, err}) => {
      if (data) {
        const {registrationId, key, calibrationId} = data;
        const submitTime = new Date().getTime();
        const commId = submission.password;
        submission.registrationId = registrationId;
        submission.calibrationPayload = key;
        submission.submitTime = submitTime;
        submission.wap = false;
        submission.webUniqueCode = tmpToken;
        submission = JSON.stringify(submission);
        const zoomPhoto = pic.zoomPhoto(calibrationId, submission).toString();
        return {
          payload: zoomPhoto,
          deviceToken: tmpToken,
          commId,
          registrationId,
        };
      }
      throw new Error(err.message || Msg.REGISTER_CHANNEL_FAIL);
    });
  }
}

function inputValidation(checkAll) {
  const messageContainer = document.getElementById('err-msg');
  const targets = document.querySelectorAll('.form-input[required]');

  const registerAuthWay = localStorage.getItem('registerAuthWay');
  const messages = {};

  messageContainer.addEventListener('click', () => {
    hideMsg(messageContainer);
  });
  const validate = function validate(inputEl) {
    const {value, name, id, required} = inputEl;
    const hint = inputEl.getAttribute('data-hint');
    // eslint-disable-next-line
    const targets = document.querySelector(`#${id}Label`);
    const regForm = document.getElementById('register-form');
    const isGuest = regForm.getAttribute('data-is-guest');
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
  Array.from(targets).forEach(target => {
    const {id} = target;
    if (checkAll) {
      if (registerAuthWay === 'GEETEST' && id === 'validateCode' && !isGuest) {
        target.parentNode.removeChild(target);
      } else {
        validate(target);
      }
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
  const {isGuest} = window;
  const userAgreed = isGuest
    ? true
    : document.getElementById('agreement').checked;

  if (!userAgreed) {
    return [[Msg.AGREEMENT_CONSENT_REQUIRED]];
  }
  const [msgMap, validForm] = inputValidation(true);
  if (validForm) {
    const targets = document.querySelectorAll('.form-input');
    const body = {};
    body.options = {};
    Array.from(targets).forEach(target => {
      let {value} = target;
      const {id} = target;
      const isOptional = target.getAttribute('data-optional') === 'true';
      if (value.trim) value = value.trim();
      if (isOptional) {
        body.options[id] = value;
      } else if (id !== 'repeatPassword') body[id] = value;
    });
    return [null, body];
  }
  return [msgMap, null];
}

function togglePassword(toggleBtn) {
  const passwordInput = document.getElementById('password');
  const repeatPasswordInput = document.getElementById('repeatPassword');
  if (passwordInput.type === 'password') {
    toggleBtn.setAttribute('data-active', true);
    passwordInput.type = 'text';
    if (repeatPasswordInput) repeatPasswordInput.type = 'text';
  } else {
    toggleBtn.setAttribute('data-active', false);
    passwordInput.type = 'password';
    if (repeatPasswordInput) repeatPasswordInput.type = 'password';
  }
}

function isValid(inputEl) {
  const {id, value} = inputEl;
  if (id === 'affCode' && !value) return true;
  if (id === 'repeatPassword') {
    const password = document.getElementById('password');
    return password && value === password.value;
  }

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

function watchToLoginBtn() {
  const toLoginBtn = document.querySelector('a.form-returnBtn'); //
  const {search} = window.location;

  toLoginBtn.addEventListener('click', () => {
    window.parent.postMessage(
      JSON.stringify({
        action: 'to_login',
      }),
      getOrigin(),
    );
    window.location.href = `/login/${search}`;
  });
}

async function watchToAgreementBtn() {
  const toAgreementBtn = document.getElementById('agreement-link');
  const {generalContents} = await siteInfo;
  const generalContent = generalContents.find(({type}) => type === 'PROTOCOL');

  if (toAgreementBtn && generalContent && generalContent.contentUrl) {
    toAgreementBtn.addEventListener('click', () => {
      window.parent.postMessage(
        JSON.stringify({
          action: 'to_agreement',
        }),
        getOrigin(),
      );
      window.open(decodeURIComponent(generalContent.contentUrl));
    });
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

// 事件委托
let geeTestTipFunction = function() {
  tellUser({
    msg: '等待验证，请稍后再试！',
    type: 'err',
  });
};

function watchRegisterToggle() {
  const {search, pathname} = window.location;
  const toggleBtn = document.getElementById('register-toggle');

  if (toggleBtn) {
    let direction = `/register/guest/${search}`;
    let action = 'to_guest_register';
    if (pathname.indexOf('guest') > -1) {
      direction = `/register/${search}`;
      action = 'to_register';
    }
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
  // const validateInput = document.getElementById('validateCode');
  // validateInput.addEventListener('focus', initValidateCode);
  // validateInput.addEventListener('touchstart', initValidateCode);

  getValidatePic();
}

function watchEnter() {
  const regForm = document.getElementById('register-form');
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

function watchSubmitBtn() {
  const submitBtn = document.getElementById('submit');
  submitBtn.addEventListener('click', () => {
    onSubmit();
  });
}

function onSubmit(geets) {
  const gt = geets || 'okGetest';
  const regForm = document.getElementById('register-form');
  const isGuest = regForm.getAttribute('data-is-guest');
  const registerAuthway = localStorage.getItem('registerAuthWay');
  const [err, testResult] = validateForm();
  if (err) {
    tellUser({
      msgMap: err,
      type: 'err',
    });
    if (registerAuthway !== 'GEETEST') {
      initValidateCode();
    }
  } else if (testResult) {
    if (gt === 'okGetest' && registerAuthway === 'GEETEST' && !isGuest) {
      geeTestTipFunction();
    } else {
      return compileSubmission(testResult)
        .then(submission =>
          postRegistration({
            submission,
          }),
        )
        .then(({data, error}) => {
          if (error) {
            if (registerAuthway !== 'GEETEST') {
              initValidateCode();
            }
            return tellUser({
              msg: error,
              type: 'err',
            });
          }

          tellUser({
            countdown: 3000,
            msg: Msg.REGISTER_SUCCESS,
            type: 'success',
          });
          regForm.reset();
          return data;
        });
    }
  }
}

function getDocHeight() {
  const {isGuest} = window;
  let height = 563;
  if (isGuest) height = 405;
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

function setRequiredInfo() {
  const {isGuest} = window;
  if (isGuest) return null;
  return fetch(API.REGISTRY_SWITCHS, {
    method: 'get',
    headers: {
      'content-type': 'application/json',
    },
  })
    .then(response => {
      if (response.status >= 200 && response.status < 400) {
        return response.json();
      }
      setTimeout(setRequiredInfo, 10000);
      throw new Error(Msg.REGISTERATION_INFO_FAIL);
    })
    .then(data => {
      const container = document.querySelector('#register-form');
      const sortableItems = [];
      if (data && data.length) {
        data.forEach(info => {
          const {key, required, regex, displayed, hint, queue} = info;
          const labelEl = document.querySelector(`label[for="${key}"]`);
          labelEl.queue = queue;
          sortableItems.push(labelEl);
          labelEl.setAttribute('data-required', required);
          labelEl.setAttribute('data-displayed', displayed);

          const inputEl = document.getElementById(key);
          inputEl.setAttribute('pattern', regex);
          inputEl.setAttribute('placeholder', hint);
          inputEl.setAttribute('data-optional', 'true');

          if (required) inputEl.setAttribute('required', required);
        });

        sortableItems.sort((a, b) => (a.queue > b.queue ? 1 : -1));
        sortableItems.forEach(item => {
          container.appendChild(item);
        });
        return sortableItems;
      }
      return null;
    })
    .catch(err => {
      tellUser({
        msg: err,
        type: 'err',
      });
    });
}
async function toggleGuestRegisterAvailability() {
  const toggleBtn = document.getElementById('register-toggle');

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
  const {
    pcOtherInfo: {siteName},
    otherSettings: {registerAuth},
  } = await siteInfo;
  const deviceToken = await acquireDeviceToken;
  if (deviceToken) {
    localStorage.setItem('appDeviceToken', deviceToken);
  }
  const initencry = await withInitEncry(API.INITENCRY);
  localStorage.setItem('appEncryptionData', initencry);
  // 如果开启GEETEST验证
  if (registerAuth === 'GEETEST') {
    localStorage.setItem('registerAuthWay', registerAuth);
    intiGt();
  } else {
    validationNameEl.setAttribute('style', 'display: block !important');
    localStorage.removeItem('registerAuthWay');
    localStorage.removeItem('registerGtData');
  }
  siteNameEl.textContent = siteName;
}

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
        localStorage.setItem('registerGtData', JSON.stringify(resultInfo));
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

document.addEventListener('DOMContentLoaded', function ready() {
  const regForm = document.getElementById('register-form');
  const isGuest = regForm.getAttribute('data-is-guest');
  if (isGuest === 'true') {
    window.isGuest = true;
    getGuestUsername();
  } else {
    window.isGuest = false;
    findInviteCode();
  }

  setRequiredInfo();
  toggleGuestRegisterAvailability();
  setSiteInfo();
  watchToLoginBtn();
  watchToAgreementBtn();
  watchPasswordToggle();
  watchRegisterToggle();
  watchValidateInput();
  watchValidatePic();
  inputValidation(false);
  watchSubmitBtn();
  getDocHeight();
  watchEnter();
});
