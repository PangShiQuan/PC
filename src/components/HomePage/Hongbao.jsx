import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';

import resolve from 'clientResolver';
import css from 'styles/homepage/hongbao.less';
import {getHongbaoLink, type as TYPE} from 'utils';
import SVG from 'react-inlinesvg';
import closeIc from 'assets/image/hongbao/closeic.svg';
import classnames from 'classnames';

const eventImgGif = resolve.client('assets/image/event-btn.gif');
const eventImg = resolve.client('assets/image/event-btn.png');

class Hongbao extends Component {
  constructor(props) {
    super(props);
    this.state={
      hongbaoClose: false,
      hongbaoPosAbsolute: false,
      layoutHeight: 0,
      currentPath: '/',
    }

    this.dispatch = props.dispatch;

    this.handleResize = this.handleResize.bind(this);
    this.handleClose = this.handleClose.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps) {
    const {accessToken, deviceToken, redirectTo, indexLayoutHeight, pathname} = nextProps;

    if (
      redirectTo === 'hongbao' &&
      accessToken !== null &&
      this.props.accessToken !== accessToken
    ) {
      this.redirectOnAuthenticated({
        link: getHongbaoLink(accessToken, deviceToken),
        // pathname: 'hongbao',
        // query: {
        //   accessToken,
        //   deviceToken,
        // },
      });
    }

    if(indexLayoutHeight){
      this.setState({
        layoutHeight: indexLayoutHeight
      })
      this.handleResize(indexLayoutHeight);
    }
    
    if(pathname === '/'){
      this.setState({
        hongbaoClose: false,
        currentPath: pathname
      })
    }else{
      const paths = pathname.split('/');
      if(paths[1] != this.state.currentPath){
        this.setState({
          hongbaoClose: false,
          currentPath: paths[1]
        })
      }
    }
  }

  redirectOnAuthenticated = ({link, query, pathname}) => {
    if (link) {
      const windFeatures =
        'menubar,toolbar,location,personalbar,status,minimizable,resizable,scrollbars';
      const wind = window.open(link, 'hongbao', windFeatures);
      this.dispatch({
        type: 'layoutModel/initializeState',
        payload: ['redirectTo'],
      });
      if (wind === null)
        this.dispatch({
          type: 'formModel/postWarnMessage',
          payload: {
            msg:
              '浏览器无法打开跳转页面，请先解除浏览器对弹出窗口的拦阻或手动导航.',
          },
        });
    } else {
      this.dispatch(
        routerRedux.push({
          pathname,
          query,
        }),
      );
    }
  };

  handleLogin = event => {
      const redirectTo = event.currentTarget.getAttribute('data-to') || null;

      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          redirectTo,
          shouldShowAuthModel: true,
        },
      });
      this.dispatch({
        type: 'userModel/updateState',
        payload: {authenticationState: TYPE.LOGIN},
      });
  };

  handleClose = event => {
    this.setState({
      hongbaoClose:true
    })
  }

  handleResize(indexLayoutHeight){
    if(typeof(indexLayoutHeight) === 'number'){
      if(indexLayoutHeight < window.innerHeight ){
        this.setState({
          hongbaoPosAbsolute:true
        })
      }else{
        this.setState({
          hongbaoPosAbsolute:false
        })
      }
    }else{
      if(this.state.layoutHeight < window.innerHeight){
        this.setState({
          hongbaoPosAbsolute:true
        })
      }else{
        this.setState({
          hongbaoPosAbsolute:false
        })
      }
    }
  }

  renderHongbaoBtn() {
    const {currentRoute, accessToken, deviceToken, chatboxData} = this.props;
    const instructionsPage =
      currentRoute && currentRoute.pathname === '/instructions';

    if (accessToken) {
      return (
        <div className={
          classnames(
            css.hongbaoWrapper,
            this.state.hongbaoPosAbsolute? css.posAbs:'',
            this.state.hongbaoClose? css.hide:'',
            chatboxData.showChatbox? css.showChatbox:'',
            chatboxData.expandChatbox? css.expandChatbox:'',
            )
          }>
          <a
            draggable
            href={getHongbaoLink(accessToken, deviceToken)}
            target="_blank"
            rel="noopener noreferrer"
            className={
              classnames(
                instructionsPage ? css.eventButtonInstructions : css.eventButton,
                css.hongbaoImageWrapper
              )
            }>
            <img src={eventImgGif || eventImg} alt="活动" />
          </a>
            <div
              className={css.hongbaoClose}
              onClick={this.handleClose}
              >
              <SVG
                src={closeIc}
                className={classnames(css.closeIcon, css.icon__svg)}>
              </SVG>
            </div>
        </div>
      );
    }
    
    return (
      <div className={
          classnames(
            css.hongbaoWrapper,
            this.state.hongbaoPosAbsolute? css.posAbs:'',
            this.state.hongbaoClose? css.hide:'',
            chatboxData.showChatbox? css.showChatbox:'',
            chatboxData.expandChatbox? css.expandChatbox:'',
          )
        }>
        <button
          className={
            classnames(
              instructionsPage ? css.eventButtonInstructions : css.eventButton,
              css.hongbaoImageWrapper
            )
          }
          type="button"
          onClick={this.handleLogin}
          data-to="hongbao"
          >
          <img draggable="false" src={eventImgGif || eventImg} alt="活动" />
        </button>
        <div
          className={css.hongbaoClose}
          onClick={this.handleClose}
          >
            <SVG
              src={closeIc}
              className={classnames(css.closeIcon, css.icon__svg)}>
            </SVG>
          </div>
      </div>
    );
  }

  render() {
    const {shouldHongbaoDisplay} = this.props;
    if (shouldHongbaoDisplay) {
      return this.renderHongbaoBtn();
    }
    return null;
  }
}

function mapStatesToProps({routing, layoutModel, appModel, userModel, chatboxModel}) {
  return {
    currentRoute: routing.location,
    deviceToken: appModel.deviceToken,
    accessToken: userModel.accessToken,
    redirectTo: layoutModel.redirectTo,
    shouldHongbaoDisplay: layoutModel.shouldHongbaoDisplay,
    chatboxData: chatboxModel,
  };
}

export default connect(mapStatesToProps)(Hongbao);
