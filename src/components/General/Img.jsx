import React, {PureComponent} from 'react';
import classnames from "classnames";
import _ from 'lodash';
import css from 'styles/general/img.less';

class Img extends PureComponent {
  render() {
    const imgProps =  _.cloneDeep(this.props);
    const imgAlt = this.props.alt;
    //Temporary remove to prevent logo appear on transparent background
    // imgProps.className = classnames(css.imgAbs, this.props.className);
    imgProps.className = classnames(this.props.className);

    return <img alt={imgAlt || 'img'} {...imgProps} />;
  }
}

export default Img;
