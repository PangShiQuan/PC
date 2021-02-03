import React, {PureComponent} from 'react';
import {connect} from 'dva';
import css from 'styles/User/Form/InputTextField.less';

class renderInput extends PureComponent {
  constructor(props) {
    super(props);
    const {dispatch} = this.props;
    this.dispatch = dispatch;
  }

  onInputChange = event => {
    event.persist();
    const {
      target: {value, name, max},
    } = event;

    if (value.toString().length <= max || !max) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {[name]: {value}},
      });

      this.dispatch({
        type: 'formModel/validateInput',
        payload: event,
      });
    }
  };

  render() {
    const {
      id,
      label,
      value,
      labelWidth,
      placeholder,
      pattern,
      type,
      obj,
      onChange,
      onKeyPress,
      onBlur,
      min,
      max,
      disabled = false,
      readOnly = false,
      style,
    } = this.props;
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
          className={css.textField}
          id={id}
          name={id}
          onChange={onChange || this.onInputChange}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          value={value}
          min={min}
          max={max}
          pattern={pattern}
          data-color={obj && obj.color}
          placeholder={placeholder}
          type={type}
          style={{
            width: `calc(100% - ${labelWidth})`,
            ...style,
          }}
          disabled={disabled}
          readOnly={readOnly}
        />
      </React.Fragment>
    );
  }
}

export default connect()(renderInput);
