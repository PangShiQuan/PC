import React, {PureComponent} from 'react';
import css from 'styles/User/Form/RangeInput.less';

class RangeInput extends PureComponent {
  render() {
    const {
      disabled,
      indicatorLabel,
      max,
      min,
      maxLabel,
      minLabel,
      name,
      shouldShowRange,
      shouldShowValue,
      step,
      value,
      onBlur,
      onChange,
      labelWidth,
    } = this.props;

    const valuePercentage = `${((value >= min ? value - min : 0) /
      (max - min)) *
      100}%`;
    const hasValue = value > min;

    return (
      <div style={{width: `calc(100% - ${labelWidth})`}}>
        <div className={css.inputBody}>
          {shouldShowValue && (
            <span
              className={css.inputValue}
              data-hasvalue={hasValue}
              disabled={disabled}>
              {indicatorLabel || value}
            </span>
          )}
          {shouldShowRange && (
            <span className={css.inputMarker__min}>{minLabel || min}</span>
          )}
          {shouldShowRange && (
            <div className={css.input}>
              <input
                data-hasvalue={hasValue}
                disabled={disabled}
                max={max}
                min={min}
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                step={step}
                style={{zIndex: 5}}
                type="range"
                value={value}
              />
              <span
                className={css.hander}
                style={{
                  left: valuePercentage,
                }}
              />
              <div
                className={css.inputTrack__highlight}
                style={{
                  width: valuePercentage,
                }}
              />
              <div className={css.inputTrack} />
              <span
                style={{left: valuePercentage}}
                className={css.inputValueIndicator}>
                {indicatorLabel || value}
              </span>
            </div>
          )}
          {shouldShowRange && (
            <span className={css.inputMarker__max}>{maxLabel || max}</span>
          )}
        </div>
      </div>
    );
  }
}

export default RangeInput;
