import React from 'react';
import {chunk} from 'lodash';
import {type as TYPE, codeResult} from 'utils';

const MarkSixShortCuts = function MarkSixShortCuts({
  currentTimeEpoch,
  onSelect,
  btnClassName,
  selectedNums = [],
  disabled,
}) {
  let symbolicsBtns = TYPE.SYMBOLICS.map(symbolicName => {
    const nums = codeResult.getNumsFromZodiaName({
      currentTimeEpoch,
      symbolicName,
    });
    function onClick() {
      onSelect(nums);
    }
    let active = false;
    if (nums && selectedNums) {
      active = nums.every(num => selectedNums.indexOf(num) >= 0);
    }
    return (
      <button
        className={btnClassName}
        data-active={active}
        key={symbolicName}
        onClick={onClick}
        disabled={active || disabled}>
        {symbolicName}
      </button>
    );
  });
  symbolicsBtns = chunk(symbolicsBtns, 6);
  return (
    <div>
      {symbolicsBtns[0]}
      <br />
      {symbolicsBtns[1]}
    </div>
  );
};

export default MarkSixShortCuts;
