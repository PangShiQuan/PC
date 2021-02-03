import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Row, Col, message} from 'antd';
import {Link, routerRedux, withRouter} from 'dva/router';
import ExternalPage from 'pages/External';
import {flattenPlatforms} from 'utils';
import {PLATFORM, PLATFORM_TYPE} from 'utils/type.config';
import css from 'styles/cards/index1.less';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import classnames from 'classnames';
import SVG from 'react-inlinesvg';
import leftArrowIcn from 'assets/image/cardGameListing/gameTabArrow/icn_left_arrow.svg';
import rightArrowIcn from 'assets/image/cardGameListing/gameTabArrow/icn_right_arrow.svg';
import CardCatalogue from './CardCatalogue1';

const ON = 'ON';

class GameIndex extends Component {
  static isEnabledGame(vendor) {
    if (vendor.platforms) {
      return vendor.platforms.some(
        x =>
          x.platform === PLATFORM.CARD &&
          x.gamePlatformType === PLATFORM_TYPE.THIRD_PARTY &&
          x.status === ON,
      );
    }
    const {gamePlatformType, platform, status} = vendor;
    return (
      platform === PLATFORM.CARD &&
      gamePlatformType === PLATFORM_TYPE.THIRD_PARTY &&
      status === ON
    );
  }

  constructor(props) {
    super(props);
    this.slider = React.createRef();
    this.state = {
      numOfCardVendor: null,
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    const platforms = GameIndex.getAvailablePlatforms(this.props);
    this.setState({numOfCardVendor: platforms.length});

    if (platforms.length) {
      this.onPathnameChange(this.props, platforms);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: {cardId},
      },
    } = nextProps;

    const {numOfCardVendor} = this.state;
    const nextAvailablePlatforms = GameIndex.getAvailablePlatforms(nextProps);
    if (
      cardId !== this.props.match.params.cardId ||
      numOfCardVendor !== nextAvailablePlatforms.length
    ) {
      this.onPathnameChange(nextProps, nextAvailablePlatforms);
      this.setState({numOfCardVendor: nextAvailablePlatforms.length});
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
    const {cardId} = params;

    if (availablePlatforms.length) {
      if (cardId && !GameIndex.isEnabledGame(gamePlatformList[cardId] || {})) {
        displacePrevSelection = true;
      }
    }

    if (displacePrevSelection) {
      const {gameNameInChinese} = gamePlatformList[params.cardId] || {};
      const msg = gameNameInChinese
        ? `${gameNameInChinese}已关闭`
        : `${params.cardId}不存在`;

      message.info(`你所选择的${msg}, 将自动跳转至默认游戏`, 3);
    }

    if (!availablePlatforms.length) {
      this.dispatch(routerRedux.replace({pathname: '/cards'}));
    } else {
      this.selectGame(cardId || '');
    }
  }

  onGameClick = ({isDemo, cardId, name, gamePlatform}) => {
    const {gamePlatformList} = this.props;
    const cardBalance = gamePlatformList[gamePlatform].balance;
    const {itransEnabled} = gamePlatformList[gamePlatform];
    this.dispatch({
      type: 'cardModel/updateState',
      payload: {
        isDemo,
        cardId,
        cardName: name,
        MODE: gamePlatform,
      },
    });

    if (cardBalance > 0 || isDemo) {
      this.dispatch({type: 'cardModel/postCardLoginUrl'});
    } else if (itransEnabled === 'ON') {
      this.dispatch({type: 'cardModel/postCardLoginUrl'});
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

  onCardCategorySelect(cardId) {
    this.clear();
    this.dispatch({
      type: 'cardModel/updateState',
      payload: {
        MODE: cardId,
      },
    });
    this.dispatch({
      type: cardId
        ? 'cardModel/getFullCardListAndCategory'
        : 'cardModel/getAllCardListByCategory',
    });
    if (cardId) {
      this.dispatch({
        type: 'playerModel/getBalanceOfGamePlatform',
        payload: {
          gamePlatform: cardId,
        },
      });
    }
  }

  static getAvailablePlatforms({gamePlatforms}) {
    return flattenPlatforms(gamePlatforms).filter(GameIndex.isEnabledGame);
  }

  clear() {
    this.dispatch({
      type: 'cardModel/initializeAll',
    });
  }

  selectGame(cardId, autoSet) {
    this.dispatch({
      type: 'cardModel/updateState',
      payload: {
        MODE: cardId,
      },
    });
    this.onCardCategorySelect(cardId);

    if (autoSet)
      this.dispatch(routerRedux.replace({pathname: `/cards/${cardId}`}));
  }

  renderGameTabContent() {
    const {
      currentPage,
      cardCategoryId,
      cardList,
      cardListandCategoryFull,
      cardListCount,
      listIsLoading,
      pageSize,
      searchTerm,
    } = this.props;
    const catalogueProps = {
      currentPage,
      dispatch: this.dispatch,
      cardCategoryId,
      cardList,
      cardListandCategoryFull,
      cardListCount,
      isLoading: listIsLoading,
      searchTerm,
      onGameClick: this.onGameClick,
      pageSize,
    };

    return <CardCatalogue {...catalogueProps} />;
  }

  renderGameTab() {
    const {
      dispatchUpdate,
      gamePlatforms,
      match: {
        params: {cardId},
      },
      MODE,
    } = this.props;

    let countGameTabs = 0;
    let activeTabIndex = 0;

    const cardTabItem = flattenPlatforms(gamePlatforms).map(
      ({gamePlatform, gamePlatformType, platform, status}) => {
        if (
          platform === PLATFORM.CARD &&
          gamePlatformType === PLATFORM_TYPE.THIRD_PARTY
        ) {
          const disabled = status !== ON;
          countGameTabs++;

          if (gamePlatform === cardId) activeTabIndex = countGameTabs;

          return (
            <Col
              key={`${gamePlatform}top`}
              className={css.card_buttonTabOuter}
              data-active={gamePlatform === MODE}
              disabled={disabled}
              data-content="暂未开放，敬请期待">
              <Link
                key={`${gamePlatform}top`}
                value={gamePlatform}
                className={css.card_buttonTab}
                data-card={gamePlatform}
                onClick={dispatchUpdate}
                to={`/cards/${gamePlatform}`}
                disabled={disabled}
              />
            </Col>
          );
        }

        return null;
      },
    );

    countGameTabs++;
    cardTabItem.unshift(
      <Col
        key="ALL"
        className={css.card_buttonTabOuter}
        data-active={!MODE}
        data-content="暂未开放，敬请期待">
        <Link
          value="ALL"
          className={css.card_buttonTab}
          data-active={!MODE}
          data-card="ALL"
          onClick={dispatchUpdate}
          to="/cards/"
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
        <Row className={classnames(css.card_buttonTabGroup, css.sliderWrapper)}>
          <Slider ref={this.slider} {...gameTabSliderSetting}>
            {cardTabItem}
          </Slider>
        </Row>
      );
    }

    return <Row className={css.card_buttonTabGroup}>{cardTabItem}</Row>;
  }

  render() {
    return (
      <div className={css.card}>
        <div className={css.card_outer}>
          <div className={css.card_topWord} />
          {this.renderGameTab()}
          <Row className={css.card_body}>{this.renderGameTabContent()}</Row>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({cardModel, playerModel}) {
  const {gamePlatformList} = playerModel;

  return {
    gamePlatformList,
    ...cardModel,
  };
}

const component = connect(mapStatesToProps)(GameIndex);

function Game(props) {
  return <ExternalPage component={component} componentProps={props} />;
}

export default withRouter(Game);
