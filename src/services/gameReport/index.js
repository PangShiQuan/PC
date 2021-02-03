import _ from 'lodash';
import * as betRecordReportS from './betRecordReport';
import * as personalReportS from './personalReport';
import * as teamReportS from './teamReport';
import * as cashFlowReportS from './cashFlowReport';
import * as transferReportS from './transferReport';

export const getExpandRowList = list => {
  const expandRowList = [];
  _.map(list, (listItem, index) => {
    if (listItem.isExpand) {
      expandRowList.push(index);
    }
  });
  return expandRowList;
};

export {betRecordReportS, personalReportS, teamReportS, cashFlowReportS, transferReportS};
