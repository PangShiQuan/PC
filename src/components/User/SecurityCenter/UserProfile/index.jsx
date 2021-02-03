import React, {Component} from 'react';
import {connect} from 'dva';
import userCSS from 'styles/User/User.less';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import UserProfileBanner from 'components/User/SecurityCenter/UserProfile/UserProfileBanner';
import UserProfileInfo from 'components/User/SecurityCenter/UserProfile/UserProfileInfo';
import UserProfileHistory from 'components/User/SecurityCenter/UserProfile/UserProfileHistory';

class BasicInfo extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.dispatch({type: 'formModel/getBasicDetails'});
    this.fetchUpdates();
  }

  componentDidUpdate(prevProps) {
    const {accessToken: prevAccessToken} = prevProps;
    const {accessToken} = this.props;

    if (prevAccessToken && accessToken && prevAccessToken !== accessToken) {
      this.fetchUpdates(true);
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'nickname',
        'realName',
        'phoneNumber',
        'email',
        'responseMsg',
        'username',
        'prizeGroup',
        'memberType',
      ],
    });
  }

  fetchUpdates = (switchUser = false) => {
    const {myLoginHistory, userCheckedIn} = this.props;
    this.dispatch({type: 'userModel/getUserTotalRecoverBalance'});

    if (!myLoginHistory.length || switchUser)
      this.dispatch({type: 'userModel/getMyLoginHistory'});
    if (!userCheckedIn || switchUser)
      this.dispatch({type: 'userModel/getUserCheckIn'});
  };

  render() {
    return (
      <React.Fragment>
        <ResponseMessageBar />
        <UserProfileBanner />
        <div className={userCSS.content_body} style={{marginTop: 0}}>
          <UserProfileInfo />
          <UserProfileHistory />
        </div>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({userModel, formModel, layoutModel, gameInfosModel}) {
  const {
    accessToken,
    awaitingResponse,
    balance,
    myLoginHistory,
    userCheckedIn,
    userCheckedInCount,
    userData,
    currentLevel,
    openState,
  } = userModel;
  const {otherSettings} = gameInfosModel;
  return {
    accessToken,
    balance,
    userData,
    myLoginHistory,
    currentLevel,
    openState,
    awaitingResponse,
    userCheckedIn,
    userCheckedInCount,
    shouldShowProfileModal: layoutModel.shouldShowProfileModal,
    ...formModel,
    otherSettings,
  };
}

export default connect(mapStatesToProps)(BasicInfo);
