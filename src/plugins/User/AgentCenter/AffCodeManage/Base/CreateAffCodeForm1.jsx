import React, {Component} from 'react';
import {connect} from 'dva';
import {Popconfirm} from 'antd';
import {
  LoadingBar,
  MDIcon,
  RangeInput,
  ToggleBtn,
  Button,
} from 'components/General';
import css from 'styles/User/Base/ProfileIndex1.less';
import {type as TYPE, getPrizePercentage} from 'utils';
import resolve from 'clientResolver';
import MemberOptions from 'components/User/AgentCenter/AffCodeManage/MemberOptions';

const Input = resolve.plugin('ProfileInput');

class CreateAffCodeForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.dispatch = this.props.dispatch;
    this.generateRandomAffCode = this.props.generateRandomAffCode;
    this.onAffToggle = this.props.onAffToggle;
    this.poluteForm = this.props.poluteForm;
    this.onBackClick = this.props.onBackClick;
    this.onDeleteClick = this.props.onDeleteClick;
    this.onInputChange = this.props.onInputChange;
    this.onRadioSelect = this.props.onRadioSelect;
    this.onRangeChange = this.props.onRangeChange;
    this.onSubmitClick = this.props.onSubmitClick;
    this.validateInput = this.props.validateInput;
    this.onGenerateAffCodeClick = this.onGenerateAffCodeClick.bind(this);
  }
  componentWillUnmount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['affCode', 'memberType', 'affCodeStatus', 'prizeGroup'],
    });
  }
  onGenerateAffCodeClick() {
    this.poluteForm();
    this.generateRandomAffCode();
  }
  renderAffCodeInput() {

    const {
      affCode,
      awaitingResponse,
      inputFieldRefs,
      isCreatingNew,
    } = this.props;
    const {value, color, icon, inputMsg} = affCode;
    return (
      <Input
        readOnly={!isCreatingNew}
        disabled={awaitingResponse || !isCreatingNew}
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={inputFieldRefs.affCode}
        min="3"
        max="20"
        name="affCode"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="^[A-Za-z0-9]\w{2,19}$"
        placeholder="请输入字母和数字组成的3-20个字符"
        value={value}
      />
    );
  }
  renderToggleBtn() {
    const {affCodeStatus} = this.props;
    const {value} = affCodeStatus;
    return (
      <ToggleBtn
        onClick={this.onAffToggle}
        label={TYPE.inputFieldRefs.affCodeStatus}
        placeholder="启用邀请码"
        checked={value === 'ON'}
      />
    );
  }
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
      <RangeInput
        dataColor="blue"
        disabled={disabled}
        indicatorLabel={`${value} (${getPrizePercentage(value)}%)`}
        label={`${TYPE.inputFieldRefs.prizeGroup} (赔率%)`}
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
    );
  }
  renderForm() {
    const {awaitingResponse, isCreatingNew, renderResponseMsg} = this.props;
    const commissionModes = localStorage.getItem('commissionMode') === TYPE.commissionMode.COMMISSION_RATIO;
    return (
      <div className={css.profile_contentBody}>
        <h4 className={css.profile_formLabel}>
          <button
            onClick={this.onBackClick}
            className={css.profile_breadcrumItem__main}>
            邀请码列表
          </button>
          <span disabled className={css.profile_breadcrumItem}>
            <MDIcon iconName="chevron-right" />
            <i>{isCreatingNew ? '创建新' : '修改'}邀请码</i>
          </span>
          <LoadingBar isLoading={awaitingResponse} />
        </h4>
        {renderResponseMsg()}
        <div className={css.profile_inputInlineRow}>
          <div className={css.profile_inputInlineBlock}>
            {this.renderToggleBtn()}
          </div>
          <div className={css.profile_inputInlineBlock}>
            <MemberOptions
              onRadioSelect={this.onRadioSelect}
              memberType={this.props.memberType}
            />
          </div>
          <div className={css.profile_inputInlineBlock} style={{flex: 2}}>
          {commissionModes ? null : this.renderRangeInput()}
          </div>
        </div>
        <div className={css.profile_inputInlineRow}>
          <div className={css.profile_inputInlineBlock}>
            {this.renderAffCodeInput()}
          </div>
          {isCreatingNew ? (
            <button
              onClick={this.onGenerateAffCodeClick}
              className={css.profile_inputInlineBtn}>
              生成邀请码
            </button>
          ) : null}
        </div>
      </div>
    );
  }
  renderBtnRow() {
    const {
      memberType,
      awaitingResponse,
      affCode,
      editTarget,
      formIsPristine,
      isCreatingNew,
    } = this.props;
    const {value} = affCode;
    const submitDisabled =
      this.awaitingResponse ||
      !value ||
      (!isCreatingNew && formIsPristine) ||
      !memberType;
    return (
      <div className={css.profile_formBtnRow}>
        <Button
          className={css.profile_formBtn__cancel}
          onClick={this.onBackClick}
          placeholder="取消"
        />
        {editTarget ? (
          <Popconfirm
            title="确定要删除吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={this.onDeleteClick}>
            <Button
              className={css.profile_formBtn__danger}
              placeholder="删除邀请码"
            />
          </Popconfirm>
        ) : null}
        <Button
          loading={awaitingResponse}
          disabled={submitDisabled}
          className={css.profile_formBtn__submit}
          onClick={this.onSubmitClick}
          placeholder={isCreatingNew ? '创建新邀请码' : '确定修改'}
        />
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.renderForm()}
        {this.renderBtnRow()}
      </div>
    );
  }
}

function mapStateToProps({teamModel, formModel, userModel}) {
  const {userData} = userModel;
  return {userData, ...teamModel, ...formModel};
}

export default connect(mapStateToProps)(CreateAffCodeForm);
