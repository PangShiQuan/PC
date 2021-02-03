import React from 'react';
import {connect} from 'dva';
import resolve from 'clientResolver';
import Logo from 'components/Header/ClientLogo';
import css from 'styles/header/Dsf/profileNav2.less';

const DreamLogo = resolve.client('components/Header/DreamLogo');
const Navigation = resolve.plugin('Navigation');

function ProfileNav(props) {
  const {
    pcOtherInfo: {siteName},
    userData,
    pathname,
  } = props;
  const isLogon = userData != null;

  return (
    <div>
      <DreamLogo
        classNameprofileNav={css.profileNavRow}
        classNamelogoCol={css.logoCol}
        classNamelistCol={css.listCol}
        datalogon={isLogon}
        pathname={pathname}
        logo={<Logo siteName={siteName} useSlogan pathname={pathname}/>}
        navigation={<Navigation/>}
       />
      </div>
  );
}

function mapStatesToProps({routing, userModel, gameInfosModel}) {
  const {location} = routing;
  return {
    pathname: location.pathname,
    pcOtherInfo: gameInfosModel.pcOtherInfo,
    userData: userModel.userData,
  };
}

export default connect(mapStatesToProps)(ProfileNav);
