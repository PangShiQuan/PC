import React from 'react';
import css from 'styles/chatbox/index.less';

const ChatboxAlert = props => {
  const {
    alertObj: {title, desc, cancel, submit},
  } = props;

  const cancelLabel = cancel && cancel.label ? cancel.label : null;
  const submitLabel = submit && submit.label ? submit.label : '关闭';

  return (
    <div className={css.chatbox_alert_container}>
      <div className={css.alert_modal}>
        {title && <div className={css.title}>{title}</div>}
        {desc && <div className={css.desc}>{desc}</div>}
        <div className={css.footer}>
          {cancelLabel && (
            <button
              type="button"
              className={css.cancelButton}
              onClick={cancel.action}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={css.submitButton}
            onClick={submit.action}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatboxAlert;
