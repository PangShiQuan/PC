import React, {PureComponent} from 'react';
import {connect} from 'dva';
import dynamic from 'dva/dynamic';
import {Route, Switch, routerRedux} from 'dva/router';
import isPlatformExist from 'utils/isPlatformExist';
import Bet from 'pages/Bet';
import Logo from 'components/Header/ClientLogo';
import {MDIcon, CoreButton} from 'components/General';
import css from 'styles/betCenter/Dsf/BetCenterIndex1.less';
import resolve from 'clientResolver';
import User from './UserIndex';

const Login = resolve.plugin('Login');
const SideNavBetcenter = resolve.plugin('SideNavBetcenter');
const HeaderNavBetcenter = resolve.plugin('HeaderNavBetcenter');

const BetCenterInd = dynamic({
  component: () => import('components/BetCenter/Dsf/BetCenter1'),
});
const BetEntrance = dynamic({
  component: () => import('components/BetCenter/Entrance'),
});

class BetIndex extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sideNavCollapsed: false,
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    if (!this.props.gameInfos.length) {
      this.dispatch({
        type: 'gameInfosModel/getContents',
      });
    } else {
      this.dispatch({type: 'gameInfosModel/getCurrentResults'});
    }

    if (!isPlatformExist(this.props.gamePlatformList)) {
      this.dispatch({
        type: 'playerModel/getGamePlatforms',
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {pcOtherInfo, gameInfos, currentResults} = this.props;
    if (
      pcOtherInfo !== nextProps.pcOtherInfo &&
      nextProps.pcOtherInfo.siteName
    ) {
      document.title = nextProps.pcOtherInfo.siteName;
    }
    if (
      gameInfos.length !== nextProps.gameInfos.length &&
      nextProps.gameInfos.length &&
      !currentResults
    ) {
      this.dispatch({type: 'gameInfosModel/getCurrentResults'});
    }
  }

  backtoHome() {
    this.dispatch(routerRedux.push(''));
  }

  toggleCollapsed = () =>
    this.setState(prevState => ({
      sideNavCollapsed: !prevState.sideNavCollapsed,
    }));

  render() {
    const {
      allGamesPrizeSettings,
      betEntries,
      dispatch,
      expandedCategory,
      gameInfos,
      location,
      thisGameId,
      pcOtherInfo: {siteName, onlineServiceUrl},
    } = this.props;
    const {pathname} = location;
    const {sideNavCollapsed} = this.state;

    const sideNavProps = {
      allGamesPrizeSettings,
      betEntries,
      className: css.betCenter_sidenavBody,
      dispatch,
      expandedCategory,
      gameInfos,
      pathname,
      thisGameId,
      sideNavCollapsed,
    };

    const headerNavProps = {
      dispatch,
      thisGameId,
      onlineServiceUrl,
    };
    return (
      <div className={css.betCenterIndex} data-collapsed={sideNavCollapsed}>
        <div className={css.betCenter_header}>
          <div className={css.betCenter_logoCol}>
            <Logo
              useSmall={sideNavCollapsed}
              siteName={siteName}
              className={css.betCenter_logoImg}
              pathname={pathname}
            />
          </div>
          <button
            type="button"
            className={css.betCenter_collapseIcon}
            onClick={this.toggleCollapsed}>
            <MDIcon
              iconName={`arrow-${
                sideNavCollapsed ? 'expand' : 'collapse'
              }-left`}
            />
          </button>
          {/* <div className={css.betCenter_backHomeCol}>
            <CoreButton
              onClick={() => this.backtoHome()}
              placeholder="返回首页"
              className={css.backhome_button}
              type="submit"
            />
          </div> */}
          <div className={css.betCenter_navCol}>
            <HeaderNavBetcenter {...headerNavProps} />
          </div>
          <div className={css.betCenter_listCol}>
            <Login />
          </div>
        </div>
        <div className={css.betCenter_body}>
          <SideNavBetcenter {...sideNavProps} />
          {/* {this.props.children} */}
          <Switch>
            <Route exact path="/betcenter" component={BetEntrance} />
            <Route
              exact
              path="/betcenter/:betCategory/:betId"
              component={BetCenterInd}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

function mapStateToProps({
  gameInfosModel,
  betCenter,
  routing,
  loading,
  layoutModel,
  playerModel,
}) {
  return {
    allGamesPrizeSettings: gameInfosModel.allGamesPrizeSettings,
    gameInfos: gameInfosModel.gameInfos,
    currentResults: gameInfosModel.currentResults,
    pcOtherInfo: gameInfosModel.pcOtherInfo,
    location: routing.location,
    betEntries: betCenter.betEntries,
    thisGameId: betCenter.thisGameId,
    expandedCategory: betCenter.expandedCategory,
    isGlobalLoading: loading.global,
    shouldShowProfileModal: layoutModel.shouldShowProfileModal,
    gamePlatformList: playerModel.gamePlatformList,
  };
}

const component = connect(mapStateToProps)(BetIndex);

export default function BetPage(props) {
  return <Bet component={component} componentProps={props} />;
}
