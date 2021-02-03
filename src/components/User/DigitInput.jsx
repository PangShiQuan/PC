import React, { Component } from "react";
import css from "styles/User/Dsf/ProfileIndex1.less";
import { MDIcon } from "components/General";

class DigitInput extends Component {
  constructor() {
    super();
    this.state = {
      inputIsPristine: true
    };
  }

  onInputBlur(event) {
    const { inputIsPristine } = this.state;
    const { onBlur } = this.props;
    if (onBlur && !inputIsPristine) {
      onBlur(event);
    }
  }
  onInputChange(event) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(event);
    }
    this.setState({ inputIsPristine: false });
  }
  onInputClick(event) {
    const { onClick } = this.props;
    if (onClick) {
      onClick(event);
    }
  }
  inputChange(event) {
    event.persist();
    this.onInputChange(event);
  }
  renderIndicateLength() {
    const { readOnly, value, max, type } = this.props;
    const valueLength = value ? value.length : 0;
    if (readOnly || !max) {
      return null;
    }

    return (
      <span className={css.profile_inputLength}>
        {type !== "number" ? <span>{valueLength}</span> : null} / {max}
      </span>
    );
  }
  renderIndicate() {
    const {
      readOnly,
      value,
      max,
      dataColor,
      dataMessage,
      dataIcon,
      type
    } = this.props;
    if (readOnly || !value) {
      return null;
    }
    return (
      <div>
        <p
          className={
            dataMessage ? css.profile_inputMsg__show : css.profile_inputMsg
          }
          data-color={dataColor}
        >
          <MDIcon className={css.profile_inputMsgIcon} iconName={dataIcon} />
          <span>{dataMessage}</span>
        </p>
        {max ? (
          <span className={css.profile_inputLength}>
            {type !== "number" ? <span>{value.length || 0}</span> : null} /{" "}
            {max}
          </span>
        ) : null}
      </div>
    );
  }
  renderIndicateMsg() {
    const { dataMsg, readOnly, dataIcon } = this.props;
    const className = dataMsg
      ? css.profile_indicateMsg__show
      : css.profile_indicateMsg;
    if (readOnly) {
      return null;
    }
    return (
      <span className={className}>
        <MDIcon className={css.profile_inputMsgIcon} iconName={dataIcon} />
        <i>{dataMsg}</i>
      </span>
    );
  }
  render() {
    const {
      readOnly,
      value,
      label,
      type,
      dataColor,
      name,
      min,
      max,
      pattern,
      placeholder,
      disabled
    } = this.props;
    const digitLength = value ? value.length : 0;
    return (
      <div className={css.profile_inputBox}>
        <input
          data-color={dataColor}
          className={css.profile_digitInput__hidden}
          min={min}
          max={max}
          name={name}
          onBlur={event => this.onInputBlur(event)}
          onChange={event => this.inputChange(event)}
          onClick={event => this.onInputClick(event)}
          pattern={pattern}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          type={type}
          unselectable="on"
          value={value}
        />
        <label
          htmlFor={name}
          className={css.profile_inputLabel}
          data-color={dataColor}
        >
          <span>{label}</span>
          {disabled || readOnly ? (
            <MDIcon
              iconName="pencil-lock"
              className={css.profile_readOnlyIcon}
            />
          ) : null}
          {this.renderIndicateMsg()}
        </label>
        <span
          className={
            digitLength === 0
              ? css.profile_digitInput__active
              : digitLength >= 1
                ? css.profile_digitInput__hasValue
                : css.profile_digitInput
          }
        />
        <span className={css.profile_digitInputDivider}>-</span>
        <span
          className={
            digitLength === 1
              ? css.profile_digitInput__active
              : digitLength >= 2
                ? css.profile_digitInput__hasValue
                : css.profile_digitInput
          }
        />
        <span className={css.profile_digitInputDivider}>-</span>
        <span
          className={
            digitLength === 2
              ? css.profile_digitInput__active
              : digitLength >= 3
                ? css.profile_digitInput__hasValue
                : css.profile_digitInput
          }
        />
        <span className={css.profile_digitInputDivider}>-</span>
        <span
          className={
            digitLength === 3
              ? css.profile_digitInput__active
              : digitLength >= 4
                ? css.profile_digitInput__hasValue
                : css.profile_digitInput
          }
        />
        {this.renderIndicateLength()}
      </div>
    );
  }
}

export default DigitInput;
