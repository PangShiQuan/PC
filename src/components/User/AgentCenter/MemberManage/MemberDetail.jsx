import React, {Component} from 'react';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import {LoadingBar, MDIcon} from 'components/General';

class MemberDetails extends Component {
  render() {
    const {applyTarget} = this.props;
    return (
      <div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            <button
              onClick={this.onBackClick}
              className={css.profile_breadcrumItem__main}>
              我的用户列表
            </button>
            <span disabled className={css.profile_breadcrumItem}>
              <MDIcon iconName="chevron-right" />
              <i> {applyTarget}用户详情</i>
            </span>
            <LoadingBar isLoading={this.awaitingResponse} />
          </h4>
        </div>
      </div>
    );
  }
}

export default MemberDetails;
