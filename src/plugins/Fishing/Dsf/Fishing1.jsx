import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Row, Col, message} from 'antd';
import {Link, routerRedux, withRouter} from 'dva/router';
import ExternalPage from 'pages/External';
import {flattenPlatforms} from 'utils';
import {PLATFORM, PLATFORM_TYPE} from 'utils/type.config';
import css from 'styles/fishing/index1.less';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import classnames from 'classnames';
import SVG from 'react-inlinesvg';
import leftArrowIcn from 'assets/image/cardGameListing/gameTabArrow/icn_left_arrow.svg';
import rightArrowIcn from 'assets/image/cardGameListing/gameTabArrow/icn_right_arrow.svg';
import FishingCatalogue from './FishingCatalogue1';

const ON = 'ON';

class GameIndex extends Component {
  static isEnabledGame(vendor) {
    if (vendor.platforms) {
      return vendor.platforms.some(
        x =>
          x.platform === PLATFORM.FISH &&
          x.gamePlatformType === PLATFORM_TYPE.THIRD_PARTY &&
          x.status === ON,
      );
    }
    const {gamePlatformType, platform, status} = vendor;
    return (
      platform === PLATFORM.FISH &&
      gamePlatformType === PLATFORM_TYPE.THIRD_PARTY &&
      status === ON
    );
  }

  constructor(props) {
    super(props);
    this.slider = React.createRef();
    this.state = {
      numOfFishingVendor: null,
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    const platforms = GameIndex.getAvailablePlatforms(this.props);
    this.setState({numOfFishingVendor: platforms.length});

    if (platforms.length) {
      this.onPathnameChange(this.props, platforms);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: {fishingId},
      },
    } = nextProps;

    const {numOfFishingVendor} = this.state;
    const nextAvailablePlatforms = GameIndex.getAvailablePlatforms(nextProps);

    if (
      fishingId !== this.props.match.params.fishingId ||
      numOfFishingVendor !== nextAvailablePlatforms.length
    ) {
      this.onPathnameChange(nextProps, nextAvailablePlatforms);
      this.setState({numOfFishingVendor: nextAvailablePlatforms.length});
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  onPathnameChange(props, availablePlatforms) {
    const {
      gamePlatformList,
      match: {params},
    } = props;
    let displacePrevSelection = false;
    const {fishingId} = params;

    if (availablePlatforms.length) {
      if (
        fishingId &&
        !GameIndex.isEnabledGame(gamePlatformList[fishingId] || {})
      ) {
        displacePrevSelection = true;
      }
    }

    if (displacePrevSelection) {
      const {gameNameInChinese} = gamePlatformList[params.fishingId] || {};
      const msg = gameNameInChinese
        ? `${gameNameInChinese}已关闭`
        : `${params.fishingId}不存在`;

      message.info(`你所选择的${msg}, 将自动跳转至默认游戏`, 3);
    }

    if (!availablePlatforms.length) {
      this.dispatch(routerRedux.replace({pathname: '/fishing'}));
    } else {
      this.selectGame(fishingId || '');
    }
  }

  onGameClick = ({isDemo, fishingId, name, gamePlatform}) => {
    const {gamePlatformList} = this.props;
    const fishingBalance = gamePlatformList[gamePlatform].balance;
    const {itransEnabled} = gamePlatformList[gamePlatform];
    this.dispatch({
      type: 'fishingModel/updateState',
      payload: {
        isDemo,
        fishingId,
        fishingName: name,
        MODE: gamePlatform,
      },
    });

    if (fishingBalance > 0 || isDemo) {
      this.dispatch({type: 'fishingModel/postFishingLoginUrl'});
    } else if (itransEnabled === 'ON') {
      this.dispatch({type: 'fishingModel/postFishingLoginUrl'});
    } else {
      Modal.info({
        title: '余额不足',
        content: <span>尊敬的用户，进入游戏前必须确保账号内存有余额。</span>,
        onOk: () => {
          this.dispatch({
            type: 'layoutModel/updateState',
            payload: {
              profileSelectedNav: 'transferCtrl',
            },
          });
          this.dispatch(
            routerRedux.push({
              pathname: `/user`,
            }),
          );
        },
      });
    }
  };

  onFishingCategorySelect(fishingId) {
    this.clear();
    this.dispatch({
      type: 'fishingModel/updateState',
      payload: {
        MODE: fishingId,
      },
    });
    this.dispatch({
      type: fishingId
        ? 'fishingModel/getFullFishingListAndCategory'
        : 'fishingModel/getAllFishingListByCategory',
    });
    if (fishingId) {
      this.dispatch({
        type: 'playerModel/getBalanceOfGamePlatform',
        payload: {
          gamePlatform: fishingId,
        },
      });
    }
  }

  static getAvailablePlatforms({gamePlatforms}) {
    return flattenPlatforms(gamePlatforms).filter(GameIndex.isEnabledGame);
  }

  clear() {
    this.dispatch({
      type: 'fishingModel/initializeAll',
    });
  }

  selectGame(fishingId, autoSet) {
    this.dispatch({
      type: 'fishingModel/updateState',
      payload: {
        MODE: fishingId,
      },
    });
    this.onFishingCategorySelect(fishingId);

    if (autoSet)
      this.dispatch(routerRedux.replace({pathname: `/fishing/${fishingId}`}));
  }

  renderGameTabContent() {
    const {
      currentPage,
      fishingCategoryId,
      fishingList,
      fishingListandCategoryFull,
      fishingListCount,
      listIsLoading,
      pageSize,
      searchTerm,
    } = this.props;
    const catalogueProps = {
      currentPage,
      dispatch: this.dispatch,
      fishingCategoryId,
      fishingList,
      fishingListandCategoryFull,
      fishingListCount,
      isLoading: listIsLoading,
      searchTerm,
      onGameClick: this.onGameClick,
      pageSize,
    };

    return <FishingCatalogue {...catalogueProps} />;
  }

  renderGameTab() {
    const {
      dispatchUpdate,
      gamePlatforms,
      match: {
        params: {fishingId},
      },
      MODE,
    } = this.props;

    let countGameTabs = 0;
    let activeTabIndex = 0;

    const fishingTabItem = flattenPlatforms(gamePlatforms).map(
      ({gamePlatform, gamePlatformType, platform, status}) => {
        if (
          platform === PLATFORM.FISH &&
          gamePlatformType === PLATFORM_TYPE.THIRD_PARTY
        ) {
          const disabled = status !== ON;
          countGameTabs++;

          if (gamePlatform === fishingId) activeTabIndex = countGameTabs;

          return (
            <Col
              key={`${gamePlatform}top`}
              className={css.fishing_buttonTabOuter}
              data-active={gamePlatform === MODE}
              disabled={disabled}
              data-content="暂未开放，敬请期待">
              <Link
                key={`${gamePlatform}top`}
                value={gamePlatform}
                className={css.fishing_buttonTab}
                data-fishing={gamePlatform}
                onClick={dispatchUpdate}
                to={`/fishing/${gamePlatform}`}
                disabled={disabled}
              />
            </Col>
          );
        }

        return null;
      },
    );

    countGameTabs++;
    fishingTabItem.unshift(
      <Col
        key="ALL"
        className={css.fishing_buttonTabOuter}
        data-active={!MODE}
        data-content="暂未开放，敬请期待">
        <Link
          value="ALL"
          className={css.fishing_buttonTab}
          data-active={!MODE}
          data-fishing="ALL"
          onClick={dispatchUpdate}
          to="/fishing/"
        />
      </Col>,
    );

    const NextArrow = props => {
      const {className, style, onClick} = props;
      return (
        <button
          type="button"
          className={classnames(
            className,
            css.gameTabNextButton,
            className.includes('slick-disabled') ? css.disableButton : '',
          )}
          style={{...style}}
          onClick={onClick}>
          <SVG
            src={rightArrowIcn}
            className={classnames(css.rightArrowIcn, css.icon__svg)}
          />
        </button>
      );
    };

    const PrevArrow = props => {
      const {className, style, onClick} = props;
      return (
        <button
          type="button"
          className={classnames(
            className,
            css.gameTabPrevButton,
            className.includes('slick-disabled') ? css.disableButton : '',
          )}
          style={{...style}}
          onClick={onClick}>
          <SVG
            src={leftArrowIcn}
            className={classnames(css.leftArrowIcn, css.icon__svg)}
          />
        </button>
      );
    };

    if (countGameTabs > 5) {
      const gameTabSliderSetting = {
        className: css.gameTabSliderSetting,
        draggable: false,
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        initialSlide:
          activeTabIndex > countGameTabs - 5
            ? countGameTabs - 5
            : activeTabIndex,
      };

      if (this.slider.current) {
        this.slider.current.slickGoTo(
          activeTabIndex > countGameTabs - 5
            ? countGameTabs - 5
            : activeTabIndex,
        );
      }
      return (
        <Row
          className={classnames(css.fishing_buttonTabGroup, css.sliderWrapper)}>
          <Slider ref={this.slider} {...gameTabSliderSetting}>
            {fishingTabItem}
          </Slider>
        </Row>
      );
    }

    return <Row className={css.fishing_buttonTabGroup}>{fishingTabItem}</Row>;
  }

  render() {
    return (
      <div className={css.fishing}>
        <div className={css.fishing_outer}>
          <div className={css.fishing_topWord} />
          {this.renderGameTab()}
          <Row className={css.fishing_body}>{this.renderGameTabContent()}</Row>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({fishingModel, playerModel}) {
  const {gamePlatformList} = playerModel;

  return {
    gamePlatformList,
    ...fishingModel,
  };
}

const component = connect(mapStatesToProps)(GameIndex);

function Game(props) {
  return <ExternalPage component={component} componentProps={props} />;
}

export default withRouter(Game);
