import React, {Component} from 'react';
import moment from 'moment';
import {connect} from 'dva';
import _ from 'lodash';
import {
  type as TYPE,
  addCommas,
  isGuestUser,
  sealPhoneNumberChar,
  sealEmailChar,
} from 'utils';
import {MDIcon, LoadingBar, Button} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import resolve from 'clientResolver';
import vipBtn from 'assets/image/VIP_Btn.png';
import {Modal} from 'antd';
import * as images from 'components/HomePage/images';

const {dateFormat} = TYPE;
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

  onCheckinClick = () => {
    this.dispatch({type: 'userModel/postUserCheckIn'});
  };

  onCancelClick = target => {
    const {userData} = this.props;
    const initialValue = userData[target];
    this.setState({editTarget: ''});
    this.dispatch({
      type: 'formModel/updateState',
      payload: {[target]: {value: initialValue}},
    });
  };

  onEditTarget = editTarget => {
    this.setState({editTarget});
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
  };

  onInputChange = event => {
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const {value, max} = event.target;
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

  onEditModeToggle = isEditing => {
    this.setState({isEditing});
    this.dispatch({type: 'formModel/getBasicDetails'});
  };

  validateInput = payload => {
    this.dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  };

  fetchUpdates(switchUser = false) {
    this.dispatch({type: 'userModel/getUserTotalRecoverBalance'});
    if (!this.props.myLoginHistory.length || switchUser)
      this.dispatch({type: 'userModel/getMyLoginHistory'});
    if (this.isGuest)
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    if (!this.props.userCheckedIn || switchUser)
      this.dispatch({type: 'userModel/getUserCheckIn'});
  }

  renderResponseMsg() {
    const {
      responseMsg: {msg, color, icon},
    } = this.props;
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

  rendermyLoginHistory() {
    const {myLoginHistory} = this.props;
    return _.map(myLoginHistory, history => {
      const {loginTime, location} = history;
      return (
        <tr key={loginTime}>
          <td>{moment(loginTime).format(dateFormat)}</td>
          <td>{location}</td>
        </tr>
      );
    });
  }

  vipImgBtn() {
    Modal.info({
      title: '温馨提示',
      content: <span>请下载APP领取VIP福利礼金</span>,
      onOk: () => {},
    });
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
          className={css.profile_formBtn__cancel}
          onClick={this.cancelEdit}
          placeholder="取消"
          disabled={!isEditing}
        />
        &nbsp;
        <Button
          loading={awaitingResponse}
          disabled={isEditing ? submitDisabled : false}
          className={css.profile_formBtn__submit}
          onClick={this.onSubmitClick}
          placeholder={submitBtnPlaceholder}
        />
      </div>
    );
  }

  renderAmountBalance() {
    if (this.isGuest) {
      return (
        <span key="main_balance" className={css.profile_accountBalance}>
          <br /> 中心钱包 <strong>{addCommas(this.props.balance)}元</strong>
        </span>
      );
    }
    return null;
  }

  render() {
    const {
      awaitingResponse,
      userData: {username},
      userCheckedIn,
      userCheckedInCount,
      currentLevel,
      openState,
      otherSettings: {bindPhoneOn},
    } = this.props;
    let vipNum;
    if (openState) {
      const {displayOrder} = currentLevel;
      const num = `icn_V${displayOrder}`;
      vipNum = `${images[num]}`;
    }
    return (
      <div>
        <div className={css.profile_contentBody}>
          <div className={css.profile_accountInfos}>
            <div className={css.profile_accountNames}>
              <div className={css.profile_accountUserProfile}>
                {username.toString().substring(0, 2)}
              </div>
              <div className={css.profile_accountName}>
                <span>{username}</span>
                {this.renderAmountBalance()}
              </div>
            </div>
            <div className={css.profile_vipContent}>
              <div>
                {openState ? (
                  <img className={css.vip_num} src={vipNum} alt="" />
                ) : null}
              </div>
              <div className={css.vip_num_btn}>
                {openState ? (
                  <img
                    className={css.vip_num_btn}
                    src={vipBtn}
                    onClick={this.vipImgBtn}
                    alt=""
                  />
                ) : null}
              </div>
            </div>
            <div className={css.profile_checkinColumn}>
              {userCheckedInCount ? (
                <span className={css.profile_checkinIndicate}>
                  已连续签到<strong>{userCheckedInCount}</strong>天
                </span>
              ) : null}
              <button
                type="button"
                className={css.profile_checkinBtn}
                disabled={userCheckedIn}
                onClick={this.onCheckinClick}>
                <i>{userCheckedIn ? '今日已签到' : '立即签到'}</i>
                <MDIcon
                  iconName={userCheckedIn ? 'calendar-check' : 'calendar-blank'}
                  className={css.profile_checkinCalendaIcon}
                />
                <MDIcon
                  iconName="thumb-up"
                  className={css.profile_checkinThumbIcon}
                />
              </button>
            </div>
          </div>
          {this.isGuest ? null : (
            <div className={css.profile_accountProfileRow}>
              <h4 className={css.profile_formLabel}>基本信息</h4>
              <LoadingBar isLoading={awaitingResponse} />
              {this.renderResponseMsg()}
              {this.renderRealName()}
              {this.renderNickname()}
              {bindPhoneOn && this.renderPhoneNumber()}
              {this.renderEmail()}
              {this.renderGroup()}
              {this.renderBtnRow()}
            </div>
          )}
        </div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>登录历史</h4>
          <LoadingBar />
          <table className={css.profile_table}>
            <thead>
              <tr>
                <td>登录时间</td>
                <td>登录地区</td>
              </tr>
            </thead>
            <tbody>{this.rendermyLoginHistory()}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({userModel, formModel, gameInfosModel}) {
  const {
    accessToken,
    awaitingResponse,
    dailyWithdrawWithAdminSettingsResult: {balance},
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
    currentLevel,
    openState,
    myLoginHistory,
    awaitingResponse,
    userCheckedIn,
    userCheckedInCount,
    ...formModel,
    otherSettings,
  };
}

export default connect(mapStatesToProps)(BasicInfo);
