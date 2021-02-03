import React, {Component} from 'react';
import {Pagination, Row, Col, Spin} from 'antd';
import {LoadingBar} from 'components/General';
import css from 'styles/cards/index1.less';

class CardCatalogue extends Component {
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
      type: 'cardModel/updateState',
      payload: {
        searchTerm: value,
      },
    });

    if (value === '') {
      this.dispatch({
        type: 'cardModel/getCardList',
      });
    }
  };

  onSearchClick = () => {
    this.dispatch({
      type: 'cardModel/getSearchCardList',
    });
    this.dispatch({
      type: 'cardModel/initializeState',
      payload: ['cardCategoryId'],
    });
  };

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

  renderCardSearch() {
    return (
      <Col className={css.card_searchInputOuter}>
        <input
          onChange={this.onInputChange}
          className={css.card_searchInputInner}
          placeholder="输入游戏名称"
          value={this.props.searchTerm}
        />
        <button
          type="button"
          className={css.card_buttonSearch}
          onClick={this.onSearchClick}>
          搜索
        </button>
      </Col>
    );
  }

  renderCardList() {
    const {cardList, cardListandCategoryFull, isLoading} = this.props;
    let no = 0;
    let placeholder;

    if (isLoading)
      placeholder = <Spin size="large" tip="正在加载游戏列表..." />;
    else if (cardListandCategoryFull.length && !cardList.length)
      placeholder = '未找到匹配游戏.';
    else if (!cardList.length) placeholder = '暂无内容！';

    if (placeholder)
      return <div className={css.card_catalogueNoItem}>{placeholder}</div>;
    return (
      <div className={css.card_catalogue}>
        {cardList.map(
          ({
            categoryId,
            gamePlatform,
            gameId: cardId,
            name,
            status,
            icon,
            smallPlatformIcon,
          }) => {
            no++;
            if (!cardId) {
              return <span key={`${no + categoryId}-span`} />;
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
              <div key={`${no}-${categoryId}-cardlist-${name}`}>
                <button
                  type="button"
                  onClick={onClick}
                  className={css.card_catalogueItem}>
                  <div className={css.card_canvas}>
                    <div className={css.card_canvasBtn}>
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
                    </div>
                  </div>
                  <p className={css.card_catalogueName}>{name}</p>
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
        <div className={css.card_category}>{this.renderCardSearch()}</div>
        {this.renderCardList()}
        {/* {this.renderPagination()} */}
      </React.Fragment>
    );
  }
}

export default CardCatalogue;
