import React, {PureComponent} from 'react';
import {DatePicker} from 'antd';
import css from 'styles/User/Form/DateThread.less';

const {RangePicker} = DatePicker;

class DateThread extends PureComponent {
  renderOptionButtons = () => {
    const {currentDayCounts, timeframeRefs, onTimeframeChange} = this.props;

    return timeframeRefs.map(time => {
      const {value, displayText} = time;
      const btnProps = {
        className: css.option_buttons,
        key: time.value,
        onClick: onTimeframeChange,
        'data-daycounts': value,
        'data-active':
          currentDayCounts && currentDayCounts.toString() === value.toString(),
      };

      return (
        <button type="button" {...btnProps}>
          {displayText}
        </button>
      );
    });
  };

  render() {
    const {startTime, endTime, onDateChange} = this.props;
    const rangePickerProps = {
      style: {marginRight: '10px'},
      onChange: onDateChange,
      value: [startTime, endTime],
      className: css.datePicker,
    };

    return (
      <div className={css.filter_date}>
        <div className={css.filter_label}>日期</div>
        <RangePicker {...rangePickerProps} />
        {this.renderOptionButtons()}
      </div>
    );
  }
}

export default DateThread;
