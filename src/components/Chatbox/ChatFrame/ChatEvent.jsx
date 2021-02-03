import React from 'react';
import css from 'styles/chatframe/index.less';

const ChatEvent = props => {
  const {name, date} = props;
  let dateDisplay = null;

  if (date) {
    dateDisplay = date.isSame(new Date(), 'day')
      ? '今天'
      : date.format('YYYY年MMMDo');
  }
  return (
    <div className={css.event}>
      <div className={css.space} />
      <div className={css.content}>
        {name && `欢迎 ${name} 进入房间`}
        {dateDisplay}
      </div>
      <div className={css.space} />
    </div>
  );
};

export default React.memo(ChatEvent);
