import React, {PureComponent} from 'react';
import {connect} from 'dva';

class Root extends PureComponent {
  componentWillMount() {
    this.props.dispatch({type: 'userModel/getUserAccess'});
  }
  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

export default connect()(Root);
