import React, {Component} from 'react';
import moment from 'moment';
import {Tooltip, Modal, Button} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import _ from 'lodash';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import {MDIcon, LoadingBar} from 'components/General';
import EditBtn from './EditAffBtn';
import SwitchBtn from './AffSwitch';
import {type} from 'utils';
import html2canvas from 'html2canvas';
import Canvas2Image from '@senntyou/canvas2image';
import QRCode from 'components/General/QRCode';

const {commissionMode} = type;
class AffCodeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      domView: '',
    };
    this.dispatch = props.dispatch;
    this.onEditClick = props.onEditClick;
    this.onQuickToggle = props.onQuickToggle;
    this.onCopySuccess = props.onCopySuccess;
    this.showQrcodeModel = props.showQrcodeModel;
    this.handleCancel = props.handleCancel;
    this.onToolTipVisibleChange = props.onToolTipVisibleChange;
  }
  handle = e => {
    e.stopPropagation();
    const {domView} = this.state;
    html2canvas(domView).then(function(canvas) {
      return Canvas2Image.saveAsImage(canvas);
    });
  };
  renderTableBody() {
    const commissionModes =
      localStorage.getItem('commissionMode') ===
      commissionMode.COMMISSION_RATIO;
    const {
      awaitingResponse,
      affCodeList,
      memberTypeRefs,
      tooltipText,
      visible,
      code,
    } = this.props;
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
                  <span className={css.profile_tableAnchor}>
                    <i>{affCode}</i>
                  </span>
                </Tooltip>
              </ClipboardButton>
            </td>
            <td>
              <ClipboardButton
                onSuccess={this.onCopySuccess}
                data-clipboard-text={`${
                  window.location.origin
                }?pt=${affCode}&action=register`}>
                <Tooltip
                  title={tooltipText}
                  onVisibleChange={this.onToolTipVisibleChange}>
                  <span className={css.profile_tableAnchor}>
                    <MDIcon iconName="link-variant" /> <i>邀请链接</i>
                  </span>
                </Tooltip>
              </ClipboardButton>
            </td>
            <td data-align="left">
              <a
                style={{color: '#106ddc'}}
                onClick={() => {
                  this.showQrcodeModel(affCode);
                }}>
                二维码名片
              </a>
              <Modal
                width="328px"
                visible={visible}
                closable={false}
                onCancel={e => this.handleCancel(e)}
                footer={[
                  <Button key="back" onClick={this.handleCancel}>
                    关闭
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={e => this.handle(e)}>
                    下载海报
                  </Button>,
                ]}>
                <div
                  className={css.modelWap}
                  ref={domView => (this.state.domView = domView)}>
                  <div className={css.QRCodemodelWap}>
                    <QRCode
                      text={`${
                        window.location.origin
                      }/?pt=${code}&action=register`}
                      size={148}
                    />
                  </div>
                  <div className={css.modelWapContent}>
                    <div className={css.modelWapcode}>
                      <div className={css.modelTitle}>
                        <span>邀请码：{code}</span>
                      </div>
                      <div className={css.modelTitleButton}>
                        <ClipboardButton
                          onSuccess={this.onCopySuccess}
                          data-clipboard-text={affCode}>
                          <Tooltip
                            title={tooltipText}
                            onVisibleChange={this.onToolTipVisibleChange}>
                            <span className={css.profile_tableAnchor}>
                              <i>复制</i>
                            </span>
                          </Tooltip>
                        </ClipboardButton>
                      </div>
                    </div>
                    <div className={css.modelWaptext}>
                      <div className={css.modelTitle}>
                        <span>网址：{`${window.location.origin}?pt=${code}&action=register`}</span>
                      </div>
                      <div className={css.modelTitleButton}>
                        <ClipboardButton
                          onSuccess={this.onCopySuccess}
                          data-clipboard-text={`${
                            window.location.origin
                          }?pt=${code}`}>
                          <Tooltip
                            title={tooltipText}
                            onVisibleChange={this.onToolTipVisibleChange}>
                            <span className={css.profile_tableAnchor}>
                              <i>复制</i>
                            </span>
                          </Tooltip>
                        </ClipboardButton>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>
            </td>
            <td>{memberTypeRefs[memberType]}</td>
            <td data-align="left">{countUser}</td>
            {commissionModes ? null : <td data-align="left">{prizeGroup}</td>}
            <td data-align="right">
              <div className={css.profile_tableCtrlsRow}>
                <EditBtn onEdit={this.onEditClick} item={listItem} />
                <SwitchBtn
                  awaitingResponse={awaitingResponse}
                  onToggle={this.onQuickToggle}
                  item={listItem}
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
    const commissionModes =
      localStorage.getItem('commissionMode') ===
      commissionMode.COMMISSION_RATIO;
    const {
      awaitingResponse,
      renderResponseMsg,
      onCreateNewClick,
      affCodeList,
    } = this.props;
    return (
      <div className={css.profile_contentBody}>
        <h4 className={css.profile_formLabel}>
          邀请码列表
          <LoadingBar isLoading={awaitingResponse} />
        </h4>
        {renderResponseMsg()}
        <table className={css.profile_table}>
          {commissionModes ? (
            <thead>
              <tr>
                <td width="15%">最后更新</td>
                <td width="25%">邀请码</td>
                <td width="15%">邀请链接</td>
                <td width="15%">用户类别</td>
                <td width="15%" data-align="left">
                  注册用户数
                </td>
                <td width="15%" data-align="left">
                  操作
                </td>
              </tr>
            </thead>
          ) : (
            <thead>
              <tr>
                <td width="15%">最后更新</td>
                <td width="20%">邀请码</td>
                <td width="10%">邀请链接</td>
                <td width="13">二维码名片</td>
                <td width="10%">用户类别</td>
                <td width="12%" data-align="left">
                  注册用户数
                </td>
                <td width="10%" data-align="left">
                  返点
                </td>
                <td width="10%" data-align="left">
                  操作
                </td>
              </tr>
            </thead>
          )}
          <tbody>
            <tr>
              <td colSpan="9">
                <button
                  disabled={affCodeList.length >= 15 || awaitingResponse}
                  onClick={onCreateNewClick}
                  className={css.profile_tableAddNewBtn}>
                  <MDIcon iconName="plus" />{' '}
                  <i>创建新邀请码 ({affCodeList.length}/15)</i>
                </button>
              </td>
            </tr>
            {this.renderTableBody()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default AffCodeList;
