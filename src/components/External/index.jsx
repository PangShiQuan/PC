import React, {Component} from 'react';
import {connect} from 'dva';

import withUserCredential from 'components/Sync/UserCredential';
import css from 'styles/external/index.less';

class ExternalPortal extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    document.title = this.props.match.params.platform;
    this.decodeStartGameUrl(this.props);
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'playerModel/initializeState',
      payload: ['extURL'],
    });
  }

  decodeStartGameUrl({location, match: {params}}) {
    this.dispatch({
      type: 'playerModel/startExternalUrl',
      payload: {locationSearch: location.search, platformCode: params.platform},
    });
  }

  render() {
    const {
      extURL,
      match: {params},
    } = this.props;

    return (
      <iframe
        src={extURL}
        title={params.platform}
        className={css.container}
        height="100%"
        width="100%"
      />
    );
  }
}

function mapStateToprops({playerModel}) {
  return {
    extURL: playerModel.extURL,
  };
}

export default connect(mapStateToprops)(
  withUserCredential(ExternalPortal, true),
);
