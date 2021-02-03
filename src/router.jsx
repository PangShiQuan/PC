import React from 'react';
import {Route, Switch, routerRedux} from 'dva/router';
import dynamic from 'dva/dynamic';
import {LocaleProvider} from 'antd';
import zh from 'antd/lib/locale-provider/zh_CN';
import LoginPopUp from 'components/General/PopUpModal';
import resolve from 'clientResolver';
import Favicon from 'react-favicon';
import {version} from 'config';

import Root from 'pages';
import {ErrorBoundary, PageLoading, PrivateRoute} from 'components/General';
import Chatbox from 'components/Chatbox';

const fav = resolve.client('favicon.ico');
const {ConnectedRouter} = routerRedux;
let BetCenter;
dynamic.setDefaultLoadingComponent(() => <PageLoading isLoading />);

const LayoutPages = dynamic({
  component: () => import('pages/Layout'),
});
const Container = dynamic({
  component: () => import('components/External/Container'),
});
if (version === 'Dsf') {
  BetCenter = dynamic({
    component: () => import('pages/BetIndex'),
  });
}
if (version === 'Base') {
  BetCenter = dynamic({
    component: () => import('components/BetCenter/Base/BetCenter1'),
  });
}
const TrendChart = dynamic({
  component: () => import('components/Trends'),
});
const Integratee = dynamic({
  component: () => import('components/External'),
});

function RouterConfig({history, app}) {
  return (
    <LocaleProvider locale={zh}>
      <ErrorBoundary>
        <Favicon url={fav} />
        <Chatbox />
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/trends/:gameUniqueId" component={TrendChart} />
            <PrivateRoute
              path="/ext/:platform?"
              component={Integratee}
              standalone
              memberAccessOnly
            />
            <Root>
              <Switch>
                <Route path="/f" component={Container} />
                <Route path="/betcenter" component={BetCenter} />
                <Route path="/" component={LayoutPages} />
              </Switch>
            </Root>
          </Switch>
        </ConnectedRouter>
        <LoginPopUp />
      </ErrorBoundary>
    </LocaleProvider>
  );
}
export default RouterConfig;
