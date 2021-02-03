import React, {Component} from 'react';
import css from './styles/maintenance.less';
import {replace, split} from 'lodash';
import moment from 'moment';

class Maintenance extends Component {
  constructor(props) {
    super(props);
  }
  render() {
  const {content} = this.props.data;
  const {message: {contact}} = content;
  const {message: {body}} = content;
  const {QQ, qq, wechat, support_link} = contact;
  const startTime = moment(content.start_time).format('YYYY年MMMDoHH:mm:ss');
  const endTime = moment(content.end_time).format('YYYY年MMMDoHH:mm:ss');
  const splitStart = split(body, '<start_time>', 2);
  const splitEnd = split(splitStart[1], '<end_time>', 2);

        return (<div className={css.maintenanceBody}>
                  <div className={css.maintenanceContent}>
                    <span>{splitStart[0]}<span className={css.time}>{startTime}</span>{splitEnd[0]}<span className={css.time}>{endTime}</span>{splitEnd[1]}</span>
                    <span>若有需要请联系</span>
                    <div className={css.contact}>
                    <span>QQ : {QQ || qq}<br/>
                          Wechat : {wechat}<br/>
                    <a
                      className={css.header_topTrayLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={support_link}>
                      <i>官方在线客服</i>
                    </a>
                    </span>
                    </div>
                  </div>
                </div>);
    };
  }

export default Maintenance;
