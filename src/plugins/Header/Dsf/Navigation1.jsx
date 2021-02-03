import React, {PureComponent} from 'react';
import {Link} from 'dva/router';
import {isMatch, map, split, indexOf, head, tail, some, isNil} from 'lodash';
import {connect} from 'dva';
import resolve from 'clientResolver';
import ExternalPage from 'pages/External';
import css from 'styles/header/Dsf/navigation1.less';
import {isPlatformGameExist, type, url} from 'utils';

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

  getDefaultSubNav = ({submenu, disabled}) =>
    map(submenu, ({navText, pathname}) => ({
      pathname,
      navText,
      disabled: !!disabled,
    }));

  setupSubNav(props) {
    const {navList} = props;
    const subNavLists = {};

    navList.forEach(navItem => {
      const {navText, [REFERENCE_PROP]: propName} = navItem;
      const APINavs = props[propName];

      subNavLists[navText] = APINavs
        ? Navigation2.getAPISubNav(navItem, APINavs)
        : this.getDefaultSubNav(navItem);
    });
    this.setState({
      subNavLists,
    });
  }

  static getAPISubNav({MATCH, pathname}, APINavs) {
    const navs = APINavs.filter(nav => isMatch(nav, MATCH));

    return navs.map(nav => {
      const {
        gameNameInChinese,
        status,
        gamePlatform,
        gameStartUrl,
        gamePlatformType,
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
      };
    });
  }

  renderSubNav(nav) {
    const {subNavLists} = this.state;
    const {pathname: thisPath} = this.props;
    const subNavs = map(subNavLists[nav.navText], navItem => {
      if (navItem.disabled) return null;

      const {navText, pathname, isIntegratee} = navItem;
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
        </li>
      );
    });

    return (
      <ul className={css.subNavList} key={nav.navText}>
        {subNavs}
      </ul>
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
          style={{width: `${100 / navList.length}%`}}>
          <Link
            to={pathname}
            alt={navText}
            className={css.button}
            disabled={absence}
            onClick={onClick}>
            {navText}
          </Link>
          {this.renderSubNav(navItem)}
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
      navText: '优惠活动',
      pathname: '/promotions',
      submenu: [
        {navText: '优惠活动', pathname: '/promotions'},
        {navText: '福利中心', pathname: '/welfarecenter'},
      ],
    },
  ],
};

function mapStatesToProps({routing}) {
  const {location} = routing;
  return {
    pathname: location.pathname,
  };
}

const component = connect(mapStatesToProps)(Navigation2);

export default function() {
  return <ExternalPage component={component} />;
}
