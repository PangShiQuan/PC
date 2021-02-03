import React from 'react';
import css from 'styles/User/ContentContainer.less';

const ContentContainer = props => {
  const {children, title, style, titleStyle} = props;
  return (
    <div className={css.profile_container} style={style}>
      <div className={css.profile_container_label} style={titleStyle}>
        {title}
      </div>
      {children}
    </div>
  );
};

export default ContentContainer;
