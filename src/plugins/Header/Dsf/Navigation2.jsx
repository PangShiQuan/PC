import React, {PureComponent} from 'react';
import {Link, routerRedux} from 'dva/router';
import {
  isMatch,
  map,
  split,
  indexOf,
  head,
  tail,
  some,
  isNil,
  isUndefined,
  filter,
  find,
} from 'lodash';
import {connect} from 'dva';
import resolve from 'clientResolver';
import ExternalPage from 'pages/External';
import css from 'styles/header/Dsf/navigation2.less';
import {
  isPlatformGameExist,
  type,
  url,
  getGameSetup,
  isDisabledGame,
  flattenPlatforms,
} from 'utils';
import {MDIcon} from 'components/General';
import fireIcon from 'assets/image/header2/ic-hot.svg';
import icnFree from 'assets/image/header2/icn_free.png';

const {PLATFORM, PLATFORM_TYPE} = type;
const REFERENCE_PROP = 'REFERENCE_PROP';
const NavigationHeader = resolve.client('components/Header/Navigation');

function findPath(path, pathname) {
  if (!pathname || !path) return false;
  const isActive =
    indexOf(tail(split(pathname, '/')), head(tail(split(path, '/')))) > -1;
  return isActive;
}

function preventDefault(event) {
  event.preventDefault();
}

class Navigation2 extends PureComponent {
  static pathIsActive(pathname, basePath) {
    return (
      basePath !== '/' &&
      (pathname === basePath || url.basePath(pathname) === basePath)
    );
  }

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  state = {
    subNavLists: [],
  };

  componentWillMount() {
    this.setupSubNav(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.navList.some(
        ({[REFERENCE_PROP]: propName = '_'}) =>
          Object.prototype.hasOwnProperty.call(this.props, propName) &&
          Object.prototype.hasOwnProperty.call(nextProps, propName) &&
          this.props[propName] !== nextProps[propName],
      )
    ) {
      this.setupSubNav(nextProps);
    }
  }

  getDefaultSubNav = ({submenu, disabled}) => {
    return map(submenu, ({navText, pathname}) => ({
      pathname,
      navText,
      disabled: !!disabled,
    }));
  };

  setupSubNav(props) {
    const {navList} = props;
    const subNavLists = {};

    navList.forEach(navItem => {
      const {navText, [REFERENCE_PROP]: propName} = navItem;
      const APINavs = flattenPlatforms(props[propName]);

      subNavLists[navText] = APINavs
        ? this.getAPISubNav(navItem, APINavs)
        : this.getDefaultSubNav(navItem);
    });
    this.setState({
      subNavLists,
    });
  }

  getAPISubNav = ({MATCH, pathname}, APINavs) => {
    const navs = APINavs.filter(nav => isMatch(nav, MATCH));

    return navs.map(nav => {
      const {
        gameNameInChinese,
        status,
        gamePlatform,
        gameStartUrl,
        gamePlatformType,
        itransEnabled,
      } = nav;

      const isIntegratee = gamePlatformType === PLATFORM_TYPE.OWN; // 自家平台对接

      return {
        pathname: isIntegratee
          ? `/ext/${gamePlatform}?startUrl=${encodeURIComponent(gameStartUrl)}`
          : `${pathname}/${gamePlatform}`,
        navText: gameNameInChinese,
        disabled: status !== 'ON',
        gameStartUrl,
        isIntegratee,
        itransEnabled,
      };
    });
  };

  betClick(category, gameUniqueId) {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {gameUniqueId},
    });
    this.dispatch(routerRedux.push(`/betcenter/${category}/${gameUniqueId}`));
  }

  renderListItems(list, classname, itemType) {
    const {allGamesPrizeSettings} = this.props;

    return list.map(listItem => {
      if (!listItem) return null;
      let {gameUniqueId, category} = listItem;
      if (!getGameSetup({gameUniqueId})) return null;

      const {gameNameInChinese} = listItem;
      const isDisabled = isDisabledGame(listItem, {allGamesPrizeSettings});
      let key = gameUniqueId;
      if (gameUniqueId === 'UNRECOGNIZED') {
        category = 'PCDANDAN';
        gameUniqueId = 'HF_LF28';
        key = 'PCDD';
      }

      if (itemType === 'HOT') {
        return (
          <li key={key} className={classname}>
            <button
              type="button"
              onClick={() => this.betClick(category, gameUniqueId)}
              disabled={isDisabled}
              className={css.sideNav_anchor}>
              <img src={fireIcon} className={css.fireicon} alt="fire icon" />
              <span className={css.sideNav_anchorSpan}>
                {gameNameInChinese}
              </span>
            </button>
          </li>
        );
      }

      return (
        <li key={key} className={classname}>
          <button
            type="button"
            onClick={() => this.betClick(category, gameUniqueId)}
            disabled={isDisabled}
            className={css.sideNav_anchor}>
            <span className={css.sideNav_anchorSpan}>{gameNameInChinese}</span>
          </button>
        </li>
      );
    });
  }

  renderSubNav(nav) {
    const {subNavLists} = this.state;
    const {pathname: thisPath, gameInfos, allGamesPrizeSettings} = this.props;
    const list = [];
    gameInfos.map(item => {
      list.push({...item, ...allGamesPrizeSettings[item.gameUniqueId]});
    });
    const lowList = filter(list, {frequency: 'LOW'});
    const highList = filter(list, {frequency: 'HIGH'});
    const hotList = filter(list, {recommendType: 'HOT'});
    const gameNameAlignCenter = isUndefined(
      find(subNavLists[nav.navText], navItem => navItem.itransEnabled === 'ON'),
    );
    const subNavs = map(subNavLists[nav.navText], navItem => {
      if (navItem.disabled) return null;
      const {navText, pathname, isIntegratee, itransEnabled} = navItem;
      const embed = pathname.includes('https://', 'http://');
      const props = {
        'data-active': Navigation2.pathIsActive(thisPath, pathname),
        className: css.subNavBtn,
      };
      if (embed || isIntegratee) {
        props.target = navText || '_blank';
      }
      let node;
      if (embed) {
        node = (
          <a href={pathname} rel="noopener noreferrer" {...props}>
            {navText}
          </a>
        );
      } else {
        node = (
          <Link to={pathname} {...props}>
            {navText}
          </Link>
        );
      }

      return (
        <li className={css.subNavItem} key={navText}>
          {node}
          {!gameNameAlignCenter ? (
            <img
              src={icnFree}
              alt="免转"
              className={css.subNavFree}
              style={itransEnabled !== 'ON' ? {visibility: 'hidden'} : null}
            />
          ) : null}
        </li>
      );
    });

    if (nav.navText === '彩票') {
      return (
        <div className={css.betContentBg}>
          <div className={css.betDecoy} />
          <div className={css.betNavigation}>
            <div className={css.betTitle} />
            <div className={css.betNavigationContent}>
              <div className={css.subbetNavigationContent}>
                <span className={css.betTitleContent}>热门</span>
                <div className={css.betContent}>
                  <ul className={css.sideNav_expandedList}>
                    {this.renderListItems(
                      hotList,
                      css.sideNav_expandedListItem,
                      'HOT',
                    )}
                  </ul>
                </div>
              </div>
              <div className={css.subbetNavigationContent}>
                <span className={css.betTitleContent}>高频率</span>
                <div className={css.betContent}>
                  <ul className={css.sideNav_expandedList}>
                    {this.renderListItems(
                      highList,
                      css.sideNav_expandedListItem,
                      'HIGH',
                    )}
                  </ul>
                </div>
              </div>
              <div className={css.subbetNavigationContent}>
                <span className={css.betTitleContent}>低频率</span>
                <div className={css.betContent}>
                  <ul className={css.sideNav_expandedList}>
                    {this.renderListItems(
                      lowList,
                      css.sideNav_expandedListItem,
                      'LOW',
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={css.subNavBg}>
        <div className={css.betDecoy} />
        <ul className={css.subNavList} key={nav.navText}>
          {subNavs}
        </ul>
      </div>
    );
  }

  renderNavList() {
    const {subNavLists} = this.state;
    const {navList, pathname: thisPath} = this.props;
    return map(navList, navItem => {
      const {
        navText,
        MATCH,
        pathname,
        disabled,
        [REFERENCE_PROP]: propName,
      } = navItem;
      const isDefaultNav = isNil(this.props[propName]);
      const subNavList = subNavLists[navText] || [];
      const available =
        !disabled &&
        (isDefaultNav || isPlatformGameExist(this.props, MATCH)) &&
        (!subNavList.length || some(subNavList, {disabled: false}));
      const active =
        available &&
        (findPath(pathname, thisPath) ||
          (thisPath !== '/' &&
            isDefaultNav &&
            subNavList.length &&
            !!subNavList.find(nav => thisPath.includes(nav.pathname))));
      const absence = !available || null;
      const onClick = absence ? preventDefault : null;

      return (
        <div
          className={css.listItem}
          key={navText}
          data-active={active}
          data-disabled={disabled}
          // style={{width: `${100 / navList.length}%`}}
        >
          <Link
            to={pathname}
            alt={navText}
            className={css.button}
            disabled={absence}
            onClick={onClick}>
            {navText}
          </Link>
          {this.renderSubNav(navItem)}
          {subNavList.length ? (
            <MDIcon className={css.downArrowIcon} iconName="chevron-down" />
          ) : null}
        </div>
      );
    });
  }

  render() {
    const {pathname} = this.props;
    return (
      <NavigationHeader
        className={css.navListRow}
        pathName={pathname}
        classNameList={css.list}
        functionList={this.renderNavList()}
      />
    );
  }
}

Navigation2.defaultProps = {
  navList: [
    {navText: '首页', pathname: '/'},
    {
      navText: '彩票',
      pathname: '/betcenter',
    },
    {
      navText: '棋牌游戏',
      pathname: '/cards',
      MATCH: {
        platform: PLATFORM.CARD,
      },
      [REFERENCE_PROP]: 'gamePlatforms',
    },
    {
      navText: '电子游戏',
      pathname: '/games',
      MATCH: {
        platform: PLATFORM.GAME,
      },
      [REFERENCE_PROP]: 'gamePlatforms',
    },
    {
      navText: '捕鱼游戏',
      pathname: '/fishing',
      MATCH: {
        platform: PLATFORM.FISH,
      },
      [REFERENCE_PROP]: 'gamePlatforms',
    },
    {
      navText: '真人视讯',
      pathname: '/realis',
      MATCH: {
        platform: PLATFORM.REALI,
      },
      [REFERENCE_PROP]: 'gamePlatforms',
    },
    {
      navText: '体育竞技',
      pathname: '/sports',
      MATCH: {
        platform: PLATFORM.SPORT,
      },
      [REFERENCE_PROP]: 'gamePlatforms',
    },
    {
      navText: '优惠中心',
      pathname: '/promotions',
      submenu: [
        {navText: '优惠活动', pathname: '/promotions'},
        {navText: '福利中心', pathname: '/welfarecenter'},
      ],
    },
  ],
};

function mapStatesToProps({routing, gameInfosModel}) {
  const {location} = routing;
  const {gameInfos, allGamesPrizeSettings} = gameInfosModel;
  return {
    pathname: location.pathname,
    gameInfos,
    allGamesPrizeSettings,
  };
}

const component = connect(mapStatesToProps)(Navigation2);

export default function() {
  return <ExternalPage component={component} />;
}
