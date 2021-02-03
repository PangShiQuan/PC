import React, {Component} from 'react';
import {MDIcon} from 'components/General';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import InputTextField from 'components/User/Form/InputTextField';
import RangeInput from 'components/User/Form/RangeInput';
import affiliateCSS from 'styles/User/AgentCenter/Affiliate.less';
import userCSS from 'styles/User/User.less';
import css from 'styles/User/AgentCenter/Member.less';
import {type as TYPE, getPrizePercentage} from 'utils';

class AffiliateForm extends Component {
  LABEL_WIDTH = '111px';

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.poluteForm = props.poluteForm;
    this.onCloseClick = props.onCloseClick;
    this.onSubmitClick = props.onSubmitClick;
  }

  componentDidMount() {
    this.dispatch({
      type: 'userModel/updateState',
      payload: {authenticationState: TYPE.REGISTER},
    });
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['authenticationState'],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'username',
        'password',
        'realName',
        'email',
        'memberType',
        'prizeGroup',
      ],
    });
  }

  validateInput = payload => {
    this.dispatch({type: 'formModel/validateInput', payload});
  };

  onUsernameChange = event => {
    this.poluteForm();
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const eventTarget = event.target;
    const {value, max} = eventTarget;
    if (`${value}`.length <= max) {
      this.validateInput(event);
    }
  };

  onRadioSelect = memberType => {
    this.poluteForm();
    this.dispatch({type: 'formModel/updateState', payload: {memberType}});
  };

  onRangeChange = event => {
    this.poluteForm();
    const {initialMinRange, initialMaxRange} = this.props;
    event.persist();
    const eventTarget = event.target;
    const {value, name} = eventTarget;
    let payload = {[name]: {value}};
    if (value < initialMinRange) {
      payload = {[name]: {value: initialMinRange}};
    } else if (value > initialMaxRange) {
      payload = {[name]: {value: initialMaxRange}};
    }
    this.dispatch({
      type: 'formModel/updateState',
      payload,
    });
  };

  renderUsernameInput = () => {
    const {username, mode} = this.props;
    const {value, inputMsg, icon, color} = username;

    return (
      <div className={css.modal_form_row}>
        <div className={css.modal_form_item}>
          <InputTextField
            disabled={mode === 'EDIT'}
            id="username"
            label={TYPE.inputFieldRefs.username}
            min="4"
            max="11"
            value={value}
            labelWidth={this.LABEL_WIDTH}
            placeholder="请输入4-11位字母和数字，至少包含一个字母)"
            pattern="^.{4,11}$"
            type="text"
            obj={username}
            onChange={this.onUsernameChange}
            style={mode === 'EDIT' ? {border: '0', padding: '0'} : null}
          />
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderPasswordInput = () => {
    const {password, mode} = this.props;
    if (mode === 'CREATE') {
      const {value} = password;
      return (
        <div className={css.modal_form_row}>
          <div className={css.modal_form_item}>
            <InputTextField
              disabled
              readOnly
              id="disabledPassword"
              label={`默认${TYPE.inputFieldRefs.password}`}
              value={value}
              labelWidth={this.LABEL_WIDTH}
              type="text"
            />
          </div>
          <div className={css.formItem_msg}>*用户登录后需自行修改</div>
        </div>
      );
    }
    return null;
  };

  renderMemberOptions() {
    const {memberType, initialMemberType, mode} = this.props;
    const isPlayer = memberType === 'PLAYER';
    const isAgent = memberType === 'AGENT';
    const selectPlayer = () => this.onRadioSelect('PLAYER');
    const selectAgent = () => this.onRadioSelect('AGENT');
    const userSelectDisabled =
      mode !== 'CREATE' && initialMemberType === 'AGENT';

    return (
      <div className={affiliateCSS.modal_form_row}>
        <div style={{width: this.LABEL_WIDTH}}>用户类型</div>
        <button
          type="button"
          disabled={userSelectDisabled}
          name="PLAYER"
          onClick={selectPlayer}
          className={affiliateCSS.radio_button}
          data-checked={isPlayer}>
          <MDIcon iconName={isPlayer ? 'radiobox-marked' : 'radiobox-blank'} />
          <span>会员</span>
        </button>
        <button
          type="button"
          name="AGENT"
          onClick={selectAgent}
          className={affiliateCSS.radio_button}
          data-checked={isAgent}>
          <MDIcon iconName={isAgent ? 'radiobox-marked' : 'radiobox-blank'} />
          <span>代理</span>
        </button>
      </div>
    );
  }

  renderRangeInput() {
    const {
      prizeGroup,
      userData,
      initialMinRange,
      initialMaxRange,
      initialValue,
      minMemberPrizeGroup,
      applyTarget,
    } = this.props;
    const memberPrizeGroup = prizeGroup.value;
    const userPrizeGroup = userData.prizeGroup;
    const platformPrizeGroup = minMemberPrizeGroup;
    const value = memberPrizeGroup;
    let disabled = false;
    let shouldShowRange = true;
    if (
      userPrizeGroup <= platformPrizeGroup ||
      (!!applyTarget && initialValue >= initialMaxRange)
    ) {
      disabled = true;
      shouldShowRange = false;
    }
    let min = initialMinRange;
    const max = initialMaxRange;
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

  renderForm() {
    const commissionModes =
      localStorage.getItem('commissionMode') ===
      TYPE.commissionMode.COMMISSION_RATIO;
    return (
      <div>
        {this.renderUsernameInput()}
        {this.renderPasswordInput()}
        {this.renderMemberOptions()}
        {commissionModes ? null : this.renderRangeInput()}
      </div>
    );
  }

  renderBtnRow() {
    const {username, formIsPristine, memberType, mode} = this.props;
    const submitDisabled =
      !username.validatePassed || formIsPristine || !memberType;
    let submitBtnPlaceholder = '创建新用户';
    if (mode === 'EDIT') {
      submitBtnPlaceholder = '确定修改';
    }
    return (
      <div className={affiliateCSS.modal_button_row}>
        <button
          type="button"
          className={affiliateCSS.modal_cancelButton}
          onClick={this.onCloseClick}>
          取消
        </button>
        <button
          type="button"
          disabled={submitDisabled}
          className={affiliateCSS.modal_submitButton}
          onClick={this.onSubmitClick}>
          {submitBtnPlaceholder}
        </button>
      </div>
    );
  }

  render() {
    const {mode, responseMsg} = this.props;
    return (
      <React.Fragment>
        <div className={affiliateCSS.modal_title}>
          {mode === 'CREATE' ? '创建新' : '修改'}用户
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
