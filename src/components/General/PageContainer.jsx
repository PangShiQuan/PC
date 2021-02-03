import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import css from 'styles/layout.less';

function PageContainer({children, className, style}) {
  const containerClasses = classnames(css.pageContainer, className);
  return (
    <div className={containerClasses} style={style}>
      {children}
    </div>
  );
}

PageContainer.proptype = {
  style: PropTypes.object,
  child: PropTypes.element,
};

export default PageContainer;
