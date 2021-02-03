import React, {PureComponent} from 'react';
import {Dropdown, Menu} from 'antd';
import {connect} from 'dva';
import {MDIcon} from 'components/General';
import css from 'styles/User/Form/Dropdown.less';
import _ from 'lodash';

class DropdownField extends PureComponent {
  renderDropdownListItem = ({items, onClick, valueSuffix}) => {
    return (
      <Menu>
        {_.map(items, (value, key) => {
          const btnProps = {
            onClick: () => onClick(key),
            value: key,
            disabled: this.awaitingResponse,
          };
          return (
            <Menu.Item key={key} {...btnProps}>
              <button type="button">{`${value}${valueSuffix}`}</button>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  render() {
    const {
      items,
      defaultValue,
      valueSuffix = '',
      onClick,
      componentStyle,
      disabled = false,
    } = this.props;
    return (
      <Dropdown
        disabled={disabled}
        overlay={this.renderDropdownListItem({items, onClick, valueSuffix})}
        trigger={['click']}>
        <button
          type="button"
          className={css.filterButton}
          style={{...componentStyle}}>
          {`${defaultValue}${valueSuffix}`}
          <MDIcon iconName="menu-down" />
        </button>
      </Dropdown>
    );
  }
}

function mapStatesToProps({userModel}) {
  const {awaitingResponse} = userModel;
  return {
    awaitingResponse,
  };
}

export default connect(mapStatesToProps)(DropdownField);
