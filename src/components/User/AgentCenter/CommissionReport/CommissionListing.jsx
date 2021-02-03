import React, {Component} from 'react';
import {Dropdown} from 'antd';
import DateThread from 'components/User/Form/DateThread';
import moment from 'moment';
import _ from 'lodash';
import {addCommas, type as TYPE} from 'utils';
import {MDIcon} from 'components/General';
import css from 'styles/User/AgentCenter/Commission.less';
import tableCSS from 'styles/User/Form/Table.less';

const {dateFormat} = TYPE;

class CommissionListing extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.onStatusChange = props.onStatusChange;
    this.onTimeframeChange = props.onTimeframeChange;
    this.onDateChange = props.onDateChange;
    this.onClearDateClick = props.onClearDateClick;
    this.onToggleDateClick = props.onToggleDateClick;
    this.onDetailsClick = props.onDetailsClick;
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'teamModel/initializeState',
      payload: ['memberList', 'agentId', 'pageSize'],
    });
  }

  renderStatusDropdown = () => {
    const {status, commissionStatusRefs} = this.props;
    return (
      <ul className={tableCSS.dropdown_menu}>
        {_.map(commissionStatusRefs, (typeValue, typeKey) => {
          const btnProps = {
            className: tableCSS.dropdown_item,
            'data-active': typeKey === status,
            key: typeKey,
            onClick: this.onStatusChange.bind(this, typeKey),
          };
          return (
            <button type="button" {...btnProps}>
              {typeValue}
            </button>
          );
        })}
      </ul>
    );
  };

  renderTableBody = () => {
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
                type="button"
                onClick={this.onDetailsClick.bind(this, issueNo)}
                className={css.link_text}>
                <i>{issueNo}</i>
              </button>
            </td>
            <td>{commissionStatusRefs[status]}</td>
            <td>{userCount}</td>
            <td>{addCommas(betsSum)}元</td>
            <td>{addCommas(commission, true)}元</td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="6">暂无数据</td>
      </tr>
    );
  };

  renderTotalCount = () => {
    const {totalBetsSum, totalCommission, myCommissionHistory} = this.props;
    const shouldShowTotal =
      (totalBetsSum || totalCommission) && myCommissionHistory.length;
    if (shouldShowTotal) {
      return (
        <tr className={tableCSS.table_total_row}>
          <td colSpan="4" data-align="right">
            总结
          </td>
          <td>{addCommas(totalBetsSum || 0)}元</td>
          <td>{addCommas(totalCommission || 0, true)}元</td>
        </tr>
      );
    }
    return null;
  };

  render() {
    const {
      status,
      commissionStatusRefs,
      dayCounts: currentDayCounts,
      startTime,
      endTime,
      timeframeRefs,
    } = this.props;

    const dateThreadProps = {
      currentDayCounts,
      startTime,
      endTime,
      timeframeRefs,
      onDateChange: this.onDateChange,
      onTimeframeChange: this.onTimeframeChange,
    };
    return (
      <div>
        <div className={tableCSS.table_container}>
          <div className={css.filter_row}>
            <DateThread {...dateThreadProps} />
          </div>
          <table className={tableCSS.table}>
            <thead>
              <tr>
                <td>交易时间</td>
                <td>期号</td>
                <td>
                  <Dropdown overlay={this.renderStatusDropdown()}>
                    <button type="button">
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
                <td>投注人数</td>
                <td>投注金额</td>
                <td>佣金</td>
              </tr>
            </thead>
            <tbody>
              {this.renderTableBody()}
              {this.renderTotalCount()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default CommissionListing;
