import React, {Component} from 'react';
import _ from 'lodash';
import {addCommas} from 'utils';
import {LoadingBar, MDIcon} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';

class CommissionDetail extends Component {
  constructor(props) {
    super(props);
    this.dispatch = this.props.dispatch;
    this.onBackClick = this.props.onBackClick;
  }
  componentWillMount() {
    this.dispatch({type: 'userModel/getCommissionDetail'});
  }
  renderTableBody() {
    const {commissionDetail, commissionDetailCount} = this.props;
    if (commissionDetailCount) {
      return _.map(commissionDetail, listItem => {
        const {
          taskIdentifier,
          username,
          sumBetsTaskPeriod,
          agentCommission,
        } = listItem;
        return (
          <tr key={`${username}_${sumBetsTaskPeriod}`}>
            <td>{taskIdentifier}</td>
            <td>{username}</td>
            <td data-align="right">{addCommas(sumBetsTaskPeriod)}元</td>
            <td data-align="right">{addCommas(agentCommission)}元</td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="7">暂无数据</td>
      </tr>
    );
  }
  render() {
    const {taskIdentifier, awaitingResponse} = this.props;
    return (
      <div className={css.profile_contentBody}>
        <h4 className={css.profile_formLabel}>
          <button
            onClick={this.onBackClick}
            className={css.profile_breadcrumItem__main}>
            佣金报表
          </button>
          <span disabled className={css.profile_breadcrumItem}>
            <MDIcon iconName="chevron-right" />
            <i>第{taskIdentifier}期佣金详情</i>
          </span>
          <LoadingBar isLoading={awaitingResponse} />
        </h4>
        <table className={css.profile_table}>
          <thead>
            <tr>
              <td width="30%">期号</td>
              <td width="30%">用户名</td>
              <td width="20%" data-align="right">
                投注金额
              </td>
              <td width="20%" data-align="right">
                佣金
              </td>
            </tr>
          </thead>
          <tbody>{this.renderTableBody()}</tbody>
        </table>
      </div>
    );
  }
}

export default CommissionDetail;
