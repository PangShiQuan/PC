import React, {Component} from 'react';
import {SubButton, MDIcon} from 'components/General/';

function Login({
  className,
  disabled,
  placeholder,
  type,
  onClick,
  databetcenter,
  icon,
}) {
  return (
    <SubButton
      className={className}
      disabled={disabled}
      placeholder={placeholder}
      type={type}
      onClick={onClick}
      data-betcenter={databetcenter}
      icon={icon !== undefined ? icon : <MDIcon iconName="gamepad-variant" />}
    />
  );
}

export default Login;
