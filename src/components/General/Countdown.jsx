import React, {Component} from 'react';
import {number, func} from 'prop-types';

class Countdown extends Component {
  static propTypes = {
    interval: number,
    onComplete: func,
    onTick: func,
    parseTime: func,
    timeRemain: number.isRequired,
  };

  static defaultProps = {
    interval: 1000,
    onComplete: () => {},
    onTick: null,
    parseTime: null,
  };

  constructor(props) {
    super(props);
    this.passedInterval = 0;
    this.timeoutId = null;
    this.state = {
      prevTime: null,
      timeRemain: props.timeRemain - this.passedInterval,
    };
  }
  componentDidMount() {
    this.tick();
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.timeRemain !== nextProps.timeRemain - this.passedInterval) {
      this.passedInterval = 0;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.setState({
        prevTime: null,
        timeRemain: nextProps.timeRemain - this.passedInterval,
      });
    }
  }

  componentDidUpdate() {
    if (!this.state.prevTime && this.state.timeRemain > 0) {
      this.tick();
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }
  getFormattedTime(milliseconds) {
    const totalSeconds = Math.round(milliseconds / 1000);

    let seconds = parseInt(totalSeconds % 60);
    let minutes = parseInt(totalSeconds / 60) % 60;
    let hours = parseInt(totalSeconds / 3600);

    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    hours = hours < 10 ? `0${hours}` : hours;
    if (this.props.parseTime) {
      return this.props.parseTime({hours, minutes, seconds});
    }
    return `${hours}:${minutes}:${seconds}`;
  }
  tick = () => {
    const {interval} = this.props;
    const currentTime = Date.now();
    const diffTime = this.state.prevTime
      ? currentTime - this.state.prevTime
      : 0;
    this.passedInterval += diffTime;

    const timeRemainInInterval = interval - (diffTime % interval);
    let timeout = timeRemainInInterval;
    if (timeRemainInInterval < interval / 2) {
      timeout += interval;
    }

    const timeRemain = Math.max(this.state.timeRemain - diffTime, 0);
    const countdownComplete = this.state.prevTime && timeRemain <= 0;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = countdownComplete ? null : setTimeout(this.tick, timeout);
    this.setState({
      prevTime: currentTime,
      timeRemain,
    });

    if (countdownComplete) {
      if (this.props.onComplete) {
        this.props.onComplete();
      }
      return;
    }

    if (this.props.onTick) {
      this.props.onTick(timeRemain);
    }
  };
  render() {
    const {timeRemain} = this.state;

    return <span>{this.getFormattedTime(timeRemain)}</span>;
  }
}

export default Countdown;
