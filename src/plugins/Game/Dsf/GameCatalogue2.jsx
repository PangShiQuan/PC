import React, {Component} from 'react';
import {Pagination, Row, Col, Spin} from 'antd';
import {LoadingBar} from 'components/General';
import css from 'styles/Game/index2.less';
import resolve from 'clientResolver';

const arrowIcon = resolve.client('assets/image/arrowIcon.png');
class GameCatalogue extends Component {
  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
    this.onGameClick = props.onGameClick;
  }

  componentWillUnmount() {
    this.clearSelection();
  }

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

  renderGameList() {
    const {gameList, gameListandCategoryFull, isLoading} = this.props;
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
          (
            {
              categoryId,
              gamePlatform,
              gameId,
              name,
              status,
              icon,
              smallPlatformIcon,
            },
            index,
          ) => {
            if (!gameId) {
              return <span key={`${index + categoryId}-span`} />;
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
              <div key={`${gameId}-${index}`} className={css.gameMargin}>
                <div
                  className={css.game_catalogueItem}
                  key={`${index}-${categoryId}-gamelist-${name}`}>
                  <div className={css.game_canvas}>
                    <button
                      type="button"
                      className={css.game_canvasBtn}
                      onClick={onClick}>
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
                      <div className={css.startGame}>开始游戏</div>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClick}
                  className={css.game_catalogueName}>
                  {name}
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
        {this.renderGameList()}
        {/* {this.renderPagination()} */}
      </React.Fragment>
    );
  }
}

export default GameCatalogue;
