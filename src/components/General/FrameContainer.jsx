import React, {Component} from 'react';

import css from 'styles/general/frameContainer.less';
import {url as URL} from 'utils';

import LoadingBar from './LoadingBar';

class FrameContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  onLoad = () => {
    this.setState({
      isLoading: false,
    });
  };

  render() {
    const {url, className, params, title} = this.props;
    if (!url && !params) return null;

    const style = {border: 0};
    let href;

    if (params) {
      const {trimUrl} = params;
      if (trimUrl) {
        URL.trimUrlTo(`/${trimUrl}`);
      }

      href = params.url;
    } else if (url) href = url;

    return (
      <React.Fragment>
        <LoadingBar isLoading={this.state.isLoading} />
        <iframe
          style={style}
          title={title}
          src={href}
          className={className || css.frameContainer_Iframe}
          onLoad={this.onLoad}
        />
      </React.Fragment>
    );
  }
}

export default FrameContainer;
