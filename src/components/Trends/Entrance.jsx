import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';

import css from 'styles/trends/entrance.less';
import {hasTrendChart, TREND_CHART_CONFIG, type as TYPE} from 'utils';

const {GAME_CATEGORY} = TREND_CHART_CONFIG;
const GAME_CATEGORY_LIST = Object.keys(GAME_CATEGORY);
const ALL = 'ALL';

class Entrance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: ALL,
      categoryGames: {},
    };
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.updateCategoryGames(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.gameInfos !== nextProps.gameInfos)
      this.updateCategoryGames(nextProps);
  }
  handleButtonClick = e => {
    this.setState({category: e.target.value});
  };
  updateCategoryGames(props) {
    const {gameInfos} = props;
    if (gameInfos.length) {
      const categoryGames = {};

      // 保留设定次序, 而不是数据读取次序
      GAME_CATEGORY_LIST.forEach(category => {
        categoryGames[category] = [];
      });

      gameInfos.forEach(gameInfo => {
        const {
          gameUniqueId,
          gameIconUrl,
          gameIconGrayUrl,
          gameNameInChinese,
          status,
          category,
        } = gameInfo;
        const thisCategory = GAME_CATEGORY[category];
        if (
          gameUniqueId !== 'UNRECOGNIZED' && (status === TYPE.ACTIVE_STATUS && thisCategory)
        ) {
          if (!categoryGames[thisCategory]) categoryGames[thisCategory] = [];

          if (
            (thisCategory !== TYPE.GAME_CATEGORY.NONE && categoryGames[thisCategory].length > 0) || hasTrendChart(gameUniqueId, gameInfos)) {
            categoryGames[thisCategory].push({
              id: gameUniqueId,
              icon: gameIconUrl,
              disabledIcon: gameIconGrayUrl,
              name: gameNameInChinese,
            });
          }
        }
      });
      this.setState({categoryGames});
    }
  }
  renderButtons() {
    const {category: thisCategory} = this.state;
    return [ALL, ...GAME_CATEGORY_LIST].map(category => (
      <button
        className={css.tab}
        data-selected={category === thisCategory}
        key={category}
        onClick={this.handleButtonClick}
        value={category}>
        {TYPE.categoriesRefs[category] || '全部彩种'}
      </button>
    ));
  }
  renderNav() {
    const {category, categoryGames} = this.state;
    const gameList =
      category === ALL
        ? Array.prototype.concat.apply([], Object.values(categoryGames))
        : categoryGames[category] || [];

    return gameList.map(({id, name}) => (
      <div className={css.subnavBtnBorder} key={id}>
      <Link key={id} className={css.nav} target="trendPage" to={`trends/${id}`}>
        {name}
      </Link>
      </div>
    ));
  }
  // 有icon区块
  renderSectionItems(category) {
    const {categoryGames} = this.state;

    return (categoryGames[category] || []).map(
      ({icon, disabledIcon, name, id}) => (
        <Link
          key={id}
          target="trendPage"
          to={`/trends/${id}`}
          className={css.sectionItem}>
          <img className={css.thumbnail} src={icon} alt={name} />
          <span className={css.sectionItemName}>{name}</span>
        </Link>
      ),
    );
  }
  renderGames() {
    return GAME_CATEGORY_LIST.map(cat => (
      <div className={css.section} key={cat}>
        <div className={css.sectionTitle}>{TYPE.categoriesRefs[cat]}</div>
        <div className={css.sectionItems}>{this.renderSectionItems(cat)}</div>
      </div>
    ));
  }
  render() {
    return (
      <div className={css.page}>
        <div className={css.headerSelect}>
          <div className={css.tabs}>{this.renderButtons()}</div>
          <div className={css.navs}>{this.renderNav()}</div>
        </div>
        {this.renderGames()}
      </div>
    );
  }
}
function mapStateToProps({gameInfosModel}) {
  return {gameInfos: gameInfosModel.gameInfos};
}
export default connect(mapStateToProps)(Entrance);
