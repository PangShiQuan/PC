import React, {Component} from 'react';
import moment from 'moment';
import _ from 'lodash';
import {Tooltip, DatePicker, Row, Col, Select} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import {connect} from 'dva';
import {type as TYPE, getConcatArray, formatCurrency} from 'utils';
import {MDIcon, LoadingBar, TableContainer} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import {cashFlowReportS} from 'services/gameReport/';

const {moneyOperationTypeRefs} = TYPE;

class CashFlowList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltipText: '点我复制到剪贴板',
    };
    this.awaitingResponse = false;
    this.dispatch = props.dispatch;
    this.onBreadcrumClick = props.onBreadcrumClick;
    this.onInitialListClick = props.onInitialListClick;
  }
  componentWillMount() {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['selectedGamePlatform'],
    });
    this.dispatch({type: 'userModel/getMyCashFlow'});
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.awaitingResponse !== nextProps.awaitingResponse) {
      this.awaitingResponse = nextProps.awaitingResponse;
    }
    if (this.props.targetUser !== nextProps.targetUser) {
      this.dispatch({type: 'userModel/getMyCashFlow'});
    }
  }
  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['state', 'date', 'moneyOperationType', 'targetUser'],
    });
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['myCashFlow', 'myCashFlowPagingState'],
    });
  }
  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };
  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };
  onDateChange = date => {
    if (date) {
      this.dispatch({
        type: 'userModel/initializeState',
        payload: ['myCashFlowIsEnd', 'myCashFlowPagingState'],
      });
      this.dispatch({type: 'dataTableModel/updateState', payload: {date}});
      this.dispatch({type: 'userModel/getMyCashFlow'});
    }
  };
  onTypeClick = operationType => {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['myCashFlowIsEnd', 'myCashFlowPagingState'],
    });
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {moneyOperationType: operationType},
    });
    this.dispatch({type: 'userModel/getMyCashFlow'});
  };
  onLoadMore = () => {
    this.dispatch({type: 'userModel/getMyCashFlow'});
  };
  compareDate = date => {
    const today = moment(new Date());
    const dayDiff = today.diff(date, 'days', true);
    return dayDiff < 0 || dayDiff >= 90;
  };
  sortChange = sorter => {
    this.dispatch({
      type: 'userModel/updateState',
      payload: {
        sortedInfo: sorter,
      },
    });
  };
  renderValue = data => {
    const amount = data || 0;
    const amountColor = amount < 0 ? 'red' : 'green';
    return (
      <span className={css.cashFlowList_value} data-color={amountColor}>
        ￥ {formatCurrency(amount)}
      </span>
    );
  };
  renderBalance = data => {
    const amount = data || 0;
    return (
      <span className={css.cashFlowList_value}>
        ￥ {formatCurrency(amount)}
      </span>
    );
  };
  renderBreadcrum() {
    const {routes, targetUser} = this.props;
    return _.map(routes, (member, index) => {
      const {userId, username} = member;
      const onClick = () =>
        this.onBreadcrumClick({
          ...member,
          index,
        });
      return (
        <button
          disabled={`${targetUser}用户详情` === username}
          className={css.profile_breadcrumItem}
          key={userId}
          onClick={onClick}>
          <MDIcon iconName="chevron-right" />
          <i>{username}</i>
        </button>
      );
    });
  }
  renderFormLabel() {
    const {targetUser, profileSelectedNav} = this.props;
    if (profileSelectedNav === 'memberManage' && targetUser) {
      return (
        <h4 className={css.profile_formLabel}>
          <button
            onClick={this.props.onInitialListClick}
            className={css.profile_breadcrumItem__main}>
            <i>我的用户列表</i>
          </button>
          {this.renderBreadcrum()}
          <LoadingBar isLoading={this.awaitingResponse} />
        </h4>
      );
    }
    return (
      <h4 className={css.profile_formLabel}>
        <span disabled className={css.profile_breadcrumItem__main}>
          账户明细
        </span>
        <LoadingBar isLoading={this.awaitingResponse} />
      </h4>
    );
  }

  renderGameReportMain(selectedGamePlatform) {
    const {sortedInfo} = this.props;
    const columns = [];
    columns.push(
      ...cashFlowReportS[selectedGamePlatform].gameReportMain({
        selectedGamePlatform,
        renderId: row => {
          let crossReferenceId = row;

          const stringArry = getConcatArray(crossReferenceId);

          return (
            <ClipboardButton
              style={{textAlign: 'inherit', padding: 0}}
              onSuccess={this.onCopySuccess}
              data-clipboard-text={crossReferenceId}>
              <Tooltip
                title={this.state.tooltipText}
                onVisibleChange={this.onToolTipVisibleChange}>
                <span className={css.profile_tableAnchor}>
                  <i>{stringArry[0]}</i>
                  <MDIcon iconName="multiplication" />
                  <MDIcon iconName="multiplication" />
                  <MDIcon iconName="multiplication" />
                  <MDIcon iconName="multiplication" />
                  <i>{stringArry[1]}</i>
                </span>
              </Tooltip>
            </ClipboardButton>
          );
        },
        renderValue: data => this.renderValue(data),
        renderBalance: data => this.renderBalance(data),
        renderBetDetail: data => this.renderBetDetail(data),
        renderBetStatus: data => this.renderBetStatus(data),
        sortedInfo,
      }),
    );
    return columns;
  }
  renderTable() {
    const {myCashFlow, selectedGamePlatform} = this.props;
    const columns = this.renderGameReportMain(selectedGamePlatform);
    let props = {};
    if (myCashFlow) {
      const data = cashFlowReportS[selectedGamePlatform].gameReportMainData({
        displayList: myCashFlow,
        selectedGamePlatform,
      });

      props = {
        columns,
        dataSource: data,
        onChange: this.sortChange,
      };
    }
    return (
      <div className={css.cashFlowList_mainTableOuter}>
        <TableContainer
          className={css.cashFlowList_mainTable}
          columns={columns}
          {...props}
        />
      </div>
    );
  }
  renderLoadMore(isVisible) {
    const {myCashFlowIsEnd} = this.props;

    return (
      <div className={css.profile_formBtnRow}>
        <button
          onClick={this.onLoadMore}
          className={css.profile_formBtn}
          disabled={myCashFlowIsEnd}>
          {myCashFlowIsEnd ? '无更多数据' : '加载更多'}
        </button>
      </div>
    );
  }
  renderDatePicker() {
    const {date, awaitingResponse} = this.props;
    const yesterday = moment(date).add(-1, 'd');
    const tomorrow = moment(date).add(1, 'd');
    const prevDay = () => this.onDateChange(yesterday);
    const nextDay = () => this.onDateChange(tomorrow);
    return (
      <Row>
        日期:
        <button
          onClick={prevDay}
          disabled={this.compareDate(yesterday) || awaitingResponse}>
          <MDIcon
            className={css.profile_tableChevronIcon}
            iconName="chevron-left"
          />
          <span>前一天</span>
        </button>
        <DatePicker
          defaultValue={moment(new Date())}
          disabled={awaitingResponse}
          value={date}
          onChange={this.onDateChange}
          disabledDate={this.compareDate}
        />
        <button
          onClick={nextDay}
          disabled={this.compareDate(tomorrow) || awaitingResponse}>
          <span>后一天</span>
          <MDIcon
            className={css.profile_tableChevronIcon}
            iconName="chevron-right"
          />
        </button>
      </Row>
    );
  }
  renderCashFlowTypeFilter() {
    const {Option} = Select;
    return (
      <div>
        交易类型:
        <Select
          defaultValue="ALL"
          style={{width: 120}}
          onChange={this.onTypeClick}>
          <Option key="ALL" value="ALL">
            全部
          </Option>
          {_.map(moneyOperationTypeRefs, (typeValue, typeKey) => (
            <Option key={typeKey} value={typeKey}>
              {typeValue}
            </Option>
          ))}
        </Select>
      </div>
    );
  }
  render() {
    return (
      <div>
        <div className={css.profile_contentBody}>
          {this.renderFormLabel()}
          <Row className={css.cashFlowList_filter}>
            <Col span={9}>{this.renderDatePicker()}</Col>
            <Col span={6}>{this.renderCashFlowTypeFilter()}</Col>
          </Row>
          {this.renderTable()}
          {this.renderLoadMore()}
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({
  userModel,
  dataTableModel,
  layoutModel,
  playerModel,
}) => ({
  awaitingResponse: userModel.awaitingResponse,
  myCashFlow: userModel.myCashFlow,
  myCashFlowIsEnd: userModel.myCashFlowIsEnd,
  profileSelectedNav: layoutModel.profileSelectedNav,
  selectedGamePlatform: userModel.selectedGamePlatform,
  sortedInfo: userModel.sortedInfo,
  ...dataTableModel,
});

export default connect(mapStatesToProps)(CashFlowList);
