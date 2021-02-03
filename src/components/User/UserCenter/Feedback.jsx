import React, {Component} from 'react';
import {connect} from 'dva';
import TextArea from 'antd/es/input/TextArea';
import {DatePicker, Dropdown, Pagination} from 'antd';
import moment from 'moment';
import classnames from 'classnames';

import {LoadingBar, MDIcon} from 'components/General';
import {dateFormat, timeframeRefs} from 'utils/type.config';
import profileCss from 'styles/User/Dsf/ProfileIndex1.less';
import css from 'styles/User/feedback.less';
import resolve from 'clientResolver';

const ProfileInput = resolve.plugin('ProfileInput');

const {RangePicker} = DatePicker;
const STATUS = {
  RESOLVED: '已回复',
  NORMAL: '未回复',
  ALL: '全部',
};
const INIT_STATE = {
  selectedFeedback: null,
};

class Feedback extends Component {
  constructor(props) {
    super(props);
    this.state = INIT_STATE;
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
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
    this.clearForm();
  }

  onCancelFeedback = () => {
    this.clearForm();
  };

  onSubmitFeedback = event => {
    event.preventDefault();
    this.dispatch({
      type: 'feedbackModel/postNewQA',
    });
  };

  onClearDateClick() {
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
  }

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

  onStatusChange = event => {
    const status = event.target.value;

    this.clearPageSelection();
    this.dispatch({
      type: 'feedbackModel/updateState',
      payload: {status},
    });
    this.getData();
  };

  onInputChange = event => {
    event.persist();
    const {
      target: {value, name},
    } = event;

    this.dispatch({
      type: 'formModel/updateState',
      payload: {[name]: {value}},
    });
  };

  getData() {
    this.setState(INIT_STATE);
    this.dispatch({
      type: `feedbackModel/getFeedbackHistory`,
    });
  }

  expandContent = ({currentTarget}) => {
    const {value} = currentTarget;

    this.setState(({selectedId}) => ({
      selectedId: selectedId === value ? '' : value,
    }));
  };

  clearForm() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['feedbackContent', 'feedbackTitle'],
    });
  }

  clearPageSelection() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['currentPage', 'start'],
    });
  }

  renderForm() {
    const {
      feedbackContent: {value: content},
      feedbackTitle: {value: title},
    } = this.props;

    return (
      <form noValidate className={profileCss.profile_contentBody}>
        <legend className={profileCss.profile_formLabel}>我要反馈</legend>
        <ProfileInput
          label="标题:"
          id="feedbackTitle"
          name="feedbackTitle"
          onChange={this.onInputChange}
          value={title}
          layout="horizontal"
          max="25"
          placeholder="请输入25字以内的反馈标题"
        />
        <div className={profileCss.profile_inputBox}>
          <label
            htmlFor="feedbackContent"
            className={profileCss.profile_inputLabel}
            data-layout="horizontal">
            内容:
          </label>
          <TextArea
            id="feedbackContent"
            name="feedbackContent"
            onChange={this.onInputChange}
            value={content}
            autosize={{minRows: 3, maxRows: 9}}
            className={classnames(css.input, profileCss.profile_input)}
            maxLength="100"
            data-layout="horizontal"
            placeholder="请输入100字以内的反馈内容"
          />
          <span className={profileCss.profile_inputLength}>
            {content.length}/ 100
          </span>
        </div>

        <fieldset className={css.form_btns}>
          <button
            disabled={!content || !title}
            type="submit"
            className={profileCss.profile_inputInlineBtn}
            onClick={this.onSubmitFeedback}>
            提交
          </button>
          <button
            disabled={!(content || title)}
            type="reset"
            className={profileCss.profile_inputInlineBtn}
            onClick={this.onCancelFeedback}>
            取消
          </button>
        </fieldset>
      </form>
    );
  }

  renderPagination() {
    if (!this.props.datas.length) return null;
    const {currentPage, pageSize, totalCount} = this.props;
    return (
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageChange}
        showQuickJumper
        showSizeChanger
        total={totalCount}
      />
    );
  }

  renderStatus() {
    const {status} = this.props;
    return (
      <ul className={profileCss.profile_dropdownMenu}>
        {Object.entries(STATUS).map(([key, value], index) => (
            <li key={index}>
              <button type="button"
                className={profileCss.profile_dropdownMenuItem}
                onClick={this.onStatusChange}
                data-active={status === key}
                value={key}>
                {value}
              </button>
            </li>
          ))}
      </ul>
    );
  }

  renderHistoryCtrl() {
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
      <div>
        <span>历史反馈</span>
        <RangePicker
          onChange={this.onDateChange}
          value={[startTime, endTime]}
          ranges={ranges}
          className={css.ctrl}
        />
        <Dropdown trigger={['click']} overlay={this.renderStatus()}>
          <button type="button" className={css.ctrl}>
            <span>{STATUS[status]}</span>
            <MDIcon
              iconName="menu-down"
              className={profileCss.profile_tableMenuDownIcon}
            />
          </button>
        </Dropdown>
      </div>
    );
  }

  renderTableBody() {
    const {datas} = this.props;
    if (!datas.length)
      return <section className={css.feedback_row}>暂无数据</section>;
    return datas.map(item => {
      const {id, status, title, content, updateTime, createTime, answer} = item;

      return (
        <div
          key={id}
          className={css.feedback_row}
          data-expanded={id === this.state.selectedId}>
          <div className={css.feedback_col}>{title}</div>
          <div className={css.feedback_col}>{STATUS[status]}</div>
          <div className={css.feedback_col}>
            {moment(updateTime * 1000).fromNow()}
          </div>
          <div className={css.feedback_col}>
            <button
              type="button"
              onClick={this.expandContent}
              className={profileCss.profile_tableAnchor}
              value={id}>
              内容
            </button>
          </div>
          {id === this.state.selectedId ? (
            <div
              className={classnames(
                css.feedback_contentWrapper,
              )}>
              <p className={css.feedback_content}>
                <span>
                  <small>问题内容：</small>
                  <br />
                  {content}
                </span>
                <small> {moment(createTime * 1000).format(dateFormat)}</small>
              </p>
              {answer ? (
                <p className={css.feedback_content}>
                  <small>{moment(updateTime * 1000).format(dateFormat)} </small>
                  <span>
                    <small>回复：</small>
                    <br />
                    {answer}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      );
    });
  }

  renderHistory() {
    const {awaitingResponse} = this.props;

    return (
      <div className={profileCss.profile_contentBody}>
        {this.renderHistoryCtrl()}
        <LoadingBar isLoading={awaitingResponse} />
        <div className={css.feedback_table}>
          <div className={classnames(css.feedback_thead, css.feedback_row)}>
            <div className={css.feedback_col}>标题</div>
            <div className={css.feedback_col}>状态</div>
            <div className={css.feedback_col}>信息变动时间</div>
            <div className={css.feedback_col}>内容</div>
          </div>
          <div>{this.renderTableBody()}</div>
        </div>
        {this.renderPagination()}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderForm()}
        {this.renderHistory()}
      </div>
    );
  }
}

function mapStateToProps({dataTableModel, feedbackModel, formModel}) {
  const {feedbackContent, feedbackTitle} = formModel;
  return {...dataTableModel, ...feedbackModel, feedbackContent, feedbackTitle};
}

export default connect(mapStateToProps)(Feedback);
