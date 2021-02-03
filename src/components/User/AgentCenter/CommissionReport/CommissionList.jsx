import React, {Component} from 'react';
import {Dropdown, DatePicker} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import {addCommas, type as TYPE} from 'utils';
import {MDIcon, LoadingBar} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';

const {dateFormat} = TYPE;
const {RangePicker} = DatePicker;

class CommissionList extends Component {
  constructor(props) {
    super(props);
    this.awaitingResponse = false;
    this.dispatch = this.props.dispatch;
    this.onStatusChange = this.props.onStatusChange;
    this.onTimeframeChange = this.props.onTimeframeChange;
    this.onDateChange = this.props.onDateChange;
    this.onClearDateClick = this.props.onClearDateClick;
    this.onToggleDateClick = this.props.onToggleDateClick;
    this.onDetailsClick = this.props.onDetailsClick;
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.awaitingResponse !== nextProps.awaitingResponse) {
      this.awaitingResponse = nextProps.awaitingResponse;
    }
  }
  componentWillUnmount() {
    this.dispatch({
      type: 'teamModel/initializeState',
      payload: ['memberList', 'agentId', 'pageSize'],
    });
  }
  renderTimeframeDropdown() {
    const {manualTimeframe, timeframeRefs, dayCounts} = this.props;
    return (
      <ul className={css.profile_dropdownMenu}>
        {_.map(timeframeRefs, time => {
          const {displayText} = time;
          const btnProps = {
            className: css.profile_dropdownMenuItem,
            key: time.dayCounts,
            onClick: this.onTimeframeChange.bind(this, {
              dayCounts: time.dayCounts,
            }),
            'data-active': dayCounts === time.dayCounts,
          };
          return <button {...btnProps}>{displayText}</button>;
        })}
        <button
          onClick={this.onToggleDateClick}
          className={css.profile_dropdownMenuItem}
          data-active={manualTimeframe}>
          自定义
        </button>
      </ul>
    );
  }
  renderStatusDropdown() {
    const {status, commissionStatusRefs} = this.props;
    return (
      <ul className={css.profile_dropdownMenu}>
        {_.map(commissionStatusRefs, (typeValue, typeKey) => {
          const btnProps = {
            className: css.profile_dropdownMenuItem,
            'data-active': typeKey === status,
            key: typeKey,
            onClick: this.onStatusChange.bind(this, typeKey),
          };
          return <button {...btnProps}>{typeValue}</button>;
        })}
      </ul>
    );
  }
  renderDateThead() {
    const {
      dayCounts,
      timeframeRefs,
      manualTimeframe,
      startTime,
      endTime,
    } = this.props;
    const ranges = {};
    _.forEach(timeframeRefs, time => {
      const {displayText} = time;
      if (time.dayCounts) {
        const startRange = moment(new Date()).add(-time.dayCounts, 'days');
        ranges[displayText] = [startRange, endTime];
      }
    });
    if (manualTimeframe) {
      const rangePickerProps = {
        onChange: this.onDateChange,
        defaultValue: [startTime, endTime],
        ranges,
      };
      return (
        <td width="25%">
          <RangePicker {...rangePickerProps} />
        </td>
      );
    }
    return (
      <td width="25%">
        交易时间
        <Dropdown overlay={this.renderTimeframeDropdown()}>
          <button style={{marginLeft: '0.5rem '}}>
            {_.find(timeframeRefs, ['dayCounts', dayCounts]).displayText}
            <MDIcon
              iconName="menu-down"
              className={css.profile_tableMenuDownIcon}
            />
          </button>
        </Dropdown>
      </td>
    );
  }
  renderTableBody() {
    const {myCommissionHistory, commissionStatusRefs} = this.props;
    if (myCommissionHistory.length) {
      return _.map(myCommissionHistory, listItem => {
        const {
          id,
          createdTime,
          issueNo,
          betsSum,
          commission,
          userCount,
          status,
        } = listItem;
        return (
          <tr key={id}>
            <td>{moment(createdTime).format(dateFormat)}</td>
            <td>
              <button
                onClick={this.onDetailsClick.bind(this, issueNo)}
                className={css.profile_tableAnchor}>
                <i>{issueNo}</i>
              </button>
            </td>
            <td>{commissionStatusRefs[status]}</td>
            <td data-align="right">{userCount}</td>
            <td data-align="right">{addCommas(betsSum)}元</td>
            <td data-align="right">{addCommas(commission)}元</td>
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
  renderTotalCount() {
    const {totalBetsSum, totalCommission, myCommissionHistory} = this.props;
    const shouldShowTotal =
      (totalBetsSum || totalCommission) && myCommissionHistory.length;
    if (shouldShowTotal) {
      return (
        <tr className={css.profile_tableTotalRow}>
          <td colSpan="4" data-align="right">
            总结
          </td>
          <td data-align="right">{addCommas(totalBetsSum || 0)}元</td>
          <td data-align="right">{addCommas(totalCommission || 0)}元</td>
        </tr>
      );
    }
    return null;
  }
  render() {
    const {awaitingResponse, status, commissionStatusRefs} = this.props;
    return (
      <div className={css.profile_contentBody}>
        <h4 className={css.profile_formLabel}>
          <span disabled className={css.profile_breadcrumItem__main}>
            佣金报表
          </span>
          <LoadingBar isLoading={awaitingResponse} />
        </h4>
        <table className={css.profile_table}>
          <thead>
            <tr>
              {this.renderDateThead()}
              <td>期号</td>
              <td>
                <Dropdown overlay={this.renderStatusDropdown()}>
                  <button>
                    {status === 'ALL'
                      ? '交易状态'
                      : commissionStatusRefs[status]}
                    <MDIcon
                      iconName="menu-down"
                      className={css.profile_tableMenuDownIcon}
                    />
                  </button>
                </Dropdown>
              </td>
              <td data-align="right">投注人数</td>
              <td data-align="right">投注金额</td>
              <td data-align="right">佣金</td>
            </tr>
          </thead>
          <tbody>
            {this.renderTableBody()}
            {this.renderTotalCount()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default CommissionList;
