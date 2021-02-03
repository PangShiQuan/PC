import React, {useCallback, useState, useEffect} from 'react';
import {Modal} from 'antd';
import {MDIcon} from 'components/General';
import {type as TYPE} from 'utils';
import InputTextField from 'components/User/Form/InputTextField';
import InputPinField from 'components/User/Form/InputPinField';
import Dropdown from 'components/User/Form/Dropdown';
import css from 'styles/User/AgentCenter/Affiliate.less';
import memberCSS from 'styles/User/AgentCenter/Member.less';
import userCSS from 'styles/User/User.less';

const LABEL_WIDTH = '111px';

const VirtualCoinFormPopUp = props => {
  const {
    vcFullList,
    bankAccountName,
    vcNewCardNo,
    onClose,
    onSubmit,
    vcSecurityPasswordProps,
    repeatVcSecurityPasswordProps,
  } = props;
  const [vcDropdownOptions, setVcDropdownOptions] = useState([]);
  const [selectedVc, setSelectedVc] = useState({});

  useEffect(() => {
    if (vcFullList.length > 0) {
      const downdropOptions = {};
      const availableList = vcFullList.filter(vc => !vc.hasAccount);
      availableList.forEach(vc => {
        downdropOptions[vc.code] = vc.name;
      });
      setVcDropdownOptions(downdropOptions);
      setSelectedVc(availableList[0]);
    }
  }, [vcFullList]);

  const onVirtualCoinChange = useCallback(vc => {
    const newVc = vcFullList.find(x => x.code === vc);
    setSelectedVc(newVc);
  }, [vcFullList]);

  const onSubmitClick = useCallback(() => {
    onSubmit({selectedVc});
    onClose();
  }, [selectedVc]);

  return (
    <Modal
      width="800px"
      visible
      maskClosable={false}
      centered
      closable={false}
      // onCancel={() => this.setState({mode: 'LIST'})}
      footer={null}>
      <div className={css.modal_title}>添加虚拟币钱包</div>
      <div className={userCSS.popUp_content_body}>
        <div className={memberCSS.modal_form_row}>
          <div className={memberCSS.modal_form_item}>
            <InputTextField
              disabled
              readOnly
              id="bankAccountName"
              label="虚拟币开户姓名"
              value={bankAccountName.value}
              labelWidth={LABEL_WIDTH}
              type="text"
            />
          </div>
        </div>

        <div className={memberCSS.modal_form_row}>
          <div style={{width: LABEL_WIDTH}}>虚拟币名称</div>
          <Dropdown
            // disabled={!sufficientWithdraw}
            items={vcDropdownOptions}
            defaultValue={selectedVc ? selectedVc.name : ''}
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
        </div>

        <div className={memberCSS.modal_form_row}>
          <div className={memberCSS.modal_form_item}>
            <InputTextField
              // disabled={mode === 'EDIT'}
              id="vcNewCardNo"
              label={TYPE.inputFieldRefs.vcNewCardNo}
              // min="4"
              // max="11"
              value={vcNewCardNo.value}
              labelWidth={LABEL_WIDTH}
              placeholder="请输入钱包地址"
              pattern="^[a-zA-Z0-9]{1,100}$"
              type="text"
              obj={vcNewCardNo}
              // onChange={e => setWalletAddress(e.target.value)}
              style={{paddingRight: '150px'}}
            />
          </div>
          <div
            className={memberCSS.formItem_msg}
            data-color={vcNewCardNo.color}>
            <MDIcon
              className={memberCSS.formItem_msgIcon}
              iconName={vcNewCardNo.icon}
            />
            {vcNewCardNo.inputMsg}
          </div>
        </div>

        <div className={memberCSS.modal_form_row}>
          <div className={memberCSS.modal_form_item}>
            <InputPinField
              labelWidth={LABEL_WIDTH}
              width="585px"
              obj={vcSecurityPasswordProps}
              label={`${TYPE.inputFieldRefs.vcSecurityPassword}`}
              max="4"
              min="4"
              name="vcSecurityPassword"
              pattern="\d[0-9]\d"
              type="password"
              value={vcSecurityPasswordProps.value}
            />
          </div>
          <div
            className={memberCSS.formItem_msg}
            data-color={vcSecurityPasswordProps.color}>
            <MDIcon
              className={memberCSS.formItem_msgIcon}
              iconName={vcSecurityPasswordProps.icon}
            />
            {vcSecurityPasswordProps.inputMsg}
          </div>
        </div>

        <div className={memberCSS.modal_form_row}>
          <div className={memberCSS.modal_form_item}>
            <InputPinField
              labelWidth={LABEL_WIDTH}
              width="585px"
              obj={repeatVcSecurityPasswordProps}
              label={`${TYPE.inputFieldRefs.repeatVcSecurityPassword}`}
              max="4"
              min="4"
              name="repeatVcSecurityPassword"
              pattern="\d[0-9]\d"
              type="password"
              value={repeatVcSecurityPasswordProps.value}
            />
          </div>
          <div
            className={memberCSS.formItem_msg}
            data-color={repeatVcSecurityPasswordProps.color}>
            <MDIcon
              className={memberCSS.formItem_msgIcon}
              iconName={repeatVcSecurityPasswordProps.icon}
            />
            {repeatVcSecurityPasswordProps.inputMsg}
          </div>
        </div>

        <div className={css.modal_button_row}>
          <button
            type="button"
            className={css.modal_cancelButton}
            onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            disabled={
              !vcNewCardNo.validatePassed ||
              !vcSecurityPasswordProps.validatePassed ||
              !repeatVcSecurityPasswordProps.validatePassed
            }
            className={css.modal_submitButton}
            onClick={onSubmitClick}>
            提交
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(VirtualCoinFormPopUp);
