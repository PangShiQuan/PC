import React, {Component} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Tooltip} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import _ from 'lodash';
import {MDIcon} from 'components/General';
import ToggleButton from 'components/User/Form/ToggleButton';
import {type as TYPE} from 'utils';
import SVG from 'react-inlinesvg';
import addIcon from 'assets/image/User/ic-agency-add.svg';
import css from 'styles/User/AgentCenter/Affiliate.less';
import tableCSS from 'styles/User/Form/Table.less';

const {memberTypeRefs, commissionMode} = TYPE;
const commissionModes =
  localStorage.getItem('commissionMode') === commissionMode.COMMISSION_RATIO;

class AffiliateListing extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;

    this.state = {
      tooltipText: '点我复制到剪贴板',
    };
  }

  onQuickToggle = permalink => {
    const {affCode, memberType, prizeGroup, status, id} = permalink;
    let newStatus = 'ON';
    if (status === 'ON') {
      newStatus = 'OFF';
    }

    const payload = {
      affCode: {value: affCode},
      affCodeStatus: {value: newStatus},
      memberType,
      prizeGroup: {value: prizeGroup},
    };
    this.dispatch({type: 'formModel/updateState', payload});
    this.dispatch({type: 'teamModel/putAffCode', payload: {id}});
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  renderTableBody() {
    const {tooltipText} = this.state;
    const {affCodeList, onEditClick, showModal} = this.props;
    if (affCodeList.length) {
      return _.map(affCodeList, listItem => {
        const {
          id,
          updatedTime,
          affCode,
          memberType,
          prizeGroup,
          countUser,
        } = listItem;
        const date = moment(updatedTime).fromNow();
        return (
          <tr key={id}>
            <td>{date}</td>
            <td>
              <ClipboardButton
                onSuccess={this.onCopySuccess}
                data-clipboard-text={affCode}>
                <Tooltip
                  title={tooltipText}
                  onVisibleChange={this.onToolTipVisibleChange}>
                  <span className={css.link}>
                    <i>{affCode}</i>
                  </span>
                </Tooltip>
              </ClipboardButton>
            </td>
            <td>
              <ClipboardButton
                onSuccess={this.onCopySuccess}
                data-clipboard-text={`${window.location.origin}?pt=${affCode}`}>
                <Tooltip
                  title={tooltipText}
                  onVisibleChange={this.onToolTipVisibleChange}>
                  <span className={css.link}>
                    <MDIcon iconName="link-variant" /> <i>邀请链接</i>
                  </span>
                </Tooltip>
              </ClipboardButton>
            </td>
            <td>
              <button
                type="button"
                className={css.link}
                onClick={() => {
                  showModal(affCode);
                }}>
                二维码名片
              </button>
            </td>
            <td>{memberTypeRefs[memberType]}</td>
            <td>{countUser}</td>
            {commissionModes ? null : <td>{prizeGroup}</td>}
            <td>
              <div className={css.actionColumn}>
                <button
                  type="button"
                  className={css.editButton}
                  onClick={() => onEditClick(listItem)}>
                  修改
                </button>
                <ToggleButton
                  onClick={() => this.onQuickToggle(listItem)}
                  checked={listItem.status === 'ON'}
                />
              </div>
            </td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="7">暂无数据</td>
      </tr>
    );
  }

  render() {
    const {affCodeList, onCreateNewClick} = this.props;

    return (
      <div>
        <div className={css.addNewRow}>
          <button
            type="button"
            disabled={affCodeList.length >= 15}
            onClick={onCreateNewClick}
            className={css.addNewButton}>
            <SVG className={css.svg_icon} src={addIcon} />
            <i>创建新的邀请码</i>
          </button>
          <span className={css.highlight}>
            *请注意：单个用户最多能创建15个邀请码，目前您还剩
            {15 - affCodeList.length}个
          </span>
        </div>

        <div className={tableCSS.table_container}>
          <table className={tableCSS.table}>
            {commissionModes ? (
              <thead>
                <tr>
                  <td>最后更新</td>
                  <td>邀请码</td>
                  <td>邀请链接</td>
                  <td>用户类别</td>
                  <td>注册用户数</td>
                  <td>操作</td>
                </tr>
              </thead>
            ) : (
              <thead>
                <tr>
                  <td>最后更新</td>
                  <td>邀请码</td>
                  <td>邀请链接</td>
                  <td>二维码名片</td>
                  <td>用户类别</td>
                  <td>注册用户数</td>
                  <td>返点</td>
                  <td>操作</td>
                </tr>
              </thead>
            )}
            <tbody>{this.renderTableBody()}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({
  teamModel,
  userModel,
  formModel,
  dataTableModel,
}) => ({
  userData: userModel.userData,
  minMemberPrizeGroup: userModel.minMemberPrizeGroup,
  ...teamModel,
  ...formModel,
  ...dataTableModel,
});

export default connect(mapStateToProps)(AffiliateListing);
