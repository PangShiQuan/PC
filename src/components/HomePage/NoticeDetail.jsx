import React, {Component} from 'react';
import moment from 'moment';
import {routerRedux} from 'dva/router';
import {connect} from 'dva';
import css from 'styles/homepage/notice.less';
import {LoadingBar, MDIcon} from 'components/General';

class NoticeDetail extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.onClickBackBtn = this.onClickBackBtn.bind(this);
    this.state = {
      isLoading: false,
    };
  }
  componentWillMount() {
    if (!this.props.selectedAnnouncement) {
      this.dispatch(routerRedux.push({pathname: '/noticelist'}));
    }
  }
  onClickBackBtn() {
    this.dispatch(routerRedux.push({pathname: '/noticelist'}));
  }
  renderContent() {
    if (this.props.selectedAnnouncement) {
      const {title, content, issueTime} = this.props.selectedAnnouncement;
      return (
        <div className={css.noticeDetail_body}>
          <h3 className={css.noticeDetail_header}>{title}</h3>
          <p className={css.noticeDetail_paragraph}>{content}</p>
          <p className={css.noticeDetail_date}>
            日期 : {moment(issueTime).format('YYYY年MMMDo')}
          </p>
        </div>
      );
    }
    return null;
  }
  render() {
    const {isLoading} = this.state;
    return (
      <div className={css.notice}>
        <h3 className={css.notice_header}>
          <MDIcon iconName="map-marker" />
          您的当前位置 : 首页 > {''}
          <button
            className={css.noticeDetail_backBtn}
            onClick={this.onClickBackBtn}>
            公告列表
          </button>
        </h3>
        <LoadingBar isLoading={isLoading} className={css.loading} />
        <div className={css.notice_container}>{this.renderContent()}</div>
      </div>
    );
  }
}

const mapStatesToProps = ({gameInfosModel}) => {
  return {selectedAnnouncement: gameInfosModel.selectedAnnouncement};
};

export default connect(mapStatesToProps)(NoticeDetail);
