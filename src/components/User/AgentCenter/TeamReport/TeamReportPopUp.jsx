import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Modal} from 'antd';
import AntdTable from 'components/User/Form/AntdTable';
import {teamReportS} from 'services/gameReport/';
import css from 'styles/User/AgentCenter/TeamReport.less';
import userCSS from 'styles/User/User.less';

class TeamReportPopUp extends PureComponent {
  getDimension = (gamePlatform, layer) => {
    const {width = 0, height = 450} = teamReportS[gamePlatform].tableDimension(
      gamePlatform,
    )[layer];

    return {width, height};
  };

  renderPersonalReportTable = ({selectedUsername, selectedUplineUsername}) => {
    const {
      displayListPersonalReport,
      selectedGamePlatform,
    } = this.props.reportModel;

    const columns = teamReportS[selectedGamePlatform].gameReportPersonal({
      selectedGamePlatform,
    });

    let props = {};
    const {data, count} = teamReportS[
      selectedGamePlatform
    ].gameReportPersonalData({
      displayList: displayListPersonalReport,
      selectedGamePlatform,
      selectedUsername,
      selectedUplineUsername,
    });

    if (count > 0) {
      const {width: x, height: y} = this.getDimension(
        selectedGamePlatform,
        'personalReport',
      );
      props = {
        pagination: false,
        dataSource: data,
        scroll: {
          x,
        },
      };
    }

    return <AntdTable columns={columns} {...props} />;
  };

  render() {
    const {
      reportModel,
      row,
      gamePlatformList,
      onPersonalReportClick,
    } = this.props;
    const {selectedGamePlatform, startDatetime, endDatetime} = reportModel;

    return (
      <Modal
        visible={row.isPersonalReportPopUp}
        onCancel={() =>
          onPersonalReportClick({
            selectedKey: row.key,
          })
        }
        width="900px"
        footer={null}
        maskClosable={false}
        closable>
        <div className={userCSS.content_body}>
          <div className={css.description_div}>
            <div className={css.title}>
              个人报表
              {` ( ${
                gamePlatformList[selectedGamePlatform].gameNameInChinese
              } )`}
            </div>
            <div className={css.description}>用户 :{` ${row.username}`}</div>
            <div className={css.description}>
              上级代理 : {` ${row.directAgent}`}
            </div>
            <div className={css.description}>
              查询日期 :
              {` ${startDatetime.format('YYYY-MM-DD')} ~
              ${endDatetime.format('YYYY-MM-DD')} `}
            </div>
          </div>
          {this.renderPersonalReportTable({
            selectedUsername: row.username,
            selectedUplineUsername: row.directAgent,
          })}
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = ({reportModel, playerModel}) => {
  const {gamePlatformList} = playerModel;
  return {reportModel, gamePlatformList};
};

export default connect(mapStateToProps)(TeamReportPopUp);
