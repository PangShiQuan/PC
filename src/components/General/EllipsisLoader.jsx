import React, {Component} from 'react';
import _ from 'lodash';
import css from 'styles/general/loader.less';

class EllipsisLoader extends Component {
  constructor() {
    super();
    this.state = {
      dotCount: 0,
      intervalId: '',
    };
    this.interval = '';
    this.dotting = this.dotting.bind(this);
  }
  componentDidMount() {
    this.dotting();
  }
  componentWillUnmount() {
    clearTimeout(this.interval);
  }
  dotting() {
    const {dotCount} = this.state;
    if (dotCount >= 6) {
      this.setState({
        dotCount: 0,
      });
    } else {
      this.setState({
        dotCount: dotCount + 1,
      });
    }
    this.interval = setTimeout(this.dotting, 1000);
  }
  render() {
    const {dotCount} = this.state;

    return (
      <span>
        {_.map([0, 1, 2, 3, 4, 5, 6], count => {
          const className =
            count <= dotCount ? css.ellipsisLoader__active : css.ellipsisLoader;
          return <span key={count} className={className} />;
        })}
      </span>
    );
  }
}

export default EllipsisLoader;
