import React, {PureComponent} from 'react';
import classnames from 'classnames';
import {Button,Row,Col} from 'antd';
import css from 'styles/general/DateTimeframeLinks.less';
import {type as TYPE, isContain} from 'utils';

const {DateTimeframeQuickRefs} = TYPE;

class DateTimeframeLinks extends PureComponent {
  render() {
    const {
      className,
      placeholder,
      onclick,
      excludeTimeframe,
      selectedvalue,
    } = this.props;
    const classes = classnames(
      css.dateTimeframeLinks_timeframeQuickLinkItem,
      className,
    );

    const quickLink = [];
    DateTimeframeQuickRefs.forEach((time,index) => {
      if (!isContain(time.value, excludeTimeframe)) {
        quickLink.push(
            <Button
              key={`datetime_${time.value}`}
              className={classes}
              value={time.value}
              onClick={onclick}
              data-active={selectedvalue === time.value}>
              {time.displayText}
            </Button>,
        );
      }
    });

    return (
      <Row className={css.dateTimeframeLinks_timeframeQuickLink}>
        {/* <Col className={css.dateTimeframeLinks_timeframeQuickLinkLabel} span={1}> */}
          {placeholder || '快捷选时'}{' '}:{'  '}
        {/* </Col> */}
        {quickLink}
      </Row>
    );
  }
}

export default DateTimeframeLinks;
