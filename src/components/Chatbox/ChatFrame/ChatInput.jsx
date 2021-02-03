import React, {useState, useEffect, useCallback} from 'react';
import {connect} from 'dva';
import css from 'styles/chatframe/index.less';
import ChatboxEmoji from 'components/Chatbox/ChatboxEmoji';
import ChatboxUploadModal from 'components/Chatbox/ChatboxUploadModal';
import * as Images from '../resources';

const renderAttachmentBar = (disabled, emojiClick) => {
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [uploadImageFile, setUploadImageFile] = useState(null);

  const onFileChange = useCallback(event => {
    const image = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = e => {
      setUploadImageFile({
        name: image.name,
        imageURL: e.target.result,
      });
      document.querySelector('#chatboxUploadImageInput').value = '';
    };
  }, []);

  const onEmojiSelect = useCallback(emoji => {
    emojiClick(emoji);
    setShowEmojiModal(false);
  }, [emojiClick]);

  return (
    <React.Fragment>
      <div className={css.attachmentBar}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowEmojiModal(!showEmojiModal)}>
          <img
            src={Images.emoticonButton}
            alt="emoticon"
            className={css.imageButton}
          />
        </button>
        <input
          id="chatboxUploadImageInput"
          type="file"
          accept="image/png, image/jpeg"
          onChange={onFileChange}
          style={{display: 'none'}}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            document.querySelector('#chatboxUploadImageInput').click()
          }>
          <img
            src={Images.uploadButton}
            alt="uplaod"
            className={css.imageButton}
          />
        </button>
        <ChatboxEmoji emojiClick={onEmojiSelect} showModal={showEmojiModal} />
      </div>
      {uploadImageFile && (
        <ChatboxUploadModal
          imageFile={uploadImageFile}
          closeModal={() => setUploadImageFile(null)}
        />
      )}
    </React.Fragment>
  );
};

const renderMessageInput = (
  disabled,
  selectedRoom,
  inputValue,
  setInputValue,
  sendTextMessage,
) => {
  useEffect(() => {
    setInputValue('');
  }, [selectedRoom]);

  const onKeyPress = useCallback(event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      sendTextMessage(inputValue);
    }
  }, [inputValue]);

  return (
    <div className={css.inputBar}>
      <div className={css.inputBox} data-disabled={disabled}>
        <textarea
          rows="1"
          placeholder={disabled ? '您现在没有发言权限' : '请输入...'}
          value={inputValue}
          onKeyDown={onKeyPress}
          onChange={e => setInputValue(e.target.value)}
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => sendTextMessage(inputValue)}>
        发送
      </button>
    </div>
  );
};

const ChatInput = props => {
  const {dispatch, disabled, selectedRoom} = props;
  const [inputValue, setInputValue] = useState('');

  const sendTextMessage = useCallback(message => {
    if (message.trim()) {
      dispatch({
        type: 'chatboxModel/sendMessage',
        payload: {
          message,
        },
      });
    }
    setInputValue('');
  }, []);

  const emojiClick = useCallback(emoji => {
    setInputValue(`${inputValue}${emoji.native}`);
  }, [inputValue]);

  return (
    <div className={css.chatInput}>
      {renderAttachmentBar(disabled, emojiClick)}
      {renderMessageInput(
        disabled,
        selectedRoom,
        inputValue,
        setInputValue,
        sendTextMessage,
      )}
    </div>
  );
};

const mapStatesToProps = ({chatboxModel}) => {
  const {selectedRoom} = chatboxModel;
  return {
    selectedRoom,
  };
};

export default React.memo(connect(mapStatesToProps)(ChatInput));
