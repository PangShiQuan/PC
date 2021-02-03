import React, {Component} from 'react';
import {forEach, map, size, sortBy, filter, throttle} from 'lodash';
import {Link, routerRedux} from 'dva/router';
import {connect} from 'dva';
import {isDisabledGame, getGameSetup, type as TYPE} from 'utils';
import css from 'styles/betCenter/BetEntrance.less';
import CardItem from './CardItem';
import LargeCardItem from './LargeCardItem';

const HOT = 'HOT';

class BetEntrance extends Component {
  static renderResultLink(item, className) {
    return (
      <Link
        className={className}
        to={`result/${item.gameUniqueId}`}
        target="_blank">
        更多开奖
      </Link>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      datasource: this.getList(props),
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    this.dispatch({type: 'gameInfosModel/getAllResults'});
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      datasource: this.getList(nextProps),
    });
  }

  onOrderCountComplete = throttle(() => {
    this.dispatch({type: 'gameInfosModel/getCurrentResults'});
  }, 1000);

  onResultCountComplete = throttle(() => {
    this.dispatch({type: 'gameInfosModel/getAllResults'});
  }, 1000);

  onGameplay = ({currentTarget}) => {
    const {value: gameUniqueId} = currentTarget;
    const category = currentTarget.getAttribute('data-category');
    const recommendType = currentTarget.getAttribute('data-recommendtype');

    this.dispatch({type: 'betCenter/initializeAll'});
    const thisGameId = gameUniqueId;
    const {allGamesPrizeSettings} = this.props;
    const SingleCollection = allGamesPrizeSettings[thisGameId];    // 点击单个彩种的数据集合5分钟
    const {localTime,updateTime} = SingleCollection;
    const newTime = + new Date();
    if (localTime < newTime - 300000) {
      this.dispatch({
        type: 'gameInfosModel/getSingleCollections',
        thisGameId,
        updateTime,
      });
    }
    this.dispatch({
      type: 'gameInfosModel/initializeState',
      payload: ['thisGameResults'],
    });

    let selectedCategory = recommendType === HOT ? 'HOT' : category;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameId: gameUniqueId, expandedCategory: selectedCategory},
    });
    selectedCategory =
      category === TYPE.GAME_CATEGORY.NONE ? 'OTHERS' : selectedCategory;
    this.dispatch({type: 'gameInfosModel/getThisGameResults'});
    this.dispatch(
      routerRedux.push({
        pathname: `/betcenter/${selectedCategory}/${gameUniqueId}`,
      }),
    );
  };

  getList = ({gameInfos, allGamesPrizeSettings}) => {
    const list = {};
    if (!gameInfos || !allGamesPrizeSettings) return list;
    forEach(gameInfos, gameInfo => {
      if (getGameSetup(gameInfo)) {
        list[gameInfo.gameUniqueId] = {
          ...gameInfo,
          disabled: isDisabledGame(gameInfo, {allGamesPrizeSettings}),
        };
      }
    });
    return sortBy(list, ['disabled', 'order']);
  };

  renderBetLink(item, className) {
    const {recommendType, gameUniqueId, category, disabled} = item;

    return (
      <button
        disabled={disabled}
        className={className}
        onClick={this.onGameplay}
        value={gameUniqueId}
        data-category={category}
        data-recommendtype={recommendType}>
        马上下注
      </button>
    );
  }

  renderRecommend() {
    let list = null;
    if (!size(this.state.datasource)) return list;
    list = filter(this.state.datasource, {recommendType: HOT});

    return map(list, item => {
      const cardProps = {
        allResults: this.props.allResults,
        awaitingResponse: this.props.awaitingResponse,
        currentResults: this.props.currentResults,
        item,
        key: item.gameUniqueId,
        onOrderCountComplete: this.onOrderCountComplete,
        onResultCountComplete: this.onResultCountComplete,
      };
      return (
        <LargeCardItem {...cardProps}>
          {this.renderBetLink(item, css.betEntrace_recommendOrderBtn)}
          {BetEntrance.renderResultLink(
            item,
            css.betEntrace_recommendResultBtn,
          )}
        </LargeCardItem>
      );
    });
  }

  renderSelectedList() {
    let list = null;
    if (
      !this.props.expandedCategory ||
      this.props.expandedCategory === 'HOT' ||
      !size(this.state.datasource)
    ) {
      return null;
    }
    list = map(
      filter(this.state.datasource, {category: this.props.expandedCategory}),
      item => {
        const cardProps = {
          item,
          key: item.gameUniqueId,
        };
        return (
          <CardItem {...cardProps}>
            {this.renderBetLink(item, css.betEntrace_orderBtn)}
            {BetEntrance.renderResultLink(item, css.betEntrace_resultBtn)}
          </CardItem>
        );
      },
    );
    return (
      <section>
        <h1 className={css.betEntrace_headline}>
          {TYPE.categoriesRefs[this.props.expandedCategory]}
        </h1>
        <ul>{list}</ul>
      </section>
    );
  }

  renderAllList() {
    let list = null;
    if (!size(this.state.datasource)) return list;
    list = map(this.state.datasource, item => {
      const cardProps = {
        item,
        key: item.gameUniqueId,
      };
      return (
        <CardItem {...cardProps}>
          {this.renderBetLink(item, css.betEntrace_orderBtn)}
          {BetEntrance.renderResultLink(item, css.betEntrace_resultBtn)}
        </CardItem>
      );
    });
    return list;
  }

  render() {
    return (
      <div className={css.betEntrace}>
        <section>
          <h1 className={css.betEntrace_headline}>热门彩种</h1>
          <ul className={css.betEntrace_recommendList}>
            {this.renderRecommend()}
          </ul>
        </section>
        {this.renderSelectedList()}
        <section>
          <h1 className={css.betEntrace_headline}>全部彩种</h1>
          <ul className={css.betEntrace_list}>{this.renderAllList()}</ul>
        </section>
      </div>
    );
  }
}

const mapStatesToProps = ({gameInfosModel, betCenter}) => ({
  allGamesPrizeSettings: gameInfosModel.allGamesPrizeSettings,
  awaitingResponse: gameInfosModel.awaitingResponse,
  allResults: gameInfosModel.allResults,
  gameInfos: gameInfosModel.gameInfos,
  currentResults: gameInfosModel.currentResults,
  expandedCategory: betCenter.expandedCategory,
});

export default connect(mapStatesToProps)(BetEntrance);
