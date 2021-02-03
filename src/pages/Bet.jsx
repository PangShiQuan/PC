import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {type as TYPE} from '../utils';

/* eslint-disable eqeqeq */
// visitorPrizeGroup value is string number and user prizeGroup is number

class BetPage extends PureComponent {
  componentDidMount() {
    const prevPrizeGroup = sessionStorage.getItem('prizeGroup');
    if (prevPrizeGroup) {
      this.updatePrizeSetting(prevPrizeGroup);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.visitorPrizeGroup !== nextProps.visitorPrizeGroup ) {
      this.updatePrizeSetting(nextProps.visitorPrizeGroup);
    }
  }

  // 请求采种接口
  updatePrizeSetting(prizeGroup) {
    this.props.dispatch({
      type: 'gameInfosModel/getAllGamesSetting',
      prizeGroup: Number(prizeGroup),
    });
  }
  render() {
    const {component: Component, componentProps: props = {}} = this.props;

    return <Component {...props} />;
  }
}

function mapStateToProps({gameInfosModel, userModel,appModel}) {
  const {
    allGamesPrizeSettings,
    prizeGroup,
    otherSettings: {visitorPrizeGroup = null} = {},
  } = gameInfosModel;
  const {userData} = userModel;
  const {
    adminBrand: {adminId},
  } = appModel;
  return {
    adminId,
    allGamesPrizeSettings,
    prizeGroup,
    userPrizeGroup: userData && userData.prizeGroup,
    visitorPrizeGroup,
  };
}

export default connect(mapStateToProps)(BetPage);
