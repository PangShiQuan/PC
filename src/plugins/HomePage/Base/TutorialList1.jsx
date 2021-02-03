import React from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import _ from 'lodash';
import classnames from 'classnames';

import css from 'styles/homepage/Base/tutorialList1.less';
import homeCss from 'styles/homepage/Base/homepageBody1.less';

class TutorialList extends React.Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  onQuestionClick({cateId, questionId}) {
    this.dispatch({
      type: 'helpCenterModel/updateState',
      payload: {selectedCategory: cateId, selectedQuestionId: questionId},
    });
    this.dispatch(routerRedux.push({pathname: '/helpcenter'}));
  }
  renderHelpListItem() {
    const {helpDocs} = this.props;
    const selectedDocs = _.find(helpDocs, ['cateName', '新手指南']);
    if (!selectedDocs) return null;
    const {helpList, cateId} = selectedDocs;
    if (!helpList.length) {
      return (
        <p className={css.tutorial_emptyMsg}>
          新手指南正在完善中，如有疑问，请联系在线客服
        </p>
      );
    }
    return _.map(helpList, (listItem, index) => {
      if (index > 3) return null;
      const {title, id} = listItem;
      return (
        <li key={id} className={css.tutorial_listItem}>
          <button
            onClick={this.onQuestionClick.bind(this, {
              cateId,
              questionId: id,
            })}>
            {title}
          </button>
        </li>
      );
    });
  }
  render() {
    return (
      <div className={homeCss.homePage_panel}>
        <h3
          className={classnames(
            homeCss.homePage_panelHeader,
            css.tutorial_header,
          )}>
          新手指南
        </h3>
        <ul className={css.tutorial_list}>{this.renderHelpListItem()}</ul>
      </div>
    );
  }
}

function mapStatesToProps({helpCenterModel}) {
  return {...helpCenterModel};
}

export default connect(mapStatesToProps)(TutorialList);
