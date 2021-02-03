import React from 'react';
import css from 'styles/general/rangeInput.less';

import MDIcon from './MDIcon';

const RangeInput = ({
  inputClassName,
  className,
  dataColor,
  dataIcon,
  dataMsg,
  disabled,
  indicatorLabel,
  label,
  max,
  maxLabel,
  min,
  minLabel,
  name,
  onBlur,
  onChange,
  shouldShowRange,
  shouldShowValue,
  step,
  style,
  value,
}) => {
  const valuePercentage = `${((value >= min ? value - min : 0) / (max - min)) *
    100}%`;
  const hasValue = value > min;
  return (
    <div className={inputClassName || css.inputBox} style={style}>
      {label && (
        <label className={css.inputLabel} htmlFor={name} data-color={dataColor}>
          {label}
          <span
            className={
              dataMsg ? css.inputIndicateMsg__show : css.inputIndicateMsg
            }>
            <MDIcon className={css.inputIndicateIcon} iconName={dataIcon} />
            <i>{dataMsg}</i>
          </span>
        </label>
      )}
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
              className={className}
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
              data-color={hasValue ? dataColor : ''}
              style={{
                left: valuePercentage,
              }}
            />
            <div
              className={css.inputTrack__highlight}
              data-color={!disabled ? dataColor : ''}
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
};

export default RangeInput;
