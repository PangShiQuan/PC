import {
  pick,
  lowerFirst,
  mapValues,
  replace,
  split,
  join,
  round,
  toNumber,
} from 'lodash';
import {delay} from 'dva/saga';
import {message} from 'antd';
import {type as TYPE, validate, API, logTranslate} from 'utils';
import {apiRequest as request} from 'services';

const {inputFieldRefs} = TYPE;
const INITIAL_STATE = {
  affCode: {value: ''},
  affCodeStatus: {value: 'ON'},
  affCodeUrl: {value: ''},
  bankAccountName: {value: ''},
  aliPayCardNo: {value: ''},
  aliPayName: {value: ''},
  aliPayCardNoName: {value: ''},
  bankAddress: {value: ''},
  newPasswordFormatFlag: false,
  bankCardNo: {value: ''},
  bankCode: {value: ''},
  bankName: {value: ''},
  bankValue: {value: ''},
  cardNo: {value: ''},
  cardType: {value: ''},
  charge: {value: ''},
  email: {value: ''},
  feedbackContent: {value: ''},
  feedbackTitle: {value: ''},
  fixedAmount: '',
  generatedVarifyCode: '',
  identityNumber: {value: ''},
  isErrorShowing: false,
  maxAmount: 100000,
  memberType: 'AGENT',
  minAmount: 1,
  mobileNo: {value: ''},
  newPassword: {value: ''},
  nickname: {value: ''},
  password: {value: ''},
  phoneNumber: {value: ''},
  prizeGroup: {value: 1800},
  QQ: {value: ''},
  realName: {value: ''},
  receiptName: {value: ''},
  remarks: {value: ''},
  repeatNewPassword: {value: ''},
  repeatPassword: {value: ''},
  repeatSecurityPassword: {value: ''},
  responseMsg: {msg: '', color: '', icon: ''},
  securityMode: TYPE.PASSWORD,
  securityPassword: {value: ''},
  selectedBankId: '',
  topupAmount: {value: ''},
  topupCardRealname: {value: ''},
  transferAmount: {value: ''},
  transferSelectTo: '',
  transferSelectFrom: '',
  transferTopupType: {value: ''},
  userAgreed: true,
  username: {value: ''},
  validateImageSrc: '',
  varifyCode: {value: ''},
  webUniqueCode: '',
  withdrawalAmount: {value: ''},
  vcName: {value: ''},
  vcCode: {value: ''},
  vcCardNo: {value: ''},
  vcNewCardNo: {value: ''},
  vcSecurityPassword: {value: ''},
  repeatVcSecurityPassword: {value: ''},
};

export default {
  namespace: 'formModel',
  state: INITIAL_STATE,
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload};
    },
    initializeState(state, {payload}) {
      const initialState = pick(INITIAL_STATE, payload);
      return {...state, ...initialState};
    },
    toggleFormValue(state, {payload}) {
      const updates = {};
      const valid = {
        color: 'green',
        validatePassed: true,
      };
      const invalid = {
        color: 'red',
        validatePassed: false,
      };

      Object.entries(payload).forEach(([key, value]) => {
        updates[key] = {
          value,
          ...(value ? valid : invalid),
        };
      });

      return {...state, ...updates};
    },
    validateInput(state, {payload}) {
      payload.persist();
      const eventTarget = payload.target;
      const {value, name, pattern, min, max, placeholder} = eventTarget;
      let eventValue = value;
      const isChinse = /[\u3400-\u9FBF]/;
      if (name === 'bankCardNo') {
        eventValue = replace(`${value}`, /\s/g, '');
      } else if (
        name.indexOf('name') > -1 ||
        (name.indexOf('Name') > -1 && isChinse.test(eventValue))
      ) {
        eventValue = join(split(eventValue, ' '), '');
      }
      const reg = new RegExp(pattern);
      const labelName =
        inputFieldRefs[name] || eventTarget.getAttribute('data-label');
      let validatePassed = reg.test(eventValue);
      let inputMsg = placeholder;
      if (validatePassed) {
        inputMsg = `${labelName}格式正确`;
      } else {
        validatePassed = false;
        inputMsg = `${labelName}格式不正确`;
      }

      if (min && `${eventValue}`.length < min) {
        validatePassed = false;
        inputMsg = `${labelName}字数需大于${min}`;
      }
      if (max && `${eventValue}`.length > max) {
        validatePassed = false;
        inputMsg = `${labelName}字数需小于${min}`;
      }
      const result = {
        value: eventValue,
        inputMsg,
        color: validatePassed ? 'green' : 'red',
        icon: validatePassed
          ? 'checkbox-marked-circle-outline'
          : 'close-circle-outline',
        validatePassed,
      };
      return {...state, [name]: result};
    },
    validateNumberInput(state, {payload}) {
      let inputTarget = null;
      if (payload.target) {
        payload.persist();
        inputTarget = payload.target;
      } else {
        inputTarget = payload;
      }
      const {value, name, placeholder} = inputTarget;
      let {min, max} = inputTarget;
      let inputMsg = placeholder;
      let validatePassed = true;
      let eventValue = value;
      let result = {};
      if (!eventValue) {
        result = {value: '', color: 'red', validatePassed: false};
      } else {
        eventValue = round(toNumber(eventValue), 2);
        max = toNumber(max);
        min = toNumber(min);
        if (eventValue > max) {
          inputMsg = `金额必须小于${max}`;
          validatePassed = false;
        } else if (eventValue < min) {
          inputMsg = `金额必须大于${min}`;
          validatePassed = false;
        }
        if (validatePassed) {
          inputMsg = `${inputFieldRefs[name]}格式正确`;
        }
        result = {
          value: eventValue,
          inputMsg,
          color: validatePassed ? 'green' : 'red',
          icon: validatePassed
            ? 'checkbox-marked-circle-outline'
            : 'close-circle-outline',
          validatePassed,
        };
      }
      return {...state, [name]: result};
    },
    validateRepeatInput(state, {payload}) {
      payload.persist();
      const eventTarget = payload.target;
      const {name, pattern, min, max, placeholder, value} = eventTarget;
      const reg = new RegExp(pattern);
      let targetName = name.substring(6, name.length);
      targetName = lowerFirst(targetName);
      const validatePassed =
        reg.test(value) &&
        value.length >= min &&
        value.length <= max &&
        value === state[targetName].value;
      let result = {};
      let errMsg = placeholder;

      if (value !== state[targetName].value) {
        errMsg = '请重复一样的密码';
      } else if (!validatePassed) {
        errMsg = '密码格式错误';
      }
      if (validatePassed && value.length) {
        result = {
          value,
          inputMsg: `${inputFieldRefs[name]}格式正确`,
          color: 'green',
          validatePassed,
          icon: 'checkbox-marked-circle-outline',
        };
      } else {
        result = {
          value,
          inputMsg: errMsg,
          color: 'red',
          validatePassed,
          icon: 'close-circle-outline',
        };
      }
      return {...state, [name]: result};
    },
    validateInputAmount(state, {payload}) {
      payload.persist();
      const eventTarget = payload.target;
      const {value, name, pattern, min, max, placeholder} = eventTarget;
      const eventValue = value ? parseFloat(value) : '';
      const reg = new RegExp(pattern);
      const validatePassed =
        eventValue === ''
          ? false
          : reg.test(eventValue) && eventValue >= min && eventValue <= max;
      let inputMsg = placeholder;

      if (validatePassed) inputMsg = `${inputFieldRefs[name]}在限额内`;
      else if (eventValue > max) inputMsg = `${inputFieldRefs[name]}超限`;

      const result = {
        value: eventValue,
        inputMsg,
        color: validatePassed ? 'green' : 'red',
        icon: validatePassed
          ? 'checkbox-marked-circle-outline'
          : 'close-circle-outline',
        validatePassed,
      };
      return {...state, [name]: result};
    },
  },
  effects: {
    // get
    *getBasicDetails(dispatch, {put, select}) {
      const {userModel} = yield select(state => state);
      const {userData} = userModel;

      const formData = {
        realName: userData.realName || '',
        phoneNumber: userData.phoneNumber || '',
        email: userData.email || '',
        nickname: userData.nickname || '',
      };
      const payload = mapValues(formData, data => ({
        value: data,
        validatePassed: !!data,
      }));
      payload.memberType = userData.role;
      yield put({
        type: 'updateState',
        payload,
      });
    },
    *getBankCardDetails(payloadObj, {call, put, select}) {
      const {userModel} = yield select(state => state);
      const {bankAccounts = []} = userModel;
      let formValues;
      let aliObj = {};
      let bankObj = {};
      bankAccounts.map(item => {
        if (item.type === 'VIRTUAL_COIN') {
          const {bankAccountName, bankCardNo, bankName, bankCode} = item;
          formValues = {
            bankAccountName,
            vcName: bankName,
            vcCode: bankCode,
            vcCardNo: bankCardNo,
          };
        } else if (item.bankCode === 'ZHB') {
          const {bankAccountName, bankCardNo} = item;
          const aliPayCardNo = bankCardNo;
          aliObj = mapValues({bankAccountName, aliPayCardNo}, value => ({
            value,
          }));
          aliObj.bankAccountName.validatePassed = true;
        } else {
          const {
            bankAccountName = '',
            bankAddress = '',
            bankCardNo = '',
            bankName = '',
            bankCode = '',
          } = item;
          bankObj = mapValues(
            {bankAccountName, bankAddress, bankCardNo, bankName, bankCode},
            value => ({value}),
          );
          bankObj.bankAccountName.validatePassed = true;
        }

        formValues = Object.assign(aliObj, bankObj);
      });
      yield put({
        type: 'updateState',
        payload: {
          ...formValues,
        },
      });
    },
    // *getUsernameExistState({payload}, {cal
    *getValidatePic(payloadObj, {call, put, select}) {
      const {appModel} = yield select(state => state);
      const webUniqueCode = yield validate.generateBrowserId();
      const response = yield call(request.getValidatePic, {
        webUniqueCode,
        deviceToken: appModel.deviceToken,
      });
      if (response && response.type === 'image/png') {
        const validateImageSrc = URL.createObjectURL(response);
        yield put({
          type: 'updateState',
          payload: {validateImageSrc, webUniqueCode},
        });
      }
    },
    *postErrorMessage({payload}, {call, put, select}) {
      const {formModel} = yield select(state => state);
      if (!formModel.isErrorShowing) {
        yield put({
          type: 'updateState',
          payload: {isErrorShowing: true},
        });

        const errorMsg = logTranslate(payload.msg);

        yield message.error(errorMsg);
        yield call(delay, 3000);

        yield put({
          type: 'updateState',
          payload: {isErrorShowing: false},
        });
      }
    },
    *postWarnMessage({payload}, {call, put, select}) {
      const {formModel} = yield select(state => state);
      if (!formModel.isWarnShowing) {
        yield put({
          type: 'updateState',
          payload: {isWarnShowing: true},
        });

        yield message.warning(payload.msg);
        yield call(delay, 3000);

        yield put({
          type: 'updateState',
          payload: {isWarnShowing: false},
        });
      }
    },
  },
  subscriptions: {},
};
