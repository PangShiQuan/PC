import React from 'react';
import {ToggleBtn} from 'components/General';

function AffSwitch({onToggle, item, awaitingResponse}) {
  const {status} = item;
  const onClick = () => {
    onToggle(item);
  };
  return (
    <ToggleBtn
      disabled={awaitingResponse}
      onClick={onClick}
      checked={status === 'ON'}
    />
  );
}

export default AffSwitch;
