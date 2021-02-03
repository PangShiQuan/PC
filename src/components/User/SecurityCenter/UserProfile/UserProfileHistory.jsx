import React, {PureComponent} from 'react';
import {connect} from 'dva';
import tableCSS from 'styles/User/Form/Table.less';
import {Pagination} from 'antd';
import moment from 'moment';
import {type as TYPE} from 'utils';
import {map} from 'lodash';
import ContentContainer from 'components/User/ContentContainer';

const {dateFormat} = TYPE;

class UserProfileHistory extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      currentPage: 1,
      pageSize: 5,
    };
  }

  renderLoginHistory = () => {
    const {myLoginHistory} = this.props;
    const {currentPage, pageSize} = this.state;

    const startIndex =
      currentPage === 1 ? 0 : currentPage * pageSize - pageSize;
    const endIndex = currentPage * pageSize;

    const data = myLoginHistory.slice(startIndex, endIndex);

    return map(data, history => {
      const {loginTime, location} = history;
      return (
        <tr key={loginTime}>
          <td>{moment(loginTime).format(dateFormat)}</td>
          <td />
          <td>{location}</td>
        </tr>
      );
    });
  };

  onChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize,
    });
  };

  renderPagination() {
    const {myLoginHistory} = this.props;
    const {currentPage, pageSize} = this.state;

    return (
      <Pagination
        className={tableCSS.pagination}
        current={currentPage}
        pageSize={pageSize}
        onChange={this.onChange}
        onShowSizeChange={this.onChange}
        pageSizeOptions={['5', '10']}
        showSizeChanger
        total={myLoginHistory.length}
      />
    );
  }

  render() {
    return (
      <ContentContainer title="登录历史">
        <table className={tableCSS.table}>
          <thead>
            <tr>
              <td style={{width: '25%'}}>登录时间</td>
              <td style={{width: '50%'}} />
              <td style={{width: '25%'}}>登录地区</td>
            </tr>
          </thead>
          <tbody>{this.renderLoginHistory()}</tbody>
        </table>
        {this.renderPagination()}
      </ContentContainer>
    );
  }
}

function mapStatesToProps({userModel}) {
  const {myLoginHistory} = userModel;
  return {
    myLoginHistory,
  };
}

export default connect(mapStatesToProps)(UserProfileHistory);
