import React from 'react';
import {connect} from 'dva';
import FloatWindow from 'components/HomePage/Dsf/FloatWindows1';
import getHongbaoLink from 'utils/getHongbaoLink';
import css from '../../styles/homepage/FloatWindows.less';

function FloatWindows(props) {
  const {accessToken, deviceToken, pcOtherInfo, ...compProps} = props;
  const {onlineServiceUrl = '', qq1, weChat = '', siteName = ''} = pcOtherInfo;
  const buttons = {
    left: [
      {
        fn: 'onGuestAccountRequest',
        text: '免费试玩',
      },
      {
        text: '帮助中心',
        to: '/helpcenter',
      },
    ],
    right: [
      {
        href: onlineServiceUrl,
        text: '在线客服',
      },
      {
        href: (qq1 && `tencent://message/?exe=qq&menu=yes&Uin=${qq1}`) || '',
        text: '在线QQ',
      },
    ],
  };
  // const topBanner =
  //   (siteName && (
  //     <span className={css.banner_top}>{siteName.split(' - ')[0]}</span>
  //   )) ||
  //   null;

  return <FloatWindow buttons={buttons} close {...compProps} />;
}

const mapStatesToProps = ({appModel, gameInfosModel, userModel}) => {
  const {pcOtherInfo} = gameInfosModel;
  return {
    deviceToken: appModel.deviceToken,
    accessToken: userModel.accessToken,
    pcOtherInfo,
  };
};

export default connect(mapStatesToProps)(FloatWindows);
