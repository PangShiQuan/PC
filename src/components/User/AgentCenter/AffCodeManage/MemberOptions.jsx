import React from 'react';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import {MDIcon} from 'components/General';

function MemberOptions({onRadioSelect, memberType}) {
  const isPlayer = memberType === 'PLAYER';
  const isAgent = memberType === 'AGENT';
  const selectPlayer = () => onRadioSelect('PLAYER');
  const selectAgent = () => onRadioSelect('AGENT');
  return (
    <div className={css.profile_inputBox}>
      <label className={css.profile_inputLabel} htmlFor="securityMode">
        用户类型
      </label>
      <button
        name="PLAYER"
        onClick={selectPlayer}
        className={css.profile_radioBtn}
        data-checked={isPlayer}>
        <MDIcon iconName={isPlayer ? 'radiobox-marked' : 'radiobox-blank'} />
        <span>会员</span>
      </button>
      <button
        name="AGENT"
        onClick={selectAgent}
        className={css.profile_radioBtn}
        data-checked={isAgent}>
        <MDIcon iconName={isAgent ? 'radiobox-marked' : 'radiobox-blank'} />
        <span>代理</span>
      </button>
    </div>
  );
}

export default MemberOptions;
