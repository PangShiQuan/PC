import React, {Component} from 'react';
import moment from 'moment';
import {connect} from 'dva';
import {Dropdown, Pagination} from 'antd';
import _ from 'lodash';
import {LoadingBar, MDIcon} from 'components/General';
import {type as TYPE} from 'utils';
import css from 'styles/User/Dsf/ProfileIndex1.less';

const {messageTypeRefs} = TYPE;

class MsgInbox extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.awaitingResponse = this.props.awaitingResponse;
    this.dispatch = this.props.dispatch;
    this.onPageChange = this.onPageChange.bind(this);
    this.onPageSizeChange = this.onPageSizeChange.bind(this);
  }
  componentWillMount() {
    this.dispatch({type: 'userModel/getUserMessage'});
  }
  componentWillReceiveProps(nextProps) {
    this.awaitingResponse = nextProps.awaitingResponse;
  }
  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['currentPage', 'pageSize', 'start'],
    });
    this.dispatch({
      type: 'userModel/getUserMessageCount',
    });
  }
  onTypeSelect(messageType) {
    this.dispatch({
      type: 'userModel/updateState',
      payload: {messageType},
    });
    this.dispatch({type: 'userModel/getUserMessage'});
  }
  onPageChange(currentPage, pageSize) {
    const start = (currentPage - 1) * pageSize;
    this.dispatch({type: 'dataTableModel/updateState', payload: {start}});
    this.dispatch({type: 'userModel/getUserMessage'});
  }
  onPageSizeChange(currentPage, pageSize) {
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize, currentPage, start: 0},
    });
    this.dispatch({type: 'userModel/getUserMessage'});
  }
  onExpandContent(expandedId) {
    if (expandedId === this.state.expandedId) {
      this.setState({expandedId: ''});
    } else {
      this.setState({expandedId});
    }
  }
  renderTypesDropdown() {
    const {messageType} = this.props;
    return (
      <ul className={css.profile_dropdownMenu}>
        {_.map(messageTypeRefs, (typeValue, typeKey) => {
          const btnProps = {
            className: css.profile_dropdownMenuItem,
            'data-active': messageType === typeKey,
            key: typeKey,
            onClick: this.onTypeSelect.bind(this, typeKey),
            disabled: this.awaitingResponse,
          };
          return <button {...btnProps}>{typeValue}消息</button>;
        })}
      </ul>
    );
  }
  renderPagination() {
    const {currentPage, pageSize, myMessagesCount} = this.props;
    return (
      <Pagination
        defaultCurrent={currentPage}
        defaultPageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageSizeChange}
        showQuickJumper
        showSizeChanger
        total={myMessagesCount}
      />
    );
  }
  renderContent({content, id}) {
    const {expandedId} = this.state;
    const msgExpanded = id === expandedId;
    const showContent = content.length < 50;
    const thisContent =
      showContent || msgExpanded
        ? content
        : _.truncate(content, {omission: '', length: 50});
    let Button = null;

    if (!showContent)
      Button = (
        <button
          onClick={this.onExpandContent.bind(this, id)}
          className={css.profile_tableAnchor}>
          {msgExpanded ? '隐藏' : '更多...'}
        </button>
      );

    return (
      <p>
        <span className={css.text__wrap}>{thisContent}</span>
        {Button}
      </p>
    );
  }
  renderTableBody() {
    const {myMessages} = this.props;
    if (myMessages.length) {
      return _.map(myMessages, msg => {
        const {id, createTime, title, content, type} = msg;
        return (
          <tr key={id}>
            <td>
              <p>
                <span className={css.profile_tableSubTitle}>
                  {messageTypeRefs[type]}消息
                </span>
              </p>
            </td>
            <td>
              <h4 className={css.profile_msgTitle}>
                <strong>{title}</strong>
                <span className={css.profile_msgTime}>
                  {moment(createTime * 1000).format(TYPE.dateFormat)}
                </span>
              </h4>
              {this.renderContent({content, id})}
            </td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="4">暂无数据</td>
      </tr>
    );
  }
  render() {
    const {messageType} = this.props;
    return (
      <div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            我的消息
            <LoadingBar isLoading={this.awaitingResponse} />
          </h4>
          <table className={css.profile_table}>
            <thead>
              <tr>
                <td width="15%">
                  <Dropdown overlay={this.renderTypesDropdown()}>
                    <button>
                      {messageTypeRefs[messageType]}消息
                      <MDIcon
                        iconName="menu-down"
                        className={css.profile_tableMenuDownIcon}
                      />
                    </button>
                  </Dropdown>
                </td>
                <td>信息内容</td>
              </tr>
            </thead>
            <tbody>{this.renderTableBody()}</tbody>
          </table>
        </div>
        {this.renderPagination()}
      </div>
    );
  }
}

function mapStatesToProps({userModel, dataTableModel}) {
  const {
    myMessages,
    myMessagesCount,
    awaitingResponse,
    messageType,
  } = userModel;
  return {
    ...dataTableModel,
    awaitingResponse,
    messageType,
    myMessages,
    myMessagesCount,
  };
}

export default connect(mapStatesToProps)(MsgInbox);
