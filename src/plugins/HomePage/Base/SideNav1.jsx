import React, {Component} from 'react';
import {routerRedux} from 'dva/router';
import _ from 'lodash';
import {connect} from 'dva';
import {MDIcon} from 'components/General';
import css from 'styles/header/Base/sideNav1.less';
import {getGameSetup, isDisabledGame, type as TYPE} from 'utils';

class SideNav1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showingMore: false,
    };
    this.dispatch = props.dispatch;
    this.onGameSelect = this.onGameSelect.bind(this);
    this.onShowMoreToggle = this.onShowMoreToggle.bind(this);
  }
  onGameSelect({gameUniqueId, category}) {
    const thisGameId = gameUniqueId;
    this.dispatch({
      type: 'gameInfosModel/getSingleCollections',
      thisGameId
    });
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameId: gameUniqueId, expandedCategory: category},
    });
    this.dispatch(routerRedux.push({pathname: '/betcenter'}));
  }
  onShowMoreToggle() {
    const {showingMore} = this.state;
    this.setState({showingMore: !showingMore});
  }
  renderListItems(list, classname, hasIcon) {
    const {allGamesPrizeSettings} = this.props;

    return list.map(listItem => {
      if (!listItem) return null;
      let {gameUniqueId, category} = listItem;

      if (!getGameSetup({gameUniqueId})) return null;

      const {gameNameInChinese, gameIconUrl} = listItem;
      const Icon = hasIcon ? (
        <img
          className={css.sideNav_thumbnail}
          src={gameIconUrl}
          alt={gameNameInChinese}
        />
      ) : null;
      let key = gameUniqueId;
      if (gameUniqueId === 'UNRECOGNIZED') {
        category = 'PCDANDAN';
        gameUniqueId = 'HF_LF28';
        key = 'PCDD';
      }
      return (
        <li key={key} className={classname}>
          <button
            disabled={isDisabledGame(listItem, {allGamesPrizeSettings})}
            className={css.sideNav_anchor}
            onClick={this.onGameSelect.bind(this, {
              gameUniqueId,
              category,
            })}>
            {Icon}
            <span className={css.sideNav_anchorSpan}>{gameNameInChinese}</span>
          </button>
        </li>
      );
    });
  }
  renderList({listLabel, frequency}) {
    const {gameInfos} = this.props;
    let list = [...gameInfos];
    if (frequency !== 'ALL') {
      list = _.filter(list, {frequency});
    }
    return (
      <div className={css.sideNav_sectionRow} data-hasextra={list.length > 4}>
        <p className={css.sideNav_sectionLabel}>
          {_.map(listLabel, text => (
            <span key={text}>{text}</span>
          ))}
        </p>
        <ul className={css.sideNav_placeholderList}>
          {this.renderListItems(
            _.take(list, 4),
            css.sideNav_placeholderListItem,
          )}
        </ul>
        <div className={css.sideNav_expandedBody}>
          <p className={css.sideNav_expandedListLabel}>{listLabel}</p>
          <ul className={css.sideNav_expandedList}>
            {this.renderListItems(list, css.sideNav_expandedListItem)}
          </ul>
        </div>
        <MDIcon iconName="chevron-right" className={css.sideNav_chevron} />
      </div>
    );
  }
  renderHotList() {
    const {gameInfos} = this.props;
    const list = _.filter(gameInfos, ['recommendType', 'HOT']);

    return (
      <ul className={css.sideNav_list}>
        {this.renderListItems(list, css.sideNav_listItem, true)}
      </ul>
    );
  }
  render() {
    const {gameInfos} = this.props;
    if (!gameInfos.length) {
      return (
        <ul className={css.sideNav_list}>
          <li className={css.sideNav_listItem}>暂无信息</li>
        </ul>
      );
    }
    return (
      <div className={css.sideNav}>
        {this.renderHotList()}
        {this.renderList({
          listLabel: TYPE.frequencyRefs.HIGH,
          frequency: 'HIGH',
        })}
        {this.renderList({
          listLabel: TYPE.frequencyRefs.LOW,
          frequency: 'LOW',
        })}
        {this.renderList({
          listLabel: '全部',
          frequency: 'ALL',
        })}
      </div>
    );
  }
}

function mapStatesToProps({layoutModel, gameInfosModel}) {
  const {shouldShowSideNav} = layoutModel;
  const {gameInfos} = gameInfosModel;
  return {
    shouldShowSideNav,
    gameInfos,
  };
}

export default connect(mapStatesToProps)(SideNav1);
