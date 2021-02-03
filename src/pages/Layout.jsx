import React, {PureComponent} from 'react';
import {connect} from 'dva';
import dynamic from 'dva/dynamic';
import {Route, Redirect, Switch} from 'dva/router';
import {PrivateRoute} from 'components/General/';
import resolve from 'clientResolver';
import {version, CUSTOM_LIVECHAT_SCRIPT, BAIDU_ANALYSIS_SCRIPT} from 'config';
import {filter, differenceWith, isEqual} from 'lodash';
import User from 'pages/UserIndex';
import MainLayout from './MainLayout';

const promotionComponent = resolve.plugin('Promotions');
const sportComponent = resolve.plugin('Sports');
const cardComponent = resolve.plugin('Cards');
const gameComponent = resolve.plugin('Game');
const fishingComponent = resolve.plugin('Fishing');

let isDsf, Promotions;
if (version === 'Dsf') {
  isDsf = true;
  Promotions = dynamic({component: () => promotionComponent});
}
if (version === 'Base') {
  isDsf = false;
  Promotions = dynamic({
    component: () => import('components/Promotions/Base/Promotions1'),
  });
}

const routes = [
  {
    exact: true,
    path: '/',
    component: dynamic({component: () => import('components/HomePage')}),
  },
  {
    path: '/fishing/:fishingId?',
    basePath: '/fishing',
    component: dynamic({component: () => fishingComponent}),
    authRequired: true,
    memberAccessOnly: true,
  },
  {
    path: '/games/:gameId?',
    basePath: '/games',
    component: dynamic({component: () => gameComponent}),
    authRequired: true,
    memberAccessOnly: true,
  },
  {
    path: '/sports/:sportId?',
    basePath: '/sports',
    component: dynamic({component: () => sportComponent}),
    authRequired: true,
    memberAccessOnly: true,
  },
  {
    path: '/realis/:realisId?',
    basePath: '/realis',
    component: dynamic({component: () => import('components/Realis/')}),
    authRequired: true,
    memberAccessOnly: true,
  },
  {
    path: '/cards/:cardId?',
    basePath: '/cards',
    component: dynamic({component: () => cardComponent}),
    authRequired: true,
    memberAccessOnly: true,
  },
  {
    path: '/trends',
    component: dynamic({component: () => import('components/Trends/Entrance')}),
  },
  {
    path: '/promotions',
    component: Promotions,
  },
  {
    path: '/welfarecenter/:type?',
    basePath: isDsf ? '/welfarecenter' : undefined,
    component: dynamic({component: () => import('components/WelfareCenter')}),
    authRequired: true,
    memberAccessOnly: true,
  },
  {
    path: '/result',
    component: dynamic({component: () => import('components/Results')}),
  },
  {
    path: '/helpcenter',
    component: dynamic({component: () => import('components/HelpCenter')}),
  },
  {
    path: '/instructions',
    component: dynamic({component: () => import('components/Instructions')}),
  },
  {
    path: '/noticelist',
    component: dynamic({
      component: () => import('components/HomePage/NoticeList'),
    }),
  },
  {
    path: '/noticedetail',
    component: dynamic({
      component: () => import('components/HomePage/NoticeDetail'),
    }),
  },
  {
    path: '/mobilesite',
    component: () => {
      const MobileSite = resolve.client('components/MobileSite');
      return MobileSite ? <MobileSite /> : <Redirect to="/" />;
    },
  },
  {
    path: '/user',
    component: User,
    authRequired: true,
  },
];

const filterBasePath = filter(routes, 'basePath');
const filterBasePathVersionRoutes = differenceWith(
  routes,
  filterBasePath,
  isEqual,
);
class Pages extends PureComponent {
  static isPublicRoute(pathname) {
    return (
      (isDsf ? routes : filterBasePathVersionRoutes).findIndex(
        ({authRequired, basePath, path}) =>
          pathname === '/' ||
          (path !== '/' &&
            !authRequired &&
            pathname.includes(basePath || path)),
      ) >= 0
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      prevPath: null, // 用于记录浏览历史中最后一个无需登录的路径
    };
  }

  componentDidMount() {
    const {id, username} = this.props;
    if (CUSTOM_LIVECHAT_SCRIPT) {
      CUSTOM_LIVECHAT_SCRIPT(id, username);
    } else if (BAIDU_ANALYSIS_SCRIPT) {
      BAIDU_ANALYSIS_SCRIPT();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {pathname},
      id,
      username,
    } = this.props;

    if (
      pathname !== nextProps.location.pathname &&
      Pages.isPublicRoute(pathname)
    ) {
      this.setState({prevPath: pathname});
    }

    const {id: nxId, username: nxUsername} = nextProps;
    if (CUSTOM_LIVECHAT_SCRIPT && (id !== nxId || username !== nxUsername)) {
      CUSTOM_LIVECHAT_SCRIPT(nxId, nxUsername);
    }
  }

  render() {
    const {prevPath} = this.state;
    const renderer = (isDsf ? routes : filterBasePathVersionRoutes).map(
      ({path, component, exact, authRequired, memberAccessOnly}) => {
        if (authRequired) {
          return (
            <PrivateRoute
              key={path}
              path={path}
              component={component}
              memberAccessOnly={memberAccessOnly}
              exact={exact}
              prevPath={prevPath}
            />
          );
        }
        return (
          <Route
            key={path}
            path={path}
            component={component}
            memberAccessOnly={memberAccessOnly}
            exact={exact}
            prevPath={prevPath}
          />
        );
      },
    );
    return (
      <MainLayout>
        <Switch>{renderer}</Switch>
      </MainLayout>
    );
  }
}

const mapStatesToProps = ({userModel}) => {
  const {id, username} = userModel;
  return {id, username};
};

export default connect(mapStatesToProps)(Pages);
