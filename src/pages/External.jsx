import {connect} from 'dva';
import {isEqual} from 'lodash';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import isPlatformExist from 'utils/isPlatformExist';

class External extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      gamePlatforms: Object.values(props.gamePlatformList),
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    if (!isPlatformExist(this.props.gamePlatformList)) {
      this.dispatch({type: 'playerModel/getGamePlatforms'});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.gamePlatformList, nextProps.gamePlatformList))
      this.setState({
        gamePlatforms: Object.values(nextProps.gamePlatformList),
      });
  }

  refresh = runAfter => {
    // this.dispatch({
    //   runAfter,
    //   type: 'playerModel/getCMSGamePlatforms',
    // });
  };

  render() {
    const {component: Component, componentProps: props = {}} = this.props;
    const {gamePlatforms} = this.state;

    return (
      <Component
        gamePlatforms={gamePlatforms}
        dispatchUpdate={this.refresh}
        {...props}
      />
    );
  }
}

External.propTypes = {
  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    .isRequired,
};

function mapStatesToProps({playerModel}) {
  return {
    gamePlatformList: playerModel.gamePlatformList,
  };
}

export default connect(mapStatesToProps)(External);
