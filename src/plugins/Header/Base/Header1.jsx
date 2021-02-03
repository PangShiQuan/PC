import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import Logo from 'components/Header/ClientLogo';
import css from 'styles/header/Base/header1.less';
import {popupDidUnmount} from 'utils/type.config';
import resolve from 'clientResolver';

const Navigation = resolve.plugin('Navigation');
const Login = resolve.plugin('Login');
const TopTray = resolve.plugin('TopTray');

class Header extends PureComponent {
  componentWillMount() {
    localStorage.setItem(popupDidUnmount, moment().add(60, 'minutes'));
  }

  render() {
    const {pcOtherInfo} = this.props;
    return (
      <div className={css.header}>
        <TopTray />
        <div className={css.header_login}>
          <div className={css.header_row}>
            <Logo className={css.header_logo} />
            <Login />
          </div>
        </div>
        <Navigation />
      </div>
    );
  }
}

function mapStatesToProps({gameInfosModel}) {
  const {pcOtherInfo = {}} = gameInfosModel;
  return {pcOtherInfo};
}

export default connect(mapStatesToProps)(Header);
