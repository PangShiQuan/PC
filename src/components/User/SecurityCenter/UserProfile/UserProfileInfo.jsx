import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {type as TYPE, sealPhoneNumberChar, sealEmailChar} from 'utils';
import css from 'styles/User/SecurityCenter/UserProfile.less';
import ContentContainer from 'components/User/ContentContainer';

class UserProfileInfo extends PureComponent {
  TYPES = {
    nickname: 'nickname',
    realName: 'realName',
    phoneNumber: 'phoneNumber',
    email: 'email',
  };

  LABEL_WIDTH = '100px';

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;

    this.state = {
      editTarget: null,
      editValue: null,
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    const {
      responseMsg: {msg, color},
    } = this.props;

    if (prevState.editTarget !== null && msg && color === 'green') {
      this.setState({
        editTarget: null,
        editValue: null,
      });
    }
  };

  onInputChange = event => {
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const eventTarget = event.target;
    const {value, max} = eventTarget;

    if (value.toString().length <= max || !max) {
      this.setState({
        editValue: eventTarget.value,
      });
      this.dispatch({
        type: 'formModel/validateInput',
        payload: event,
      });
    }
  };

  onClickEdit = target => {
    const {
      nickname: {value: nicknameValue},
      phoneNumber: {value: phValue},
      email: {value: emailValue},
      realName: {value: realNameValue},
    } = this.props;

    let editValue = null;
    switch (target) {
      case this.TYPES.realName:
        editValue = realNameValue;
        break;
      case this.TYPES.nickname:
        editValue = nicknameValue;
        break;
      case this.TYPES.phoneNumber:
        editValue = phValue;
        break;
      case this.TYPES.email:
        editValue = emailValue;
        break;
      default:
        break;
    }
    this.setState({
      editTarget: target,
      editValue,
    });
  };

  onClickSubmit = () => {
    const {editTarget} = this.state;
    if (editTarget) {
      if (editTarget === this.TYPES.realName) {
        this.dispatch({type: 'userModel/putUserRealName'});
      } else {
        this.dispatch({type: 'userModel/putUserInfo'});
      }
    }
  };

  onClickCancel = () => {
    const {userData} = this.props;
    const {editTarget} = this.state;
    const initialValue = userData[editTarget];
    this.dispatch({
      type: 'formModel/updateState',
      payload: {[editTarget]: {value: initialValue}},
    });
    this.setState({
      editTarget: null,
      editValue: null,
    });
  };

  renderField = ({
    type,
    value,
    min,
    max,
    color,
    inputMsg,
    pattern,
    disabled,
  }) => {
    const {editTarget, editValue} = this.state;
    const disabledButton = (editTarget && !value) || color === 'red';

    const editText = type === this.TYPES.realName ? '申请更新真实姓名' : '修改';

    return (
      <div className={css.profile_inputDiv}>
        <div style={{display: 'inline-block', width: this.LABEL_WIDTH}}>
          {TYPE.inputFieldRefs[type]}
        </div>
        {editTarget === type ? (
          <div style={{display: 'inline-flex', alignItems: 'center'}}>
            <input
              id={type}
              name={type}
              type="text"
              value={editValue}
              pattern={pattern}
              min={min}
              max={max}
              className={css.inputTextField}
              data-color={color}
              onChange={this.onInputChange}
            />
            {color === 'red' && inputMsg && (
              <span className={css.errorMessage}>{inputMsg}</span>
            )}
            <button
              type="button"
              disabled={disabledButton}
              className={css.submitButton}
              onClick={this.onClickSubmit}>
              提交申请
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={this.onClickCancel}>
              取消
            </button>
          </div>
        ) : (
          <div style={{display: 'inline-flex', alignItems: 'center'}}>
            {value ? (
              <span>{value}</span>
            ) : (
              <span className={css.not_bind}>尚未绑定</span>
            )}
            {!disabled && (
              <button
                type="button"
                disabled={editTarget}
                className={css.editButton}
                onClick={() => this.onClickEdit(type)}>
                {value ? editText : '立即绑定'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  renderRealName = () => {
    const {
      realName: {color, inputMsg},
      userData: {realName},
    } = this.props;

    if (!realName) return null;

    return this.renderField({
      type: this.TYPES.realName,
      value: realName,
      inputMsg,
      color,
      pattern:
        '^([\\u4e00-\\u9fa5]{1}([·•● ]?[\\u4e00-\\u9fa5]){1,14})$|^[a-zA-Z\\s]{4,30}$',
    });
  };

  renderNickname = () => {
    const {
      nickname: {value, color, inputMsg},
      userData: {nickname},
    } = this.props;

    return this.renderField({
      type: this.TYPES.nickname,
      value: nickname || value,
      inputMsg,
      color,
      disabled: nickname != null,
      pattern:
        '^([\\u4e00-\\u9fa5]{1}([·•● ]?[\\u4e00-\\u9fa5]){1,14})$|^[a-zA-Z\\s]{4,30}$',
    });
  };

  renderPhoneNumber = () => {
    const {
      phoneNumber: {value, color, inputMsg},
      userData: {phoneNumber},
    } = this.props;

    const infoFullied = phoneNumber === value;
    let phoneToHide;
    if (phoneNumber != null) {
      phoneToHide = sealPhoneNumberChar(phoneNumber);
    }
    return this.renderField({
      type: this.TYPES.phoneNumber,
      value: infoFullied ? phoneToHide : value,
      max: 11,
      min: 11,
      color,
      inputMsg,
      pattern: `^19[8,9]\\d{8}$|^134[0-8][\\d]{7}$|^13[0-35-9]\\d{8}$|^14[5,6,7,8,9]\\d{8}$|^15[^4]\\d{8}$|^16[6]\\d{8}$|^17[0,1,2,3,4,5,6,7,8]\\d{8}$|^18[\\d]{9}$`,
      disabled: phoneNumber != null,
    });
  };

  renderEmail = () => {
    const {
      email: {value, color, inputMsg},
      userData: {email},
    } = this.props;

    const infoFullied = email === value;
    let emailToHide;
    if (email != null) {
      emailToHide = sealEmailChar(email);
    }

    return this.renderField({
      type: this.TYPES.email,
      value: infoFullied ? emailToHide : value,
      max: 35,
      min: 7,
      color,
      inputMsg,
      pattern: `[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?`,
      disabled: email != null,
    });
  };

  renderGroup = () => {
    const {
      userData: {prizeGroup},
    } = this.props;

    if (!prizeGroup) {
      return null;
    }

    return (
      <div className={css.profile_inputDiv}>
        <div style={{display: 'inline-block', width: this.LABEL_WIDTH}}>
          彩票返点
        </div>
        <div style={{display: 'inline-block'}}>
          <span>{prizeGroup}</span>
        </div>
      </div>
    );
  };

  render() {
    const {
      otherSettings: {bindPhoneOn},
    } = this.props;

    return (
      <>
        {this.isGuest ? null : (
          <ContentContainer title="基本信息">
            <div className={css.profile_form_container}>
              {this.renderRealName()}
              {bindPhoneOn && this.renderPhoneNumber()}
              {this.renderNickname()}
              {this.renderEmail()}
              {this.renderGroup()}
            </div>
          </ContentContainer>
        )}
      </>
    );
  }
}

function mapStatesToProps({userModel, formModel, gameInfosModel}) {
  const {userData} = userModel;
  const {otherSettings} = gameInfosModel;
  return {
    userData,
    ...formModel,
    otherSettings,
  };
}

export default connect(mapStatesToProps)(UserProfileInfo);
