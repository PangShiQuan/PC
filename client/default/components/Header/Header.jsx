import React, {Component} from 'react';

function Header ({className, profileNav, navigation}) {
    return(
      <div className={className}>
        {profileNav}
        {navigation}
      </div>);
}

export default Header;