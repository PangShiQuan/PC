import React, {Component} from 'react';
import {addCommas} from 'utils';
import {MDIcon, LoadingBar} from 'components/General';
import resolve from 'clientResolver';
import css from 'styles/User/Dsf/ProfileIndex1.less';

const Input = resolve.plugin('ProfileInput');

class TransferForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.dispatch = this.props.dispatch;
    this.awaitingResponse = false;
    this.onBackClick = this.props.onBackClick;
  }
  componentWillMount() {
    this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.awaitingResponse !== nextProps.awaitingResponse) {
      this.awaitingResponse = nextProps.awaitingResponse;
    }
  }
  renderUsernameInput() {
    const {username, inputFieldRefs} = this.props;
    const {value, inputMsg, icon, color} = username;
    return (
      <Input
        disabled
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={inputFieldRefs.username}
        min="6"
        max="12"
        name="username"
        // onBlur={this.validateUsername}
        onChange={this.onInputChange}
        pattern="^[A-Za-z0-9]\w{5,11}$"
        placeholder="请输入字母和数字组成的6-12个字符"
        value={value}
      />
    );
  }
  renderTransferAmount() {
    const {
      transferAmount,
      inputFieldRefs,
      dailyWithdrawWithAdminSettingsResult,
    } = this.props;
    const {balance} = dailyWithdrawWithAdminSettingsResult;
    const {value, inputMsg, icon, color} = transferAmount;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={inputFieldRefs.transferAmount}
        max={balance}
        name="transferAmount"
        pattern="\d[0-9]\d"
        type="number"
        placeholder={`请输入提现金额，位数介于 ${addCommas(10)} - ${addCommas(
          100000,
        )}`}
        value={value}
      />
    );
  }
  render() {
    const {renderResponseMsg} = this.props;
    return (
      <div className={css.profile_contentBody}>
        <h4 className={css.profile_formLabel}>
          <button
            onClick={this.onBackClick}
            className={css.profile_breadcrumItem__main}>
            我的用户列表
          </button>
          <button disabled className={css.profile_breadcrumItem}>
            <MDIcon iconName="chevron-right" />
            <i>用户转账</i>
          </button>
          <LoadingBar isLoading={this.awaitingResponse} />
        </h4>
        {renderResponseMsg()}
        {this.renderUsernameInput()}
        {this.renderTransferAmount()}
      </div>
    );
  }
}

export default TransferForm;
