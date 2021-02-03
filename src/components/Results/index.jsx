import React, {Component} from 'react';
import {groupBy, keys} from 'lodash';
import {connect} from 'dva';
import {Link, Route, Switch} from 'dva/router';
import filter from 'lodash/filter';
import {MDIcon} from 'components/General/';
import {getGameSetup, settingMap, type as TYPE} from 'utils';
import css from 'styles/results/index.less';
import resolve from 'clientResolver';

const {categoriesRefs} = TYPE;
const ResultsTable = resolve.plugin('ResultsTable');
const SingleResultTable = resolve.plugin('SingleResultTable');

class ResultsIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: '全部',
    };
    this.dispatch = props.dispatch;
    this.navs = groupBy(settingMap.gamesMap, 'category');
    this.selectAll = this.onCategorySelect.bind(this, {
      currentTarget: {value: '全部'},
    });
  }

  componentWillMount() {
    this.dispatch({type: 'betCenter/updateState', payload: {resultLimit: 40}});
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: ['resultLimit'],
    });
  }

  onCategorySelect = ({currentTarget}) => {
    this.setState({
      selectedCategory: currentTarget.value,
    });
  };

  onBackClick = () => {
    this.dispatch({
      type: 'gameInfosModel/initializeState',
      payload: ['selectedResult'],
    });
  };

  renderNavCategory() {
    if (this.navs) {
      const {selectedCategory} = this.state;
      const categories = keys(this.navs);
      return (
        <div className={css.navCategory}>
          {this.props.selectedResult && (
            <Link
              className={css.navCategoryBtn__back}
              onClick={this.onBackClick}
              to="/result">
              <i>返回目录</i>
            </Link>
          )}
          <button
            type="button"
            data-active={selectedCategory === '全部'}
            className={css.navCategoryBtn}
            onClick={this.selectAll}>
            全部
          </button>
          {categories.map(category => (
            <button
              type="button"
              key={category}
              className={css.navCategoryBtn}
              data-active={selectedCategory === category}
              onClick={this.onCategorySelect}
              value={category}>
              {categoriesRefs[category]}
            </button>
          ))}
        </div>
      );
    }
  }

  renderSubNav() {
    const {selectedResult, gameInfos, allGamesPrizeSettings} = this.props;
    const list = [];
    let subNav = [];

    // 合并彩种信息和彩种开关状态信息
    gameInfos.map(item => {
      list.push({...item, ...allGamesPrizeSettings[item.gameUniqueId]});
    });

    // 筛选彩种类型和状态
    if (this.state.selectedCategory === '全部') {
      subNav = filter(list, {status: 'NORMAL'});
    } else {
      subNav = filter(list, {
        status: 'NORMAL',
        category: this.state.selectedCategory,
      });
    }

    return (
      <div className={css.subnav}>
        {subNav.map(
          ({gameNameInChinese, gameUniqueId, issueFrequency}, index) => {
            if (!getGameSetup({gameUniqueId})) return null;
            return (
              <div className={css.subnavBtnBorder} key={index}>
                <Link
                  key={gameUniqueId}
                  className={css.subnavBtn}
                  to={`/result/${gameUniqueId}`}
                  data-active={
                    gameNameInChinese === selectedResult.gameNameInChinese
                  }>
                  {gameNameInChinese}
                </Link>
              </div>
            );
          },
        )}
      </div>
    );
  }

  render() {
    return (
      <div className={css.results}>
        <div className={css.nav}>
          {this.renderNavCategory()}
          {this.renderSubNav()}
        </div>
        <Switch>
          <Route exact path="/result" component={ResultsTable} />
          <Route path="/result/:gameUniqueId" component={SingleResultTable} />
        </Switch>
      </div>
    );
  }
}

function mapStatesToProp({gameInfosModel}) {
  const {allGamesPrizeSettings, gameInfos, selectedResult} = gameInfosModel;
  return {selectedResult, gameInfos, allGamesPrizeSettings};
}

export default connect(mapStatesToProp)(ResultsIndex);
