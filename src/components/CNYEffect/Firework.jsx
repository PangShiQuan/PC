import React, {useState, useEffect, useCallback} from 'react';
import fireworkBlue from 'assets/image/CNY/firework-blue.gif';
import fireworkOrange from 'assets/image/CNY/firework-orange.gif';
import fireworkPink from 'assets/image/CNY/firework-pink.gif';
import fireworkPurple from 'assets/image/CNY/firework-purple.gif';
import fireworkRed from 'assets/image/CNY/firework-red.gif';
import css from 'styles/CNY/fireworks.less';

const Firework = () => {
  const [fireworkNode, setFireworkNode] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const generateFireworkEffect = useCallback(() => {
    const randomNum = Math.floor(Math.random() * 5);
    let gifFile = null;

    switch (randomNum) {
      case 0:
        gifFile = fireworkBlue;
        break;
      case 1:
        gifFile = fireworkOrange;
        break;
      case 2:
        gifFile = fireworkPink;
        break;
      case 3:
        gifFile = fireworkPurple;
        break;
      case 4:
        gifFile = fireworkRed;
        break;
      default:
        break;
    }

    // firework size, min=30, max=100
    const fireworkSize = Math.floor(Math.random() * 70 + 30);

    const node = (
      <img
        className={css.firework}
        src={gifFile}
        alt="firework"
        style={{
          top: `${Math.floor(Math.random() * 90)}%`,
          right: `${Math.floor(Math.random() * 90)}%`,
          height: `${fireworkSize}px`,
          width: `${fireworkSize}px`,
        }}
      />
    );

    setFireworkNode(node);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const intId = setInterval(() => {
        const randomTime = Math.random() * 2000;
        setTimeout(() => {
          generateFireworkEffect();
        }, randomTime);
      }, 2000);

      setIntervalId(intId);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return fireworkNode;
};

export default React.memo(Firework);
