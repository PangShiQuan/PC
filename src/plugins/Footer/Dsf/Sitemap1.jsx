import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {routerRedux} from 'dva/router';
import {MDIcon} from 'components/General';
import css from 'styles/footer/Dsf/sitemap1.less';
import resolve from 'clientResolver';
import {CUSTOM_LIVECHAT_TRIGGER} from 'config';

const logo =resolve.client('assets/image/logo.png');

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
  onQuestionClick = ({currentTarget}) => {
    let {
      cateid: selectedCategory,
      id: selectedQuestionId,
    } = currentTarget.dataset;

    if (!currentTarget.dataset) {
      selectedCategory = currentTarget.getAttribute('data-cateid');
      selectedQuestionId = currentTarget.getAttribute('data-id');
    }

    this.dispatch({
      type: 'helpCenterModel/updateState',
      payload: {selectedCategory, selectedQuestionId},
    });
    this.dispatch(routerRedux.push({pathname: '/helpcenter'}));
  };

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
            onClick={this.onQuestionClick}
            data-id={id}
            data-cateid={cateId}>
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
        <p className={css.sitemap_contact} key={index} style={{'width':'14.8rem','overflow': 'hidden','textOverflow': 'ellipsis','whiteSpace': 'nowrap'}} >
          <span style={{marginLeft:'0.1rem'}}><img src={iconUrl}  style={{'width':'15px','height':'15px'}}/></span>
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
      <p className={css.sitemap_contact}>
        <MDIcon iconName="qqchat" />
        <i>QQ: {qq1}</i>
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
        <MDIcon iconName="headset" />
        <a rel="noopener noreferrer" {...csLiveChatProps}>
          在线客服
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

  render() {
    const {sitemapBgColor, pcOtherInfo} = this.props;
    return null;
    // return (
    //   <div className={css.sitemap} data-sitemapbgcolor={sitemapBgColor}>
    //     <div className={css.sitemap_body}>
    //       <div className={css.sitemap_leftColumn}>
    //         <div className={css.sitemap_logo}>
    //           <img src={logo} alt={pcOtherInfo.siteName} />
    //         </div>
    //         <div className={css.sitemap_benefits}>
    //           <p className={css.sitemap_benefit}>
    //             <MDIcon
    //               iconName="checkbox-marked"
    //               className={css.sitemap_checkbox}
    //             />
    //             账户安全
    //           </p>
    //           <p className={css.sitemap_benefit}>
    //             <MDIcon
    //               iconName="checkbox-marked"
    //               className={css.sitemap_checkbox}
    //             />
    //             购彩便捷
    //           </p>
    //           <p className={css.sitemap_benefit}>
    //             <MDIcon
    //               iconName="checkbox-marked"
    //               className={css.sitemap_checkbox}
    //             />
    //             兑奖简单
    //           </p>
    //           <p className={css.sitemap_benefit}>
    //             <MDIcon
    //               iconName="checkbox-marked"
    //               className={css.sitemap_checkbox}
    //             />
    //             提款快速
    //           </p>
    //         </div>
    //       </div>
    //       <div className={css.sitemap_rightColumns}>
    //         {this.renderSitemap()}
    //         <div className={css.sitemap_rightColumn}>
    //           <p className={css.sitemap_rightColumnHeader}>联系我们</p>
    //           {this.renderQQ()}
    //           {this.renderCustomerService()}
    //           {this.renderAll()}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}

const mapStatesToProps = ({helpCenterModel, gameInfosModel}) => {
  const {pcOtherInfo = {}} = gameInfosModel;
  return {...helpCenterModel, pcOtherInfo};
};

export default connect(mapStatesToProps)(Sitemap);
