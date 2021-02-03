import React, {Component, Fragment} from 'react';
import {map} from 'lodash';
import {connect} from 'dva';
import {Row, Col, Spin} from 'antd';
import moment from 'moment';
import scrollIntoView from 'scroll-into-view';
import {type as TYPE} from 'utils';
import css from 'styles/promotions/Dsf/promotions2.less';
import resolve from 'clientResolver';

const arrowIcon = resolve.client('assets/image/arrowIcon.png');

class Promotion extends Component {
  static defaultProps = {
    categories: [
      {categoryId: 'ALL', categoryName: '全部活动'},
      {categoryId: 'DEPOSIT', categoryName: '存款优惠'},
      {categoryId: 'REFUND', categoryName: '返利优惠'},
      {categoryId: 'OTHERS', categoryName: '其他优惠'},
    ],
  };

  constructor(props) {
    super(props);
    this.state = {
      contentLoading: false,
      framesHeight: {},
      loadedContent: [],
    };
    this.dispatch = props.dispatch;
    this.promotionListDiv = [];
    this.onSideBarClick = this.onSideBarClick.bind(this);
    this.onPromoClick = this.onPromoClick.bind(this);
  }

  componentWillMount() {
    this.dispatch({type: 'promotionsModel/getSpecialOfferList'});
  }

  componentDidMount() {
    window.addEventListener('message', this.setContentHeight, false);
  }

  componentDidUpdate(prevProps) {
    const {hash = '', promotionList, selectedPromotion} = this.props;
    const promoId = hash.replace('#', '');
    const thisPromo = this.promotionListDiv[promoId];

    if (
      promotionList &&
      ((prevProps.selectedPromotion !== promoId &&
        selectedPromotion !== promoId) ||
        !prevProps.promotionList) &&
      hash &&
      thisPromo
    ) {
      this.onPromoClick({currentTarget: thisPromo});
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.setContentHeight);
    this.dispatch({
      type: 'promotionsModel/initializeState',
      payload: ['selectedCategory', 'selectedPromotion'],
    });
  }

  onContentLoad = () => {
    this.setState({contentLoading: false});
  };

  onSideBarClick({currentTarget}) {
    const {value} = currentTarget;
    this.dispatch({
      type: 'promotionsModel/updateState',
      payload: {selectedCategory: value},
    });
  }

  onKeyUp = event => {};

  onPromoClick({currentTarget}) {
    const {
      promotionList: {datas},
      selectedPromotion,
    } = this.props;
    let {id} = currentTarget;

    window.location.hash = id;

    if (id === selectedPromotion) id = '';
    else {
      const promotion = datas.find(data => data.id === id);
      const {loadedContent} = this.state;

      if (promotion.photoWeb && !loadedContent.includes(id)) {
        this.setState({
          contentLoading: true,
          loadedContent: loadedContent.concat(id),
        });
      }

      scrollIntoView(currentTarget.parentElement, {
        time: 300,
        // easeInSine
        ease: easeValue =>
          1 + Math.sin((Math.PI / 2) * easeValue - Math.PI / 2),
        align: {
          top: 0.02,
        },
      });
    }
    this.dispatch({
      type: 'promotionsModel/updateState',
      payload: {selectedPromotion: id},
    });
  }

  setContentHeight = event => {
    if (event.data && event.data.height) {
      const {framesHeight} = this.state;
      const iframeElements = document.getElementsByTagName('iframe');
      const target = Array.from(iframeElements).find(
        frameElement => frameElement.contentWindow === event.source,
      );

      if (target) {
        framesHeight[target.src] = event.data.height + 21;
        this.setState({framesHeight});
      }
    }
  };

  renderSideBar() {
    const {categories, selectedCategory} = this.props;
    return (
      <div className={css.promotions_sideBar}>
        {categories.map((category, index) => {
          const {categoryName, categoryId} = category;
          return (
            <button
              type="button"
              className={css.promotions_sideBarBtn}
              key={categoryId}
              data-active={categoryId === selectedCategory}
              value={categoryId}
              onClick={this.onSideBarClick}>
              {categoryId === selectedCategory ? (
                <img src={arrowIcon} className={css.arrowIcon} />
              ) : null}
              <span className={css.btnName}>{categoryName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  renderEmbeddedContent({
    content = '',
    issueTime,
    title,
    isSelected,
    photoWeb,
    id,
  }) {
    const {contentLoading, framesHeight, loadedContent} = this.state;
    const commonAttr = 'allow-popups allow-popups-to-escape-sandbox';
    let Content = null;

    if (photoWeb) {
      const props =
        isSelected || loadedContent.includes(id) ? {src: photoWeb} : {};
      Content = (
        <Spin
          size="large"
          tip="正在加载页面..."
          spinning={contentLoading}
          className={css.loading}>
          <div
            className={css.promotions_embed}
            style={{height: framesHeight[photoWeb]}}>
            <iframe
              title={title}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox={
                ['activity', 'promotion'].some(el => photoWeb.includes(el)) // 管端设置的优惠活动详情地址含有此字段, 有点不靠谱
                  ? `allow-scripts allow-same-origin ${commonAttr}`
                  : commonAttr
              }
              onLoad={this.onContentLoad}
              allowFullScreen
              className={css.promotions_embed_item}
              {...props}
            />
          </div>
        </Spin>
      );
    } else
      Content = (
        <div className={css.promotions_itemHtml}>
          <div dangerouslySetInnerHTML={{__html: content}} />
        </div>
      );

    return (
      <div className={css.promotions_itemContent} data-expanded={isSelected}>
        <div className={css.promotions_itemHeader}>
          <span className={css.promotions_itemTitle}>{title}</span>
          {!issueTime ? null : (
            <span className={css.promotions_itemDate}>
              发布时间：{moment(issueTime * 1000).format(TYPE.dateFormat)}
            </span>
          )}
        </div>

        {Content}
      </div>
    );
  }

  renderContent() {
    const {selectedCategory, selectedPromotion, promotionList} = this.props;
    if (!promotionList) return null;
    const {datas} = promotionList;

    return (
      <div className={css.promotions_contentColumn}>
        {map(datas, (item, index) => {
          const {title, photoMobile, summary, id} = item;
          const isShow =
            summary === selectedCategory || selectedCategory === 'ALL';
          return isShow ? (
            <div className={css.promotions_item} key={`${index}__${title}`}>
              <div
                id={id}
                ref={ref => {
                  this.promotionListDiv[id] = ref;
                }}
                role="tab"
                tabIndex={index}
                className={css.promotions_itemImage}
                onKeyUp={this.onKeyUp}
                onClick={this.onPromoClick}
                style={{backgroundImage: `url(${photoMobile})`}}
              />
              {this.renderEmbeddedContent({
                ...item,
                isSelected: selectedPromotion === id,
              })}
            </div>
          ) : null;
        })}
      </div>
    );
  }

  render() {
    const {pcPromotionTopImage} = this.props;
    return (
      <Fragment>
        <Row
          className={css.promotions_banner}
          style={{backgroundImage: `url(${pcPromotionTopImage})`}}
        />
        <div className={css.promotions_body}>
          {this.renderSideBar()}
          <Row className={css.promotions_contentRow}>
            {this.renderContent()}
          </Row>
        </div>
      </Fragment>
    );
  }
}

function mapStateToProps({promotionsModel, routing}) {
  const {
    location: {hash},
  } = routing;

  return {...promotionsModel, hash};
}

export default connect(mapStateToProps)(Promotion);
