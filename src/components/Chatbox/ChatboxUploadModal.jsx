import React, {useState, useCallback} from 'react';
import {connect} from 'dva';
import css from 'styles/chatbox/chatboxUploadModal.less';
import ChatboxEmoji from 'components/Chatbox/ChatboxEmoji';
import * as Images from './resources';

const ChatboxUploadModal = props => {
  const {dispatch, imageFile, closeModal} = props;
  const {imageURL} = imageFile;

  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const emojiClick = useCallback(emoji => {
    setInputValue(`${inputValue}${emoji.native}`);
  }, [inputValue]);

  const submitImageMessage = useCallback(() => {
    dispatch({
      type: 'chatboxModel/uploadImageFile',
      payload: {
        imageFile,
        message: inputValue,
      },
    });
    closeModal();
  }, [imageURL, inputValue]);

  return (
    <div className={css.chatbox_upload_modal_container}>
      <div className={css.chatbox_upload_modal}>
        <div className={css.header}>
          确定要发送这照片到群里吗？
          <button
            type="button"
            className={css.closeButton}
            onClick={closeModal}>
            <img src={Images.closeButton} alt="close" />
          </button>
        </div>

        <div className={css.body}>
          <div className={css.image_container}>
            <img src={imageURL} alt="upload_image" />
          </div>
        </div>

        <div className={css.inputDiv}>
          <div className={css.emoji_container}>
            <button
              type="button"
              onClick={() => setShowEmojiModal(!showEmojiModal)}>
              <img
                src={Images.emoticonButton}
                alt="emoticon"
                className={css.imageButton}
              />
            </button>
          </div>
          <input
            type="text"
            value={inputValue}
            placeholder="请输入..."
            onChange={e => setInputValue(e.target.value)}
            className={css.inputBox}
          />
          <ChatboxEmoji emojiClick={emojiClick} showModal={showEmojiModal} />
        </div>

        <div className={css.submitDiv}>
          <button
            type="button"
            className={css.submitButton}
            onClick={submitImageMessage}>
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStatesToProps = ({chatboxModel}) => {
  const {selectedRoom} = chatboxModel;
  return {
    selectedRoom,
  };
};

export default React.memo(connect(mapStatesToProps)(ChatboxUploadModal));
