import React, { Component } from 'react';
import classnames from 'classnames';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import { MDIcon } from 'components/General';
import closeeye from 'assets/image/allIcon/closeeye.svg';
import openeye from 'assets/image/allIcon/openeye.svg';
class ProfileInput extends Component {
  constructor(props) {
    super(props);
    this.input = '';

    this.state = {
      inputOnFocus: false,
      inputIsPristine: true,
      inputType: this.props.type,
      isopenEye: false
    };
  }

  onBeforeChange = event => {
    const { clipboardData, key, type, target } = event;
    const dataInvalidKey = target.getAttribute('data-invalidkey');
    let invalidInput;

    if (dataInvalidKey) {
      if (type === 'keypress') {
        invalidInput = key === dataInvalidKey;
      } else if (type === 'paste') {
        invalidInput = clipboardData.getData('text').includes(dataInvalidKey);
      }
    }

    if (invalidInput) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  onInputChange = event => {
    const { onChange } = this.props;
    this.setState({ inputIsPristine: false });
    if (onChange) onChange(event);
  };

  onInputFocus = event => {
    const { onFocus } = this.props;
    this.onInputClick();
    if (onFocus) onFocus(event);
  };

  onInputClick = () => {
    const { readOnly, disabled } = this.props;
    if (!readOnly && !disabled) {
      this.setState({ inputOnFocus: true });
    }
  };

  onInputHover = () => {
    const { readOnly, disabled } = this.props;
    if (!readOnly && !disabled) {
      this.setState({ inputOnFocus: true });
    }
  };

  onInputBlur = event => {
    const { onBlur, mouseLeaveSensitive } = this.props;
    const { inputIsPristine } = this.state;
    if ((inputIsPristine === false || mouseLeaveSensitive) && onBlur)
      onBlur(event);
  };

  onInputMouseLeave = () => {
    const { mouseLeaveSensitive } = this.props;
    const { input } = this;
    if (mouseLeaveSensitive) {
      this.setState({ inputOnFocus: false });
      input.blur();
    }
  };

  onDropdownClick = () => {
    this.setState({ inputOnFocus: false });
    const { input } = this;
    input.blur();
  };

  renderIndicateLength() {
    const { displayInputLength, readOnly, value, max, type } = this.props;
    const valueLength = value ? value.length : 0;

    const displayInputLengthT =
      displayInputLength === undefined ? true : displayInputLength;
    if (readOnly || !max || !displayInputLengthT) {
      return null;
    }

    return (
      <span className={css.profile_inputLength}>
        {type !== 'number' ? <span>{valueLength}</span> : null} / {max}
      </span>
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

  renderDropdown(notEditable) {
    const { renderOptions } = this.props;
    const { inputOnFocus } = this.state;

    if (!notEditable && renderOptions && inputOnFocus) {
      return (
        <div
          role="listbox"
          className={css.profile_select}
          onClick={this.onDropdownClick}
          tabIndex="0">
          {renderOptions()}
        </div>
      );
    }
  }

  renderDateIcon() {
    const inputType = this.props.type || 'text';
    if (inputType.indexOf('date') >= 0) {
      return (
        <MDIcon iconName="calendar" className={css.profile_dateInputIcon} />
      );
    }
  }

  renderPasswordEye = () => {
    const { isopenEye } = this.state;
    return <img className={css.passwordIcon} src={isopenEye ? openeye : closeeye} onClick={() => { this.setState({ isopenEye: !isopenEye, inputType: isopenEye ? "password" : "text" }) }}/>
  }

  render() {
    const {
      dataColor,
      dataInvalidKey,
      disabled,
      label,
      max,
      min,
      name,
      pattern,
      placeholder,
      readOnly,
      required,
      style,
      value,
      width,
      className,
      layout = 'vertical',
      isShowEye
    } = this.props;
    const notEditable = disabled || readOnly;
    const {inputType}=this.state
    // const { inputXIndex, inputYIndex, inputWidth } = this.state;
    // const style = { width: inputWidth, top: inputYIndex, left: inputXIndex };
    return (
      <div
        style={{ width }}
        className={css.profile_inputBox}
        onMouseEnter={this.onInputHover}
        onMouseLeave={this.onInputMouseLeave}>
        <label
          htmlFor={name}
          className={css.profile_inputLabel}
          data-color={notEditable ? '' : dataColor}
          data-required={required}
          data-layout={layout}>
          <span>{label}</span>
          {notEditable ? (
            <MDIcon
              iconName="pencil-lock"
              className={css.profile_readOnlyIcon}
            />
          ) : null}
          {this.renderIndicateMsg()}
        </label>
        {this.renderDateIcon()}
        <input
          disabled={disabled}
          max={max}
          min={min}
          maxLength={max || null}
          pattern={pattern}
          placeholder={placeholder}
          readOnly={readOnly || false}
          name={name}
          value={value}
          type={inputType || 'text'}
          className={classnames(css.profile_input, className || '')}
          onBlur={this.onInputBlur}
          onClick={this.onInputClick}
          onChange={this.onInputChange}
          onFocus={this.onInputFocus}
          onKeyPress={this.onBeforeChange}
          onPaste={this.onBeforeChange}
          ref={node => {
            this.input = node;
          }}
          data-label={label}
          data-color={dataColor}
          data-invalidkey={dataInvalidKey}
          data-layout={layout}
          style={{ ...style }}
        />

        {this.renderDropdown(notEditable)}
        {this.renderIndicateLength()}
        {isShowEye && this.renderPasswordEye()}
      </div>
    );
  }
}

export default ProfileInput;
