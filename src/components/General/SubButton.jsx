import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from './Button';
import css from 'styles/general/button.less';

class RedButton extends Component {
  renderIcon(icon) {
    if (icon) {
      return icon;
    }
    return null;
  }
  render() {
    const {
      type,
      className,
      style,
      placeholder,
      onClick,
      icon,
      iconalignment,
      disabled,
    } = this.props;
    const btnClasses = classnames(css.subButton, className);
    return (
      <Button
        disabled={disabled}
        type={type}
        onClick={onClick}
        className={btnClasses}
        style={style}
        placeholder={placeholder}
        icon={icon}
        iconalignment={iconalignment}
      />
    );
  }
}

RedButton.propTypes = {
  icon: PropTypes.element,
};

export default RedButton;
