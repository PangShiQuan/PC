import React from 'react';
import {connect} from 'dva';
import {map} from 'lodash';
import css from 'styles/chatbox/index.less';
import roomSVG from 'assets/image/icn_room.svg';
import SVG from 'react-inlinesvg';

const ChatboxRoomList = props => {
  const {
    chatboxModel: {
      allRooms,
      selectedRoom: {roomId},
    },
    onSelectRoom,
  } = props;

  return (
    <div className={css.chatbox_roomList_container}>
      <div className={css.chatbox_roomList}>
        {map(allRooms, room => {
          return (
            <button
              type="button"
              key={room.roomId}
              data-active={roomId === room.roomId}
              onClick={() => onSelectRoom(room.roomId)}>
              <SVG className={css.roomIcon} src={roomSVG} />
              {room.roomName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const mapStatesToProps = ({chatboxModel}) => {
  return {
    chatboxModel,
  };
};

export default connect(mapStatesToProps)(ChatboxRoomList);
