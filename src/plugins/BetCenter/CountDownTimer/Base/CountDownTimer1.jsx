import React from 'react';
import PropTypes from 'prop-types';
import css from 'styles/betCenter/Base/CircularProgressBar1.less';
import classnames from 'classnames';
import icons from 'styles/iconfont.less';

function CountDownTimer({hours, minutes, seconds}) {
  return (
    <div className={css.countDownContainer}>
      <div className={hours.toString().length>2?css.threeDigitalNums:css.digitalNums}>
        <span
          className={classnames(
            css.digitalNum,
            icons[`digital_num_${`${hours}`[0]}`],
          )}
        />
        <span
          className={classnames(
            css.digitalNum,
            icons[`digital_num_${`${hours}`[1]}`],
          )}
        />
        <span
          className={classnames(
            css.digitalNum,
            icons[`digital_num_${`${hours}`[2]}`],
          )}
        />
      </div>
      <span className={css.comma}>:</span>
      <div className={css.digitalNums}>
        <span
          className={classnames(
            css.digitalNum,
            icons[`digital_num_${`${minutes}`[0]}`],
          )}
        />
        <span
          className={classnames(
            css.digitalNum,
            icons[`digital_num_${`${minutes}`[1]}`],
          )}
        />
      </div>
      <span className={css.comma}>:</span>
      <div className={css.digitalNums}>
        <span
          className={classnames(
            css.digitalNum,
            icons[`digital_num_${`${seconds}`[0]}`],
          )}
        />
        <span
          className={classnames(
            css.digitalNum,
            icons[`digital_num_${`${seconds}`[1]}`],
          )}
        />
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
