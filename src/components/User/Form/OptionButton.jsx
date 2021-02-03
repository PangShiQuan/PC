import React, {PureComponent} from 'react';
import css from 'styles/User/Form/OptionButton.less';
import {MDIcon} from 'components/General';

class OptionButton extends PureComponent {
  render() {
    const {checked, children, style, onClick} = this.props;
    return (
      <button
        type="button"
        onClick={onClick}
        data-checked={checked}
        className={css.optionButton}
        style={style}>
        {children}
        {checked && (
          <div className={css.tickIconDiv}>
            <MDIcon className={css.tickIcon} iconName="check" />
          </div>
        )}
      </button>
    );
  }
}

export default OptionButton;
