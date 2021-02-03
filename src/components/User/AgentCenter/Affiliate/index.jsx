import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Modal, Button} from 'antd';
import {randomWord} from 'utils';
import html2canvas from 'html2canvas';
import Canvas2Image from '@senntyou/canvas2image';
import QRCode from 'components/General/QRCode';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import AffiliateListing from 'components/User/AgentCenter/Affiliate/AffiliateListing';
import AffiliateForm from 'components/User/AgentCenter/Affiliate/AffiliateForm';
import userCSS from 'styles/User/User.less';
import css from 'styles/User/AgentCenter/Affiliate.less';

const INITIAL_STATE = {
  editTarget: '',
  domView: '',
  modalVisible: false,
  code: '',
  formIsPristine: true,
  isCreatingNew: false,
};

class Affiliate extends PureComponent {
  constructor(props) {
    super(props);

    this.state = INITIAL_STATE;
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.fetchUpdates();
  }

  componentDidUpdate(prevProps, prevState) {
    const {accessToken, affCodeList, responseMsg} = this.props;
    const {
      accessToken: prevAccessToken,
      affCodeList: prevAffCodeList,
      responseMsg: prevResponseMsg,
    } = prevProps;

    if (
      prevResponseMsg !== responseMsg &&
      responseMsg &&
      responseMsg.color === 'green' &&
      prevState.modalVisible
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(INITIAL_STATE);
    }

    if (prevAccessToken && accessToken && prevAccessToken !== accessToken) {
      this.fetchUpdates(true);
    }

    if (prevAffCodeList !== affCodeList) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({editTarget: '', isCreatingNew: false});
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'teamModel/initializeState',
      payload: ['affCodeList'],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'affCode',
        'affCodeStatus',
        'memberType',
        'prizeGroup',
        'responseMsg',
      ],
    });
  }

  handleModalClose = e => {
    e.stopPropagation();
    this.setState(INITIAL_STATE);
  };

  showModal = code => {
    this.setState({
      modalVisible: true,
      code,
    });
  };

  onCreateNewClick = () => {
    const {userData} = this.props;
    const {prizeGroup} = userData;
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg', 'prizeGroup'],
    });
    this.dispatch({
      type: 'formModel/updateState',
      payload: {prizeGroup: {value: prizeGroup}},
    });
    this.generateRandomAffCode();
    this.setState({
      modalVisible: true,
      isCreatingNew: true,
      formIsPristine: true,
    });
  };

  generateRandomAffCode = () => {
    this.poluteForm();
    const affCode = randomWord(true, 4, 16);
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        affCode: {value: affCode},
      },
    });
    this.initializeForm();
  };

  initializeForm = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
  };

  poluteForm = () => {
    this.setState({formIsPristine: false});
  };

  onEditClick = permalink => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.setState({
      modalVisible: true,
      isCreatingNew: false,
      formIsPristine: true,
    });

    const {affCode, memberType, prizeGroup, status, id} = permalink;
    const payload = {
      affCode: {value: affCode},
      affCodeStatus: {value: status},
      memberType,
      prizeGroup: {value: prizeGroup},
    };
    this.dispatch({type: 'formModel/updateState', payload});
    this.setState({editTarget: id});
  };

  onCloseClick = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'affCode',
        'affCodeStatus',
        'memberType',
        'prizeGroup',
        'responseMsg',
      ],
    });
    this.setState(INITIAL_STATE);
  };

  onSubmitClick = () => {
    const {editTarget, isCreatingNew} = this.state;
    if (editTarget) {
      this.dispatch({
        type: 'teamModel/putAffCode',
        payload: {id: editTarget},
      });
    } else if (isCreatingNew) {
      this.dispatch({type: 'teamModel/postAffCode'});
    }
  };

  onDeleteClick = () => {
    const {editTarget} = this.state;
    this.dispatch({
      type: 'teamModel/deleteAffCode',
      payload: {id: editTarget},
    });
  };

  downloadQRCode = e => {
    e.stopPropagation();
    const {domView} = this.state;
    return html2canvas(domView).then(canvas => {
      return Canvas2Image.saveAsImage(canvas);
    });
  };

  fetchUpdates = (switchUser = false) => {
    const {affCodeList} = this.props;
    if (!affCodeList.length || switchUser)
      this.dispatch({type: 'teamModel/getAffCodeList'});
  };

  renderQRCodeForm() {
    const {code} = this.state;
    return (
      <div className={css.modelWap} ref={domView => this.setState({domView})}>
        <div className={css.QRCodemodelWap}>
          <QRCode
            text={`${window.location.origin}/?pt=${code}&action=register`}
            size={148}
          />
        </div>
        <div className={css.modelWapContent}>
          <p className={css.modelWapcode}>
            <span>邀请码：</span>
            <span style={{marginLeft: '10px'}}>{code}</span>
          </p>
          <p className={css.modelWaptext}>
            <span>网址：</span>
            <span style={{marginLeft: '10px'}}>{`${
              window.location.origin
            }?pt=${code}`}</span>
          </p>
        </div>
      </div>
    );
  }

  renderForm() {
    const {isCreatingNew, formIsPristine, editTarget} = this.state;
    const {
      affCode,
      affCodeStatus,
      userData,
      prizeGroup,
      memberType,
      responseMsg,
    } = this.props;

    const formProps = {
      dispatch: this.dispatch,
      affCode,
      affCodeStatus,
      editTarget,
      formIsPristine,
      generateRandomAffCode: this.generateRandomAffCode,
      isCreatingNew,
      memberType,
      minMemberPrizeGroup: this.props.minMemberPrizeGroup,
      onCloseClick: this.onCloseClick,
      onDeleteClick: this.onDeleteClick,
      onSubmitClick: this.onSubmitClick,
      poluteForm: this.poluteForm,
      prizeGroup,
      userData,
      responseMsg,
      initializeForm: this.initializeForm,
    };
    return <AffiliateForm {...formProps} />;
  }

  render() {
    const {modalVisible, isCreatingNew, editTarget, code} = this.state;
    const {affCodeList, userData, minMemberPrizeGroup} = this.props;
    const listProps = {
      affCodeList,
      formDisabled: userData.prizeGroup < minMemberPrizeGroup,
      onCreateNewClick: this.onCreateNewClick,
      onEditClick: this.onEditClick,
      showModal: this.showModal,
    };
    const showForm = isCreatingNew || editTarget;

    return (
      <React.Fragment>
        {!modalVisible && <ResponseMessageBar />}
        <div className={userCSS.content_body}>
          <AffiliateListing {...listProps} />

          <Modal
            width={showForm ? '800px' : '338px'}
            visible={modalVisible}
            maskClosable={false}
            closable={false}
            onCancel={this.handleModalClose}
            footer={
              code && [
                <Button key="back" onClick={this.handleModalClose}>
                  关闭
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={this.downloadQRCode}>
                  下载海报
                </Button>,
              ]
            }>
            <React.Fragment>
              {showForm && this.renderForm()}
              {code && this.renderQRCodeForm()}
            </React.Fragment>
          </Modal>
        </div>
      </React.Fragment>
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

export default connect(mapStateToProps)(Affiliate);
