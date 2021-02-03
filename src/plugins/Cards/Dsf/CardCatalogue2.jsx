import React, {Component} from 'react';
import {Pagination, Row, Col, Spin} from 'antd';
import {LoadingBar} from 'components/General';
import css from 'styles/cards/index2.less';
import resolve from 'clientResolver';

const arrowIcon = resolve.client('assets/image/arrowIcon.png');
class CardCatalogue extends Component {
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
      type: 'cardModel/updateState',
      payload: {pageSize, currentPage},
    });
    if (searchTerm === '') {
      this.dispatch({
        type: 'cardModel/getCardList',
      });
    } else {
      this.dispatch({
        type: 'cardModel/getSearchCardList',
      });
    }
  };

  onCategoryClick = ({currentTarget}) => {
    this.dispatch({
      type: 'cardModel/updateState',
      payload: {cardCategoryId: parseInt(currentTarget.value)},
    });
    this.clearSelection();
    this.dispatch({
      type: 'cardModel/getCardList',
    });
  };

  clearSelection() {
    this.dispatch({
      type: 'cardModel/initializeState',
      payload: ['currentPage', 'pageSize', 'searchTerm'],
    });
  }

  renderCardList() {
    const {cardList, isLoading} = this.props;
    let placeholder;

    if (isLoading)
      placeholder = <Spin size="large" tip="正在加载游戏列表..." />;
    else if (!cardList.length) placeholder = '暂无内容！';

    if (placeholder)
      return <div className={css.card_catalogueNoItem}>{placeholder}</div>;
    return (
      <div className={css.card_catalogue}>
        {cardList.map(
          (
            {
              categoryId,
              gamePlatform,
              gameId: cardId,
              name,
              status,
              icon,
              smallPlatformIcon,
            },
            index,
          ) => {
            if (!cardId) {
              return <span key={`${index + categoryId}-span`} />;
            }
            const onClick = () => {
              this.onGameClick({
                isDemo: false,
                cardId,
                name,
                gamePlatform,
              });
            };
            return (
              <div key={`${cardId}-${index}`} className={css.cardMargin}>
                <div
                  className={css.card_catalogueItem}
                  key={`${index}-${categoryId}-cardlist-${name}`}>
                  <div className={css.card_canvas}>
                    <button
                      type="button"
                      className={css.card_canvasBtn}
                      onClick={onClick}>
                      <img
                        src={icon}
                        alt={`${categoryId}_${name}`}
                        className={css.card_canvasImage}
                      />
                      <img
                        src={smallPlatformIcon}
                        alt={`${categoryId}_${name}`}
                        className={css.card_canvasImage_icon}
                      />
                      <div className={css.startGame}>开始游戏</div>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClick}
                  className={css.card_catalogueName}>
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
    const {cardListCount, currentPage, pageSize} = this.props;
    if (cardListCount === 0) return <div />;
    return (
      <div>
        <div className={css.card_pagination}>
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            pageSize={pageSize}
            current={currentPage}
            onChange={this.onPaginationChange}
            onShowSizeChange={this.onPaginationChange}
            showQuickJumper
            total={cardListCount}
          />
        </div>
        <div className={css.card_clear} />
      </div>
    );
  }

  render() {
    const {isLoading} = this.props;

    return (
      <React.Fragment>
        <LoadingBar
          isLoading={isLoading}
          className={css.card_loading}
          data-active={isLoading}
        />
        {this.renderCardList()}
      </React.Fragment>
    );
  }
}

export default CardCatalogue;
