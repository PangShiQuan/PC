import React, {PureComponent} from 'react';
import moment from 'moment';
import {connect} from 'dva';
import {Pagination} from 'antd';
import _ from 'lodash';
import {MDIcon} from 'components/General';
import {type as TYPE} from 'utils';
import css from 'styles/User/NewsCenter/MyNews.less';
import userCSS from 'styles/User/User.less';
import Dropdown from 'components/User/Form/Dropdown';

const {messageTypeRefs} = TYPE;

class MyNews extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {expandedId: null};

    const {dispatch} = this.props;
    this.dispatch = dispatch;
  }

  componentDidMount() {
    this.dispatch({type: 'userModel/getUserMessage'});
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

  onTypeSelect = messageType => {
    this.dispatch({
      type: 'userModel/updateState',
      payload: {messageType},
    });
    this.dispatch({type: 'userModel/getUserMessage'});
  };

  onExpandContent = selectedId => {
    const {expandedId} = this.state;
    this.setState({expandedId: selectedId === expandedId ? null : selectedId});
  };

  onPageChange = (currentPage, pageSize) => {
    const start = (currentPage - 1) * pageSize;
    this.dispatch({type: 'dataTableModel/updateState', payload: {start}});
    this.dispatch({type: 'userModel/getUserMessage'});
  };

  onPageSizeChange = (currentPage, pageSize) => {
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize, currentPage, start: 0},
    });
    this.dispatch({type: 'userModel/getUserMessage'});
  };

  renderPagination = () => {
    const {currentPage, pageSize, myMessagesCount} = this.props;
    return (
      <Pagination
        className={css.pagination}
        defaultCurrent={currentPage}
        defaultPageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageSizeChange}
        showQuickJumper
        showSizeChanger
        total={myMessagesCount}
      />
    );
  };

  renderTableBody() {
    const {expandedId} = this.state;

    const {myMessages} = this.props;
    if (myMessages.length) {
      return _.map(myMessages, (msg, index) => {
        const {id, createTime, title, content, type} = msg;
        const isLastRow = index === myMessages.length - 1;

        return (
          <React.Fragment key={id}>
            <tr data-last={isLastRow && expandedId !== id}>
              <td className={css.table_column_type}>
                <div className={css.table_column_type_text} data-type={type}>
                  {messageTypeRefs[type]}消息
                </div>
              </td>
              <td className={css.table_column_title}>
                <strong>{title}</strong>
              </td>
              <td className={css.table_column_details}>
                <button
                  type="button"
                  className={css.table_details_button}
                  onClick={() => this.onExpandContent(id)}>
                  详情
                  <MDIcon
                    iconName={expandedId !== id ? 'menu-down' : 'menu-up'}
                    className={css.icon}
                  />
                </button>
              </td>
            </tr>
            <tr data-last={isLastRow && expandedId === id}>
              <td
                colSpan="100%"
                className={css.table_column_description}
                style={expandedId !== id ? {display: 'none'} : null}>
                {expandedId === id ? (
                  <div>
                    <div className={css.content}>{content}</div>
                    <div className={css.datetime}>
                      {moment(createTime * 1000).format(TYPE.dateFormat)}
                    </div>
                  </div>
                ) : null}
              </td>
            </tr>
          </React.Fragment>
        );
      });
    }
    return (
      <tr>
        <td className={css.table_column_empty}>暂无数据</td>
      </tr>
    );
  }

  render() {
    const {messageType} = this.props;
    return (
      <div className={userCSS.content_body}>
        <div className={css.dropdownDiv}>
          <Dropdown
            items={messageTypeRefs}
            defaultValue={messageTypeRefs[messageType]}
            valueSuffix="消息"
            onClick={this.onTypeSelect}
            componentStyle={{padding: '10px'}}
          />
        </div>
        <table className={css.table}>
          <tbody>{this.renderTableBody()}</tbody>
        </table>
        {this.renderPagination()}
      </div>
    );
  }
}

function mapStatesToProps({userModel, dataTableModel}) {
  const {myMessages, myMessagesCount, messageType} = userModel;
  return {
    ...dataTableModel,
    messageType,
    myMessages,
    myMessagesCount,
  };
}

export default connect(mapStatesToProps)(MyNews);
