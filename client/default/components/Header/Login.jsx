import React, {Component} from 'react';
import {SubButton, MDIcon} from 'components/General/';

function Login ({className, disabled, placeholder, type, onClick, databetcenter}) {
    return (<SubButton
      className={className}
      disabled={disabled}
      placeholder={placeholder}
      type={type}
      onClick={onClick}
      data-betcenter={databetcenter}
      />);
}
  
export default Login;