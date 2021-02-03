import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {MDIcon} from 'components/General/';
import css from 'styles/header/Dsf/marquee1.less';

class Marquee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animationDuration: `${this.getAnimationDuration(props)}s`,
    };
  }

  componentWillReceiveProps(nextProps) {
    const {announcements} = nextProps;
    if (this.props.announcements !== announcements) {
      this.setState({
        animationDuration: `${this.getAnimationDuration(nextProps)}s`,
      });
    }
  }

  getAnimationDuration({announcements = []}) {
    let annoucementsLength = [...announcements]
      .map(item => item.content)
      .join('; ').length;
    annoucementsLength /= 320;
    annoucementsLength *= 60;
    return annoucementsLength < 20 ? 20 : annoucementsLength;
  }

  renderMarquee() {
    const {animationDuration} = this.state;
    const {announcements} = this.props;

    if (announcements) {
      const style = {animationDuration};
      const nodes = announcements.map(item => (
        <span key={item.createTime}>{item.content}</span>
      ));
      return (
        <div className={css.marquee}>
          <div className={css.marquee_body} style={style}>
            <Link
              to="/noticelist"
              className={css.marquee_content}
              style={style}>
              {nodes}
            </Link>
          </div>
        </div>
      );
    }
    return null;
  }
  render() {
    let isPromotions;
    if (this.props.ispromotions === true){
      isPromotions = true;
    }
    else
      isPromotions = false;
    return (
      <div className={css.marquee_row} ispromotions={isPromotions.toString()}>
        <MDIcon iconName="volume-high" className={css.marquee_icon} ispromotions={isPromotions.toString()}/>
        {this.renderMarquee()}
      </div>
    );
  }
}

const mapStatesToProps = ({gameInfosModel}) => {
  const {announcement, announcements} = gameInfosModel;
  return {announcement, announcements};
};

export default connect(mapStatesToProps)(Marquee);
