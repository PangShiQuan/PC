import React, {useCallback, useEffect} from 'react';
import moment from 'moment';
import {connect} from 'dva';
import {map, find} from 'lodash';
import css from 'styles/chatframe/index.less';
import ChatMessage from 'components/Chatbox/ChatFrame/ChatMessage';
import ChatInput from 'components/Chatbox/ChatFrame/ChatInput';
import ChatEvent from 'components/Chatbox/ChatFrame/ChatEvent';
import downArrow from 'assets/image/icn_downArrow.svg';

const massageMsgData = messages => {
  const output = [];
  let curUserId = null;
  let date = null;
  map(messages, msg => {
    if (!msg) return;

    if (msg.type === 'message') {
      // date separation
      if (!date || !moment(msg.messages.updatedTime).isSame(date, 'day')) {
        date = moment(msg.messages.updatedTime);
        output.push({
          type: 'date',
          date,
        });
      }

      // diff user separation
      if (curUserId === msg.userId && output[output.length - 1].messages) {
        const lastItem = output[output.length - 1];
        lastItem.messages.push({
          ...msg.messages,
        });
      } else {
        curUserId = msg.userId;
        output.push({
          ...msg,
          messages: [msg.messages],
        });
      }
    } else {
      curUserId = null;
      output.push(msg);
    }
  });
  return output;
};

const ChatFrame = props => {
  const {messages, userPrinciple, selectedRoom} = props;
  const outputMsg = massageMsgData(messages);
  let disabled = true;
  let userId = null;

  if (userPrinciple) {
    const selectRoom = find(
      userPrinciple.properties.rooms,
      room => room.id == selectedRoom.roomId,
    );
    if (selectRoom && selectRoom.canPost) {
      disabled = !selectRoom.canPost;
    }

    userId = userPrinciple.id;
  }

  const isAtBottom = useCallback(() => {
    const chatBody = document.querySelector('#chatbody');
    if (chatBody) {
      const curScrollPosition = chatBody.scrollTop + chatBody.offsetHeight;
      return curScrollPosition === chatBody.scrollHeight;
    }
    return false;
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const chatBody = document.querySelector('#chatbody');
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
  }, []);

  useEffect(() => {
    const chatBody = document.querySelector('#chatbody');
    chatBody.addEventListener('scroll', () => {
      document.querySelector(
        `.${css.scrollButton}`,
      ).style.display = isAtBottom() ? 'none' : 'block';
    });
  }, []);

  return (
    <div className={css.chatframe}>
      <div id="chatbody" className={css.chatBody}>
        {map(outputMsg, (msg, index) => {
          if (!msg) return;

          if (msg.type === 'message') {
            if (
              (index === outputMsg.length - 1 && msg.userId === userId) ||
              isAtBottom()
            ) {
              scrollToBottom();
            }
            return (
              <ChatMessage
                key={index}
                fromLoginUser={userId !== undefined && msg.userId == userId}
                avatar={msg.avatar}
                username={msg.username}
                messages={msg.messages}
                vipIcon={msg.vipIcon}
              />
            );
          }

          if (msg.type === 'date') {
            return <ChatEvent key={index} date={msg.date} />;
          }

          return msg.name ? <ChatEvent key={index} name={msg.name} /> : '';
        })}
      </div>
      <button
        type="button"
        className={css.scrollButton}
        onClick={scrollToBottom}>
        <img src={downArrow} className={css.icon} alt="arrow" />
      </button>
      <footer className={css.chatFooter}>
        <ChatInput disabled={disabled} />
      </footer>
    </div>
  );
};

const mapStatesToProps = ({chatboxModel}) => {
  const {userPrinciple, selectedRoom} = chatboxModel;
  return {
    userPrinciple,
    selectedRoom,
  };
};

export default React.memo(connect(mapStatesToProps)(ChatFrame));
