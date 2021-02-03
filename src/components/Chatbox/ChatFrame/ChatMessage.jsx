import React, {useCallback} from 'react';
import {map} from 'lodash';
import {connect} from 'dva';
import moment from 'moment';
import css from 'styles/chatframe/index.less';
import {type as TYPE} from 'utils';

const renderTime = time => {
  return <div className={css.time}>{moment(time).format('HH:mm:ss')}</div>;
};

const renderTipster = (msg, index, fromLoginUser, followOrderClick) => {
  const {
    updatedTime,
    properties: {data},
  } = msg;

  const isLogin = localStorage.getItem(TYPE.accessToken);

  return (
    <div key={index} className={css.tipster} data-user={fromLoginUser}>
      <div className={css.header}>
        <div
          className={css.gameIcon}
          style={{backgroundImage: `url(${data.lotteryIcon})`}}
        />
        <div className={css.gameDesc}>
          <div className={css.gameHeader}>
            <div>{data.gameName}</div>
            <div>玩法：{data.gameType}</div>
          </div>
          <div className={css.issue}>期号：{data.round}</div>
          <div className={css.info}>
            投注命中率<span>{data.probability}</span>
          </div>
        </div>
      </div>
      <div className={css.body}>
        <div>
          <div>{data.detail}</div>
          <div>投注内容</div>
        </div>
        <div>
          <div>{data.amount}</div>
          <div>投注金额</div>
        </div>
      </div>
      <div className={css.footer}>
        <button
          type="button"
          className={css.submitButton}
          disabled={!isLogin}
          onClick={() => followOrderClick(data.orderId, data.userId)}>
          跟单
        </button>
      </div>
      {renderTime(updatedTime)}
    </div>
  );
};

const renderImage = (files, imageClick) => {
  const imageURL = files[0].url;

  return (
    <button type="button" onClick={() => imageClick(imageURL)}>
      <img className={css.image} src={imageURL} alt="attached img" />
    </button>
  );
};
const ChatMessage = props => {
  const {dispatch, fromLoginUser, avatar, username, vipIcon, messages} = props;

  const imageClick = useCallback(imageURL => {
    dispatch({
      type: 'chatboxModel/updateState',
      payload: {
        showFullScreenImage: imageURL,
      },
    });
  }, []);

  const followOrderClick = useCallback((orderId, userId) => {
    dispatch({
      type: 'chatboxModel/followOrder',
      payload: {
        orderId,
        userId,
      },
    });
  }, []);

  return (
    <div className={css.message} data-user={fromLoginUser}>
      <div className={css.avatar} style={{backgroundImage: `url(${avatar})`}} />

      <div className={css.contentContainer}>
        <div className={css.content_header}>
          <div className={css.username}>{username}</div>
          {vipIcon && <img className={css.vipIcon} src={vipIcon} />}
        </div>

        {map(messages, (msg, index) => {
          if (msg.properties && !msg.properties.files) {
            return renderTipster(msg, index, fromLoginUser, followOrderClick);
          }
          return (
            <div
              className={css.content}
              key={index}
              data-first={messages.length > 1 && index !== messages.length - 1}
              data-last={messages.length > 1 && index !== 0}>
              {msg.content}
              {msg.properties && msg.properties.files
                ? renderImage(msg.properties.files, imageClick)
                : ''}
              {renderTime(msg.updatedTime)}
            </div>
          );
        })}
      </div>
      <div className={css.space} />
    </div>
  );
};

export default React.memo(connect()(ChatMessage));
