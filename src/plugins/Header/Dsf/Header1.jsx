import React, {PureComponent} from 'react';
import moment from 'moment';
import {type as TYPE} from 'utils';
import css from 'styles/header/Dsf/header1.less';
import resolve from 'clientResolver';

const Headerbackground = resolve.client('components/Header/Header');
const Navigation = resolve.plugin('Navigation');
const ProfileNav = resolve.plugin('ProfileNav');

class Header extends PureComponent {
  componentWillMount() {
    localStorage.setItem(TYPE.popupDidUnmount, moment().add(60, 'minutes'));
  }

  render() {
    const {minPageWidth, paths} = this.props;
    return (
      <header
        data-pathname={paths.join(' ')}
        className={css.header}
        style={minPageWidth ? {minWidth: minPageWidth} : null}>
        <Headerbackground
          className={css.navigation}
          profileNav={<ProfileNav />}
          navigation={<Navigation />}
        />
      </header>
    );
  }
}

export default Header;
