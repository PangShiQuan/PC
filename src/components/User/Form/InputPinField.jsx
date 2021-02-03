import React, {PureComponent} from 'react';
import css from 'styles/User/Form/InputPinField.less';
import {connect} from 'dva';
import _ from 'lodash';

class InputPinField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputIsPristine: true,
    };
    this.dispatch = props.dispatch;
  }

  validateInput = payload => {
    const {inputIsPristine} = this.state;
    if (!inputIsPristine) {
      this.dispatch({
        type: 'formModel/validateInput',
        payload,
      });
    }
  };

  validateRepeatInput = payload => {
    this.dispatch({
      type: 'formModel/validateRepeatInput',
      payload,
    });
  };

  onInputChange = event => {
    event.persist();
    const eventTarget = event.target;
    const {value, max, name, min} = eventTarget;
    if (`${value}`.length <= _.toNumber(max)) {
      const payload = {[name]: {value}};
      this.dispatch({type: 'formModel/updateState', payload});
      this.dispatch({
        type: 'formModel/initializeState',
        payload: ['responseMsg'],
      });
      if (value.length >= min) {
        if (name.indexOf('repeat') > -1) {
          this.validateRepeatInput(event);
        } else {
          this.validateInput(event);
        }
      }
    }
    this.setState({inputIsPristine: false});
  };

  onInputClick = event => {
    event.persist();
    const eventTarget = event.target;
    const {name} = eventTarget;
    const {dispatch} = this.props;
    dispatch({type: 'formModel/initializeState', payload: [name]});
  };

  render() {
    const {
      width,
      labelWidth,
      readOnly = false,
      disabled = false,
      value,
      label,
      type,
      obj,
      name,
      min,
      max,
      pattern,
    } = this.props;
    const digitLength = value ? value.length : 0;
    let spanClass1 = css.pinInput;
    let spanClass2 = css.pinInput;
    let spanClass3 = css.pinInput;
    let spanClass4 = css.pinInput;

    switch (digitLength) {
      case 0:
        spanClass1 = css.pinInput_active;
        break;
      case 1:
        spanClass1 = css.pinInput_hasValue;
        spanClass2 = css.pinInput_active;
        break;
      case 2:
        spanClass1 = css.pinInput_hasValue;
        spanClass2 = css.pinInput_hasValue;
        spanClass3 = css.pinInput_active;
        break;
      case 3:
        spanClass1 = css.pinInput_hasValue;
        spanClass2 = css.pinInput_hasValue;
        spanClass3 = css.pinInput_hasValue;
        spanClass4 = css.pinInput_active;
        break;
      case 4:
        spanClass1 = css.pinInput_hasValue;
        spanClass2 = css.pinInput_hasValue;
        spanClass3 = css.pinInput_hasValue;
        spanClass4 = css.pinInput_hasValue;
        break;
      default:
        break;
    }

    return (
      <React.Fragment>
        <div
          style={{
            width: `${labelWidth}`,
          }}
          className={css.label}>
          {label}
        </div>
        <input
          data-color={obj && obj.color}
          min={min}
          max={max}
          name={name}
          // onBlur={event => this.validateInput(event)}
          onChange={event => this.onInputChange(event)}
          onClick={event => this.onInputClick(event)}
          pattern={pattern}
          readOnly={readOnly}
          disabled={disabled}
          type={type}
          unselectable="on"
          value={value}
          className={css.textField}
          style={{
            width: width || `calc(100% - ${labelWidth})`,
          }}
        />
        <span className={spanClass1} />
        <span className={css.pinInput_divider}>-</span>
        <span className={spanClass2} />
        <span className={css.pinInput_divider}>-</span>
        <span className={spanClass3} />
        <span className={css.pinInput_divider}>-</span>
        <span className={spanClass4} />
      </React.Fragment>
    );
  }
}

export default connect()(InputPinField);
