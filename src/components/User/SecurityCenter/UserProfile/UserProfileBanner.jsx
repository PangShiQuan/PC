import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {MDIcon} from 'components/General';
import {Modal} from 'antd';
import * as images from 'components/HomePage/images';
import vipBtn from 'assets/image/VIP_Btn.png';
import SVG from 'react-inlinesvg';
import profilePicIcon from 'assets/image/User/ic-user.svg';
import attendanceIcon from 'assets/image/User/ic-attendance.svg';
import css from 'styles/User/SecurityCenter/UserProfile.less';

class UserProfileBanner extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  vipImgBtn = () => {
    Modal.info({
      title: '温馨提示',
      content: <span>请下载APP领取VIP福利礼金</span>,
      onOk: () => {},
    });
  };

  onCheckinClick = () => {
    this.dispatch({type: 'userModel/postUserCheckIn'});
  };

  render() {
    const {
      userData: {username},
      openState,
      currentLevel: {displayOrder},
      userCheckedIn,
      userCheckedInCount,
    } = this.props;
    const vipNum = `${images[`icn_V${displayOrder - 1}`]}`;

    return (
      <div className={css.profile_banner_container}>
        <div className={css.profile_pic}>
          <SVG src={profilePicIcon} />
        </div>

        <div>{username}, 您好！</div>

        {openState ? (
          <img className={css.vip_num} src={vipNum} alt="vip number" />
        ) : null}

        {openState ? (
          <button type="button" onClick={this.vipImgBtn}>
            <img className={css.vip_num_btn} src={vipBtn} alt="vip" />
          </button>
        ) : null}

        <div className={css.profile_checkinColumn}>
          {userCheckedInCount ? (
            <span className={css.profile_checkinIndicate}>
              已连续签到 <strong>{userCheckedInCount}</strong> 天
            </span>
          ) : null}
          <button
            type="button"
            className={css.profile_checkinBtn}
            disabled={userCheckedIn}
            onClick={this.onCheckinClick}>
            <SVG
              src={attendanceIcon}
              className={css.profile_checkinCalendaIcon}
            />
            {/* <MDIcon
              iconName={userCheckedIn ? 'calendar-check' : 'calendar-blank'}
            /> */}
            <MDIcon
              iconName="thumb-up"
              className={css.profile_checkinThumbIcon}
            />
            <span>{userCheckedIn ? '今日已签到' : '每日签到'}</span>
          </button>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({userModel}) {
  const {
    userData,
    openState,
    currentLevel,
    userCheckedIn,
    userCheckedInCount,
  } = userModel;
  return {
    userData,
    currentLevel,
    openState,
    userCheckedIn,
    userCheckedInCount,
  };
}

export default connect(mapStatesToProps)(UserProfileBanner);
