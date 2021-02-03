import React, {PureComponent} from 'react';
import {Pagination} from 'antd';
import _ from 'lodash';
import moment from 'moment';
import {routerRedux} from 'dva/router';
import {connect} from 'dva';
import css from 'styles/homepage/notice.less';
import {LoadingBar, MDIcon} from 'components/General';

class NoticeList extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.awaitingResponse = props.awaitingResponse;
    this.onPageChange = this.onPageChange.bind(this);
    this.state = {
      pageSize: 10,
    };
  }

  componentWillMount() {
    const {pageSize} = this.state;
    this.dispatch({type: 'gameInfosModel/getAnnouncementList'});
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize},
    });
  }

  componentWillReceiveProps(nextProps) {
    this.awaitingResponse = nextProps.awaitingResponse;
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeAll',
    });
  }

  onPageChange(currentPage, pageSize) {
    const start = (currentPage - 1) * pageSize;
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {start, currentPage},
    });
    this.dispatch({type: 'gameInfosModel/getAnnouncementList'});
  }

  onSelectedList = ({currentTarget}) => {
    let {item} = currentTarget.dataset;

    if (!currentTarget.dataset) item = currentTarget.getAttribute('data-item');

    this.dispatch({
      type: 'gameInfosModel/updateState',
      payload: {selectedAnnouncement: JSON.parse(item)},
    });
    this.dispatch(routerRedux.push({pathname: '/noticedetail'}));
  };

  renderList() {
    const {announcementList} = this.props;

    return _.map(announcementList, (item, index) => {
      const {title, issueTime} = item;

      return (
        <li key={index} className={css.notice_list}>
          <button
            type="button"
            className={css.notice_listBtn}
            onClick={this.onSelectedList}
            data-item={JSON.stringify(item || '')}>
            <MDIcon iconName="circle" />
            {title}
          </button>
          <span className={css.notice_listTime}>
            {moment(issueTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        </li>
      );
    });
  }

  renderPagination() {
    const {announcementListCount, currentPage, pageSize} = this.props;
    return (
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        onChange={this.onPageChange}
        showQuickJumper
        total={announcementListCount}
      />
    );
  }

  render() {
    return (
      <div className={css.noticeBg}>
        <div className={css.notice}>
          <h3 className={css.notice_header}>
            <MDIcon iconName="map-marker" />
            您的当前位置 : 首页 &gt; 公告列表
          </h3>
          <LoadingBar
            isLoading={this.awaitingResponse}
            className={css.loading}
          />
          <div className={css.notice_container}>
            <ul>{this.renderList()}</ul>
          </div>
          <div className={css.notice_pagination}>{this.renderPagination()}</div>
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({gameInfosModel, dataTableModel}) => {
  const {
    announcementList,
    announcementListCount,
    awaitingResponse,
  } = gameInfosModel;
  const {currentPage, pageSize} = dataTableModel;
  return {
    announcementList,
    announcementListCount,
    currentPage,
    pageSize,
    awaitingResponse,
  };
};

export default connect(mapStatesToProps)(NoticeList);
