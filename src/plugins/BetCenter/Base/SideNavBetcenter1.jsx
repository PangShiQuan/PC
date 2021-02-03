import React, { Component } from 'react';
import { Modal } from 'antd';
import { find, isEqual, map, forEach, filter, reject, isEmpty } from 'lodash';
import { MDIcon } from 'components/General';
import { isDisabledGame, getGameSetup, type as TYPE } from 'utils';
import css from 'styles/betCenter/Base/SideNav1.less';
import SVG from 'react-inlinesvg';
import maintainanceIcon from 'assets/image/allIcon/maintainanceIcon.svg';

class SideNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LOTTERY_CATEGORY: '',
    };
    this.switchGameConfirm = Modal.confirm.bind(this);
    this.getGameCategory = this.getGameCategory.bind(this);
    this.switchGameHandler = this.switchGameHandler.bind(this);
    this.dispatch = props.dispatch;
    this.onInitializeClick = props.onInitializeClick;
  }
  componentWillMount() {
    this.getDefaultGame(this.props);
    this.getGameCategory(this.props);
    const thisGameId = map(this.props.gameInfos, item=> {
      return item.gameUniqueId;
    })
    this.dispatch({
      type: 'gameInfosModel/getSingleCollections',
      thisGameId,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.gameInfos, nextProps.gameInfos)) {
      this.getGameCategory(nextProps);
    }
    if (
      (this.props.gameInfos !== nextProps.gameInfos ||
      this.props.allGamesPrizeSettings !== nextProps.allGamesPrizeSettings) &&
      !isEmpty(nextProps.allGamesPrizeSettings)
    ) {
      this.getDefaultGame(nextProps);
    }
  }
  onGameSelect = ({ currentTarget }) => {
    const thisGameId = currentTarget.value;
    const { betEntries } = this.props;
    const switchGameHandler = this.switchGameHandler.bind(this);
    if (betEntries && betEntries.length > 0) {
      this.switchGameConfirm({
        title: '切换彩种会清除已选注单，是否确定切换？',
        onOk() {
          switchGameHandler(thisGameId);
        },
      });
    } else {
      this.switchGameHandler(thisGameId);
    }
  };
  getDefaultGame({ allGamesPrizeSettings, thisGameId, gameInfos }) {
    const defaultGame = find(gameInfos, { gameUniqueId: thisGameId });
    const defaultGameInactive =
      !defaultGame || isDisabledGame(defaultGame, { allGamesPrizeSettings });
    if (defaultGameInactive) {
      const nextNormalGame = find(
        gameInfos,
        game =>
          !['UNRECOGNIZED', thisGameId].includes(game.gameUniqueId) &&
          !isDisabledGame(game, { allGamesPrizeSettings }),
      );
      if (nextNormalGame && nextNormalGame.gameUniqueId) {
        this.dispatch({
          type: 'betCenter/updateState',
          payload: { expandedCategory: nextNormalGame.category },
        });
        this.switchGameHandler(nextNormalGame.gameUniqueId);
      }
    }
  }
  getGameCategory({ gameInfos }) {
    const NEW_CATEGORY = {};
    forEach(gameInfos, gameInfo => {
      const { category } = gameInfo;
      NEW_CATEGORY[category] = NEW_CATEGORY[category] || [];
      NEW_CATEGORY[category].push(gameInfo);
    });
    this.setState({ LOTTERY_CATEGORY: NEW_CATEGORY });
  }
  switchGameHandler(thisGameId) {
    this.dispatch({
      type: 'gameInfosModel/getSingleCollections',
      thisGameId,
    });
    this.dispatch({ type: 'betCenter/initializeAll' });
    this.dispatch({
      type: 'gameInfosModel/initializeState',
      payload: ['thisGameResults'],
    });
    this.dispatch({
      type: 'betCenter/updateState',
      payload: { thisGameId },
    });
    this.dispatch({ type: 'gameInfosModel/getThisGameResults' });
  }
  expandToggle = ({ currentTarget }) => {
    const expandedCategory = currentTarget.value;
    if (this.props.expandedCategory === expandedCategory) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: { expandedCategory: '' },
      });
    } else {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: { expandedCategory },
      });
    }
  };
  renderSubMenuItems(type, list) {
    const { allGamesPrizeSettings, thisGameId } = this.props;
    if (list.length) {
      return map(list, game => {
        let { gameUniqueId } = game;
        const { gameIconUrl, gameNameInChinese, gameIconGrayUrl } = game;
        let btnActive = gameUniqueId === thisGameId;
        const isPCDD = gameUniqueId === 'UNRECOGNIZED';
        let key = `${type}__${gameUniqueId}`;
        if (isPCDD) {
          gameUniqueId = 'HF_LF28';
          btnActive = thisGameId === 'HF_LF28' || thisGameId === 'HF_BJ28';
          key = `${type}__PCDD`;
        }
        if (!getGameSetup({ gameUniqueId })) return null;

        const isDisabled = isDisabledGame(game, { allGamesPrizeSettings });

        return (
          <button
            onClick={this.onGameSelect}
            key={key}
            disabled={btnActive || isDisabled}
            className={css.subMenuItem}
            data-active={btnActive}
            value={gameUniqueId}>
            <img
              alt="gameIcon"
              className={css.gameIcon}
              src={isDisabled ? gameIconGrayUrl : gameIconUrl}
            />
            <span className={css.gameName}>{gameNameInChinese}</span>
            {isDisabled ? <SVG
              className={css.maintainanceIcon}
              src={maintainanceIcon}
            >
            </SVG> : null}
          </button>
        );
      });
    }
    return null;
  }
  renderHotList() {
    const { gameInfos, expandedCategory } = this.props;
    let list = [...gameInfos];
    list = filter(list, ['recommendType', 'HOT']);
    const itemExpanded = expandedCategory === 'HOT';
    return (
      <div className={css.menuItem}>
        <button
          onClick={this.expandToggle}
          className={css.menuExpandToggle}
          value="HOT">
          <span className={css.gameName}>热门游戏</span>
          <MDIcon
            iconName="chevron-down"
            rotated={itemExpanded}
            className={css.menuChevron}
          />
        </button>
        <div className={css.subMenus} data-expanded={itemExpanded}>
          {this.renderSubMenuItems('HOT', list)}
        </div>
      </div>
    );
  }
  renderCategoryList() {
    const { LOTTERY_CATEGORY } = this.state;
    const { expandedCategory } = this.props;
    return map(TYPE.categoriesRefs, (categoryName, categoryId) => {
      let list = LOTTERY_CATEGORY[categoryId];
      list = reject(list, ['gameUniqueId', 'UNRECOGNIZED']);
      const itemExpanded = expandedCategory === categoryId;
      return (
        <div className={css.menuItem} key={categoryId}>
          <button
            onClick={this.expandToggle}
            className={css.menuExpandToggle}
            value={categoryId}>
            <span className={css.gameName}>{categoryName}</span>
            <MDIcon
              iconName="chevron-down"
              rotated={itemExpanded}
              className={css.menuChevron}
            />
          </button>
          <div className={css.subMenus} data-expanded={itemExpanded}>
            {this.renderSubMenuItems(categoryId, list)}
          </div>
        </div>
      );
    });
  }
  render() {
    return (
      <div className={css.sideNav}>
        {this.renderHotList()}
        {this.renderCategoryList()}
      </div>
    );
  }
}

export default SideNav;
