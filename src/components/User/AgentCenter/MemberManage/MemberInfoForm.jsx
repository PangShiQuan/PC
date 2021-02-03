import React, {Component} from 'react';

import {MDIcon, LoadingBar, RangeInput, Button} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import {getPrizePercentage, type as TYPE} from 'utils';
import resolve from 'clientResolver';

const Input = resolve.plugin('ProfileInput');

const RadioButton = ({disabled, active, value, placeholder, onSelect}) => {
  function onClick() {
    onSelect(value);
  }
  return (
    <button
      disabled={disabled}
      className={css.profile_radioBtn}
      data-checked={active}
      name={value}
      onClick={onClick}>
      <MDIcon iconName={active ? 'radiobox-marked' : 'radiobox-blank'} />
      <span>{placeholder}</span>
    </button>
  );
};

class MemberInfoForm extends Component {
  constructor(props) {
    super(props);
    this.awaitingResponse = false;
    this.dispatch = props.dispatch;
    this.onBackClick = props.onBackClick;
    this.onInitialListClick = props.onInitialListClick;
    this.onInputChange = props.onInputChange;
    this.onRadioSelect = props.onRadioSelect;
    this.onRangeChange = props.onRangeChange;
    this.onSubmitClick = props.onSubmitClick;
    this.validateInput = props.validateInput;
    // this.validateUsername = props.validateUsername;
    this.memberType = props.memberType;
    this.initializeParentState = props.initializeParentState;
  }

  componentWillMount() {
    this.dispatch({
      type: 'userModel/updateState',
      payload: {authenticationState: TYPE.REGISTER},
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.awaitingResponse !== nextProps.awaitingResponse) {
      this.awaitingResponse = nextProps.awaitingResponse;
    }
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
        'responseMsg',
        'memberType',
        'prizeGroup',
      ],
    });
  }

  renderOptions() {
    const {memberType, initialMemberType, mode} = this.props;
    const isPlayer = memberType === 'PLAYER';
    const isAgent = memberType === 'AGENT';
    const userSelectDisabled =
      mode !== 'CREATE' && initialMemberType === 'AGENT';

    return (
      <div className={css.profile_inputBox}>
        <label className={css.profile_inputLabel} htmlFor="memberType">
          用户类别
        </label>
        <RadioButton
          disabled={userSelectDisabled}
          active={isPlayer}
          value="PLAYER"
          onSelect={this.onRadioSelect}
          placeholder="会员"
        />
        <RadioButton
          active={isAgent}
          value="AGENT"
          onSelect={this.onRadioSelect}
          placeholder="代理"
        />
      </div>
    );
  }

  renderUsernameInput() {
    const {username, inputFieldRefs, mode} = this.props;
    const {value, inputMsg, icon, color} = username;
    const inputDisabled = mode === 'EDIT' || this.awaitingResponse;
    return (
      <Input
        disabled={inputDisabled}
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={inputFieldRefs.username}
        min="4"
        max="11"
        name="username"
        // onBlur={this.validateUsername}
        onChange={this.onInputChange}
        pattern="^.{4,11}$"
        placeholder="用户名(4-11位字母和数字, 至少含有一个字母)"
        value={value}
      />
    );
  }

  renderRangeInput() {
    const {
      prizeGroup,
      userData,
      inputFieldRefs,
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
      <RangeInput
        dataColor="blue"
        onDrag={this.onRangeChange}
        onChange={this.onRangeChange}
        minLabel={`${min} (${getPrizePercentage(min)}%)`}
        maxLabel={`${max} (${getPrizePercentage(max)}%)`}
        shouldShowValue
        shouldShowRange={shouldShowRange}
        disabled={disabled}
        indicatorLabel={`${value} (${getPrizePercentage(value)}%)`}
        label={`${inputFieldRefs.prizeGroup} (赔率%)`}
        name="prizeGroup"
        min={min}
        max={max}
        step={2}
        value={value}
      />
    );
  }

  renderBtnRow() {
    const {username, formIsPristine, memberType, mode} = this.props;
    const submitDisabled =
      this.awaitingResponse ||
      !username.validatePassed ||
      formIsPristine ||
      !memberType;
    let submitBtnPlaceholder = '创建新用户';
    if (mode === 'EDIT') {
      submitBtnPlaceholder = '确定修改';
    }
    return (
      <div className={css.profile_formBtnRow}>
        <Button
          className={css.profile_formBtn__cancel}
          onClick={this.onBackClick}
          placeholder="取消"
        />
        <Button
          disabled={submitDisabled}
          className={css.profile_formBtn__submit}
          onClick={this.onSubmitClick}
          placeholder={submitBtnPlaceholder}
        />
      </div>
    );
  }

  renderPasswordInput() {
    const {password, inputFieldRefs, mode} = this.props;
    if (mode === 'CREATE') {
      const {value} = password;
      return (
        <Input
          value={value}
          dataIcon="information-outline"
          disabled
          dataMsg="用户登录后需自行修改"
          label={`默认${inputFieldRefs.password}`}
        />
      );
    }
    return null;
  }

  render() {
    const {renderResponseMsg, mode} = this.props;
    const commissionModes = localStorage.getItem('commissionMode') === TYPE.commissionMode.COMMISSION_RATIO;
    let breadcrumbText = '创建新用户';
    if (mode === 'EDIT') {
      breadcrumbText = '修改用户';
    }
    return (
      <div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            <button
              onClick={this.onBackClick}
              className={css.profile_breadcrumItem__main}>
              我的用户列表
            </button>
            <button disabled className={css.profile_breadcrumItem}>
              <MDIcon iconName="chevron-right" />
              <i>{breadcrumbText}</i>
            </button>
            <LoadingBar isLoading={this.awaitingResponse} />
          </h4>
          {renderResponseMsg()}
          {this.renderUsernameInput()}
          {this.renderPasswordInput()}
          <div className={css.profile_inputInlineRow}>
            <div style={{display: 'flex', flex: 0.5}}>
              {this.renderOptions()}
            </div>
            <div className={css.profile_inputInlineBlock}>
            {commissionModes ? null : this.renderRangeInput()}
            </div>
          </div>
        </div>
        {this.renderBtnRow()}
      </div>
    );
  }
}

export default MemberInfoForm;
