import React, {Component} from 'react';
import {Link} from 'dva/router';
import {connect} from 'dva';
import {PageContainer} from 'components/General';
import * as webInfo from 'utils/webInfo.config';
import css from 'styles/header/Base/navigation1.less';
import classnames from 'classnames';

const navList = [
  {navText: '首页', pathname: '/'},
  {navText: '购彩大厅', pathname: '/betcenter'},
  {navText: '手机购彩', pathname: '/mobilesite'},
  {
    navText: '优惠中心',
    pathname: '/promotions',
    submenu: [
      {navText: '优惠活动', pathname: '/promotions'},
      {navText: '福利中心', pathname: '/welfarecenter'},
    ],
  },
  {navText: '开奖公告', pathname: '/result'},
  {navText: '走势图表', pathname: '/trends'},
];

class Navigation1 extends Component {
  toggleSideNav = () => {
    const {dispatch, shouldShowSideNav} = this.props;
    dispatch({
      type: 'layoutModel/setSideNavVisibility',
      payload: !shouldShowSideNav,
    });
  };

  render() {
    const {shouldShowSideNav, sideNavIsLocked, pathname} = this.props;
    const sideNavParentClass = shouldShowSideNav
      ? css.navigation_sideNavParent__showSideNav
      : css.navigation_sideNavParent;
    return (
      <div className={css.navigation}>
        <PageContainer className={css.navigation_body}>
          {pathname === '/' ? (
            <div className={sideNavParentClass}>
              <button
                type="button"
                className={css.navigation_sideNavToggleBtn}
                disabled={sideNavIsLocked}
                onClick={this.toggleSideNav}>
                选择彩种
              </button>
            </div>
          ) : null}
          <div className={css.navigation_list}>
            {navList.map(navItem => {
              const {navText} = navItem;
              if (navItem.pathname.indexOf('www') > -1) {
                return (
                  <div className={css.navigation_listItem} key={navText}>
                    <a href={navItem.pathname} target="_blank">
                      <button
                        type="button"
                        className={css.navigation_button}
                        data-active={
                          pathname.slice(0, 7) === navItem.pathname.slice(0, 7)
                        }>
                        {navText}
                      </button>
                    </a>
                  </div>
                );
              }

              return (
                <div
                  className={css.navigation_listItem}
                  data-submenu={!!navItem.submenu}
                  key={navText}>
                  <Link to={navItem.pathname}>
                    <button
                      type="button"
                      data-active={
                        navItem.submenu
                          ? navItem.submenu.some(
                              sub =>
                                sub.pathname.slice(0, 7) ===
                                pathname.slice(0, 7),
                            )
                          : pathname.slice(0, 7) ===
                            navItem.pathname.slice(0, 7)
                      }
                      className={css.navigation_button}>
                      {navText}
                    </button>
                  </Link>

                  {navItem.submenu && (
                    <div className={css.navigation_submenu}>
                      {navItem.submenu.map(submenu => {
                        return (
                          <Link to={submenu.pathname} key={submenu.navText}>
                            <button
                              type="button"
                              className={classnames(
                                css.navigation_button,
                                css.navigation_submenu_button,
                              )}>
                              {submenu.navText}
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PageContainer>
      </div>
    );
  }
}

function mapStatesToProps({layoutModel, routing}) {
  const {
    location: {pathname},
  } = routing;
  const {activeTab, shouldShowSideNav, sideNavIsLocked} = layoutModel;
  return {activeTab, shouldShowSideNav, sideNavIsLocked, pathname};
}

export default connect(mapStatesToProps)(Navigation1);
