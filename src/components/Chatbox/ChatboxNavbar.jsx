import React from 'react';
import {connect} from 'dva';
import css from 'styles/chatbox/index.less';
import downArrow from 'assets/image/icn_downArrow.svg';

const ChatboxNavBar = props => {
  const {
    chatboxModel: {selectedRoom},
    showRoomList,
    onNavClick,
  } = props;
  return (
    <div className={css.chatbox_navbar}>
      <button
        type="button"
        className={css.chatbox_navbarButton}
        onClick={selectedRoom ? onNavClick : null}>
        <React.Fragment>
          {selectedRoom ? selectedRoom.roomName : '努力加载中...'}
          <img
            src={downArrow}
            className={css.icon}
            data-active={showRoomList}
            alt="arrow"
          />
        </React.Fragment>
      </button>
    </div>
  );
};

const mapStatesToProps = ({chatboxModel}) => {
  return {
    chatboxModel,
  };
};

export default connect(mapStatesToProps)(ChatboxNavBar);
