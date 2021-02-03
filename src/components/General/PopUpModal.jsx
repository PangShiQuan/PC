import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {isEmpty} from 'lodash';
import resolve from 'clientResolver';
import withUserCredential from 'components/Sync/UserCredential';
import PrivateRoute from 'components/General/PrivateRoute';
import profileCss from 'styles/User/Dsf/ProfileIndex1.less';
import css from 'styles/User/Dsf/Authentication1.less';

const Authentication = resolve.plugin('Authentication');

class PopUpModal extends Component {
  static bodyScrollHandler({shouldShowProfileModal, shouldShowAuthModel}) {
    const {body} = document;
    body.style.overflow =
      shouldShowProfileModal || shouldShowAuthModel ? 'hidden' : 'auto';
  }

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    PopUpModal.bodyScrollHandler(this.props);

    if (this.props.accessToken) this.initUser(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      accessToken,
      shouldShowAuthModel,
      shouldShowProfileModal,
    } = nextProps;
    const authenticating =
      this.props.accessToken &&
      accessToken &&
      this.props.accessToken !== accessToken;

    if (
      authenticating ||
      (this.props.shouldShowProfileModal !== shouldShowProfileModal &&
        shouldShowProfileModal &&
        accessToken)
    ) {
      this.initUser(nextProps, authenticating);
    }

    if (
      this.props.shouldShowProfileModal !== shouldShowProfileModal ||
      this.props.shouldShowAuthModel !== shouldShowAuthModel
    ) {
      PopUpModal.bodyScrollHandler(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    const {state = {}, userData} = this.props;

    let outputRedirection = {pathname: '/', state: {}};

    if (!prevProps.userData && userData && state.redirection) {
      if (PrivateRoute.isAuthorized(userData, state.memberAccessOnly)) {
        outputRedirection = state.redirection;
      }
      this.dispatch(routerRedux.replace(outputRedirection));
    }
  }

  initUser(props, switchUser = false) {
    if (props.sessionId && (switchUser || isEmpty(props.userData)))
      this.dispatch({type: 'userModel/getCurrentUser'});
    if (!props.topupGroups || switchUser)
      this.dispatch({type: 'transferModel/getTopupGroups'});
  }

  render() {
    const {shouldShowAuthModel} = this.props;

    if (shouldShowAuthModel) {
      return (
        <React.Fragment>
          <div className={profileCss.profileModal_overlay} />
          <div className={css.auth_modal}>
            <Authentication />
          </div>
        </React.Fragment>
      );
    }
    return null;
  }
}

function mapStateToProps({layoutModel, userModel, routing}) {
  const {accessToken, sessionId, userData} = userModel;
  const {shouldShowAuthModel, shouldShowProfileModal} = layoutModel;
  const {
    location: {state},
  } = routing;

  return {
    accessToken,
    sessionId,
    userData,
    state,
    shouldShowAuthModel,
    shouldShowProfileModal,
  };
}

export default connect(mapStateToProps)(withUserCredential(PopUpModal));
