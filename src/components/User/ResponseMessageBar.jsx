import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {MDIcon} from 'components/General';
import css from 'styles/User/ResponseMessageBar.less';

class ResponseMessageBar extends PureComponent {
  static clearResponseMessageBar = ({dispatch}) => {
    dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
  };

  render() {
    const {
      responseMsg: {msg, color, icon},
      dispatch,
    } = this.props;

    if (msg) {
      setTimeout(() => {
        dispatch({
          type: 'formModel/initializeState',
          payload: ['responseMsg'],
        });
      }, 5000);
    }

    return (
      <React.Fragment>
        {msg && (
          <div data-color={color} className={css.profile_responseMessage}>
            <MDIcon iconName={icon} />
            <span>{msg}</span>
            <button
              type="button"
              onClick={() => {
                dispatch({
                  type: 'formModel/initializeState',
                  payload: ['responseMsg'],
                });
              }}>
              <MDIcon iconName="close" />
            </button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

function mapStatesToProps({formModel}) {
  return {
    ...formModel,
  };
}

export default connect(mapStatesToProps)(ResponseMessageBar);
