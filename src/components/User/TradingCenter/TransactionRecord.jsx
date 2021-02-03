import React, {Component} from 'react';
import moment from 'moment';
import {Pagination, Tooltip, Dropdown} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import {sortBy, reverse, map, slice, filter} from 'lodash';
import {connect} from 'dva';

import {addCommas, type as TYPE, getConcatArray} from 'utils';
import {MDIcon} from 'components/General';
import profileCss from 'styles/User/Dsf/ProfileIndex1.less';
import userCSS from 'styles/User/User.less';
import tableCSS from 'styles/User/Form/Table.less';
import SVG from 'react-inlinesvg';
import arrowUpIcon from 'assets/image/User/ic-btn-transfer-active-up.svg';
import arrowDownIcon from 'assets/image/User/ic-btn-transfer-active-down.svg';

const {dateFormat, transferStateRefs} = TYPE;

function DropDownButton({onSelect, active, placeholder, value}) {
  function onClick() {
    onSelect(value);
  }
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={tableCSS.dropdown_item}>
      {placeholder}
    </button>
  );
}

class TransactionRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentList: [],
      tooltipText: '点我复制到剪贴板',
      sorting: '',
    };
    this.dispatch = props.dispatch;
    this.onCopySuccess = this.onCopySuccess.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.onPageSizeChange = this.onPageSizeChange.bind(this);
    this.onToolTipVisibleChange = this.onToolTipVisibleChange.bind(this);
  }

  componentWillMount() {
    this.getRecord(this.props);
  }

  componentDidUpdate(prevProps) {
    const {
      type: prevType,
      transactionHistory: prevTransactionHistory,
      pageSize: prevPageSize,
      currentPage: prevCurrentPage,
    } = prevProps;
    const {type, transactionHistory, pageSize, currentPage} = this.props;

    if (prevType !== type) {
      this.clear();
      this.getRecord(this.props);
    }

    if (
      prevTransactionHistory !== transactionHistory ||
      prevPageSize !== pageSize ||
      prevCurrentPage !== currentPage
    ) {
      this.sliceList(this.props);
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  onCopySuccess() {
    this.setState({tooltipText: '复制成功！'});
  }

  onToolTipVisibleChange() {
    this.setState({tooltipText: '点我复制到剪贴板'});
  }

  onPageSizeChange(currentPage, pageSize) {
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize, currentPage},
    });
    this.getRecord(this.props);
  }

  onPageChange(currentPage) {
    const {transactionHistory, pageSize} = this.props;
    const lastPage = Math.round(transactionHistory.length / pageSize);
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {currentPage},
    });
    if (currentPage >= lastPage) {
      this.getRecord(this.props);
    }
  }

  onSortChange = direction => {
    const {sorting} = this.state;
    if (sorting === direction) {
      this.setState({sorting: ''});
    } else {
      this.setState({sorting: direction});
    }
    this.getRecord(this.props);
  };

  onStateChange = success => {
    this.dispatch({type: 'transactionModel/updateState', payload: {success}});
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {currentPage: 1},
    });
    this.getRecord(this.props);
  };

  onCancelConfirm = ({currentTarget}) => {
    this.dispatch({
      type: 'transactionModel/cancelTransaction',
      payload: {transactionNo: currentTarget.value, type: this.props.type},
    });
  };

  onCancelCancel = () => {
    this.dispatch({
      type: 'transactionModel/initializeState',
      payload: ['pendingAction'],
    });
  };

  onCancelTransaction = ({currentTarget}) => {
    this.dispatch({
      type: 'transactionModel/updateState',
      payload: {pendingAction: currentTarget.value},
    });
  };

  getRecord({type}) {
    this.dispatch({
      type: 'transactionModel/getTransactionHistory',
      payload: {type},
    });
  }

  clear() {
    this.dispatch({
      type: 'transactionModel/initializeAll',
    });
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['pageSize', 'start', 'currentPage'],
    });
  }

  sliceList({transactionHistory, pageSize, currentPage, filterBy}) {
    const {sorting} = this.state;
    let currentList = [...transactionHistory];
    if (transactionHistory) {
      if (sorting === 'up') {
        currentList = sortBy([...currentList], ['amount']);
      } else if (sorting === 'down') {
        currentList = reverse(sortBy([...currentList], ['amount']));
      }
      const start = (currentPage - 1) * pageSize;
      const end = currentPage * pageSize;
      currentList = slice([...currentList], start, end);

      if (filterBy && typeof filterBy.includes === 'function') {
        currentList = currentList.filter(item => filterBy.includes(item.state));
      }
      this.setState({currentList});
    }
  }

  renderPagination() {
    const {isTopup} = this.props;
    const {transactionHistory, currentPage, pageSize} = this.props;
    const totalLength = transactionHistory.length;
    const filterTopup = filter(transactionHistory, ['state', 'IN_PROGRESS'])
      .length;
    return (
      <Pagination
        className={tableCSS.pagination}
        defaultCurrent={currentPage}
        defaultPageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageSizeChange}
        showQuickJumper
        showSizeChanger
        total={isTopup ? filterTopup : totalLength}
      />
    );
  }

  renderAction() {
    const {type} = this.props;

    if (['WITHDRAWAL'].includes(type)) {
      return <td>操作</td>;
    }

    return null;
  }

  renderOperation(item) {
    const {state, transactionId} = item;
    const {pendingAction, type} = this.props;
    const classname = tableCSS.action_button;
    let Operation;

    if (pendingAction === transactionId) {
      Operation = (
        <React.Fragment>
          <button
            type="button"
            className={classname}
            onClick={this.onCancelCancel}>
            否
          </button>
          <button
            type="button"
            className={classname}
            onClick={this.onCancelConfirm}
            value={transactionId}>
            是
          </button>
        </React.Fragment>
      );
    } else if (type === 'WITHDRAWAL') {
      if (state === 'IN_PROGRESS') {
        Operation = (
          <button
            type="button"
            className={classname}
            onClick={this.onCancelTransaction}
            value={transactionId}>
            取消提款
          </button>
        );
      } else Operation = <span />;
    }

    if (!Operation) return null;
    return <td className={tableCSS.action}>{Operation}</td>;
  }

  renderTableBody() {
    const {currentList, tooltipText} = this.state;
    if (currentList.length) {
      return map(currentList, listItem => {
        const {
          createTime,
          transactionId,
          state,
          amount,
          stateChineseDisplay,
        } = listItem;
        const succeed = state === 'true';
        const stringArry = getConcatArray(transactionId);

        let statusColor = null;
        switch (stateChineseDisplay) {
          case '关闭':
            statusColor = 'grey';
            break;
          case '失败':
            statusColor = 'red';
            break;
          default:
            break;
        }

        return (
          <tr key={transactionId}>
            <td style={{width: '170px'}}>
              {moment(createTime).format(dateFormat)}
            </td>
            <td>
              <ClipboardButton
                onSuccess={this.onCopySuccess}
                data-clipboard-text={transactionId}>
                <Tooltip
                  title={tooltipText}
                  onVisibleChange={this.onToolTipVisibleChange}>
                  <span className={profileCss.profile_tableAnchor}>
                    <i>{stringArry[0]}</i>
                    <MDIcon iconName="multiplication" />
                    <MDIcon iconName="multiplication" />
                    <MDIcon iconName="multiplication" />
                    <MDIcon iconName="multiplication" />
                    <i>{stringArry[1]}</i>
                  </span>
                </Tooltip>
              </ClipboardButton>
            </td>
            <td className={tableCSS.status_column} data-color={statusColor}>
              {stateChineseDisplay}
            </td>
            <td data-color={succeed ? 'green' : ''}>
              {succeed ? '+' : ''}
              {addCommas(amount)}元
            </td>
            {this.renderOperation(listItem)}
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="6">暂无数据</td>
      </tr>
    );
  }

  renderStateDropdown() {
    const {success} = this.props;
    return (
      <ul className={tableCSS.dropdown_menu}>
        {map(transferStateRefs, (typeValue, typeKey) => (
          <DropDownButton
            active={typeKey === success}
            onSelect={this.onStateChange}
            key={typeKey}
            value={typeKey}
            placeholder={typeValue}
          />
        ))}
      </ul>
    );
  }

  renderTableHead() {
    const {hideHeader} = this.props;
    if (!hideHeader) {
      const {sorting} = this.state;
      return (
        <thead>
          <tr>
            <td>交易时间</td>
            <td>订单号</td>
            <td>
              <Dropdown overlay={this.renderStateDropdown()}>
                <button type="button">
                  <i>交易状态</i>
                  <MDIcon
                    iconName="menu-down"
                    className={profileCss.profile_tableMenuDownIcon}
                  />
                </button>
              </Dropdown>
            </td>
            <td>
              <i style={{marginRight: '0.5rem'}}>交易金额</i>
              <button type="button" onClick={() => this.onSortChange('up')}>
                <SVG
                  src={arrowUpIcon}
                  className={
                    sorting === 'up'
                      ? tableCSS.sort_icon_active
                      : tableCSS.sort_icon
                  }
                />
              </button>
              <button type="button" onClick={() => this.onSortChange('down')}>
                <SVG
                  src={arrowDownIcon}
                  className={
                    sorting === 'down'
                      ? tableCSS.sort_icon_active
                      : tableCSS.sort_icon
                  }
                />
              </button>
            </td>
            {this.renderAction()}
          </tr>
        </thead>
      );
    }

    return null;
  }

  render() {
    const {isTopup} = this.props;
    return (
      <div className={!isTopup ? userCSS.content_body : ''}>
        <div className={tableCSS.table_container}>
          <table className={tableCSS.table}>
            {this.renderTableHead()}
            <tbody>{this.renderTableBody()}</tbody>
          </table>
        </div>
        {this.renderPagination()}
      </div>
    );
  }
}

function mapStatesToProps({dataTableModel, transactionModel}) {
  const {pendingAction, transactionHistory} = transactionModel;
  return {
    pendingAction,
    transactionHistory,
    currentPage: dataTableModel.currentPage,
    pageSize: dataTableModel.pageSize,
  };
}
export default connect(mapStatesToProps)(TransactionRecord);
