import React, {useCallback, useState, useEffect} from 'react';
import classnames from 'classnames';
import NP from 'number-precision';
import Dropdown from 'components/User/Form/Dropdown';
import SubmitResetButton from 'components/User/Form/SubmitResetButton';
import VirtualCoinFormPopUp from 'components/User/TradingCenter/Withdrawal/VirtualCoinFormPopUp';
import _ from 'lodash';
import {rounding} from 'utils';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import css2 from 'styles/User/TradingCenter/Withdrawal.less';
import formCSS from 'styles/User/SecurityCenter/SecurityInfo.less';

function generateVcCashAmount(vc) {
  const newVc = _.clone(vc);
  newVc.minCashAmt = rounding.round(NP.divide(newVc.minAmt, newVc.buyRate));
  newVc.maxCashAmt = rounding.roundDown(NP.divide(newVc.maxAmt, newVc.buyRate));
  newVc.feeCashAmt = rounding.roundDown(NP.divide(newVc.fee, newVc.buyRate));
  const amtPrecisionValue = getDecimalLength(newVc.amtPrecision);
  newVc.feeAmt = rounding.roundDown(newVc.fee, amtPrecisionValue || 0);
  return newVc;
}

function getDecimalLength(value) {
  if (Math.floor(value) === value) return 0;
  return (
    Number(value.toString().split('-')[1]) ||
    value.toString().split('.')[1].length ||
    0
  );
}

const VirtualCoinForm = props => {
  const {
    LABEL_WIDTH,
    vcFullList,
    vcAccounts,
    bankAccountName,
    vcNewCardNo,
    sufficientWithdraw,
    chargeRatio,
    securityPasswordProps,
    vcSecurityPasswordProps,
    repeatVcSecurityPasswordProps,
    withdrawalAmount,
    onRequestSubmit,
    onVcMethodChange,
    resetWithdrawalAmountField,
    showErrorMsg,
    children,
  } = props;
  const [vcDropdownOptions, setVcDropdownOptions] = useState([]);
  const [selectedVcAccount, setSelectedVcAccount] = useState({});
  const [selectedVcSetting, setSelectedVcSetting] = useState({});
  const [units, setUnits] = useState('0');
  const [displayPopUpModal, setDisplayPopUpModal] = useState(false);

  useEffect(() => {
    if (vcFullList.length > 0) {
      const downdropOptions = {};
      _.filter(vcFullList, vc =>
        _.some(vcAccounts, vcAcc => vcAcc.bankCode === vc.code),
      ).forEach(vc => {
        downdropOptions[vc.code] = vc.name;
      });
      setVcDropdownOptions(downdropOptions);
      let initialVcAccount = _.find(vcAccounts, vc => vc.isDefault);
      if (_.isEmpty(initialVcAccount)) {
        [initialVcAccount] = vcAccounts;
      }
      setSelectedVcAccount(initialVcAccount);
      setSelectedVcSetting(
        generateVcCashAmount(
          _.find(vcFullList, vc => vc.code === initialVcAccount.bankCode),
        ),
      );
    }
  }, [vcFullList]);

  useEffect(() => {
    const {buyRate} = selectedVcSetting;
    if (!_.isEmpty(selectedVcSetting)) {
      setUnits(
        withdrawalAmount.value
          ? NP.times(withdrawalAmount.value, buyRate)
          : '0',
      );
    }
  }, [selectedVcSetting, withdrawalAmount]);

  const onVirtualCoinChange = useCallback(selectedVcCode => {
    const newVc = vcFullList.find(x => x.code === selectedVcCode);
    const newVcAccount = _.find(
      vcAccounts,
      vc => vc.bankCode === selectedVcCode,
    );
    setSelectedVcAccount(newVcAccount);
    setSelectedVcSetting(generateVcCashAmount(newVc));
    onVcMethodChange({selectedVcBankId: newVcAccount.id});
    resetWithdrawalAmountField();
  }, [vcFullList]);

  const handleAddNewVcWallet = useCallback(() => {
    setDisplayPopUpModal(true);
  }, []);

  const submitNewVcWallet = useCallback(({selectedVc: vc}) => {
    props.onRequestAddNewVc({
      selectedVc: vc,
    });
  }, []);

  const checkWithdrawalAmount = useCallback(() => {
    const {
      minCashAmt,
      maxCashAmt,
      minAmt,
      maxAmt,
      amtPrecision,
    } = selectedVcSetting;
    const {value} = withdrawalAmount;

    let output = {};

    if (
      !(
        Number(value) >= Number(minCashAmt) &&
        Number(value) <= Number(maxCashAmt)
      )
    ) {
      output = {
        color: 'red',
        icon: 'close-circle-outline',
        msg: `最低虚拟币数量: ${rounding.round(
          minAmt,
          getDecimalLength(amtPrecision),
        )}；最高虚拟币数量: ${rounding.roundDown(
          maxAmt,
          getDecimalLength(amtPrecision),
        )}`,
        // msg: `最低虚拟币数量: ${rounding.round(
        //   minAmt,
        //   getDecimalLength(amtPrecision),
        // )} （${minCashAmt}元）；最高虚拟币数量: ${rounding.roundDown(
        //   maxAmt,
        //   getDecimalLength(amtPrecision),
        // )} （${maxCashAmt}元）`,
      };
    }

    return output;
  }, [withdrawalAmount, selectedVcSetting]);

  const onSubmitClick = useCallback(() => {
    const withdrawalAmountMsg = checkWithdrawalAmount();
    if (_.isEmpty(withdrawalAmountMsg)) {
      onRequestSubmit({
        vcWithdrawalAmount: withdrawalAmount.value,
        vcFee: chargeRatio <= 0 ? 0 : selectedVcSetting.feeCashAmt,
      });
    } else {
      showErrorMsg({
        responseMsg: withdrawalAmountMsg,
      });
    }
  }, [withdrawalAmount]);

  return (
    <React.Fragment>
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <div
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              padding: '8px 0',
              fontSize: '0.875rem',
              width: `${LABEL_WIDTH}`,
            }}
            className={css.label}>
            虚拟币名称
          </div>
          <Dropdown
            disabled={!sufficientWithdraw}
            items={vcDropdownOptions}
            defaultValue={selectedVcAccount ? selectedVcAccount.bankName : ''}
            onClick={onVirtualCoinChange}
            componentStyle={{
              display: 'inline-block',
              padding: '8px 8px 8px 15px',
              border: '1px solid #e1e1e1',
              borderRadius: '4px',
              height: '45px',
              marginRight: '10px',
            }}
          />
          {_.some(vcFullList, vc => !vc.hasAccount) && (
            <div className={formCSS.formItem_msg}>
              <button
                type="button"
                className={css2.addNewVcWallet}
                onClick={handleAddNewVcWallet}>
                添加虚拟币钱包
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={formCSS.formItemRow}>
        <div className={classnames(css2.textField_row)}>
          <div
            style={{
              width: LABEL_WIDTH,
            }}
            className={css2.label}>
            钱包地址
          </div>
          <div
            className={css2.textField}
            style={{
              width: `347px`,
              verticalAlign: 'top',
              wordWrap: 'break-word',
            }}>
            {selectedVcAccount.bankCardNo}
          </div>
        </div>
      </div>

      {/* withdrawal amount field */}
      {children[0]}

      <div className={formCSS.formItemRow}>
        <div className={classnames(css2.textField_row)}>
          <div
            style={{
              width: LABEL_WIDTH,
            }}
            className={css2.label}>
            提款费用
          </div>
          <div className={css2.textField}>
            {chargeRatio <= 0 || _.isEmpty(selectedVcSetting.feeCashAmt) ? (
              '免提款费用'
            ) : (
              <React.Fragment>
                <span>{selectedVcSetting.feeCashAmt}元</span>{' '}
                <span style={{color: 'red'}}>
                  ({selectedVcSetting.feeAmt}虚拟币)
                </span>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      <div className={formCSS.formItemRow}>
        <div className={classnames(css2.textField_row)}>
          <div
            style={{
              width: LABEL_WIDTH,
            }}
            className={css2.label}>
            虚拟币数量
          </div>
          <div className={css2.textField}>{units}虚拟币</div>
        </div>
      </div>

      <div className={formCSS.formItemRow}>
        <div className={classnames(css2.textField_row)}>
          <div
            style={{
              width: LABEL_WIDTH,
            }}
            className={css2.label}>
            备注
          </div>
          <div
            className={css2.textField}
            style={{
              width: `347px`,
              verticalAlign: 'top',
            }}>
            虚拟币的数量是根据市场的浮动，在确认提款后将会重新确认兑换的数量
          </div>
        </div>
      </div>

      {/* security password field */}
      {children[1]}

      <div className={formCSS.formItem}>
        <SubmitResetButton
          labelWidth={LABEL_WIDTH}
          submitDisabled={
            units < 0 ||
            !sufficientWithdraw ||
            withdrawalAmount.color !== 'green' ||
            securityPasswordProps.color !== 'green'
          }
          // resetDisabled
          hideReset
          onSubmitClick={onSubmitClick}
          // onResetClick={this.onClearClick}
          submitText={sufficientWithdraw ? '提交' : '您暂时无法提款'}
          // resetText="重置"
          submitWidth="100%"
          // resetWidth="80px"
          marginTop
        />
      </div>
      {displayPopUpModal && (
        <VirtualCoinFormPopUp
          vcFullList={vcFullList}
          bankAccountName={bankAccountName}
          vcNewCardNo={vcNewCardNo}
          onClose={() => setDisplayPopUpModal(false)}
          onSubmit={submitNewVcWallet}
          vcSecurityPasswordProps={vcSecurityPasswordProps}
          repeatVcSecurityPasswordProps={repeatVcSecurityPasswordProps}
        />
      )}
    </React.Fragment>
  );
};

export default React.memo(VirtualCoinForm);
