import React, {Component} from 'react';
import moment from 'moment';
import {Pagination, Tooltip, Dropdown} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import {sortBy, reverse, map, slice, filter} from 'lodash';
import {connect} from 'dva';
import classnames from 'classnames';

import {addCommas, type as TYPE, getConcatArray} from 'utils';
import {MDIcon, LoadingBar, SortIconButton} from 'components/General';
import profileCss from 'styles/User/Dsf/ProfileIndex1.less';
import css from 'styles/User/transactionRecord.less';

const {dateFormat, transferStateRefs, transferTypeRefs} = TYPE;

function DropDownButton({onSelect, active, placeholder, value}) {
  function onClick() {
    onSelect(value);
  }
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={profileCss.profile_dropdownMenuItem}>
      {placeholder}
    </button>
  );
}

class TransactionRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentList: [],
      fullList: [],
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

  componentWillReceiveProps(nextProps) {
    if (this.props.type !== nextProps.type) {
      this.clear();
      this.getRecord(nextProps);
    }
    if (
      this.props.transactionHistory !== nextProps.transactionHistory ||
      this.props.pageSize !== nextProps.pageSize ||
      this.props.currentPage !== nextProps.currentPage
    ) {
      this.sliceList(nextProps);
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

      if (filterBy && typeof filterBy.includes === 'function') {
        currentList = currentList.filter(item => filterBy.includes(item.state));
      }
      this.setState({fullList: currentList});
      currentList = slice([...currentList], start, end);
      this.setState({currentList});
    }
  }

  renderPagination() {
    const {transactionHistory, currentPage, pageSize} = this.props;
    const {fullList} = this.state;
    const totalLength = transactionHistory.length;
    const isTopup = this.props.isTopup || false;
    return (
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageSizeChange}
        showQuickJumper
        showSizeChanger
        total={isTopup ? fullList.length : totalLength}
      />
    );
  }

  renderAction() {
    const {type} = this.props;

    if (['WITHDRAWAL'].includes(type)) {
      return (
        <td data-align="center" style={{width: '92px'}}>
          操作
        </td>
      );
    }

    return null;
  }

  renderOperation(item) {
    const {state, transactionId} = item;
    const {pendingAction, type} = this.props;
    const classname = classnames(
      profileCss.profile_inputInlineBtn,
      css.btn__inline,
    );
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
    return (
      <td data-align="center" className={css.action}>
        {Operation}
      </td>
    );
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
        return (
          <tr key={transactionId}>
            <td>{moment(createTime).format(dateFormat)}</td>
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
            <td>{stateChineseDisplay}</td>
            <td data-color={succeed ? 'green' : ''} data-align="right">
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
      <ul className={profileCss.profile_dropdownMenu}>
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
    if (!this.props.hideHeader) {
      const {sorting} = this.state;
      return (
        <thead>
          <tr>
            <td>交易时间</td>
            <td>收支单号</td>
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
            <td data-align="right">
              <i style={{marginRight: '0.5rem'}}>交易金额</i>
              <SortIconButton
                direction="up"
                onSort={this.onSortChange}
                target="amount"
                active={sorting === 'up'}
              />
              <SortIconButton
                direction="down"
                onSort={this.onSortChange}
                target="amount"
                active={sorting === 'down'}
              />
            </td>
            {this.renderAction()}
          </tr>
        </thead>
      );
    }

    return null;
  }

  render() {
    const {awaitingResponse, title, type} = this.props;
    const section = title || `${transferTypeRefs[type]}记录`;

    return (
      <div>
        <div className={profileCss.profile_contentBody}>
          <h4 className={profileCss.profile_formLabel}>
            {section}
            <LoadingBar isLoading={awaitingResponse} />
          </h4>
          <table className={profileCss.profile_table}>
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
  const {
    awaitingResponse,
    pendingAction,
    transactionHistory,
  } = transactionModel;
  return {
    awaitingResponse,
    pendingAction,
    transactionHistory,
    currentPage: dataTableModel.currentPage,
    pageSize: dataTableModel.pageSize,
  };
}
export default connect(mapStatesToProps)(TransactionRecord);
