import React from 'react';
import Firework from 'components/CNYEffect/Firework';

const Fireworks = () => {
  const generateFireworks = () => {
    const nodes = [];
    const numOfFireworks = 14;

    for (let index = 0; index < numOfFireworks; index++) {
      nodes.push(<Firework key={index} />);
    }

    return nodes;
  };

  return generateFireworks();
};

export default React.memo(Fireworks);
