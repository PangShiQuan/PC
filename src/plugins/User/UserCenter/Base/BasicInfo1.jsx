import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {
  type as TYPE,
  addCommas,
  isGuestUser,
  sealPhoneNumberChar,
  sealEmailChar,
} from 'utils';
import {Button, SubButton} from 'components/General';
import resolve from 'clientResolver';
import css from 'styles/User/Base/ProfileIndex1.less';
import userCSS from 'styles/User/User.less';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import UserProfileBanner from 'components/User/SecurityCenter/UserProfile/UserProfileBanner';
import UserProfileInfo from 'components/User/SecurityCenter/UserProfile/UserProfileInfo';
import UserProfileHistory from 'components/User/SecurityCenter/UserProfile/UserProfileHistory';

const Input = resolve.plugin('ProfileInput');

class BasicInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editTarget: '',
      isEditing: false,
    };
    this.isGuest = isGuestUser(props.userData);
    this.dispatch = props.dispatch;
    this.cancelRealName = this.onCancelClick.bind(this, 'realName');
    this.editRealName = this.onEditTarget.bind(this, 'realName');
    this.cancelEdit = this.onEditModeToggle.bind(this, false);
  }

  componentDidMount() {
    this.dispatch({type: 'formModel/getBasicDetails'});
    this.fetchUpdates();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.accessToken &&
      nextProps.accessToken &&
      this.props.accessToken !== nextProps.accessToken
    ) {
      this.fetchUpdates(true);
    }
    if (nextProps.userData !== this.props.userData) {
      this.onEditModeToggle(false);
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'nickname',
        'realName',
        'phoneNumber',
        'email',
        'responseMsg',
        'username',
        'prizeGroup',
        'memberType',
      ],
    });
  }

  onCancelClick = target => {
    const {userData} = this.props;
    const initialValue = userData[target];
    this.setState({editTarget: ''});
    this.dispatch({
      type: 'formModel/updateState',
      payload: {[target]: {value: initialValue}},
    });
  };

  onEditTarget(editTarget) {
    this.setState({editTarget});
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
  }

  onInputChange = event => {
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const eventTarget = event.target;
    const {value, max} = eventTarget;
    if (value.toString().length <= max || !max) {
      this.validateInput(event);
    }
  };

  onSubmitRealName = () => {
    this.dispatch({type: 'userModel/putUserRealName'});
    this.onCancelClick('realName');
  };

  onSubmitClick = () => {
    if (this.state.isEditing) {
      this.dispatch({type: 'userModel/putUserInfo'});
    } else {
      this.onEditModeToggle(true);
    }
  };

  onEditModeToggle(isEditing) {
    this.setState({isEditing});
    this.dispatch({type: 'formModel/getBasicDetails'});
  }

  validateInput = payload => {
    const {dispatch} = this.props;
    dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  };

  fetchUpdates(switchUser = false) {
    // this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    this.dispatch({type: 'userModel/getUserTotalRecoverBalance'});

    if (!this.props.myLoginHistory.length || switchUser)
      this.dispatch({type: 'userModel/getMyLoginHistory'});
    if (!this.props.userCheckedIn || switchUser)
      this.dispatch({type: 'userModel/getUserCheckIn'});
  }

  renderNickname() {
    const {
      awaitingResponse,
      nickname: {value, inputMsg, icon, color},
      userData: {nickname},
    } = this.props;
    const {isEditing} = this.state;

    return (
      <div className={css.profile_inputInlineRow}>
        <div className={css.profile_inputInlineBlock}>
          <Input
            readOnly={!isEditing}
            disabled={!isEditing || nickname === value || awaitingResponse}
            dataColor={color}
            dataIcon={icon}
            dataMsg={inputMsg}
            label={TYPE.inputFieldRefs.nickname}
            name="nickname"
            onBlur={this.validateInput}
            onChange={this.onInputChange}
            pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
            placeholder={
              isEditing
                ? `请输入中文、英文的姓名的${TYPE.inputFieldRefs.nickname}`
                : `尚未绑定${TYPE.inputFieldRefs.nickname}`
            }
            value={value}
          />
        </div>
      </div>
    );
  }

  renderRealName() {
    const {
      awaitingResponse,
      realName: {value, inputMsg, icon, color},
      userData: {realName},
    } = this.props;
    const {editTarget} = this.state;
    if (!realName) return null;

    return (
      <div className={css.profile_inputInlineRow}>
        {editTarget === 'realName' || value ? (
          <div className={css.profile_inputInlineBlock}>
            <Input
              readOnly={editTarget !== 'realName'}
              disabled={editTarget !== 'realName' || awaitingResponse}
              dataColor={color}
              dataIcon={icon}
              dataMsg={inputMsg}
              label={TYPE.inputFieldRefs.realName}
              name="realName"
              onBlur={this.validateInput}
              onChange={this.onInputChange}
              pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
              placeholder={`请输入中文、英文的${TYPE.inputFieldRefs.realName}`}
              value={value}
            />
          </div>
        ) : null}
        {editTarget === 'realName' ? (
          <button
            type="button"
            onClick={this.cancelRealName}
            className={css.profile_inputInlineBtn}>
            取消
          </button>
        ) : null}
        {editTarget === 'realName' ? (
          <button
            type="button"
            disabled={!value}
            onClick={this.onSubmitRealName}
            className={css.profile_inputInlineBtn}>
            确定{value ? '申请更新' : '添加'}
          </button>
        ) : (
          <button
            type="button"
            onClick={this.editRealName}
            className={css.profile_inputInlineBtn}>
            {value ? '申请更新' : '添加'}
            {TYPE.inputFieldRefs.realName}
          </button>
        )}
      </div>
    );
  }

  renderPhoneNumber() {
    const {
      awaitingResponse,
      phoneNumber: {value, inputMsg, icon, color},
      userData: {phoneNumber},
    } = this.props;
    const {isEditing} = this.state;
    const infoFullied = phoneNumber === value;
    let phoneToHide;
    if (phoneNumber != null) {
      phoneToHide = sealPhoneNumberChar(phoneNumber);
    }
    return (
      <div className={css.profile_inputInlineRow}>
        <div className={css.profile_inputInlineBlock}>
          <Input
            readOnly={!isEditing}
            disabled={!isEditing || phoneNumber === value || awaitingResponse}
            dataColor={color}
            dataIcon={icon}
            dataMsg={inputMsg}
            label={TYPE.inputFieldRefs.phoneNumber}
            max="11"
            min="11"
            name="phoneNumber"
            onBlur={this.validateInput}
            onChange={this.onInputChange}
            pattern="^19[8,9]\d{8}$|^134[0-8][\d]{7}$|^13[0-35-9]\d{8}$|^14[5,6,7,8,9]\d{8}$|^15[^4]\d{8}$|^16[6]\d{8}$|^17[0,1,2,3,4,5,6,7,8]\d{8}$|^18[\d]{9}$"
            placeholder={
              isEditing
                ? '请输入正确11位数字电话号码'
                : `尚未绑定${TYPE.inputFieldRefs.phoneNumber}`
            }
            value={infoFullied ? phoneToHide : value}
          />
        </div>
      </div>
    );
  }

  renderEmail() {
    const {
      awaitingResponse,
      email: {value, inputMsg, icon, color},
      userData: {email},
    } = this.props;
    const {isEditing} = this.state;
    const infoFullied = email === value;
    let emailToHide;
    if (email != null) {
      emailToHide = sealEmailChar(email);
    }
    return (
      <div className={css.profile_inputInlineRow}>
        <div className={css.profile_inputInlineBlock}>
          <Input
            readOnly={!isEditing || infoFullied}
            disabled={!isEditing || infoFullied || awaitingResponse}
            dataColor={color}
            dataIcon={icon}
            dataMsg={inputMsg}
            label={TYPE.inputFieldRefs.email}
            max="35"
            min="7"
            name="email"
            onBlur={this.validateInput}
            onChange={this.onInputChange}
            pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
            placeholder={
              isEditing
                ? '请输入正确的邮箱地址例如:example@qq.com'
                : `尚未绑定${TYPE.inputFieldRefs.email}`
            }
            value={infoFullied ? emailToHide : value}
          />
        </div>
      </div>
    );
  }

  renderGroup() {
    const {
      userData: {prizeGroup},
    } = this.props;
    if (!prizeGroup) {
      return null;
    }
    return (
      <div className={css.profile_inputInlineRow}>
        <div className={css.profile_inputInlineBlock}>
          <Input readOnly label="彩票返点" disabled value={prizeGroup} />
        </div>
      </div>
    );
  }

  renderBtnRow() {
    const {
      awaitingResponse,
      email,
      phoneNumber,
      nickname,
      userData: {
        email: userEmail,
        phoneNumber: userPhoneNumber,
        nickname: userNickname,
      },
    } = this.props;
    const disableEdit = userEmail && userPhoneNumber && userNickname;
    const {isEditing} = this.state;
    const submitDisabled =
      (!email.validatePassed && !phoneNumber.validatePassed) ||
      !nickname.validatePassed;
    const submitBtnPlaceholder = isEditing ? '确定绑定' : '绑定基本信息';

    return disableEdit ? null : (
      <div className={css.profile_formBtnRow}>
        <Button
          onClick={this.cancelEdit}
          placeholder="取消"
          disabled={!isEditing}
        />
        <SubButton
          loading={awaitingResponse}
          disabled={isEditing ? submitDisabled : false}
          className={css.profile_formSubmitBtn}
          onClick={this.onSubmitClick}
          placeholder={submitBtnPlaceholder}
        />
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <ResponseMessageBar />
        <UserProfileBanner />
        <div className={userCSS.content_body} style={{marginTop: 0}}>
          <UserProfileInfo />
          <UserProfileHistory />
        </div>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({userModel, formModel, layoutModel, gameInfosModel}) {
  const {
    accessToken,
    awaitingResponse,
    balance,
    myLoginHistory,
    userCheckedIn,
    userCheckedInCount,
    userData,
    currentLevel,
    openState,
  } = userModel;
  const {otherSettings} = gameInfosModel;
  return {
    accessToken,
    balance,
    userData,
    myLoginHistory,
    currentLevel,
    openState,
    awaitingResponse,
    userCheckedIn,
    userCheckedInCount,
    shouldShowProfileModal: layoutModel.shouldShowProfileModal,
    ...formModel,
    otherSettings,
  };
}

export default connect(mapStatesToProps)(BasicInfo);
