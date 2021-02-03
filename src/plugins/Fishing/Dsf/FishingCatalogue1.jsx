import React, {Component} from 'react';
import {Pagination, Row, Col, Spin} from 'antd';
import {LoadingBar} from 'components/General';
import css from 'styles/fishing/index1.less';

class FishingCatalogue extends Component {
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
      type: 'fishingModel/updateState',
      payload: {
        searchTerm: value,
      },
    });

    if (value === '') {
      this.dispatch({
        type: 'fishingModel/getFishingList',
      });
    }
  };

  onSearchClick = () => {
    this.dispatch({
      type: 'fishingModel/getSearchFishingList',
    });
    this.dispatch({
      type: 'fishingModel/initializeState',
      payload: ['fishingCategoryId'],
    });
  };

  onPaginationChange = (currentPage, pageSize) => {
    const {searchTerm} = this.props;
    this.dispatch({
      type: 'fishingModel/updateState',
      payload: {pageSize, currentPage},
    });
    if (searchTerm === '') {
      this.dispatch({
        type: 'fishingModel/getFishingList',
      });
    } else {
      this.dispatch({
        type: 'fishingModel/getSearchFishingList',
      });
    }
  };

  onCategoryClick = ({currentTarget}) => {
    this.dispatch({
      type: 'fishingModel/updateState',
      payload: {fishingCategoryId: parseInt(currentTarget.value)},
    });
    this.clearSelection();
    this.dispatch({
      type: 'fishingModel/getFishingList',
    });
  };

  clearSelection() {
    this.dispatch({
      type: 'fishingModel/initializeState',
      payload: ['currentPage', 'pageSize', 'searchTerm'],
    });
  }

  renderFishingSearch() {
    return (
      <Col className={css.fishing_searchInputOuter}>
        <input
          onChange={this.onInputChange}
          className={css.fishing_searchInputInner}
          placeholder="输入游戏名称"
          value={this.props.searchTerm}
        />
        <button
          type="button"
          className={css.fishing_buttonSearch}
          onClick={this.onSearchClick}>
          搜索
        </button>
      </Col>
    );
  }

  renderFishingList() {
    const {fishingList, fishingListandCategoryFull, isLoading} = this.props;
    let no = 0;
    let placeholder;

    if (isLoading)
      placeholder = <Spin size="large" tip="正在加载游戏列表..." />;
    else if (fishingListandCategoryFull.length && !fishingList.length)
      placeholder = '未找到匹配游戏.';
    else if (!fishingList.length) placeholder = '暂无内容！';

    if (placeholder)
      return <div className={css.fishing_catalogueNoItem}>{placeholder}</div>;
    return (
      <div className={css.fishing_catalogue}>
        {fishingList.map(
          ({
            categoryId,
            gamePlatform,
            gameId: fishingId,
            name,
            status,
            icon,
            smallPlatformIcon,
          }) => {
            no++;
            if (!fishingId) {
              return <span key={`${no + categoryId}-span`} />;
            }
            const onClick = () => {
              this.onGameClick({
                isDemo: false,
                fishingId,
                name,
                gamePlatform,
              });
            };
            return (
              <div key={`${no}-${categoryId}-fishinglist-${name}`}>
                <button
                  type="button"
                  onClick={onClick}
                  className={css.fishing_catalogueItem}>
                  <div className={css.fishing_canvas}>
                    <div className={css.fishing_canvasBtn}>
                      <img
                        src={icon}
                        alt={`${categoryId}_${name}`}
                        className={css.fishing_canvasImage}
                      />
                      <img
                        src={smallPlatformIcon}
                        alt={`${categoryId}_${name}`}
                        className={css.fishing_canvasImage_icon}
                      />
                    </div>
                  </div>
                  <p className={css.fishing_catalogueName}>{name}</p>
                </button>
              </div>
            );
          },
        )}
      </div>
    );
  }

  renderPagination() {
    const {fishingListCount, currentPage, pageSize} = this.props;
    if (fishingListCount === 0) return <div />;
    return (
      <div>
        <div className={css.fishing_pagination}>
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            pageSize={pageSize}
            current={currentPage}
            onChange={this.onPaginationChange}
            onShowSizeChange={this.onPaginationChange}
            showQuickJumper
            total={fishingListCount}
          />
        </div>
        <div className={css.fishing_clear} />
      </div>
    );
  }

  render() {
    const {isLoading} = this.props;

    return (
      <React.Fragment>
        <LoadingBar
          isLoading={isLoading}
          className={css.fishing_loading}
          data-active={isLoading}
        />
        <div className={css.fishing_category}>{this.renderFishingSearch()}</div>
        {this.renderFishingList()}
        {/* {this.renderPagination()} */}
      </React.Fragment>
    );
  }
}

export default FishingCatalogue;
