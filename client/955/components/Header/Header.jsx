import React, {Component} from 'react';
import {connect} from 'dva';

function Header (props) {
    let pathname = false;
    if (props.pathname === "/promotions") {
        pathname = true;
    }
    return (
      <div className={props.className} ispromotions={pathname.toString()}>
        {props.profileNav}
        {props.navigation}
        {props.login}
      </div>);
}

function mapStatesToProps({routing}) {
    const {location} = routing;
    return {
        pathname: location.pathname,
    };
}

export default connect(mapStatesToProps)(Header);