import React from 'react';
import css from 'styles/User/Form/ToggleButton.less';

function ToggleButton({checked, placeholder, disabled, onClick}) {
  return (
    <div className={css.inputBox}>
      <button
        type="button"
        data-checked={checked}
        className={css.button}
        onClick={onClick}
        disabled={disabled}>
        <span className={css.toggle}>
          <span className={css.toggleTrack} />
          <span className={css.toggleHander} />
        </span>
        {placeholder && <i className={css.btnPlaceholder}>{placeholder}</i>}
      </button>
    </div>
  );
}

export default ToggleButton;
