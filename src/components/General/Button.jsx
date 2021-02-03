import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import css from 'styles/general/button.less';
import Column from './Column';
import EllipsisLoader from './EllipsisLoader';

/* eslint-disable react/prop-types */
class Button extends Component {
  renderIcon(icon) {
    const {iconalignment, placeholder} = this.props;
    if (icon) {
      return (
        <Column float={placeholder ? iconalignment : 'none'}>{icon}</Column>
      );
    }
    return null;
  }
  render() {
    const {
      className,
      type,
      style,
      placeholder,
      onClick,
      icon,
      disabled,
      loading,
      value,
      children,
    } = this.props;
    const classes = classnames(css.button, className);
    return (
      <button
        {...this.props}
        disabled={disabled || loading}
        >
        {this.renderIcon(icon)}
        {placeholder || children} {loading ? <EllipsisLoader duration={3000} /> : null}
      </button>
    );
  }
}

Button.propTypes = {
  icon: PropTypes.element,
};

export default Button;
