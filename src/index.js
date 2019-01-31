import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';

const defaultAnchor = { x: 0.5, y: 0.5 };
const defaultBorderColor = '#f00';
const defaultBorderStyle = 'solid';
const defaultBorderWidth = 1;

const optionalStyleProps = {
  borderColor: PropTypes.string,
  borderStyle: PropTypes.string,
  borderWidth: PropTypes.number,
  className: PropTypes.string,
  zIndex: PropTypes.number,
};

export default class CurveTo extends Component {
  componentWillMount() {
    this.fromAnchor = this.parseAnchor(this.props.fromAnchor);
    this.toAnchor = this.parseAnchor(this.props.toAnchor);
    this.delay = this.parseDelay(this.props.delay);
  }

  componentDidMount() {
    this.delay = this.parseDelay(this.props.delay);
    if (typeof this.delay !== 'undefined') {
      this.deferUpdate(this.delay);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fromAnchor !== this.props.fromAnchor) {
      this.fromAnchor = this.parseAnchor(this.props.fromAnchor);
    }
    if (nextProps.toAnchor !== this.props.toAnchor) {
      this.toAnchor = this.parseAnchor(this.props.toAnchor);
    }
    this.delay = this.parseDelay(nextProps.delay);
    if (typeof this.delay !== 'undefined') {
      this.deferUpdate(this.delay);
    }
  }

  componentWillUnmount() {
    if (this.t) {
      clearTimeout(this.t);
      this.t = null;
    }
  }

  shouldComponentUpdate() {
    // Always update component if the parent component has been updated.
    // The reason for this is that we would not only like to update
    // this component when the props have changed, but also when
    // the position of our target elements has changed.
    // We could return true only if the positions of `from` and `to` have
    // changed, but that may be expensive and unnecessary.
    return true;
  }

  // Forced update after delay (MS)
  deferUpdate(delay) {
    if (this.t) {
      clearTimeout(this.t);
    }
    this.t = setTimeout(() => this.forceUpdate(), delay);
  }

  parseDelay(value) {
    if (typeof value === 'undefined') {
      return value;
    } else if (typeof value === 'boolean' && value) {
      return 0;
    }
    const delay = parseInt(value, 10);
    if (isNaN(delay) || !isFinite(delay)) {
      throw new Error(`LinkTo could not parse delay attribute "${value}"`);
    }
    return delay;
  }

  parseAnchorPercent(value) {
    const percent = parseFloat(value) / 100;
    if (isNaN(percent) || !isFinite(percent)) {
      throw new Error(`LinkTo could not parse percent value "${value}"`);
    }
    return percent;
  }

  parseAnchorText(value) {
    // Try to infer the relevant axis.
    switch (value) {
        case 'top':
            return { y: 0 };
        case 'left':
            return { x: 0 };
        case 'middle':
            return { y: 0.5 };
        case 'center':
            return { x: 0.5 };
        case 'bottom':
            return { y: 1 };
        case 'right':
            return { x: 1 };
    }
    return null;
}

  parseAnchor(value) {
    if (!value) {
      return defaultAnchor;
    }
    const parts = value.split(' ');
    if (parts.length > 2) {
      throw new Error('LinkTo anchor format is "<x> <y>"');
    }
    const [x, y] = parts;
    return Object.assign({}, defaultAnchor,
      x ? this.parseAnchorText(x) || { x: this.parseAnchorPercent(x) } : {},
      y ? this.parseAnchorText(y) || { y: this.parseAnchorPercent(y) } : {}
    );
  }

  findElement(className) {
    return document.getElementsByClassName(className)[0];
  }

  detect() {
    const { from, to, within = '', } = this.props;

    const a = this.findElement(from);
    const b = this.findElement(to);

    if (!a || !b) {
      return false;
    }

    const anchor0 = this.fromAnchor;
    const anchor1 = this.toAnchor;

    const box0 = a.getBoundingClientRect();
    const box1 = b.getBoundingClientRect();

    let offsetX = window.pageXOffset;
    let offsetY = window.pageYOffset;

    if (within) {
      const p = this.findElement(within);
      const boxp = p.getBoundingClientRect();

      offsetX -= boxp.left;
      offsetY -= boxp.top;
    }

    const x0 = box0.left + box0.width * anchor0.x + offsetX;
    const x1 = box1.left + box1.width * anchor1.x + offsetX;
    const y0 = box0.top + box0.height * anchor0.y + offsetY;
    const y1 = box1.top + box1.height * anchor1.y + offsetY;

    return { x0, y0, x1, y1 };
  }

  render() {
    const points = this.detect();
    return points ? (
      <Curve {...points} {...this.props} />
    ) : null;
  }
}

CurveTo.propTypes = Object.assign({}, {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  curveTo: PropTypes.array.isRequired,
  curveFrom: PropTypes.array.isRequired,
  within: PropTypes.string,
  fromAnchor: PropTypes.string,
  toAnchor: PropTypes.string,
  delay: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
}, optionalStyleProps);

export class Curve extends PureComponent {

  componentDidMount() {
    // Append rendered DOM element to the container the
    // offsets were calculated for
    this.within.appendChild(this.node);
  }

  componentWillUnmount() {
    this.within.removeChild(this.el);
  }

  findElement(className) {
    return document.getElementsByClassName(className)[0];
  }

  calcCurve(curve, x0, y0, x1) {

    const centerX = (x1 - x0) / 2;
    // const centerY = (y1 - y0) / 2;

    return { x: x0 + centerX + curve * 10, y: y0 + 50 }
  }

  render() {
    const { x0, y0, x1, y1, within = '', curveTo = [0, 0], curveFrom = [0, 0] } = this.props;

    this.within = within ? this.findElement(within) : document.body;

    const positionStyle = {
      zIndex: Number.isFinite(this.props.zIndex)
                      ? String(this.props.zIndex)
                      : '1',
    };

    const defaultStyle = {
      borderTopColor: this.props.borderColor || defaultBorderColor,
      borderTopStyle: this.props.borderStyle || defaultBorderStyle,
      borderTopWidth: this.props.borderWidth || defaultBorderWidth,
    };

    const props = {
      className: this.props.className,
      style: Object.assign({}, defaultStyle, positionStyle),
    }

    const styles = {
      stroke: props.style.borderTopColor,
      strokeWidth: props.style.borderTopWidth,
      strokeStyle: props.style.borderTopStyle,
      className: props.className,
      zIndex: props.style.zIndex,
    }

    // const curveDraw = this.calcCurve(curve, x0, y0, x1);

    // As we've seen before, the quadratic Bézier curve
    // involves moving to the starting point, and then
    // specifying the control and end points with `Q`
    const instructions = `
      M ${x0},${y0}
      C ${x0 + curveFrom[0]},${y0 + curveFrom[1]} ${x1 + curveTo[0]},${y1 + curveTo[1]} ${x1},${y1}
    `;
    // Q ${curveDraw.x},${curveDraw.y} ${x1},${y1}
    // C ${x0 + 100},${y0} ${x1 - 50},${y1 + 50} ${x1},${y1}

    // We need a wrapper element to prevent an exception when then
    // React component is removed. This is because we manually
    // move the rendered DOM element after creation.
    return (
      <div className="react-curveto-placeholder">
        <svg
        className={styles.className}
        ref={(node) => (this.node = node)}
        style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0, zIndex: styles.zIndex }}
        >
          <CurvePath instructions={instructions} styles={styles} />
        </svg>
      </div>
    );
  }
}

Curve.propTypes = Object.assign({}, {
  x0: PropTypes.number.isRequired,
  y0: PropTypes.number.isRequired,
  x1: PropTypes.number.isRequired,
  y1: PropTypes.number.isRequired,
}, optionalStyleProps);

const CurvePath = ({ instructions, styles }) => (
    <path

        d={instructions}
        fill="none"
        stroke={styles.stroke}
        strokeWidth={styles.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={styles.strokeStyle === 'solid' ? '' : '5,5'}
    />
);
CurvePath.propTypes = Object.assign({}, {
  instructions: PropTypes.string.isRequired,
  styles: PropTypes.object.isRequired,
});
