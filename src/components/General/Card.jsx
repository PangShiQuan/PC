import React from 'react';
import classnames from 'classnames';
import css from 'styles/general/Card.less';
import Img from './Img';

function Card(props) {
  const {
    title,
    subtitle,
    desc,
    image,
    imageIcon,
    size,
    overlayStyle,
    disableContent,
    className,
    ...buttonProps
  } = props;
  const btnClass = size !== 'small' ? css.col__half : css.col__quart;
  const content = subtitle ? (
    <React.Fragment>
      <div className={css.overlayContents}>
        <div className={css.overlay} />
        <p className={css.overlayContent}>{subtitle}</p>
        <p className={css.overlayContent}>
          <small>{desc}</small>
        </p>
      </div>
      <div
        className={css.navContents}
        style={{textAlign: 'center'}}
        data-content={disableContent}>
        <p>
          <strong>{title}</strong>
        </p>
      </div>
    </React.Fragment>
  ) : (
    <div className={css.navContents} data-content={disableContent}>
      <p>
        <strong>{title}</strong>
      </p>
      {desc && (
        <p>
          <small>{desc}</small>
        </p>
      )}
    </div>
  );

  return (
    <button
      type="button"
      className={classnames(btnClass, className)}
      {...buttonProps}>
      {/* <div className={css.navImg} style={overlayStyle} /> */}
      {imageIcon && <img className={css.iconImg} src={imageIcon} alt="icon" />}
      <Img className={css.navImg} src={image} />
      {content}
    </button>
  );
}

export default Card;
