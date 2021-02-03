import React from 'react';
import PropTypes from 'prop-types';
import css from 'styles/betCenter/Dsf/CircularProgressBar1.less';
import resolve from 'clientResolver';

const CircularProgressBar = resolve.plugin('CircularProgressbar');

function CountDownTimer({hours, minutes, seconds}) {
  return (
    <div className={css.countDownContainer}>
      <div className={css.circle}>
        <CircularProgressBar
          percentage={hours / 24 * 100}
          textForPercentage={() => `${hours}`}
        />
        <span className={css.CircularProgressbarText}>{hours}</span>
      </div>
      <span className={css.comma}>:</span>
      <div className={css.circle}>
        <CircularProgressBar
          percentage={minutes / 60 * 100}
          textForPercentage={() => `${minutes}`}
        />
        <span className={css.CircularProgressbarText}>{minutes}</span>
      </div>
      <span className={css.comma}>:</span>
      <div className={css.circle}>
        <CircularProgressBar percentage={seconds / 60 * 100} />
        <span className={css.CircularProgressbarText}>{seconds}</span>
      </div>
    </div>
  );
}

CountDownTimer.propTypes = {
  hours: PropTypes.number.isRequired,
  minutes: PropTypes.number.isRequired,
  seconds: PropTypes.number.isRequired,
};

export default CountDownTimer;
