import React, {Component} from 'react';
import {Pagination, Row, Col, Spin} from 'antd';
import {LoadingBar} from 'components/General';
import css from 'styles/Game/index1.less';

class GameCatalogue extends Component {
  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
    this.onGameClick = props.onGameClick;
  }

  componentWillUnmount() {
    this.clearSelection();
  }

  onInputChange = event => {
    event.persist();
    const {value} = event.target;
    this.clearSelection();
    this.dispatch({
      type: 'gameModel/updateState',
      payload: {
        searchTerm: value,
      },
    });

    if (value === '') {
      this.dispatch({
        type: 'gameModel/getGameList',
      });
    }
  };

  onSearchClick = () => {
    this.dispatch({
      type: 'gameModel/getSearchGameList',
    });
    this.dispatch({
      type: 'gameModel/initializeState',
      payload: ['gameCategoryId'],
    });
  };

  onPaginationChange = (currentPage, pageSize) => {
    const {searchTerm} = this.props;
    this.dispatch({
      type: 'gameModel/updateState',
      payload: {pageSize, currentPage},
    });
    if (searchTerm === '') {
      this.dispatch({
        type: 'gameModel/getGameList',
      });
    } else {
      this.dispatch({
        type: 'gameModel/getSearchGameList',
      });
    }
  };

  onCategoryClick = ({currentTarget}) => {
    this.dispatch({
      type: 'gameModel/updateState',
      payload: {gameCategoryId: parseInt(currentTarget.value)},
    });
    this.clearSelection();
    this.dispatch({
      type: 'gameModel/getGameList',
    });
  };

  clearSelection() {
    this.dispatch({
      type: 'gameModel/initializeState',
      payload: ['currentPage', 'pageSize', 'searchTerm'],
    });
  }

  renderGameSearch() {
    return (
      <Col className={css.game_searchInputOuter}>
        <input
          onChange={this.onInputChange}
          className={css.game_searchInputInner}
          placeholder="输入游戏名称"
          value={this.props.searchTerm}
        />
        <button
          type="button"
          className={css.game_buttonSearch}
          onClick={this.onSearchClick}>
          搜索
        </button>
      </Col>
    );
  }

  renderGameList() {
    const {gameList, gameListandCategoryFull, isLoading} = this.props;
    let no = 0;
    let placeholder;

    if (isLoading)
      placeholder = <Spin size="large" tip="正在加载游戏列表..." />;
    else if (gameListandCategoryFull.length && !gameList.length)
      placeholder = '未找到匹配游戏.';
    else if (!gameList.length) placeholder = '暂无内容！';

    if (placeholder)
      return <div className={css.game_catalogueNoItem}>{placeholder}</div>;

    return (
      <div className={css.game_catalogue}>
        {gameList.map(
          ({
            categoryId,
            gamePlatform,
            gameId,
            name,
            status,
            icon,
            smallPlatformIcon,
          }) => {
            no++;
            if (!gameId) {
              return <span key={`${no + categoryId}-span`} />;
            }
            const onClick = () => {
              this.onGameClick({
                isDemo: false,
                gameId,
                name,
                gamePlatform,
              });
            };
            return (
              <div key={`${no}-${categoryId}-gamelist-${name}`}>
                <button
                  type="button"
                  className={css.game_catalogueItem}
                  onClick={onClick}>
                  <div className={css.game_canvas}>
                    <div className={css.game_canvasBtn}>
                      <img
                        src={icon}
                        alt={`${categoryId}_${name}`}
                        className={css.game_canvasImage}
                      />
                      <img
                        src={smallPlatformIcon}
                        alt={`${categoryId}_${name}`}
                        className={css.game_canvasImage_icon}
                      />
                    </div>
                  </div>
                  <p className={css.game_catalogueName}>{name}</p>
                </button>
              </div>
            );
          },
        )}
      </div>
    );
  }

  renderPagination() {
    const {gameListCount, currentPage, pageSize} = this.props;
    if (gameListCount === 0) return <div />;
    return (
      <div>
        <div className={css.game_pagination}>
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            pageSize={pageSize}
            current={currentPage}
            onChange={this.onPaginationChange}
            onShowSizeChange={this.onPaginationChange}
            showQuickJumper
            total={gameListCount}
          />
        </div>
        <div className={css.game_clear} />
      </div>
    );
  }

  render() {
    const {isLoading} = this.props;

    return (
      <React.Fragment>
        <LoadingBar
          isLoading={isLoading}
          className={css.game_loading}
          data-active={isLoading}
        />
        <div className={css.game_category}>{this.renderGameSearch()}</div>
        {this.renderGameList()}
        {/* {this.renderPagination()} */}
      </React.Fragment>
    );
  }
}

export default GameCatalogue;
