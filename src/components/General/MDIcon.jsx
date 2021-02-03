import React from 'react';
import classNames from 'classnames';
import 'mdi/css/materialdesignicons.css';
import css from 'styles/general/icon.less';

function MDIcon({
  iconName,
  className,
  color,
  size,
  style,
  bubbleCount,
  rotated,
  ispromotions,
}) {
  const classes = classNames(
    css.icon,
    `mdi`,
    {
      [`mdi-${color}`]: color,
      [`mdi-${size}`]: size,
      [`mdi-${iconName}`]: iconName,
    },
    className,
  );
  return (
    <i
      className={classes}
      style={style}
      data-count={bubbleCount}
      data-rotated={rotated}
      ispromotions={ispromotions}
    />
  );
}

export default MDIcon;
