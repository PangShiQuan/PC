import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {routerRedux} from 'dva/router';
import {MDIcon} from 'components/General';
import css from 'styles/footer/Base/sitemap1.less';
import qq from 'assets/image/QQ.svg';
import custom from 'assets/image/custom.svg';
import wecat from 'assets/image/wecat.svg';
import phone from 'assets/image/phone.svg';
import email from 'assets/image/emial.svg';
import {assets} from 'config';
import resolve from 'clientResolver';
import {CUSTOM_LIVECHAT_TRIGGER} from 'config';

const logo = resolve.client(assets.logo);

class Sitemap extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    this.dispatch({
      type: 'helpCenterModel/getHelpList',
    });
  }
  onQuestionClick({questionId, cateId}) {
    this.dispatch({
      type: 'helpCenterModel/updateState',
      payload: {selectedCategory: cateId, selectedQuestionId: questionId},
    });
    this.dispatch(routerRedux.push({pathname: '/helpcenter'}));
  }

  renderList({helpList, cateName, cateId}) {
    if (!helpList.length) {
      return (
        <p className={css.sitemap_emtpyColumnMsg}>
          {cateName}正在完善中，如有疑问，请联系在线客服
        </p>
      );
    }
    const result = _.map(helpList, (listItem, index) => {
      if (index > 4) return null;
      const {title, id} = listItem;
      return (
        <li key={index} className={css.sitemap_question}>
          <button
            onClick={this.onQuestionClick.bind(this, {
              questionId: id,
              cateId,
            })}>
            {title}
          </button>
        </li>
      );
    });
    return result;
  }

  renderAll() {
    const {pcOtherInfo} = this.props;
    const {otherContactDtoList = []} = pcOtherInfo;
    const result = _.map(otherContactDtoList, (listItem, index) => {
      const {title, content, iconUrl} = listItem;
      return (
        <p className={css.sitemap_contact} key={index} >
          <span className={css.leftstyle}><img src={iconUrl} className={css.peture}/></span>
          <i>&nbsp;&nbsp;&nbsp;{title}:{content}</i>
        </p>
      );
    });
    return result;
  }
  renderQQ() {
    const {pcOtherInfo} = this.props;
    if (!pcOtherInfo || !pcOtherInfo.qq1) return null;
    const {qq1} = pcOtherInfo;
    return (
      <p className={css.sitemap_contact} >
      <span  className={css.leftstyle}><img src={qq}  className={css.peture}/></span>
    <i>&nbsp;&nbsp;&nbsp;QQ:{qq1}</i>
  </p>
    );
  }
  renderCustomerService() {
    const {pcOtherInfo} = this.props;
    if (!pcOtherInfo || !pcOtherInfo.onlineServiceUrl) return null;
    const {onlineServiceUrl} = pcOtherInfo;

    const csLiveChatProps = {};
    if(CUSTOM_LIVECHAT_TRIGGER){
      csLiveChatProps.onClick = CUSTOM_LIVECHAT_TRIGGER;
    }else{
      csLiveChatProps.href = onlineServiceUrl;
      csLiveChatProps.target="_blank";
    }

    return (
      <p className={css.sitemap_contact}>
        <span className={css.leftstyle}><img src={custom}  className={css.peture}/></span>
        <a rel="noopener noreferrer" {...csLiveChatProps}>
          &nbsp;&nbsp;&nbsp;在线客服
        </a>
      </p>
    );
  }


  renderSitemap() {
    const {helpDocs} = this.props;
    if (!helpDocs) {
      return (
        <p className={css.sitemap_emptyMsg}>
          帮助中心正在完善中，如有疑问，请联系在线客服
        </p>
      );
    }
    const result = _.map(helpDocs, helpItem => {
      const {helpList, cateName, cateId} = helpItem;
      if (cateName === '新手指南') return null;
      return (
        <div className={css.sitemap_rightColumn} key={cateId}>
          <div className={css.sitemap_rightColumnHeader}>{cateName}</div>
          <ul className={css.sitemap_questions}>
            {this.renderList({helpList, cateName, cateId})}
          </ul>
        </div>
      );
    });
    return result;
  }
  renderEmial() {
    const {pcOtherInfo} = this.props;
    if (!pcOtherInfo || !pcOtherInfo.emailForComplain) return null;
    const {emailForComplain} = pcOtherInfo;
    return (
      <p className={css.sitemap_contact} >
        <span  className={css.leftstyle}><img src={email}  className={css.peture}/></span>
        <i>&nbsp;&nbsp;&nbsp;投诉邮箱:{emailForComplain}</i>
      </p>
    );
  }

  renderPhone() {
    const {pcOtherInfo} = this.props;
    if (!pcOtherInfo || !pcOtherInfo.telephone) return null;
    const {telephone} = pcOtherInfo;
    return (
      <p className={css.sitemap_contact} >
        <span  className={css.leftstyle}><img src={phone}  className={css.peture}/></span>
        <i>&nbsp;&nbsp;&nbsp;telephone:{telephone}</i>
      </p>
    );
  }

  renderWecat() {
    const {pcOtherInfo} = this.props;
    if (!pcOtherInfo || !pcOtherInfo.weCat) return null;
    const {weChat} = pcOtherInfo;
    return (
      <p className={css.sitemap_contact} >
        <span  className={css.leftstyle}><img src={wecat}  className={css.peture}/></span>
        <i>&nbsp;&nbsp;&nbsp;weChat:{weChat}</i>
      </p>
    );
  }
  render() {
    const {sitemapBgColor, pcOtherInfo} = this.props;
    const {otherContactDtoList = []} = pcOtherInfo;
    let showDtoList = false;
    if (otherContactDtoList.length > 0) {
      showDtoList = true;
    }
    return (
      <div className={css.sitemap} data-sitemapbgcolor={sitemapBgColor}>
        <div className={css.sitemap_body}>
          <div className={css.sitemap_leftColumn}>
            <div className={css.sitemap_logo}>
              <img src={logo} alt={pcOtherInfo.siteName} />
            </div>
            <div className={css.sitemap_benefits}>
              <p className={css.sitemap_benefit}>
                <MDIcon
                  iconName="checkbox-marked"
                  className={css.sitemap_checkbox}
                />
                账户安全
              </p>
              <p className={css.sitemap_benefit}>
                <MDIcon
                  iconName="checkbox-marked"
                  className={css.sitemap_checkbox}
                />
                购彩便捷
              </p>
              <p className={css.sitemap_benefit}>
                <MDIcon
                  iconName="checkbox-marked"
                  className={css.sitemap_checkbox}
                />
                兑奖简单
              </p>
              <p className={css.sitemap_benefit}>
                <MDIcon
                  iconName="checkbox-marked"
                  className={css.sitemap_checkbox}
                />
                提款快速
              </p>
            </div>
          </div>
          <div className={css.sitemap_rightColumns}>
            {this.renderSitemap()}
            <div className={css.sitemap_rightColumn}>
              <p className={css.sitemap_rightColumnHeader}>联系我们</p>
              {this.renderQQ()}
              {this.renderCustomerService()}
              {showDtoList ? this.renderAll():null}
              {!showDtoList ? this.renderEmial():null}
              {!showDtoList ? this.renderWecat():null}
              {!showDtoList ? this.renderPhone():null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({helpCenterModel, gameInfosModel}) => {
  const {pcOtherInfo = {}} = gameInfosModel;
  return {...helpCenterModel, pcOtherInfo};
};

export default connect(mapStatesToProps)(Sitemap);
