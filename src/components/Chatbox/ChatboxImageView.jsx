import React from 'react';
import css from 'styles/chatbox/imageview.less';

const ChatboxImageView = props => {
  const {imageURL, closeFullScreenImage} = props;
  return (
    <button
      type="button"
      className={css.image_container}
      onClick={closeFullScreenImage}>
      <img className={css.image} src={imageURL} alt="attachment" />
    </button>
  );
};

export default React.memo(ChatboxImageView);
