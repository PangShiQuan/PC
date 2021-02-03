import React from 'react';
import classnames from 'classnames';
import css from 'styles/general/button.less';
import Button from './Button';

function CoreButton(props) {
  return (
    <Button {...props} className={classnames(css.coreButton, props.className)} />
  );
}

export default CoreButton;
