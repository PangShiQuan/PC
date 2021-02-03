import React, {PureComponent} from 'react';
import moment from 'moment';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {connect} from 'dva';
import _ from 'lodash';
import {MDIcon} from 'components/General';
import css from 'styles/homepage/popupNotice.less';

class PopupNotice extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedNotice: '',
      concatContent: true,
    };
    this.dispatch = props.dispatch;
  }
  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.popupAnnouncements !== this.props.popupAnnouncements ||
        nextProps.shouldShowPopupModal !== this.props.shouldShowPopupModal) &&
      nextProps.shouldShowPopupModal
    ) {
      this.setModalInfo(nextProps);
    } else {
      document.body.style.overflow = '';
    }
  }
  componentWillUnmount() {
    document.body.style.overflow = '';
  }
  onTitleSelect = ({currentTarget}) => {
    let {notice} = currentTarget.dataset;

    if (!currentTarget.dataset) notice = currentTarget.getAttribute('data-notice');

    this.setState({selectedNotice: JSON.parse(notice)});
  };
  setModalInfo = props => {
    if (props.popupAnnouncements.length) {
      const {popupAnnouncements} = props;
      _.sortBy(popupAnnouncements, ['sequence']);
      this.setState({selectedNotice: popupAnnouncements[0]});
      document.body.style.overflow = 'hidden';
    }
  };
  hideModal = () => {
    this.dispatch({
      type: 'layoutModel/hidePopupNotice',
    });
    document.body.style.overflow = '';
  };
  renderList() {
    const {popupAnnouncements} = this.props;
    if (popupAnnouncements) {
      return popupAnnouncements.map(listItem => {
        const {createTime, title} = listItem;
        const itemActive = title === this.state.selectedNotice.title;
        return (
          <li
            key={createTime}
            className={
              itemActive
                ? css.popupNotice_listItem__active
                : css.popupNotice_listItem
            }>
            <button
              onClick={this.onTitleSelect}
              data-notice={JSON.stringify(listItem || '')}>
              {title}
            </button>
          </li>
        );
      });
    }
    return null;
  }
  renderMask = () => (
    <CSSTransition
      className={css.popupNotice_mask}
      classNames={{
        enter: css.popupNotice_mask__enter,
        enterActive: css.popupNotice_mask__enterActive,
        exit: css.popupNotice_mask__exit,
        exitActive: css.popupNotice_mask__exitActive,
      }}
      timeout={250}>
      <div />
    </CSSTransition>
  );

  renderModalContent = () => (
    <CSSTransition
      className={css.popupNotice_wrap}
      classNames={{
        enter: css.popupNotice_wrap__enter,
        enterActive: css.popupNotice_wrap__enterActive,
        exit: css.popupNotice_wrap__exit,
        exitActive: css.popupNotice_wrap__exitActive,
      }}
      timeout={300}>
      <div>
        <div className={css.popupNotice_modalBody}>
          <div className={css.popupNotice_header}>
            <MDIcon />
            <span className={css.popupNotice_headerSpan}>平台公告</span>
            <button
              className={css.popupNotice_closeBtn}
              onClick={this.hideModal}>
              <MDIcon iconName="close" />
            </button>
          </div>
          <ul className={css.popupNotice_list}>{this.renderList()}</ul>
          <div className={css.popupNotice_content}>
            <h3 className={css.popupNotice_contentTitle}>
              {this.state.selectedNotice.title}
            </h3>
            <p className={css.popupNotice_contentParagraph}>
              {this.state.selectedNotice.content}
            </p>
            <p className={css.popupNotice_contentIssueTime}>
              日期：{moment(this.state.selectedNotice.issueTime).format(
                'YYYY年 MMM Do',
              )}
            </p>
          </div>
        </div>
      </div>
    </CSSTransition>
  );

  render() {
    if (this.state.selectedNotice && this.props.shouldShowPopupModal)
      return (
        <TransitionGroup>
          {this.renderMask()}
          {this.renderModalContent()}
        </TransitionGroup>
      );

    return null;
  }
}

const mapStatesToProps = ({gameInfosModel, layoutModel}) => ({
  popupAnnouncements: gameInfosModel.popupAnnouncements,
  shouldShowPopupModal: layoutModel.shouldShowPopupModal,
});

export default connect(mapStatesToProps)(PopupNotice);
