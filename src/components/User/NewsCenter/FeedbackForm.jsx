import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Input} from 'antd';
import css from 'styles/User/NewsCenter/Feedback.less';
import InputTextField from 'components/User/Form/InputTextField';
import SubmitResetButton from 'components/User/Form/SubmitResetButton';

const {TextArea} = Input;

class FeedbackForm extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentWillUnmount = () => {
    this.clearForm();
  };

  onCancelFeedback = () => {
    this.clearForm();
  };

  onSubmitFeedback = event => {
    event.preventDefault();
    this.dispatch({
      type: 'feedbackModel/postNewQA',
    });
  };

  onInputChange = event => {
    event.persist();
    const {
      target: {value, name, max},
    } = event;

    if (value.toString().length <= max || !max) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {[name]: {value}},
      });

      this.dispatch({
        type: 'formModel/validateInput',
        payload: event,
      });
    }
  };

  clearForm = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['feedbackContent', 'feedbackTitle'],
    });
  };

  renderTextAreaInput = ({id, label, value, labelWidth, placeholder, obj}) => {
    return (
      <div>
        <div
          style={{
            width: `${labelWidth}`,
          }}
          className={css.label}>
          {label}
        </div>
        <TextArea
          id={id}
          name={id}
          onChange={this.onInputChange}
          value={value}
          autosize={{minRows: 3, maxRows: 9}}
          maxLength="100"
          placeholder={placeholder}
          data-color={obj.color}
          className={css.textArea}
          style={{
            width: `calc(100% - ${labelWidth})`,
          }}
        />
      </div>
    );
  };

  render = () => {
    const {feedbackContent, feedbackTitle} = this.props;
    const LABEL_WIDTH = '50px';

    return (
      <form noValidate className={css.form}>
        <div className={css.formItem}>
          <InputTextField
            id="feedbackTitle"
            label="标题"
            value={feedbackTitle.value}
            labelWidth={LABEL_WIDTH}
            placeholder="请输入25字以内的反馈标题"
            obj={feedbackTitle}
          />
        </div>
        {this.renderTextAreaInput({
          id: 'feedbackContent',
          label: '内容',
          value: feedbackContent.value,
          labelWidth: LABEL_WIDTH,
          placeholder: '请输入100字以内的反馈内容',
          obj: feedbackContent,
        })}
        <SubmitResetButton
          labelWidth={LABEL_WIDTH}
          submitDisabled={!feedbackContent.value || !feedbackTitle.value}
          hideReset
          // resetDisabled,
          onSubmitClick={this.onSubmitFeedback}
          // onResetClick={this.onCancelFeedback}
          submitText="提交"
          // resetText="重置"
          submitWidth="348px"
          // resetWidth="80px"
          marginTop
        />
      </form>
    );
  };
}

function mapStateToProps({formModel}) {
  const {feedbackContent, feedbackTitle} = formModel;
  return {
    feedbackContent,
    feedbackTitle,
  };
}

export default connect(mapStateToProps)(FeedbackForm);
