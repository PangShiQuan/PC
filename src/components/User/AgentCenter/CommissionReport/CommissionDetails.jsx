import React, {PureComponent} from 'react';
import _ from 'lodash';
import {addCommas} from 'utils';
import tableCSS from 'styles/User/Form/Table.less';
import userCSS from 'styles/User/User.less';

class CommissionDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.dispatch({type: 'userModel/getCommissionDetail'});
  }

  renderTableBody = () => {
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
            <td>{addCommas(sumBetsTaskPeriod)}元</td>
            <td>{addCommas(agentCommission)}元</td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="100%">暂无数据</td>
      </tr>
    );
  };

  render() {
    return (
      <div className={userCSS.content_body} style={{paddingTop: '50px'}}>
        <div className={tableCSS.table_container}>
          <table className={tableCSS.table}>
            <thead>
              <tr>
                <td width="30%">期号</td>
                <td width="30%">用户名</td>
                <td width="20%">投注金额</td>
                <td width="20%">佣金</td>
              </tr>
            </thead>
            <tbody>{this.renderTableBody()}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default CommissionDetails;
