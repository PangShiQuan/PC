import React, {Component} from 'react';
import classnames from 'classnames';
import css from 'styles/general/loader.less';
import {newStyle} from 'utils';

class PlaceLoader extends Component {
  render() {
    const {
      loaderDuration,
      loaderOffset, // animation-delay
      loaderBuffer, // animation-bg
      height,
      width,
      style,
      className,
    } = this.props;

    const animationStyles = {
      backgroundSize: `${600 * loaderBuffer}% 100%`,
      animationDuration: `${loaderDuration}s`,
      animationDelay: `${loaderDuration * loaderOffset}s`,
    };
    const loaderClasses = classnames(css.placeloader, className);
    const loaderStyles = newStyle(
      {
        height,
        width,
      },
      animationStyles,
      style,
    );
    return <div style={loaderStyles} className={loaderClasses} />;
  }
}

PlaceLoader.defaultProps = {
  height: '100px',
  width: '100px',
  loaderDuration: 1.5,
  loaderOffset: 0,
  loaderBuffer: 1,
};

export default PlaceLoader;
