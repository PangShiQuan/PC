import React, {Component} from 'react';
import {Pagination, Row, Col, Spin} from 'antd';
import {LoadingBar} from 'components/General';
import css from 'styles/fishing/index2.less';
import resolve from 'clientResolver';

const arrowIcon = resolve.client('assets/image/arrowIcon.png');
class FishingCatalogue extends Component {
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

  renderFishingList() {
    const {fishingList, isLoading} = this.props;
    let placeholder;

    if (isLoading)
      placeholder = <Spin size="large" tip="正在加载游戏列表..." />;
    else if (!fishingList.length) placeholder = '暂无内容！';

    if (placeholder)
      return <div className={css.fishing_catalogueNoItem}>{placeholder}</div>;
    return (
      <div className={css.fishing_catalogue}>
        {fishingList.map(
          (
            {
              categoryId,
              gamePlatform,
              gameId: fishingId,
              name,
              status,
              icon,
              smallPlatformIcon,
            },
            index,
          ) => {
            if (!fishingId) {
              return <span key={`${index + categoryId}-span`} />;
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
              <div key={`${fishingId}-${index}`} className={css.fishingMargin}>
                <div
                  className={css.fishing_catalogueItem}
                  key={`${index}-${categoryId}-fishinglist-${name}`}>
                  <div className={css.fishing_canvas}>
                    <button
                      type="button"
                      className={css.fishing_canvasBtn}
                      onClick={onClick}>
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
                      <div className={css.startGame}>开始游戏</div>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClick}
                  className={css.fishing_catalogueName}>
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
        {this.renderFishingList()}
      </React.Fragment>
    );
  }
}

export default FishingCatalogue;
