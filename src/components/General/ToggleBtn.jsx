import React from 'react';
import css from 'styles/general/toggleBtn.less';

function ToggleBtn({checked, label, placeholder, disabled, onClick}) {
  return (
    <div className={css.inputBox}>
      {label ? <span className={css.inputLabel}>{label}</span> : null}
      <button
        data-checked={checked}
        className={css.button}
        onClick={onClick}
        disabled={disabled}>
        <span className={css.toggle}>
          <span className={css.toggleTrack} />
          <span className={css.toggleHander} />
        </span>
        <i className={css.btnPlaceholder}>{placeholder}</i>
      </button>
    </div>
  );
}

export default ToggleBtn;
