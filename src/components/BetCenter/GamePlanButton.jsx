import React, {Component} from 'react';
import {betPlan, getGameSetup, betPlanDuration} from 'utils';

class GamePlanButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.dispatch = props.dispatch;
  }

  initPlan = () => {
    const {
      onClick,
      betEntries,
      thisGameId,
      betPlanData,
      tabPlanValue,
      methodGroup,
    } = this.props;
    let isBetEntriesPlanExist = true;
    if (tabPlanValue === 'profit') {
      isBetEntriesPlanExist = betPlan.getBetPlan(
        betEntries,
        getGameSetup({gameUniqueId: thisGameId}).issueDuration,
        betPlanData,
        tabPlanValue,
        methodGroup,
      );
    }

    const payload = {
      betPlan: isBetEntriesPlanExist,
    };

    this.dispatch({
      type: 'betCenter/updateState',
      payload,
    });
    if (typeof onClick === 'function') onClick();
  };

  render() {
    const {
      className,
      disabled,
      thisGameId,
      otherSettings: {chaseNumberOn},
    } = this.props;
    const isbetPlanDuration = thisGameId
      ? betPlanDuration(getGameSetup({gameUniqueId: thisGameId}).issueDuration)
      : null;
    return isbetPlanDuration && chaseNumberOn ? (
      <button
        type="button"
        disabled={disabled}
        className={className}
        onClick={this.initPlan}>
        追号投注
      </button>
    ) : null;
  }
}

export default GamePlanButton;
