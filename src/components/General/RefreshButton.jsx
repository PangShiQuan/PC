import React from 'react';
import classnames from 'classnames';
import css from 'styles/general/button.less';

import MDIcon from './MDIcon';

function RefreshButton(props) {
  const {
    className,
    type = 'button',
    disabled,
    loading,
    rotated,
    icon,
    refreshClassName,
    ...prop
  } = props;

  return (
    <button
      {...prop}
      type={type}
      disabled={disabled || loading}
      className={classnames(className, css.accessBarBtn)}>
      <MDIcon
        rotated={loading}
        iconName={icon || 'refresh'}
        className={classnames(refreshClassName, css.refreshIcon)}
      />
    </button>
  );
}

export default RefreshButton;
