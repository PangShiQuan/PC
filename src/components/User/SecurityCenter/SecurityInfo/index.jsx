import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {type as TYPE} from 'utils';
import {MDIcon} from 'components/General';
import InputTextField from 'components/User/Form/InputTextField';
import SubmitResetButton from 'components/User/Form/SubmitResetButton';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import InputPinField from 'components/User/Form/InputPinField';
import css from 'styles/User/SecurityCenter/SecurityInfo.less';
import userCSS from 'styles/User/User.less';
import closeeye from 'assets/image/allIcon/closeeye.svg';
import openeye from 'assets/image/allIcon/openeye.svg';

class SecurityInfo extends Component {
  LABEL_WIDTH = '90px';

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      openEye: [],
    };
    this.validateInput = this.validateInput.bind(this);
    this.validateRepeatInput = this.validateRepeatInput.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
  }

  onInputChange(event) {
    event.persist();
    const eventTarget = event.target;
    const {value, max, name, min} = eventTarget;
    if (`${value}`.length <= _.toNumber(max)) {
      const payload = {[name]: {value}};
      this.dispatch({type: 'formModel/updateState', payload});
      this.dispatch({
        type: 'formModel/initializeState',
        payload: ['responseMsg'],
      });
      if (value.length >= min) {
        if (name.indexOf('repeat') > -1) {
          this.validateRepeatInput(event);
        } else {
          this.validateInput(event);
        }
      }
    }
  }

  onClearClick = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'password',
        'securityPassword',
        'repeatSecurityPassword',
        'newPassword',
        'repeatPassword',
        'repeatNewPassword',
        'responseMsg',
        'vcNewCardNo',
        'vcSecurityPassword',
        'repeatVcSecurityPassword',
      ],
    });
  };

  onResetClick(event) {
    const eventTarget = event.target;
    const {name} = eventTarget;
    this.dispatch({type: 'formModel/initializeState', payload: [name]});
  }

  onRadioSelect = ({currentTarget}) => {
    const securityMode = currentTarget.value;
    this.dispatch({
      type: 'formModel/updateState',
      payload: {securityMode},
    });
    this.onClearClick();
  };

  onSubmitClick() {
    this.dispatch({type: 'userModel/postPasswordInfo'});
  }

  validateInput(payload) {
    this.dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  }

  validateRepeatInput(payload) {
    this.dispatch({
      type: 'formModel/validateRepeatInput',
      payload,
    });
  }

  renderPasswordEye = name => {
    const {openEye} = this.state;
    const newOpenEye = openEye.includes(name)
      ? [...openEye.filter(x => x !== name)]
      : [...openEye, name];

    return (
      <button
        type="button"
        className={css.passwordIcon_button}
        onClick={() => {
          this.setState({
            openEye: newOpenEye,
          });
        }}>
        <img
          className={css.passwordIcon}
          src={openEye.includes(name) ? closeeye : openeye}
          alt="eye"
        />
      </button>
    );
  };

  renderPasswordInput = () => {
    const {password} = this.props;
    const {openEye} = this.state;
    const {value, inputMsg, icon, color} = password;
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem}>
          <InputTextField
            id="password"
            label={`旧${TYPE.inputFieldRefs.password}`}
            min="6"
            max="15"
            value={value}
            labelWidth={this.LABEL_WIDTH}
            placeholder="请输入旧密码"
            pattern="^.{6,15}$"
            type={openEye.includes('password') ? 'text' : 'password'}
            obj={password}
            onBlur={this.validateInput}
            onChange={this.onInputChange}
          />
          {this.renderPasswordEye('password')}
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderNewPasswordInput = () => {
    const {newPassword} = this.props;
    const {openEye} = this.state;
    const {value, inputMsg, icon, color} = newPassword;
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem}>
          <InputTextField
            id="newPassword"
            label={`${TYPE.inputFieldRefs.newPassword}`}
            min="6"
            max="15"
            value={value}
            labelWidth={this.LABEL_WIDTH}
            placeholder="请输入大小写字母和数字组成的6-15个字符"
            pattern="^.{6,15}$"
            type={openEye.includes('newPassword') ? 'text' : 'password'}
            obj={newPassword}
            onBlur={this.validateInput}
            onChange={this.onInputChange}
          />
          {this.renderPasswordEye('newPassword')}
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderRepeatNewPasswordInput() {
    const {repeatNewPassword} = this.props;
    const {openEye} = this.state;
    const {value, inputMsg, icon, color} = repeatNewPassword;
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem}>
          <InputTextField
            id="repeatNewPassword"
            label={`${TYPE.inputFieldRefs.repeatNewPassword}`}
            min="6"
            max="15"
            value={value}
            labelWidth={this.LABEL_WIDTH}
            placeholder="请重复输入一样的新密码"
            pattern="^.{6,15}$"
            type={openEye.includes('repeatNewPassword') ? 'text' : 'password'}
            obj={repeatNewPassword}
            onBlur={this.validateInput}
            onChange={this.onInputChange}
          />
          {this.renderPasswordEye('repeatNewPassword')}
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  }

  renderSecurityInput() {
    const {securityPassword} = this.props;
    const {value, inputMsg, icon, color} = securityPassword;
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem} style={{position: 'relative'}}>
          <InputPinField
            labelWidth={this.LABEL_WIDTH}
            obj={securityPassword}
            label={`${TYPE.inputFieldRefs.securityPassword}`}
            max="4"
            min="4"
            name="securityPassword"
            onBlur={this.validateInput}
            onChange={this.onInputChange}
            onClick={this.onResetClick}
            pattern="\d[0-9]\d"
            type="password"
            value={value}
          />
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  }

  renderNewSecurityInput() {
    const {newPassword} = this.props;
    const {value, inputMsg, icon, color} = newPassword;
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem} style={{position: 'relative'}}>
          <InputPinField
            labelWidth={this.LABEL_WIDTH}
            obj={newPassword}
            label={`${TYPE.inputFieldRefs.newPassword}`}
            max="4"
            min="4"
            name="newPassword"
            onBlur={this.validateInput}
            onChange={this.onInputChange}
            onClick={this.onResetClick}
            pattern="\d[0-9]\d"
            type="password"
            value={value}
          />
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  }

  renderRepeatNewSecurityInput() {
    const {repeatNewPassword} = this.props;
    const {value, inputMsg, icon, color} = repeatNewPassword;
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem} style={{position: 'relative'}}>
          <InputPinField
            labelWidth={this.LABEL_WIDTH}
            obj={repeatNewPassword}
            label={`${TYPE.inputFieldRefs.repeatNewPassword}`}
            max="4"
            min="4"
            name="repeatNewPassword"
            onBlur={this.validateInput}
            onChange={this.onInputChange}
            onClick={this.onResetClick}
            pattern="\d[0-9]\d"
            type="password"
            value={value}
          />
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  }

  renderForm() {
    const {securityMode} = this.props;
    if (securityMode === TYPE.PASSWORD) {
      return (
        <div>
          {this.renderPasswordInput()}
          {this.renderNewPasswordInput()}
          {this.renderRepeatNewPasswordInput()}
        </div>
      );
    }
    if (securityMode === TYPE.SECURITY_PASSWORD) {
      return (
        <div>
          {this.renderSecurityInput()}
          {this.renderNewSecurityInput()}
          {this.renderRepeatNewSecurityInput()}
        </div>
      );
    }
  }

  renderOptions() {
    const {securityMode, userData} = this.props;
    const {realName} = userData;
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem}>
          <div className={css.label} style={{width: this.LABEL_WIDTH}}>
            密码类别
          </div>
          <button
            type="button"
            onClick={this.onRadioSelect}
            value={TYPE.PASSWORD}
            data-checked={securityMode === TYPE.PASSWORD}
            className={css.optionButton}
            style={{marginRight: '17px'}}>
            登录密码
            {securityMode === TYPE.PASSWORD && (
              <div className={css.tickIconDiv}>
                <MDIcon className={css.tickIcon} iconName="check" />
              </div>
            )}
          </button>
          {realName && (
            <button
              type="button"
              onClick={this.onRadioSelect}
              value={TYPE.SECURITY_PASSWORD}
              data-checked={securityMode === TYPE.SECURITY_PASSWORD}
              className={css.optionButton}>
              提现密码
              {securityMode === TYPE.SECURITY_PASSWORD && (
                <div className={css.tickIconDiv}>
                  <MDIcon className={css.tickIcon} iconName="check" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  renderSubmitButtons = () => {
    const {
      securityMode,
      securityPassword,
      newPassword,
      password,
      repeatNewPassword,
    } = this.props;
    let readyToSubmit = false;
    if (securityMode === TYPE.SECURITY_PASSWORD) {
      readyToSubmit =
        newPassword.value !== undefined &&
        securityPassword.value !== undefined &&
        repeatNewPassword.value !== undefined &&
        (newPassword.inputMsg &&
          newPassword.inputMsg.indexOf('格式正确') > -1) &&
        (securityPassword.inputMsg &&
          securityPassword.inputMsg.indexOf('格式正确') > -1) &&
        (repeatNewPassword.inputMsg &&
          repeatNewPassword.inputMsg.indexOf('格式正确') > -1);
    } else {
      readyToSubmit =
        newPassword.value !== undefined &&
        password.value !== undefined &&
        repeatNewPassword.value !== undefined &&
        (newPassword.inputMsg &&
          newPassword.inputMsg.indexOf('格式正确') > -1) &&
        (password.inputMsg && password.inputMsg.indexOf('格式正确') > -1) &&
        (repeatNewPassword.inputMsg &&
          repeatNewPassword.inputMsg.indexOf('格式正确') > -1);
    }
    return (
      <div className={css.formItem}>
        <SubmitResetButton
          labelWidth={this.LABEL_WIDTH}
          submitDisabled={!readyToSubmit}
          // resetDisabled,
          onSubmitClick={this.onSubmitClick}
          onResetClick={this.onClearClick}
          submitText="提交"
          resetText="重置"
          submitWidth="270px"
          resetWidth="80px"
          marginTop
        />
      </div>
    );
  };

  render() {
    return (
      <React.Fragment>
        <ResponseMessageBar />
        <div className={userCSS.content_body}>
          {this.renderOptions()}
          {this.renderForm()}
          {this.renderSubmitButtons()}
        </div>
      </React.Fragment>
    );
  }
}

const mapStatesToProps = ({userModel, formModel}) => {
  const {userData} = userModel;
  return {
    ...formModel,
    userData,
  };
};

export default connect(mapStatesToProps)(SecurityInfo);
