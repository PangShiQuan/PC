import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import css from 'styles/layout.less';

function Row({
  style,
  className,
  onMouseLeave,
  onMouseEnter,
  onClick,
  children,
}) {
  const rowClasses = classnames(css.row, className);
  return (
    <div
      role="presentation"
      style={style}
      className={rowClasses}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}>
      {children}
    </div>
  );
}

Row.proptype = {
  style: PropTypes.object,
  child: PropTypes.element,
};

export default Row;
