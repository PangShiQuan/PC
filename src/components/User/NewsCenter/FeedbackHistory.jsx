import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {DatePicker, Pagination} from 'antd';
import {MDIcon} from 'components/General';
import moment from 'moment';

import {dateFormat, timeframeRefs} from 'utils/type.config';
import profileCss from 'styles/User/Dsf/ProfileIndex1.less';
import css from 'styles/User/NewsCenter/Feedback.less';
import ContentContainer from 'components/User/ContentContainer';
import Dropdown from 'components/User/Form/Dropdown';

const {RangePicker} = DatePicker;
const STATUS = {
  RESOLVED: '已回复',
  NORMAL: '未回复',
  ALL: '全部',
};
const INIT_STATE = {
  selectedFeedbackId: null,
};

class FeedbackHistory extends PureComponent {
  constructor(props) {
    super(props);
    this.state = INIT_STATE;
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize: 10},
    });
    this.getData();
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeAll',
    });
  }

  onClearDateClick = () => {
    const {dayCounts} = this.props;
    const newStartTime = moment(new Date()).add(-dayCounts, 'days');

    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {startTime: newStartTime},
    });
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['endTime'],
    });
    this.getData();
  };

  onDateChange = ([startTime, endTime]) => {
    this.clearPageSelection();

    if (!startTime && !endTime) {
      this.onClearDateClick();
    } else if (startTime && endTime) {
      this.dispatch({
        type: 'dataTableModel/updateState',
        payload: {startTime, endTime},
      });
      this.getData();
    }
  };

  onPageChange = (currentPage, pageSize) => {
    const start = (currentPage - 1) * pageSize;
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {start, currentPage, pageSize},
    });
    this.getData();
  };

  onStatusChange = status => {
    this.clearPageSelection();
    this.dispatch({
      type: 'feedbackModel/updateState',
      payload: {status},
    });
    this.getData();
  };

  getData = () => {
    this.setState(INIT_STATE);
    this.dispatch({
      type: `feedbackModel/getFeedbackHistory`,
    });
  };

  expandContent = ({currentTarget}) => {
    const {value} = currentTarget;

    this.setState(({selectedFeedbackId}) => ({
      selectedFeedbackId: selectedFeedbackId === value ? '' : value,
    }));
  };

  clearPageSelection = () => {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['currentPage', 'start'],
    });
  };

  renderPagination = () => {
    if (!this.props.datas.length) return null;
    const {currentPage, pageSize, totalCount} = this.props;
    return (
      <Pagination
        className={css.pagination}
        current={currentPage}
        pageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageChange}
        showQuickJumper
        showSizeChanger
        total={totalCount}
      />
    );
  };

  renderHistoryCtrl = () => {
    const {startTime, endTime, status} = this.props;
    const ranges = {};

    timeframeRefs.forEach(time => {
      const {displayText} = time;
      if (time.dayCounts) {
        const startRange = moment(new Date()).add(-time.dayCounts, 'days');
        ranges[displayText] = [startRange, endTime];
      }
    });

    return (
      <div className={css.filterContainer}>
        <div className={css.filterDiv}>日期</div>
        <div className={css.filterDiv}>
          <RangePicker
            onChange={this.onDateChange}
            value={[startTime, endTime]}
            ranges={ranges}
            className={css.datePicker}
          />
        </div>
        <div className={css.filterDiv}>
          <Dropdown
            items={STATUS}
            defaultValue={STATUS[status]}
            onClick={this.onStatusChange}
            componentStyle={{padding: '10px'}}
          />
        </div>
      </div>
    );
  };

  renderTableBody = () => {
    const {datas} = this.props;

    return (
      <tbody>
        {!datas.length ? (
          <tr data-last="true">
            <td colSpan="4" className={css.table_column_empty}>
              暂无数据
            </td>
          </tr>
        ) : (
          datas.map((item, index) => {
            const {selectedFeedbackId} = this.state;
            const {
              id,
              status,
              title,
              content,
              updateTime,
              createTime,
              answer,
            } = item;
            const isLastRow = index === datas.length - 1;

            return (
              <React.Fragment key={id}>
                <tr data-last={isLastRow && selectedFeedbackId !== id}>
                  <td className={css.table_column_title}>{title}</td>
                  <td
                    className={css.table_column_status}
                    data-replied={answer !== undefined}>
                    {STATUS[status]}
                  </td>
                  <td className={css.table_column_time}>
                    {moment(updateTime * 1000).fromNow()}
                  </td>
                  <td className={css.table_column_details}>
                    <button
                      type="button"
                      onClick={this.expandContent}
                      className={profileCss.profile_tableAnchor}
                      value={id}>
                      详情
                      <MDIcon
                        iconName={
                          selectedFeedbackId !== id ? 'menu-down' : 'menu-up'
                        }
                        className={css.icon}
                      />
                    </button>
                  </td>
                </tr>
                <tr data-last={isLastRow && selectedFeedbackId === id}>
                  <td
                    colSpan="100%"
                    className={css.table_column_description}
                    style={
                      selectedFeedbackId !== id ? {display: 'none'} : null
                    }>
                    {selectedFeedbackId === id ? (
                      <div>
                        <div className={css.question}>
                          <div>
                            <small>问题内容：</small>
                          </div>
                          <div>{content}</div>
                          <div className={css.datetime}>
                            {moment(createTime * 1000).format(dateFormat)}
                          </div>
                        </div>
                        {answer && (
                          <div>
                            <div>
                              <small>回复：</small>
                            </div>
                            <div>{answer}</div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              </React.Fragment>
            );
          })
        )}
      </tbody>
    );
  };

  render() {
    return (
      <ContentContainer title="历史反馈">
        {this.renderHistoryCtrl()}
        <table className={css.table}>
          <thead>
            <tr>
              <td className={css.table_header}>标题</td>
              <td className={css.table_header}>状态</td>
              <td className={css.table_header}>信息变动时间</td>
              <td className={css.table_header}>内容</td>
            </tr>
          </thead>
          {this.renderTableBody()}
        </table>
        {this.renderPagination()}
      </ContentContainer>
    );
  }
}

function mapStateToProps({dataTableModel, feedbackModel}) {
  return {
    ...dataTableModel,
    ...feedbackModel,
  };
}

export default connect(mapStateToProps)(FeedbackHistory);
