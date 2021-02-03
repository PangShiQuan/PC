import React from 'react';
import {connect} from 'dva';
import resolve from 'clientResolver';
import Logo from 'components/Header/ClientLogo';
import css from 'styles/header/Dsf/profileNav1.less';

const DreamLogo = resolve.client('components/Header/DreamLogo');
const Login = resolve.plugin('Login');

function ProfileNav(props) {
  const {
    pcOtherInfo: {siteName},
    userData,
    pathname,
  } = props;
  const isLogon = userData != null;

  return (
      <DreamLogo
        classNameprofileNav={css.profileNavRow}
        classNamelogoCol={css.logoCol}
        classNamelistCol={css.listCol}
        datalogon={isLogon}
        pathname={pathname}
        login={<Login/>}
        logo={<Logo siteName={siteName} useSlogan pathname={pathname}/>}
       />
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
