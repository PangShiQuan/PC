import React, {PureComponent} from 'react';
import {connect} from 'dva';
import isGuestUser from 'utils/isGuestUser';
import ChatboxWindow from './ChatboxWindow';

class Chatbox extends PureComponent {
  render() {
    const {userData, isChatEnabled} = this.props;
    const isGuest = isGuestUser(userData);

    return !isGuest && isChatEnabled ? <ChatboxWindow /> : null;
  }
}

const mapStatesToProps = ({userModel, chatboxModel}) => {
  const {enable: isChatEnabled} = chatboxModel;
  return {
    userData: userModel,
    isChatEnabled,
  };
};

export default connect(mapStatesToProps)(Chatbox);
