import React from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {Progress} from 'antd';
import {addCommas} from 'utils';
import classnames from 'classnames';
import css from 'styles/User/TradingCenter/WithdrawalInfo.less';
import userCSS from 'styles/User/User.less';

const WithdrawalInfo = props => {
  const {
    reminderMsg,
    aggregateBetRequirements, // 总需投注
    aggregateBets, // 有效投注
    aggitionalBetReq, // 还需投注
  } = props;
  const percentage = (aggregateBets / aggregateBetRequirements) * 100;

  return (
    <div className={classnames(userCSS.content_body, css.content_box)}>
      <div className={css.description}>尊敬的用户，{reminderMsg}</div>
      <div className={css.info_section}>
        <div className={css.label_row}>
          <div>0元</div>
          <div>{addCommas(aggregateBetRequirements)}元</div>
        </div>
        <div>
          <Progress
            percent={percentage}
            showInfo={false}
            strokeColor="#3edd82"
          />
        </div>
        <div className={css.label_user_info}>
          <div>
            有效投注(元)：
            <span className={css.green_label}>{addCommas(aggregateBets)}</span>
          </div>
          <div>
            还需投注(元)：
            <span className={css.orange_label}>
              {addCommas(aggitionalBetReq)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function mapStateToProps({userModel}) {
  const {dailyWithdrawWithAdminSettingsResult, balance} = userModel;
  return {
    ...dailyWithdrawWithAdminSettingsResult,
    balance,
  };
}

export default connect(mapStateToProps)(WithdrawalInfo);
