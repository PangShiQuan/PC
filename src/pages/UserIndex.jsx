import React, {Component} from 'react';
import dynamic from 'dva/dynamic';
import withUserCredential from 'components/Sync/UserCredential';
import {version} from 'config';

let UserProfile;
if (version === 'Dsf') {
  UserProfile = dynamic({
    component: () => import('components/User/Dsf/User1'),
  });
}
if (version === 'Base') {
  UserProfile = dynamic({
    component: () => import('components/User/Base/User1'),
  });
}

class UserIndex extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  render() {
    return <UserProfile />;
  }
}

export default withUserCredential(UserIndex);
