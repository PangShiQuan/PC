import React from 'react';
import css from 'styles/CNY/plumFalling.less';

const PlumFalling = () => {
  const numOfPlums = 40;
  const node = [];
  for (let index = 0; index < numOfPlums; index++) {
    node.push(<div key={index} className={css.plum} />);
  }

  return node;
};

export default React.memo(PlumFalling);
