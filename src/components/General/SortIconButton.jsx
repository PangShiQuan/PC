import React from 'react';
import MDIcon from './MDIcon';
import css from 'styles/User/Dsf/ProfileIndex1.less';

/**
 * @param {function} onSort - callback after button clicked
 * @param {string} direction - up || down
 * @param {bolean} active - to toggle icon class
 * @param {string} target - target key to be sort
 */
const SortIconButton = ({onSort, direction, target, active}) => {
  function onClick() {
    onSort(direction, target);
  }
  return (
    <button onClick={onClick}>
      <MDIcon
        iconName={`arrow-${direction}`}
        className={
          active ? css.profile_tableSortIcon__active : css.profile_tableSortIcon
        }
      />
    </button>
  );
};

export default SortIconButton;
