import React, { Component } from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { type as TYPE } from 'utils';
import { Button, MDIcon, LoadingBar } from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import resolve from 'clientResolver';
import DigitInput from '../DigitInput';

const Input = resolve.plugin('ProfileInput');

class SecurityInfo extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.validateInput = this.validateInput.bind(this);
    this.validateRepeatInput = this.validateRepeatInput.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
  }

  onInputChange(event) {
    event.persist();
    const eventTarget = event.target;
    const { value, max, name, min } = eventTarget;
    if (`${value}`.length <= _.toNumber(max)) {
      const payload = { [name]: { value } };
      this.dispatch({ type: 'formModel/updateState', payload });
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
      ],
    });
  };

  onResetClick(event) {
    const eventTarget = event.target;
    const { name } = eventTarget;
    this.dispatch({ type: 'formModel/initializeState', payload: [name] });
  }

  onRadioSelect = ({ currentTarget }) => {
    const securityMode = currentTarget.value;
    this.dispatch({
      type: 'formModel/updateState',
      payload: { securityMode },
    });
    this.onClearClick();
  };

  onSubmitClick() {
    this.dispatch({ type: 'userModel/postPasswordInfo' });
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

  renderPasswordInput() {
    const { password } = this.props;
    const { value, inputMsg, icon, color } = password;
    return (
        <Input
          dataColor={color}
          dataIcon={icon}
          dataMsg={inputMsg}
          label={`旧${TYPE.inputFieldRefs.password}`}
          min="6"
          max="15"
          name="password"
          onBlur={this.validateInput}
          onChange={this.onInputChange}
          pattern="^.{6,15}$"
          placeholder="请输入旧密码"
          type="password"
          value={value}
          isShowEye={true}
        />
    );
  }

  renderNewPasswordInput() {
    const { newPassword } = this.props;
    const { value, inputMsg, icon, color } = newPassword;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.newPassword}`}
        min="6"
        max="15"
        name="newPassword"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="^.{6,15}$"
        placeholder="请输入大小写字母和数字组成的6-15个字符"
        type="password"
        value={value}
        isShowEye={true}
      />
    );
  }

  renderRepeatNewPasswordInput() {
    const { repeatNewPassword } = this.props;
    const { value, inputMsg, icon, color } = repeatNewPassword;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.repeatNewPassword}`}
        min="6"
        max="15"
        name="repeatNewPassword"
        onBlur={this.validateRepeatInput}
        onChange={this.onInputChange}
        pattern="^.{6,15}$"
        placeholder="请重复输入一样的新密码"
        type="password"
        value={value}
        isShowEye={true}
      />
    );
  }

  renderSecurityInput() {
    const { securityPassword } = this.props;
    const { value, inputMsg, icon, color } = securityPassword;
    return (
      <DigitInput
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.securityPassword}`}
        max="4"
        min="4"
        name="securityPassword"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        onClick={this.onResetClick}
        pattern="\d[0-9]\d"
        placeholder="请输入 4 位数字"
        type="password"
        value={value}
      />
    );
  }

  renderNewSecurityInput() {
    const { newPassword } = this.props;
    const { value, inputMsg, icon, color } = newPassword;
    return (
      <DigitInput
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.newPassword}`}
        max="4"
        min="4"
        name="newPassword"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        onClick={this.onResetClick}
        pattern="\d[0-9]\d"
        placeholder="请输入 4 位数字"
        type="password"
        value={value}
      />
    );
  }

  renderRepeatNewSecurityInput() {
    const { repeatNewPassword } = this.props;
    const { value, inputMsg, icon, color } = repeatNewPassword;
    return (
      <DigitInput
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.repeatNewPassword}`}
        max="4"
        min="4"
        name="repeatNewPassword"
        onBlur={this.validateRepeatInput}
        onChange={this.onInputChange}
        onClick={this.onResetClick}
        pattern="\d[0-9]\d"
        placeholder="请输入 4 位数字"
        type="password"
        value={value}
      />
    );
  }

  renderResponseMsg() {
    const { responseMsg } = this.props;
    const { msg, color, icon } = responseMsg;
    if (msg) {
      return (
        <div data-color={color} className={css.profile_formResponse}>
          <MDIcon iconName={icon} />
          <span>{msg}</span>
        </div>
      );
    }
    return null;
  }

  renderForm() {
    const { securityMode } = this.props;
    if (securityMode === TYPE.PASSWORD) {
      return (
        <div className={css.profile_form}>
          {this.renderPasswordInput()}
          {this.renderNewPasswordInput()}
          {this.renderRepeatNewPasswordInput()}
        </div>
      );
    }
    if (securityMode === TYPE.SECURITY_PASSWORD) {
      return (
        <div className={css.profile_form}>
          {this.renderSecurityInput()}
          {this.renderNewSecurityInput()}
          {this.renderRepeatNewSecurityInput()}
        </div>
      );
    }
  }

  renderOptions() {
    const { securityMode, userData } = this.props;
    const { realName } = userData;
    return (
      <div className={css.profile_inputBox}>
        <label className={css.profile_inputLabel} htmlFor="securityMode">
          密码类别
        </label>
        <button
          type="button"
          onClick={this.onRadioSelect}
          value={TYPE.PASSWORD}
          data-checked={securityMode === TYPE.PASSWORD}
          className={css.profile_radioBtn}>
          <MDIcon
            iconName={
              securityMode === TYPE.PASSWORD
                ? 'radiobox-marked'
                : 'radiobox-blank'
            }
          />
          <span>登录密码</span>
        </button>
        {realName ? (
          <button
            type="button"
            onClick={this.onRadioSelect}
            value={TYPE.SECURITY_PASSWORD}
            data-checked={securityMode === TYPE.SECURITY_PASSWORD}
            className={css.profile_radioBtn}>
            <MDIcon
              iconName={
                securityMode === TYPE.SECURITY_PASSWORD
                  ? 'radiobox-marked'
                  : 'radiobox-blank'
              }
            />
            <span>提现密码</span>
          </button>
        ) : null}
      </div>
    );
  }

  render() {
    const {
      securityMode,
      awaitingResponse,
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
      <div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            修改{securityMode === TYPE.SECURITY_PASSWORD ? '提现' : '登录'}密码
            <LoadingBar isLoading={awaitingResponse} />
          </h4>
          {this.renderOptions()}
          {this.renderForm()}
        </div>
        {this.renderResponseMsg()}
        <div className={css.profile_formBtnRow}>
          <Button
            type="button"
            className={css.profile_formBtn__cancel}
            onClick={this.onClearClick}
            placeholder="重置"
          />
          <Button
            disabled={!readyToSubmit}
            className={css.profile_formBtn__submit}
            onClick={this.onSubmitClick}
            placeholder={`更新${
              securityMode === TYPE.SECURITY_PASSWORD ? '提现' : '登录'
              }密码`}
          />
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({ userModel, formModel }) => {
  const { userData, awaitingResponse } = userModel;
  return { ...formModel, userData, awaitingResponse };
};

export default connect(mapStatesToProps)(SecurityInfo);
