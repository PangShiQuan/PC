import React, {Component} from 'react';
import {routerRedux} from 'dva/router';
import {MDIcon} from 'components/General';
import css from 'styles/betCenter/Dsf/HeaderNav1.less';
import * as images from 'components/BetCenter/Entrance/images';
import {CUSTOM_LIVECHAT_TRIGGER} from 'config';

class HeaderNav extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  render() {
    const {thisGameId, onlineServiceUrl} = this.props;
    const toResult = () => this.dispatch(routerRedux.push('/result'));
    const toPromotions = () => this.dispatch(routerRedux.push('/promotions'));
    const toTrend = () => this.dispatch(routerRedux.push('/trends'));
    const toInstruction = () =>
      this.dispatch(
        routerRedux.push(`/instructions?gameUniqueId=${thisGameId}`),
      );

    const csLiveChatProps = {};
    if(CUSTOM_LIVECHAT_TRIGGER){
      csLiveChatProps.onClick = CUSTOM_LIVECHAT_TRIGGER;
    }else{
      csLiveChatProps.href = onlineServiceUrl;
      csLiveChatProps.target="_blank";
    }

    return (
      <div className={css.headerNavContainer}>
        <div className={css.menuItem}>
          <button
            type="button"
            className={css.subMenuItem}
            onClick={toInstruction}>
            <img src={images.infoIcon} alt="玩法说明" className={css.navIcon} />
            <span className={css.label}>玩法说明</span>
          </button>
        </div>
        <div className={css.menuItem}>
          <button
            type="button"
            className={css.subMenuItem}
            onClick={toPromotions}>
            <img
              src={images.promotionIcon}
              alt="优惠活动"
              className={css.navIcon}
            />
            <span className={css.label}>优惠活动</span>
          </button>
        </div>
        <div className={css.menuItem}>
          <button type="button" className={css.subMenuItem} onClick={toResult}>
            <img
              src={images.resultIcon}
              alt="开奖公告"
              className={css.navIcon}
            />
            <span className={css.label}>开奖公告</span>
          </button>
        </div>
        <div className={css.menuItem}>
          <button type="button" className={css.subMenuItem} onClick={toTrend}>
            <img
              src={images.trendIcon}
              alt="走势图表"
              className={css.navIcon}
            />
            <span className={css.label}>走势图表</span>
          </button>
        </div>
        <div className={css.menuItem}>
          <a rel="noopener noreferrer" {...csLiveChatProps}>
            <button type="button" className={css.subMenuItem}>
              <img
                src={images.messageIcon}
                alt="在线客服"
                className={css.navIcon}
              />
              <span className={css.label}>在线客服</span>
            </button>
          </a>
        </div>
      </div>
    );
  }
}

export default HeaderNav;
