import * as Images from './resources';

export default (message, selectedRoom, dispatch, handleChatboxSwitchChange) => {
  if (message.principal) {
    dispatch({
      type: 'chatboxModel/updateState',
      payload: {
        userPrinciple: message.principal,
      },
    });
    const welcomeMsg = message.principal.properties.rooms.find(
      room => room.id == selectedRoom.roomId,
    ).welcome;

    if (welcomeMsg) {
      const msgObj = {
        type: 'message',
        username: '系统管理员',
        avatar: Images.systemAvatar,
        messages: {
          content: welcomeMsg,
          updatedTime: new Date(),
        },
      };
      return msgObj;
    }
    return null;
  }

  if (message.kind === 'message' && message.renderer === 'text') {
    const msgObj = {
      type: 'message',
      userId: message.from.id,
      username: message.from.name,
      avatar: message.from.avatar,
      vipIcon: message.from.vipIcon,
      messages: {
        content: message.content,
        properties: message.properties,
        updatedTime: message.created_at,
      },
    };
    return msgObj;
  }

  if (message.kind === 'message' && message.renderer === 'sharedtemplate01') {
    const msgObj = {
      type: 'message',
      userId: message.from.id,
      username: message.from.name,
      avatar: message.from.avatar,
      vipIcon: message.from.vipIcon,
      messages: {
        content: message.content,
        updatedTime: message.created_at,
        properties: message.properties,
      },
    };

    return msgObj;
  }

  if (message.kind === 'event' && message.event === 'room_join') {
    const msgObj = {
      type: 'room_join',
      name: message.name,
    };
    return msgObj;
  }

  if (message.kind === 'event' && message.event === 'switch_chat_changed') {
    handleChatboxSwitchChange();
  } else if (message.kind === 'event' && message.event.includes('_changed')) {
    // user_changed
    // room_detail_changed
    // room_status_changed
    dispatch({
      type: 'chatboxModel/getUserPrinciple',
    });
  }
};
