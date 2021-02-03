import kjua from 'kjua';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import PlaceLoader from './PlaceLoader';

const MIN_VER = 1;
const MAX_VER = 40;
const PADDING = 4;
const style = {
  backgroundColor: '#fff',
  padding: `${PADDING}px`,
};

const QR_STRICT = {
  // render pixel-perfect lines
  crisp: false,
  // render method: 'canvas' or 'image'
  render: 'image',
  // modes: 'plain', 'label' or 'image'
  mode: 'plain',
  // label/image size and pos in pc: 0..100
  mSize: 30,
  mPosX: 50,
  mPosY: 50,
  // label
  label: 'no label',
  fontname: 'sans',
  fontcolor: '#333',
  // image element
  image: null,
};

class QRCode extends Component {
  constructor(props) {
    super(props);
    const {width, height} = props;
    this.state = {
      src: '',
      alt: '',
      width,
      height,
    };
  }

  componentWillMount() {
    this.refresh(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.text !== nextProps.text) this.refresh(nextProps);
  }

  refresh(props) {
    let {size} = props;
    size -= PADDING * 2;
    const state = {
      width: size,
      height: size,
    };

    if (props.text) {
      const qrCode = kjua({...props, ...{size}, ...QR_STRICT});

      state.src = qrCode.src;
      state.alt = props.text;
    }

    this.setState({...state});
  }

  render() {
    const {className, style: thisStyle} = this.props;
    const {src, alt, width, height} = this.state;
    return (
      <div style={thisStyle || style} className={className}>
        {src ? (
          <img
            crossOrigin="anonymous"
            src={src}
            alt={alt}
            width={width}
            height={height}
          />
        ) : (
          <PlaceLoader width={width} height={height} />
        )}
      </div>
    );
  }
}

QRCode.propTypes = {
  ecLevel: PropTypes.oneOf(['L', 'M', 'Q', 'H']),
  minVersion: (props, propName) => {
    if (props[propName] < MIN_VER || props[propName] > MAX_VER) {
      return new Error(
        `${props[propName]} for ${propName} out of defined range.
        Please select within range ${MIN_VER} and ${MAX_VER}`,
      );
    }
  },
  text: PropTypes.string,
};

QRCode.defaultProps = {
  // minimum version: 1..40
  minVersion: 1,
  // error correction level: 'L', 'M', 'Q' or 'H'
  ecLevel: 'L',
  // size in pixel
  size: 150,
  // pixel-ratio, null for devicePixelRatio
  ratio: null,
  // code color
  fill: '#333',
  // background color
  back: '#fff',
  // content
  text: null,
  // roundend corners in pc: 0..100
  rounded: 0,
  // quiet zone in modules
  quiet: 0,
};

export default QRCode;
