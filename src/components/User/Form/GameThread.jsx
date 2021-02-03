import React, {PureComponent} from 'react';
import {connect} from 'dva';
import isPlatformExist from 'utils/isPlatformExist';
import {type, isGuestUser} from 'utils';
import {personalReportS, betRecordReportS} from 'services/gameReport/';
import css from 'styles/User/Form/GameThread.less';

const {
  gamePlatformType: {ALL, BET},
  PLATFORM_TYPE,
} = type;

class GameThread extends PureComponent {
  constructor(props) {
    super(props);
    this.isGuest = isGuestUser(props.userData);
  }

  renderOptionButtons = () => {
    const {
      profileSelectedNav,
      selectedGamePlatform,
      gamePlatformList,
      onGamePlatformSelect,
      hideShowAllCategory,
      showAllGames,
    } = this.props;

    const gamePlatformTab = [];

    if (
      isPlatformExist(gamePlatformList) &&
      !this.isGuest &&
      !hideShowAllCategory
    ) {
      gamePlatformTab.push(
        <button
          type="button"
          className={css.option_buttons}
          key="ALL"
          value="ALL"
          onClick={onGamePlatformSelect}
          data-active={selectedGamePlatform === ALL}>
          全部
        </button>,
      );
    }

    const platformList = Object.keys(gamePlatformList).map(
      e => gamePlatformList[e],
    );

    let reports = personalReportS;
    if (profileSelectedNav === 'orderRecord') {
      reports = betRecordReportS;
    }

    const displayPlatformList = platformList.filter(
      ({gamePlatformType}) => gamePlatformType !== PLATFORM_TYPE.HIDE,
    );

    displayPlatformList.map(
      ({gamePlatform, gameNameInChinese, gamePlatformType}) => {
        if (
          (showAllGames &&
            gamePlatform &&
            !((this.isGuest && gamePlatform !== BET) || gamePlatform === BET) &&
            gamePlatformType !== PLATFORM_TYPE.OWN) ||
          (!showAllGames &&
            !(this.isGuest && gamePlatform !== BET) &&
            reports[gamePlatform])
        ) {
          gamePlatformTab.push(
            <button
              type="button"
              className={css.option_buttons}
              key={gamePlatform}
              value={gamePlatform}
              onClick={onGamePlatformSelect}
              data-active={gamePlatform === selectedGamePlatform}>
              {gameNameInChinese}
            </button>,
          );
        }
        return true;
      },
    );

    return gamePlatformTab;
  };

  render() {
    return (
      <div className={css.filter_game}>
        <div className={css.filter_label}>游戏</div>
        <div className={css.filter_options}>{this.renderOptionButtons()}</div>
      </div>
    );
  }
}

function mapStatesToProps({playerModel, layoutModel, userModel}) {
  return {
    gamePlatformList: playerModel.gamePlatformList,
    profileSelectedNav: layoutModel.profileSelectedNav,
    userData: userModel.userData,
  };
}

export default connect(mapStatesToProps)(GameThread);
