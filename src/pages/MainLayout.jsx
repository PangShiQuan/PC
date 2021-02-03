import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {Row} from 'antd';
import _ from 'lodash';
import Footer from 'components/Footer';
import PopupNotice from 'components/HomePage/PopupNotice';
import Hongbao from 'components/HomePage/Hongbao';
import {PageLoading} from 'components/General/';
import css from 'styles/pages/index.less';
import {url} from 'utils';
import resolve from 'clientResolver';
import {PATH_BINDING, version} from 'config';

const Header = resolve.plugin('Header');
const FloatWindows = resolve.client('components/HomePage/FloatWindows');
const PAGE_BG = {};

if (PATH_BINDING.PAGE_BG) {
  Object.entries(PATH_BINDING.PAGE_BG).forEach(([path, asset]) => {
    PAGE_BG[path] = resolve.client(asset);
  });
}

class MainLayout extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showSiteMap: false,
      showDisclaimer: false,
      showFloatWindows: false,
      sitemapBgColor: 'white',
      disclaimerBgColor: 'white',
      headPath: '',
      layoutWrapperHeight: 0,
    };
    this.dispatch = props.dispatch;
    this.parentRef = React.createRef();
    this.layoutWrapper = React.createRef();
  }

  componentDidMount() {
    this.dispatch({
      type: 'gameInfosModel/getHomepageInfo',
    });
    this.setPageView(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pathname !== this.props.pathname) {
      this.setPageView(nextProps);
    }
    if (
      this.props.pcOtherInfo !== nextProps.pcOtherInfo &&
      nextProps.pcOtherInfo.siteName
    ) {
      document.title = nextProps.pcOtherInfo.siteName;
    }
    if (
      this.props.gameInfos !== nextProps.gameInfos &&
      nextProps.gameInfos.length &&
      !this.props.currentResults
    ) {
      this.dispatch({type: 'gameInfosModel/getCurrentResults'});
    }
  }

  setPageView(props) {
    let showSiteMap = false;
    let sitemapBgColor = 'gray';
    const headPath = url.basePath(props.pathname);
    const floatWindowsPaths = [
      '/',
      '/result',
      '/mobilesite',
      '/promotions',
      '/noticelist',
      '/cards',
      '/games',
      '/fishing',
      '/sports',
      '/realis',
    ];
    const showFloatWindows = floatWindowsPaths.includes(headPath);
    let disclaimerBgColor = 'black';
    let showDisclaimer = false;

    if (version === 'Dsf') {
      switch (headPath) {
        case 'gameresults':
          showDisclaimer = true;
          disclaimerBgColor = 'white';
          break;
        case '/':
        case '/trends':
        case '/promotions':
        case '/welfarecenter':
        case '/result':
        case '/helpcenter':
        case '/instructions':
        case '/noticelist':
        case '/noticedetail':
        case '/mobilesite':
        case '/games':
        case '/cards':
        case '/fishing':
        case '/sports':
        case '/realis':
        case '/user':
          showDisclaimer = true;
          break;
        default:
          break;
      }
    }
    if (version === 'Base') {
      switch (headPath) {
        case '/':
          showSiteMap = true;
          showDisclaimer = true;
          sitemapBgColor = 'white';
          break;
        case '/gameresults':
          showDisclaimer = true;
          disclaimerBgColor = 'white';
          break;
        case '/trends':
        case '/promotions':
        case '/welfarecenter':
        case '/result':
        case '/helpcenter':
        case '/instructions':
        case '/noticelist':
        case '/noticedetail':
        case '/mobilesite':
        case '/user':
          showDisclaimer = true;
          break;
        default:
          break;
      }
    }
    this.setState({
      showSiteMap,
      showDisclaimer,
      showFloatWindows,
      sitemapBgColor,
      disclaimerBgColor,
      headPath,
    });
  }

  renderFloatWindows(props) {
    const {showFloatWindows} = this.state;
    if (showFloatWindows) return <FloatWindows {...props} />;
    return null;
  }

  render() {
    const {isGlobalLoading, pathname} = this.props;
    const {headPath, ...footerAttr} = this.state;
    const paths = pathname.split('/');
    const extraAttr = {
      paths,
    };
    if (headPath === 'sports') {
      extraAttr.minPageWidth = '64.3rem';
    }
    if (headPath === 'realis') {
      extraAttr.minPageWidth = '64.3rem';
    }

    if (this.layoutWrapper.current) {
      this.setState({
        layoutWrapperHeight: this.layoutWrapper.current.offsetHeight,
      });
    }

    return (
      <div
        className={css.layout}
        data-pathname={paths.join(' ')}
        ref={this.layoutWrapper}>
        <div className={css.pages}>
          <Header {...extraAttr} />
          <Row
            className={paths[1] === 'user' ? css.userBg : css.promotionBg}
            style={
              extraAttr.minPageWidth ? {minWidth: extraAttr.minPageWidth} : null
            }>
            {this.props.children}
          </Row>
        </div>
        <Footer {...footerAttr} {...extraAttr} />
        {this.renderFloatWindows({
          float: 'left',
          osType: 'ios',
          osName: '苹果',
        })}
        {this.renderFloatWindows({
          float: 'right',
          osType: 'android',
          osName: '安卓',
        })}
        <PopupNotice />
        <PageLoading isLoading={isGlobalLoading && pathname !== '/'} />
        <Hongbao
          indexLayoutHeight={this.state.layoutWrapperHeight}
          pathname={pathname}
        />
      </div>
    );
  }
}

function mapStatesToProps({
  userModel,
  trendModel,
  helpCenterModel,
  transferModel,
  orderModel,
  transactionModel,
  teamModel,
  reportModel,
  feedbackModel,
  statisticsReportModel,

  routing,
  loading,
  gameInfosModel,
}) {
  const {
    location: {pathname},
  } = routing;
  const {awaitingResponse: userAwaitingResponse} = userModel;
  const {awaitingResponse: trendAwaitingResponse} = trendModel;
  const {awaitingResponse: helpAwaitingResponse} = helpCenterModel;
  const {awaitingResponse: transferAwaitingResponse} = transferModel;
  const {awaitingResponse: orderAwaitingResponse} = orderModel;
  const {awaitingResponse: transactionAwaitingResponse} = transactionModel;
  const {awaitingResponse: teamAwaitingResponse} = teamModel;
  const {awaitingResponse: reportAwaitingResponse} = reportModel;
  const {awaitingResponse: feedbackAwaitingResponse} = feedbackModel;
  const {awaitingResponse: statisticsAwaitingResponse} = statisticsReportModel;
  const {global, models} = loading;
  const {currentResults, gameInfos} = gameInfosModel;
  let globalLoading = global;

  // if only chatbox laoding then hide global loading
  if (
    global &&
    models.chatboxModel &&
    Object.keys(_.pickBy(models, model => model === true)).length
  ) {
    globalLoading = false;
  }

  return {
    currentResults,
    gameInfos,
    pathname,
    pcOtherInfo: gameInfosModel.pcOtherInfo,
    isGlobalLoading:
      globalLoading ||
      userAwaitingResponse ||
      trendAwaitingResponse ||
      helpAwaitingResponse ||
      transferAwaitingResponse ||
      orderAwaitingResponse ||
      transactionAwaitingResponse ||
      teamAwaitingResponse ||
      reportAwaitingResponse ||
      feedbackAwaitingResponse ||
      statisticsAwaitingResponse,
  };
}

export default connect(mapStatesToProps)(MainLayout);
