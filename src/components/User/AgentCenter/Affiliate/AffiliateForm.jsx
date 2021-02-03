import React, {Component} from 'react';
import {Popconfirm} from 'antd';
import {MDIcon} from 'components/General';
import RangeInput from 'components/User/Form/RangeInput';
import ToggleButton from 'components/User/Form/ToggleButton';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import css from 'styles/User/AgentCenter/Affiliate.less';
import userCSS from 'styles/User/User.less';
import {type as TYPE, getPrizePercentage} from 'utils';

class AffiliateForm extends Component {
  LABEL_WIDTH = '111px';

  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
    this.generateRandomAffCode = props.generateRandomAffCode;
    this.poluteForm = props.poluteForm;
    this.initializeForm = props.initializeForm;
    this.onCloseClick = props.onCloseClick;
    this.onDeleteClick = props.onDeleteClick;
    this.onSubmitClick = props.onSubmitClick;
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['affCode', 'memberType', 'affCodeStatus', 'prizeGroup'],
    });
  }

  onRadioSelect = memberType => {
    this.poluteForm();
    this.dispatch({type: 'formModel/updateState', payload: {memberType}});
    this.initializeForm();
  };

  onRangeChange = event => {
    this.poluteForm();
    event.persist();
    const eventTarget = event.target;
    const {value, name} = eventTarget;
    const payload = {[name]: {value}};
    this.dispatch({
      type: 'formModel/updateState',
      payload,
    });
    this.initializeForm();
  };

  onAffToggle = () => {
    this.poluteForm();
    const {affCodeStatus} = this.props;
    const {value} = affCodeStatus;
    let payload = {affCodeStatus: {value: 'ON'}};
    if (value === 'ON') {
      payload = {affCodeStatus: {value: 'OFF'}};
    }
    this.dispatch({type: 'formModel/updateState', payload});
    this.initializeForm();
  };

  onGenerateAffCodeClick = () => {
    this.poluteForm();
    this.generateRandomAffCode();
  };

  onAffCodeChange = event => {
    this.poluteForm();
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        affCode: {value: event.target.value},
      },
    });
  };

  renderToggleBtn() {
    const {affCodeStatus} = this.props;
    const {value} = affCodeStatus;
    return (
      <div className={css.modal_form_row}>
        <div style={{width: this.LABEL_WIDTH}}>
          {TYPE.inputFieldRefs.affCodeStatus}
        </div>
        <ToggleButton
          style={{margin: '0', color: 'black'}}
          onClick={this.onAffToggle}
          placeholder="启用邀请码"
          checked={value === 'ON'}
        />
      </div>
    );
  }

  renderMemberOption = ({onRadioSelect, memberType}) => {
    const isPlayer = memberType === 'PLAYER';
    const isAgent = memberType === 'AGENT';
    const selectPlayer = () => onRadioSelect('PLAYER');
    const selectAgent = () => onRadioSelect('AGENT');
    return (
      <div className={css.modal_form_row}>
        <div style={{width: this.LABEL_WIDTH}}>用户类型</div>
        <button
          type="button"
          name="PLAYER"
          onClick={selectPlayer}
          className={css.radio_button}
          data-checked={isPlayer}>
          <MDIcon iconName={isPlayer ? 'radiobox-marked' : 'radiobox-blank'} />
          <span>会员</span>
        </button>
        <button
          type="button"
          name="AGENT"
          onClick={selectAgent}
          className={css.radio_button}
          data-checked={isAgent}>
          <MDIcon iconName={isAgent ? 'radiobox-marked' : 'radiobox-blank'} />
          <span>代理</span>
        </button>
      </div>
    );
  };

  renderRangeInput() {
    const {prizeGroup, userData, minMemberPrizeGroup} = this.props;
    const userPrizeGroup = userData.prizeGroup;
    const platformPrizeGroup = minMemberPrizeGroup;
    const maxRange = userData.prizeGroup;
    const {value} = prizeGroup;
    let disabled = false;
    let shouldShowRange = true;
    if (userPrizeGroup < platformPrizeGroup) {
      disabled = true;
      shouldShowRange = false;
    }
    let min = minMemberPrizeGroup;
    const max = maxRange;
    if (max % 2 === 0 && min % 2 !== 0) {
      min += 1;
    } else if (max % 2 !== 0 && min % 2 === 0) {
      min += 1;
    }
    return (
      <div className={css.modal_form_row}>
        <div style={{width: '105px'}}>{`${
          TYPE.inputFieldRefs.prizeGroup
        } (赔率)`}</div>
        <RangeInput
          labelWidth="105px"
          disabled={disabled}
          indicatorLabel={`${value} (${getPrizePercentage(value)}%)`}
          max={max}
          maxLabel={`${max} (${getPrizePercentage(max)}%)`}
          min={min}
          minLabel={`${min} (${getPrizePercentage(min)}%)`}
          name="prizeGroup"
          onChange={this.onRangeChange}
          onDrag={this.onRangeChange}
          shouldShowRange={shouldShowRange}
          shouldShowValue
          step={2}
          value={value}
        />
      </div>
    );
  }

  renderAffiliateCodeInput = () => {
    const {affCode, isCreatingNew} = this.props;
    const {value} = affCode;
    return (
      <div className={css.modal_form_row}>
        <div style={{width: '91px'}}>{TYPE.inputFieldRefs.affCode}</div>
        <input
          className={css.affCode_input}
          type="text"
          readOnly={!isCreatingNew}
          name="affCode"
          value={value}
          onChange={this.onAffCodeChange}
        />
        {isCreatingNew ? (
          <button
            type="button"
            onClick={this.onGenerateAffCodeClick}
            className={css.modal_generateButton}>
            生成邀请码
          </button>
        ) : null}
      </div>
    );
  };

  renderForm() {
    const commissionModes =
      localStorage.getItem('commissionMode') ===
      TYPE.commissionMode.COMMISSION_RATIO;
    const {memberType} = this.props;
    return (
      <div>
        {this.renderToggleBtn()}
        {this.renderMemberOption({
          onRadioSelect: this.onRadioSelect,
          memberType,
        })}
        {commissionModes ? null : this.renderRangeInput()}
        {this.renderAffiliateCodeInput()}
      </div>
    );
  }

  renderBtnRow() {
    const {
      memberType,
      affCode,
      editTarget,
      formIsPristine,
      isCreatingNew,
    } = this.props;
    const {value} = affCode;
    const submitDisabled =
      !value || (!isCreatingNew && formIsPristine) || !memberType;
    return (
      <div className={css.modal_button_row}>
        <button
          type="button"
          className={css.modal_cancelButton}
          onClick={this.onCloseClick}>
          取消
        </button>
        {editTarget ? (
          <Popconfirm
            title="确定要删除吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={this.onDeleteClick}>
            <button type="button" className={css.modal_deleteButton}>
              删除邀请码
            </button>
          </Popconfirm>
        ) : null}
        <button
          type="button"
          disabled={submitDisabled}
          className={css.modal_submitButton}
          onClick={this.onSubmitClick}>
          {isCreatingNew ? '创建新邀请码' : '确定修改'}
        </button>
      </div>
    );
  }

  render() {
    const {isCreatingNew, responseMsg} = this.props;
    return (
      <React.Fragment>
        <div className={css.modal_title}>
          {isCreatingNew ? '创建新' : '修改'}邀请码
        </div>
        {responseMsg && responseMsg.color !== 'green' && <ResponseMessageBar />}
        <div className={userCSS.popUp_content_body}>
          {this.renderForm()}
          {this.renderBtnRow()}
        </div>
      </React.Fragment>
    );
  }
}

export default AffiliateForm;
