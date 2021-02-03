import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';

import ExternalPage from 'pages/External';
import resolve from 'clientResolver';
import {HOMEPAGE_CONFIG} from 'config';

const Home = resolve.plugin('HomePage');

class HomePageContent extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  onClickGames = ({dispatchItem, pathname}) => {
    if (dispatchItem) this.dispatch(dispatchItem);
    else if (pathname) this.dispatch(routerRedux.push(pathname));
  };

  onClickManagement = ({
    userData,
    fallbackDispatch,
    dispatchItem,
    pathname,
    url,
  }) => {
    if (!userData && fallbackDispatch) {
      this.dispatch(fallbackDispatch);
    } else if (dispatchItem) this.dispatch(dispatchItem);
    else if (url) window.open(url);
    else if (pathname) this.dispatch(routerRedux.push(pathname));
  };

  render() {
    const homeProps = {
      onClickManagement: this.onClickManagement,
      onClickGames: this.onClickGames,
      userData: this.props.userData,
      festivalTheme: this.props.festivalTheme,
      ...this.props,
    };
    return <Home {...homeProps} />;
  }
}

HomePageContent.defaultProps = HOMEPAGE_CONFIG;

function mapStatesToProps({userModel, layoutModel}) {
  return {
    userData: userModel.userData,
    festivalTheme: layoutModel.festivalTheme,
  };
}

const component = connect(mapStatesToProps)(HomePageContent);

export default function() {
  return <ExternalPage component={component} />;
}
