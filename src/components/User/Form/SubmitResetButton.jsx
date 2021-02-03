import React, {PureComponent} from 'react';
import css from 'styles/User/Form/SubmitResetButton.less';

class SubmitResetButton extends PureComponent {
  render() {
    const {
      labelWidth,
      submitDisabled,
      resetDisabled,
      hideReset,
      onSubmitClick,
      onResetClick,
      submitText,
      resetText,
      submitWidth,
      resetWidth,
      marginTop,
    } = this.props;
    return (
      <div style={marginTop && {marginTop: '14px'}}>
        <div
          style={{
            width: labelWidth,
            display: 'inline-block',
          }}
        />
        <div
          style={{display: 'inline-block', width: `calc(100% - ${labelWidth}`}}>
          <button
            type="button"
            className={css.submitButton}
            disabled={submitDisabled}
            onClick={onSubmitClick}
            style={{width: submitWidth}}>
            {submitText}
          </button>
          {!hideReset && (
            <button
              type="button"
              className={css.cancelButton}
              disabled={resetDisabled}
              onClick={onResetClick}
              style={{width: resetWidth}}>
              {resetText}
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default SubmitResetButton;
