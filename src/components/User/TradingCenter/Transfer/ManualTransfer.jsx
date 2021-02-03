import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Select} from 'antd';
import {MDIcon} from 'components/General';

import css from 'styles/User/TradingCenter/Transfer.less';
import {addCommas} from 'utils';
import ContentContainer from 'components/User/ContentContainer';
import InputTextField from 'components/User/Form/InputTextField';
import SubmitResetButton from 'components/User/Form/SubmitResetButton';
import SVG from 'react-inlinesvg';
import transferIcon from 'assets/image/User/ic-btn-transfer.svg';
import ResponseMessageBar from 'components/User/ResponseMessageBar';

const CENTER = 'CENTER';
const {Option} = Select;

const PLATFORM_PATH = {
  GAME: '/games',
  CARD: '/cards',
  SPORT: '/sports',
};

class ManualTransfer extends PureComponent {
  LABEL_WIDTH = '50px';

  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['transferAmount', 'transferSelectTo', 'transferSelectFrom'],
    });

    this.onTransferMethodSelectFrom({key: CENTER});
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['transferAmount', 'transferSelectTo', 'transferSelectFrom'],
    });
  }

  onTransferMethodSelectFrom = transferType => {
    const {transferSelectFrom, refreshBalance} = this.props;
    refreshBalance(transferType.key);

    if (transferType.key !== CENTER) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: transferType.key,
          transferSelectTo: CENTER,
        },
      });
    } else {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: CENTER,
          transferSelectTo: transferSelectFrom,
        },
      });
    }
  };

  onTransferMethodSelectTo = transferType => {
    const {transferSelectTo, refreshBalance} = this.props;
    refreshBalance(transferType.key);

    if (transferType.key !== CENTER) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: CENTER,
          transferSelectTo: transferType.key,
        },
      });
    } else {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: transferSelectTo,
          transferSelectTo: CENTER,
        },
      });
    }
  };

  onTransferOptionClick = () => {
    ResponseMessageBar.clearResponseMessageBar(this);
    this.dispatch({type: 'playerModel/manualBalanceTransfer'});
  };

  onInputChange = event => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({type: 'formModel/validateInputAmount', payload: event});
  };

  onConvertClick = () => {
    const {transferSelectFrom, transferSelectTo} = this.props;
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        transferSelectFrom: transferSelectTo,
        transferSelectTo: transferSelectFrom,
      },
    });
  };

  getTransferList = () => {
    const {transferTypeList} = this.props;
    return [...transferTypeList.entries()].map(
      ([id, {balance, text, isHeader, isransEnabled}]) => {
        if ((!isHeader && isransEnabled !== 'ON') || id == 'CENTER') {
          return (
            <Option key={id}>
              {text} 余额:
              {balance >= 0 ? (
                `${addCommas(balance)}元`
              ) : (
                <span className={css.profile_noBalance}>?</span>
              )}
            </Option>
          );
        }
        return null;
      },
    );
  };

  renderTransferField = isFrom => {
    const {transferSelectFrom, transferSelectTo} = this.props;
    return (
      <div className={css.form_row}>
        <div style={{display: 'inline-block', width: this.LABEL_WIDTH}}>
          {isFrom ? '从' : '到'}
        </div>

        <Select
          className={css.select_box}
          size="large"
          labelInValue
          value={{
            key: isFrom ? transferSelectFrom : transferSelectTo,
          }}
          onChange={
            isFrom
              ? this.onTransferMethodSelectFrom
              : this.onTransferMethodSelectTo
          }
          style={{fontSize: '14px', width: '255px'}}>
          {this.getTransferList()}
        </Select>
      </div>
    );
  };

  renderAmountField = () => {
    const {transferTypeList} = this.props;
    const {transferAmount, transferSelectFrom, transferSelectTo} = this.props;
    const {value, inputMsg, icon, color} = transferAmount;
    let balance = 0;
    if (transferSelectFrom && transferSelectTo) {
      const balanceObj = transferTypeList.get(transferSelectFrom);
      if (balanceObj) {
        const {balance: bal} = balanceObj;
        balance = bal;
      }
    }

    return (
      <React.Fragment>
        <div className={css.form_row} style={{paddingBottom: '8px'}}>
          <div className={css.form_item}>
            <InputTextField
              id="transferAmount"
              label="金额"
              min="1"
              max={balance}
              value={value}
              labelWidth={this.LABEL_WIDTH}
              placeholder="请输入转帐金额"
              pattern="(?=[^\0])(?=^([0-9]+){0,1}(\.[0-9]{1,2}){0,1}$)"
              type="number"
              obj={transferAmount}
              onChange={this.onInputChange}
            />
          </div>
        </div>
        {inputMsg && (
          <div className={css.form_row}>
            <div className={css.form_item}>
              <div style={{width: this.LABEL_WIDTH, display: 'inline-block'}} />
              <div className={css.formItem_msg} data-color={color}>
                <MDIcon className={css.formItem_msgIcon} iconName={icon} />
                {inputMsg}
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  renderSubmitButton = () => {
    const {transferTypeList} = this.props;
    const {
      balanceTransferIsLoading,
      transferAmount,
      transferSelectFrom,
      transferSelectTo,
    } = this.props;
    const {validatePassed} = transferAmount;
    let balance = 0;
    let isContainBalance = false;
    if (transferSelectFrom && transferSelectTo) {
      const balanceObj = transferTypeList.get(transferSelectFrom);
      if (balanceObj) {
        const {balance: bal} = balanceObj;
        balance = bal;
        isContainBalance = balance > 0 && transferSelectTo;
      }
    }

    return (
      <SubmitResetButton
        labelWidth={this.LABEL_WIDTH}
        submitDisabled={
          balanceTransferIsLoading || !validatePassed || !isContainBalance
        }
        hideReset
        onSubmitClick={this.onTransferOptionClick}
        submitText="提交"
        submitWidth="255px"
        marginTop
      />
    );
  };

  renderConvertButton = () => {
    return (
      <React.Fragment>
        <div className={css.convert_line} />
        <button
          type="button"
          className={css.convert_button}
          onClick={this.onConvertClick}>
          <SVG className={css.svg_icon} src={transferIcon} />
        </button>
      </React.Fragment>
    );
  };

  renderManualTransfer = () => {
    return (
      <div className={css.transfer_form}>
        {this.renderTransferField(true)}
        {this.renderTransferField(false)}
        {this.renderAmountField()}
        {this.renderSubmitButton()}
        {this.renderConvertButton()}
      </div>
    );
  };

  render() {
    return (
      <ContentContainer title="自定义额度转换">
        <div>
          <div>{this.renderManualTransfer()}</div>
        </div>
      </ContentContainer>
    );
  }
}

function mapStatesToProps({
  cardModel,
  gameModel,
  sportModel,
  userModel,
  formModel,
  playerModel,
}) {
  const {transferAmount, transferSelectFrom, transferSelectTo} = formModel;
  const {balanceTransferIsLoading, gamePlatformList} = playerModel;
  const {balance} = userModel;

  return {
    gamePlatformList,
    MODE: {
      [PLATFORM_PATH.CARD]: cardModel.MODE,
      [PLATFORM_PATH.GAME]: gameModel.MODE,
      [PLATFORM_PATH.SPORT]: sportModel.MODE,
    },
    balance,
    balanceTransferIsLoading,
    transferAmount,
    transferSelectFrom,
    transferSelectTo,
  };
}

export default connect(mapStatesToProps)(ManualTransfer);
