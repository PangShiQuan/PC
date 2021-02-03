import {connect} from 'dva';
import {Redirect} from 'dva/router';
import React, {PureComponent} from 'react';

import AuthChannel, {COMMAND} from 'messaging/handler/auth';

class Root extends PureComponent {
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.redirect &&
      this.props.accessToken &&
      !nextProps.accessToken
    ) {
      this.props.onRedirect();
    }
  }

  render() {
    return null;
  }
}

function mapStateToProps({userModel}) {
  return {accessToken: userModel.accessToken};
}

const AuthEntry = connect(mapStateToProps)(Root);

/* eslint-disable react/no-multi-comp */
function withUserCredential(WrappedComponent, redirect = false) {
  return class UserCredential extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        redirectToRoot: false,
      };
      this.dispatch = props.dispatch;
      this.handlerId = null;
    }

    componentWillMount() {
      this.handlerId = AuthChannel.add(this.handler);
    }

    componentWillUnmount() {
      AuthChannel.remove({id: this.handlerId});
    }

    onRedirect = () => {
      this.setState({redirectToRoot: true});
    };

    handler = ({data}) => {
      if (data.command === COMMAND.UNAUTH) {
        this.dispatch({
          type: 'userModel/unauthenticate',
          payload: {trigger: true},
        });
      } else if (data.pkg) {
        if (data.command === COMMAND.AUTH) {
          this.dispatch({
            type: 'userModel/clearUserData',
          });
          this.dispatch({
            type: 'userModel/authenticate',
            payload: {
              accessToken: data.pkg.accessToken,
              sessionId: data.pkg.sessionId,
              trigger: true,
            },
          });
        }
      }
    };

    render() {
      if (redirect && this.state.redirectToRoot)
        return <Redirect from={window.location.pathname} to="/" />;

      return (
        <React.Fragment>
          <AuthEntry redirect={redirect} onRedirect={this.onRedirect} />
          <WrappedComponent {...this.props} />
        </React.Fragment>
      );
    }
  };
}

export default withUserCredential;
