import React, {Component} from 'react';
import {connect} from 'dva';
import {Collapse} from 'antd';
import {LoadingBar} from 'components/General';
import css from 'styles/HelpCenter/HelpCenter.less';

const {Panel} = Collapse;

class HelpCenterBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sideNavItems: [],
    };
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({
      type: 'helpCenterModel/getHelpList',
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.helpDocs !== this.props.helpDocs) {
      this.setDefaultCategory(nextProps);
    }
  }
  componentWillUnmount() {
    this.dispatch({
      type: 'helpCenterModel/initializeState',
      payload: ['selectedCategory', 'selectedQuestionId'],
    });
  }
  onChange = key => {
    this.dispatch({
      type: 'helpCenterModel/updateState',
      payload: {selectedQuestionId: key},
    });
  };
  onHelpCategoryClick = ({currentTarget}) => {
    const selectedCategory = parseInt(
      (currentTarget.dataset && currentTarget.dataset.cate) ||
        currentTarget.getAttribute('data-cate'),
    );

    this.dispatch({
      type: 'helpCenterModel/initializeState',
      payload: ['selectedQuestionId'],
    });
    this.dispatch({
      type: 'helpCenterModel/updateState',
      payload: {selectedCategory},
    });
  };
  setDefaultCategory = ({helpDocs, selectedCategory}) => {
    let sideNavItems = [];
    if (helpDocs) {
      sideNavItems = helpDocs.map(({cateName, cateId}) => ({
        cateName,
        cateId,
      }));
      if (!selectedCategory) {
        const defaultItem = sideNavItems[0];
        const defaultId = defaultItem.cateId;
        this.dispatch({
          type: 'helpCenterModel/updateState',
          payload: {selectedCategory: defaultId},
        });
      }
    }
    this.setState({sideNavItems});
  };
  renderSideNav() {
    const {sideNavItems} = this.state;
    return (
      <ul>
        {sideNavItems.map((item, index) => {
          const {cateName, cateId} = item;
          return (
            <li key={index}>
              <button
                className={css.helpCenter_sideNavBtn}
                onClick={this.onHelpCategoryClick}
                data-cate={cateId}
                key={cateId}
                data-active={cateId === this.props.selectedCategory}>
                {cateName}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  renderQuestions(selectedHelpDocs) {
    const {selectedQuestionId} = this.props;
    const {cateName, helpList} = selectedHelpDocs;
    const currentActiveKey =
      selectedQuestionId === -1
        ? helpList && helpList[0].id
        : selectedQuestionId;

    return (
      <dl className={css.helpCenter_content}>
        <dt className={css.helpCenter_title}>{cateName}</dt>
        <Collapse
          activeKey={currentActiveKey}
          onChange={this.onChange}
          bordered={false}
          accordion>
          {helpList.map((listItem, index) => {
            const {title, id, content} = listItem;
            return (
              <Panel
                header={`${index + 1}. ${title}`}
                key={id}
                style={{border: 'none'}}>
                <dd
                  className={css.helpCenter_answers}
                  dangerouslySetInnerHTML={{__html: content}}
                />
              </Panel>
            );
          })}
        </Collapse>
      </dl>
    );
  }
  renderHelpList() {
    const {selectedCategory, helpDocs} = this.props;
    if (!helpDocs) return null;
    const selectedHelpDocs = helpDocs.find(
      ({cateId}) => cateId === selectedCategory,
    );

    if (
      !selectedHelpDocs ||
      (selectedHelpDocs && !selectedHelpDocs.helpList.length)
    ) {
      return (
        <p className={css.helpCenter_emtpyMsg}>
          {(selectedHelpDocs && selectedHelpDocs.cateName) || ''}正在完善中...
        </p>
      );
    }

    return this.renderQuestions(selectedHelpDocs);
  }
  render() {
    const {awaitingResponse} = this.props;
    return (
      <div className={css.helpCenter}>
        <div className={css.helpCenter_body}>
          <h4 className={css.helpCenter_header}>首页 &gt; 帮助中心</h4>
          <LoadingBar
            isLoading={awaitingResponse}
            className={css.helpCenter_loading}
          />
          <div className={css.helpCenter_contents}>
            <aside className={css.helpCenter_sideNav}>
              {this.renderSideNav()}
            </aside>
            {this.renderHelpList()}
          </div>
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({helpCenterModel}) => ({...helpCenterModel});

export default connect(mapStatesToProps)(HelpCenterBody);
