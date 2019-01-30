import 'babel-polyfill';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

import CurveTo from '../src/index.js';

function Demo() {
    return (
        <div>
            <DelayTest />
        </div>
    );
}

class Block extends Component {
    render() {
        const { top, left, color, className } = this.props;
        const style = { top, left, backgroundColor: color };
        return (
            <div
                className={`block ${className}`}
                style={style}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            >
                {this.props.children}
            </div>
        );
    }
}

Block.propTypes = {
    children: PropTypes.any,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    top: PropTypes.string,
    left: PropTypes.string,
    color: PropTypes.string,
    className: PropTypes.string,
};

class DelayTest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetVisible: true,
        };
    }

    render() {
        return (
            <fieldset id="delay-test">
                <legend>Delay Test</legend>

                Demonstrate how to draw a curve to a component which does not
                exist at the moment that the CurveTo component has been mounted.

                <Block
                    className="delay-E"
                    top="80px"
                    left="120px"
                    color="#00f"
                    onMouseOver={() => this.setState({ targetVisible: true })}
                    onMouseOut={() => this.setState({ targetVisible: true })}
                    >E</Block>
                <Block
                    className="delay-F"
                    top="80px"
                    left="400px"
                    color="#f00"
                    >F</Block>
                <CurveTo
                    from="delay-E"
                    to="delay-F"
                    fromAnchor="75% 75%"
                    toAnchor="25% 25%"
                    borderColor="#f00"
                    borderStyle="solid"
                    borderWidth={1}
                    delay={0}
                    curve={-10}
                    />

                <Block
                    className="delay-G"
                    top="180px"
                    left="120px"
                    color="#00f"
                    onMouseOver={() => this.setState({ targetVisible: true })}
                    onMouseOut={() => this.setState({ targetVisible: true })}
                    >E</Block>
                <Block
                    className="delay-H"
                    top="180px"
                    left="400px"
                    color="#f00"
                    >F</Block>
                <CurveTo
                    from="delay-G"
                    to="delay-H"
                    fromAnchor="top"
                    toAnchor="bottom"
                    borderColor="#0f0"
                    borderStyle="dotted"
                    borderWidth={2}
                    delay={1000}
                    curve={0}
                    />

                <Block
                    className="delay-I"
                    top="280px"
                    left="120px"
                    color="#00f"
                    onMouseOver={() => this.setState({ targetVisible: true })}
                    onMouseOut={() => this.setState({ targetVisible: true })}
                    >E</Block>
                <Block
                    className="delay-J"
                    top="280px"
                    left="400px"
                    color="#f00"
                    >F</Block>
                <CurveTo
                    from="delay-I"
                    to="delay-J"
                    fromAnchor="right"
                    toAnchor="left"
                    borderColor="#000"
                    borderStyle="dotted"
                    borderWidth={2}
                    delay={1}
                    curve={10}
                    />
            </fieldset>
       );
    }
}

function createRootElement() {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
    return root;
}

function getRootElement() {
    return document.getElementById('root') ||
        createRootElement();
}

render(
    <Demo />,
    getRootElement()
);
