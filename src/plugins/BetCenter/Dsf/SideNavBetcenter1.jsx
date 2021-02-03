import React, {Component} from 'react';
import {Modal} from 'antd';
import {routerRedux} from 'dva/router';
import {find, forEach, filter, map, reject} from 'lodash';
import {MDIcon} from 'components/General';
import {isDisabledGame, getGameSetup, type as TYPE} from 'utils';
import css from 'styles/betCenter/Dsf/SideNav1.less';
import * as images from 'components/BetCenter/Entrance/images';

const {
  categoriesRefs,
  GAME_CATEGORY: {NONE},
} = TYPE;

class SideNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LOTTERY_CATEGORY: '',
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    // this.getDefaultGame(this.props);
    this.getGameCategory(this.props);
    const thisGameId = map(this.props.gameInfos, item => {
      return item.gameUniqueId;
    });
    this.dispatch({
      type: 'gameInfosModel/getSingleCollections',
      thisGameId,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.gameInfos !== nextProps.gameInfos) {
      // this.getDefaultGame(this.props);
      this.getGameCategory(nextProps);
    }
  }

  onGameSelect = ({category, gameUniqueId}) => {
    const {betEntries} = this.props;
    if (betEntries && betEntries.length > 0) {
      Modal.confirm({
        title: '切换彩种会清除已选注单，是否确定切换？',
        onOk: () => {
          this.switchGameHandler({category, gameUniqueId});
        },
      });
    } else {
      this.switchGameHandler({category, gameUniqueId});
    }
  };

  // temporary remove because no use.
  // getDefaultGame({allGamesPrizeSettings, thisGameId, gameInfos}) {
  //   const defaultGame = find(gameInfos, {gameUniqueId: thisGameId});
  //   const defaultGameInactive =
  //     !defaultGame || isDisabledGame(defaultGame, {allGamesPrizeSettings});
  //   if (defaultGameInactive) {
  //     const nextNormalGame = find(
  //       gameInfos,
  //       game =>
  //         !['UNRECOGNIZED', thisGameId].includes(game.gameUniqueId) &&
  //         !isDisabledGame(game, {allGamesPrizeSettings}),
  //     );
  //     if (nextNormalGame && nextNormalGame.gameUniqueId) {
  //       this.switchGameHandler({
  //         gameUniqueId: nextNormalGame.gameUniqueId,
  //         category: nextNormalGame.category,
  //       });
  //     }
  //   }
  // }

  getGameCategory({gameInfos}) {
    const NEW_CATEGORY = {};
    forEach(gameInfos, gameInfo => {
      const {category} = gameInfo;
      NEW_CATEGORY[category] = NEW_CATEGORY[category] || [];
      NEW_CATEGORY[category].push(gameInfo);
    });
    this.setState({LOTTERY_CATEGORY: NEW_CATEGORY});
  }

  switchGameHandler({gameUniqueId, category}) {
    const thisGameId = gameUniqueId;
    this.dispatch({
      type: 'gameInfosModel/getSingleCollections',
      thisGameId,
    });
    this.dispatch({type: 'betCenter/initializeAll'});
    this.dispatch({
      type: 'gameInfosModel/initializeState',
      payload: ['thisGameResults'],
    });
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameId, expandedCategory: category},
    });
    this.dispatch({type: 'gameInfosModel/getThisGameResults'});
    const selectedCategory = category === NONE ? 'OTHERS' : category;
    this.dispatch(
      routerRedux.push(`/betcenter/${selectedCategory}/${thisGameId}`),
    );
  }

  expandToggle = ({currentTarget}) => {
    const expandedCategory = currentTarget.value;
    if (this.props.expandedCategory === expandedCategory) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {expandedCategory: ''},
      });
    } else {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {expandedCategory},
      });
    }
  };

  renderSubMenuItems(type, list) {
    const isAll = this.props.pathname === '/betcenter';
    const {allGamesPrizeSettings, thisGameId} = this.props;
    if (list.length) {
      return map(list, game => {
        let {gameUniqueId} = game;
        const {
          category,
          gameIconUrl,
          gameNameInChinese,
          gameIconGrayUrl,
        } = game;
        if (!getGameSetup({gameUniqueId})) return null;
        const isDisabled = isDisabledGame(game, {allGamesPrizeSettings});
        let btnActive = gameUniqueId === thisGameId;
        const isPCDD = gameUniqueId === 'UNRECOGNIZED';
        let key = `${type}__${gameUniqueId}`;
        if (isPCDD) {
          gameUniqueId = 'HF_LF28';
          btnActive = thisGameId === 'HF_LF28' || thisGameId === 'HF_BJ28';
          key = `${type}__PCDD`;
        }
        const imgSrc = isDisabled ? gameIconGrayUrl : gameIconUrl;
        return (
          <button
            type="button"
            onClick={() =>
              this.onGameSelect({
                category: type === 'HOT' ? 'HOT' : category,
                gameUniqueId,
              })
            }
            key={key}
            data-gameuniqueid={gameUniqueId}
            disabled={(btnActive && !isAll) || isDisabled}
            className={css.subMenuItem}
            data-active={btnActive && !isAll}>
            <span
              className={css.avatar}
              style={{backgroundImage: `url('${imgSrc}')`}}
            />
            <span className={css.label}>{gameNameInChinese}</span>
            {isDisabled ? <MDIcon iconName="worker" /> : null}
          </button>
        );
      });
    }
    return null;
  }

  renderHotList() {
    const {gameInfos, expandedCategory} = this.props;
    let list = [...gameInfos];
    list = filter(list, ['recommendType', 'HOT']);
    const itemExpanded = expandedCategory === 'HOT';
    return (
      <div className={css.menuItem} data-expanded={itemExpanded}>
        <button
          type="button"
          onClick={this.expandToggle}
          value="HOT"
          className={css.menuExpandToggle}>
          <img
            src={images.hotIcon}
            alt="热门游戏"
            className={css.menuBtnIcon}
          />
          <span className={css.label}>热门游戏</span>
          <MDIcon iconName="chevron-down" className={css.menuChevron} />
        </button>
        <div className={css.subMenus}>
          {this.renderSubMenuItems('HOT', list)}
        </div>
      </div>
    );
  }

  renderCategoryList() {
    const {LOTTERY_CATEGORY} = this.state;
    let {expandedCategory} = this.props;
    if (expandedCategory === 'OTHERS') expandedCategory = NONE;
    return map(categoriesRefs, (categoryName, categoryId) => {
      let list = LOTTERY_CATEGORY[categoryId];
      list = reject(list, ['gameUniqueId', 'UNRECOGNIZED']);
      const itemExpanded = expandedCategory === categoryId;
      let imgSrc = '';
      const firstItem = list[0];
      if (firstItem) {
        imgSrc = firstItem.gameIconUrl;
      }
      return (
        <div
          className={css.menuItem}
          key={categoryId}
          data-expanded={itemExpanded}>
          <button
            type="button"
            onClick={this.expandToggle}
            value={categoryId}
            className={css.menuExpandToggle}>
            <span
              className={css.avatar}
              style={{backgroundImage: `url('${imgSrc}')`}}
            />
            <span className={css.label} data-hide={this.props.sideNavCollapsed}>
              {categoryName}
            </span>
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
    const backToAll = () => this.dispatch(routerRedux.push('/betcenter'));
    const toResult = () => this.dispatch(routerRedux.push('/result'));
    const toPromotions = () => this.dispatch(routerRedux.push('/promotions'));
    const toTrend = () => this.dispatch(routerRedux.push('/trends'));
    const toInstruction = () =>
      this.dispatch(
        routerRedux.push(`/instructions?gameUniqueId=${this.props.thisGameId}`),
      );
    const isAll = this.props.pathname === '/betcenter';
    return (
      <div className={css.sideNav} data-collapsed={this.props.sideNavCollapsed}>
        <div className={css.menuItem}>
          <button
            type="button"
            className={css.subMenuItem}
            onClick={backToAll}
            data-active={isAll}
            data-isall={isAll}>
            <img
              src={images.allIcon}
              alt="全部彩种"
              className={css.menuBtnIcon}
            />
            <span className={css.label}>全部彩种</span>
          </button>
        </div>
        {this.renderHotList()}
        {this.renderCategoryList()}
      </div>
    );
  }
}

export default SideNav;
