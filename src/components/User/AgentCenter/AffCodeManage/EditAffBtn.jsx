import React from 'react';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import {Button} from 'components/General';

function EditAffBtn({onEdit, item}) {
  const onClick = () => {
    onEdit(item);
  };
  return (
    <Button
      placeholder="修改"
      className={css.profile_tableBtn}
      onClick={onClick}
    />
  );
}

export default EditAffBtn;
