import React, {Component} from 'react';
import {map} from 'lodash';
import css from 'styles/User/ProfileSidenav.less';
import {type as TYPE, isGuestUser} from 'utils';

const {userProfileNavsFirst} = TYPE;
const {
  tradingCenter,
  securityCenter,
  messageCenter,
  agentCenter,
} = userProfileNavsFirst;

class SideNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGuest: isGuestUser(props.userData),
    };
    this.bsOptions = {
      bounce: true,
      momentum: true,
      preventDefault: true,
    };
    this.dispatch = props.dispatch;
  }

  componentDidUpdate(prevProps) {
    const {userData: prevUserData} = prevProps;
    const {userData} = this.props;
    if (prevUserData.username !== userData.username)
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isGuest: isGuestUser(userData),
      });
  }

  renderNavs(navs) {
    const {profileSelectedNav, topupGroups, onNavSelect} = this.props;
    const {isGuest} = this.state;

    return map(navs, nav => {
      if (isGuest && nav.notForGuest) return null;
      let {disabled} = nav;
      if (nav.navKey === 'topupCtrl' && !topupGroups) {
        disabled = true;
      }

      return (
        <div key={nav.navKey} className={css.profile_sideNavGroup}>
          <button
            type="button"
            className={css.profile_sideNavBtn}
            onClick={() => onNavSelect(nav.navKey)}
            data-active={profileSelectedNav === nav.navKey}
            disabled={disabled}>
            <span className={css.profile_sideNavBtnText}>
              {nav.displayName}
            </span>
          </button>
        </div>
      );
    });
  }

  render() {
    const {userData} = this.props;
    const tradingCenterFiltered = tradingCenter.filter(e => !e.isDsf);
    const agentCenterFiltered = agentCenter.filter(e => !e.isDsf);
    const {role} = userData;
    const isAgent = role && role.indexOf('AGENT') > -1;
    return (
      <div
        className={css.profile_sideNav}
        ref={el => {
          this.sideNav = el;
        }}>
        <div>
          <div className={css.profile_primaryList}>
            <div className={css.profile_sideNavGroup}>
              <div className={css.profile_sideNavLabel}>交易中心</div>
              <div className={css.profile_sideNavItemGroup}>
                {this.renderNavs(tradingCenterFiltered)}
              </div>
            </div>
            <div className={css.profile_sideNavGroup}>
              <div className={css.profile_sideNavLabel}>安全中心</div>
              <div className={css.profile_sideNavItemGroup}>
                {this.renderNavs(securityCenter)}
              </div>
            </div>
            <div className={css.profile_sideNavGroup}>
              <div className={css.profile_sideNavLabel}>消息中心</div>
              <div className={css.profile_sideNavItemGroup}>
                {this.renderNavs(messageCenter)}
              </div>
            </div>
            {isAgent ? (
              <div className={css.profile_sideNavGroup}>
                <div className={css.profile_sideNavLabel}>代理中心</div>
                <div className={css.profile_sideNavItemGroup}>
                  {this.renderNavs(agentCenterFiltered)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default SideNav;
