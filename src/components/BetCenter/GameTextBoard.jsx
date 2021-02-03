import React, {Component} from 'react';
import TextArea from 'antd/es/input/TextArea';
import {Modal} from 'antd';
import Dropzone from 'react-dropzone';
import {isEmpty} from 'lodash';

import {Button, Column, Row} from 'components/General/';
import getSeparator from 'utils/betCenter/textBetIdentifier';
import getExportBets, {
  getBetString,
} from 'utils/betCenter/getBetStringFromText';
import css from 'styles/betCenter/GameTextBoard.less';

const title = '系统提示';
const instructions = [
  '导入文件格式为txt格式; 多注号码之间请用1个空格[ ]、 逗号[,] 或分号[;] 隔开（不合格号码自动去除）。',
];
const infoMsg = {
  confirm: '您真的要删除所有投注号码？',
  empty: '文件内容为空，请重新导入!',
  fail: '导入文件失败，请重新导入!',
  invalidFileType: '请上传txt文本',
};
const buttonText = {
  affirm: '知道了',
  confirm: '确定',
  cancel: '取消',
};
const FILE_TYPE = 'text/plain';

class GameTextBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      betsCache: '',
      disabledCtrlButtons: true,
      info: {cancelText: '', msg: null, okText: '', type: 'info', onOk: null},
      separator: getSeparator(props.thisMethodSetting.betMode),
    };
    this.dispatch = this.props.dispatch;
  }

  componentWillMount() {
    const {allBetObj, methodId} = this.props;

    if (!isEmpty(allBetObj) && !isEmpty(allBetObj[methodId])) {
      this.setCurrentBetInfos(this.props, true);
    }

    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        disabledByDefault: false,
        isMultipleBet: true,
      },
    });
  }

  componentDidMount() {
    // 必要的, 用来引起 onBlur
    this.textBet.textAreaRef.focus();
  }

  componentWillReceiveProps(nextProps) {
    const {separator} = this.state;
    const thisMethodSetting = nextProps.thisGameSetting.find(
      gameSetting =>
        gameSetting.inputMode === 'text' &&
        gameSetting.methodId === nextProps.methodId,
    );

    if (thisMethodSetting) {
      if (nextProps.betEntries !== this.props.betEntries) {
        if (nextProps.betEntries.length >= this.props.betEntries.length)
          this.onClearClick(nextProps);
        else this.setCurrentBetInfos({...nextProps, thisMethodSetting});
      } else if (nextProps.thisMultipleBet !== this.props.thisMultipleBet) {
        this.textBet.textAreaRef.value = nextProps.thisMultipleBetString.join(
          separator.group[0],
        );
      } else if (
        nextProps.methodId &&
        nextProps.methodId !== this.props.methodId
      ) {
        this.setCurrentBetInfos({...nextProps, thisMethodSetting});
      }
      this.toggleCtrlButtons(nextProps.thisMultipleBetString);
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: [
        'disabledByDefault',
        'isMultipleBet',
        'thisMultipleBet',
        'thisMultipleBetString',
      ],
    });
  }

  onBlur = () => {
    const {separator} = this.state;

    if (
      this.textBet &&
      this.textBet.textAreaRef.value !==
        this.props.thisMultipleBetString.join(separator.group[0])
    ) {
      this.refresh();
    }
  };

  onClearClick = ({methodId} = {}) => {
    if (!methodId) {
      const {allBetObj: thisAllBetObj, methodId: thisMethodId} = this.props;
      const newAllBetObj = {...thisAllBetObj};
      newAllBetObj[thisMethodId] = [];

      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          allBetObj: newAllBetObj,
        },
      });
    }

    this.textBet.textAreaRef.value = '';
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: ['thisMultipleBet', 'thisMultipleBetString'],
    });
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const fileAsBinaryString = reader.result;

          if (fileAsBinaryString) {
            this.textBet.textAreaRef.value = '';
            this.refresh(fileAsBinaryString);
          } else
            this.setState({
              info: {
                msg: <span>{infoMsg.empty}</span>,
                okText: buttonText.confirm,
                type: 'info',
              },
            });
        };
        reader.onerror = () => {
          this.setState({
            info: {
              msg: <span>{infoMsg.fail}</span>,
              okText: buttonText.confirm,
              info: 'info',
            },
          });
        };
        reader.readAsText(file);
      });
    } else if (rejectedFiles.length) {
      if (rejectedFiles.some(({type}) => type !== FILE_TYPE)) {
        this.setState({
          info: {
            msg: <span>{infoMsg.invalidFileType}</span>,
            okText: buttonText.affirm,
            type: 'info',
          },
        });
      }
    }
  };

  onKeyPress = e => {
    const {separator} = this.state;
    const char = e.key;
    const reg = new RegExp(
      `[\\d${separator.multi}${separator.row}${separator.group.join('')}]`,
    );

    if (
      !(
        (e.ctrlKey && (char === 'v' || char === 'c')) ||
        char.toLowerCase() === 'backspace' ||
        char.toLowerCase() === 'enter' ||
        reg.test(char)
      )
    )
      e.preventDefault();
  };

  onPaste = e => {
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('Text');

    if (pastedText) {
      this.refresh(pastedText);
    }
  };

  onRemoveDuplicate = () => {
    const {
      textAreaRef: {value},
    } = this.textBet;

    if (value) {
      this.refresh('', true);
    }
  };

  setCurrentBetInfos(
    {allBetObj, betEntries, methodId, thisMethodSetting},
    shouldProcess,
  ) {
    const {separator} = this.state;
    const thisBetObj = allBetObj[methodId];
    const thisMultipleBet = Array.isArray(thisBetObj)
      ? thisBetObj
      : (isEmpty(thisBetObj) && []) || [allBetObj[methodId]];
    const thisMultipleBetString =
      thisMultipleBet.length > 0
        ? getBetString(thisMultipleBet, separator, {
            sections: thisMethodSetting.gameRules.sections,
          })
        : [];

    // 只有复式才会有一注而已, 这时才处理
    if (shouldProcess && thisMultipleBet.length === 1) {
      const {bets, betsString} = this.processBets(
        {
          betEntries,
          methodId,
          thisMethodSetting,
        },
        thisMultipleBetString.join(separator.group[0]),
      );

      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          thisMultipleBet: bets,
          thisMultipleBetString: betsString,
        },
      });
    } else {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          thisMultipleBet,
          thisMultipleBetString,
        },
      });
    }
  }

  showClearConfirm = () => {
    this.setState({
      info: {
        cancelText: buttonText.cancel,
        msg: infoMsg.confirm,
        okText: buttonText.confirm,
        onOk: () => {
          this.onClearClick();
          this.hideModal();
        },
        type: 'confirm',
      },
    });
  };

  toggleCtrlButtons = betsString => {
    const {disabledCtrlButtons} = this.state;

    if (
      (betsString.length && disabledCtrlButtons) ||
      (!betsString.length && !disabledCtrlButtons)
    )
      this.setState({disabledCtrlButtons: !disabledCtrlButtons});
  };

  hideModal = () => {
    this.setState({
      info: {cancelText: '', msg: null, okText: '', onOk: null, type: 'info'},
    });
  };

  openFileDialog = () => {
    this.dropZone.open();
  };

  refresh(currentBets = '', removeDuplicate) {
    const {betsCache, separator} = this.state;
    const {
      textAreaRef: {value},
    } = this.textBet;
    const insertBetsSeparator =
      Math.max(
        ...separator.group.map(gSeparator => value.lastIndexOf(gSeparator)),
      ) !==
      value.length - 1
        ? separator.group[0]
        : '';
    const newCurrentBets = value + insertBetsSeparator + currentBets;

    // 跳掉没必要的刷新
    if (betsCache !== newCurrentBets) {
      const {allBetObj, methodId} = this.props;
      const {bets, betsString, duplicateBets, invalidBets} = this.processBets(
        this.props,
        newCurrentBets,
        removeDuplicate,
      );
      const newAllBetObj = {...allBetObj};
      newAllBetObj[methodId] = bets;

      const infoDesc = (
        <div className={css.infoDesc}>
          {duplicateBets.length || invalidBets.length ? (
            <span>重复或不合法的号码将自动删除</span>
          ) : null}
        </div>
      );

      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          allBetObj: newAllBetObj,
          thisMultipleBet: bets,
          thisMultipleBetString: betsString,
        },
      });

      if (!removeDuplicate && (duplicateBets.length || invalidBets.length)) {
        this.setState({
          info: {msg: infoDesc, okText: buttonText.affirm, type: 'info'},
        });
      }
    }
  }

  processBets = (
    {betEntries, methodId, thisMethodSetting},
    bets,
    removeDuplicate = false,
  ) => {
    const {separator} = this.state;
    const oddChar = new RegExp(
      `[^${separator.row}${separator.group.join('')}\\d${separator.multi}]`,
      'g',
    );
    const currentBets = bets.replace(oddChar, '');
    const exportedBets = getExportBets(
      thisMethodSetting,
      {
        currentBets,
        existingBets: betEntries,
        methodId,
      },
      removeDuplicate,
    );
    const {sections} = thisMethodSetting.gameRules;
    const processedBets = exportedBets.bets.map(bet => {
      const betObj = {};
      bet.forEach((betRow, index) => {
        betObj[sections[index]] = betRow;
      });

      return betObj;
    });
    return {
      ...exportedBets,
      bets: processedBets,
    };
  };

  render() {
    const {
      disabledCtrlButtons,
      info: {cancelText, msg, okText, onOk, type},
    } = this.state;

    return (
      <React.Fragment>
        <Modal
          title={title}
          visible={!!(type === 'info' && msg)}
          onCancel={this.hideModal}
          wrapClassName={css.modal__info}
          footer={<Button placeholder={okText} onClick={this.hideModal} />}
          width={325}>
          {msg}
        </Modal>
        <Modal
          title={title}
          visible={!!(type === 'confirm' && typeof onOk === 'function')}
          onCancel={this.hideModal}
          onOk={onOk}
          cancelText={cancelText}
          okText={okText}
          wrapClassName={css.modal__confirm}
          width={325}>
          {msg}
        </Modal>
        <Row className={css.inputContainer}>
          <Column className={css.inputArea}>
            <Dropzone
              accept={FILE_TYPE}
              disableClick
              multiple={false}
              onDrop={this.onDrop}
              ref={ref => {
                this.dropZone = ref;
              }}
              className={css.dropzone}
              acceptStyle={{borderColor: '#12b886'}}
              rejectStyle={{
                borderColor: '#e4393c',
                backgroundColor: '#d9d9d9',
              }}>
              <TextArea
                ref={ref => {
                  this.textBet = ref;
                }}
                placeholder="手动输入单式投注"
                rows={15 - (instructions.length > 5 ? 5 : instructions.length)}
                onBlur={this.onBlur}
                onKeyPress={this.onKeyPress}
                onPaste={this.onPaste}
                className={css.betInput}
              />
            </Dropzone>
          </Column>
          <Column className={css.ctrlBar}>
            <Button
              placeholder="导入文件"
              className={css.ctrlButton}
              onClick={this.openFileDialog}
            />
            <Button
              disabled={disabledCtrlButtons ? true : null}
              placeholder="删除重复号"
              onClick={this.onRemoveDuplicate}
              className={css.ctrlButton}
            />
            <Button
              disabled={disabledCtrlButtons ? true : null}
              placeholder="清空"
              className={css.ctrlButton}
              onClick={this.showClearConfirm}
            />
          </Column>
        </Row>
        <Row className={css.row}>
          <div className={css.betInstruction}>
            {instructions.map((instruction, index) => (
              <span key={index}>{instruction}</span>
            ))}
          </div>
        </Row>
      </React.Fragment>
    );
  }
}

export default GameTextBoard;
