import React, { Component } from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';
import BaseFooterCell from './FooterCell';
import ColumnUtilsMixin from'./ColumnUtils';
import PropTypes from 'prop-types';
import createObjectWithProperties from './createObjectWithProperties';
import ExcelColumn from './PropTypeShapes/ExcelColumn';
import getScrollbarSize from './getScrollbarSize';
const createReactClass = require('create-react-class');
const ScrollShim = require('./ScrollShim');

const knownDivPropertyKeys = ['width', 'height', 'style', 'onScroll'];

const FooterRow = createReactClass({
  mixins: [ColumnUtilsMixin, ScrollShim],

  componentWillMount() {
    this.cells = [];
  },

  onScroll(e: any) {
    if (ReactDOM.findDOMNode(this) !== e.target) {
      return;
    }
    this.appendScrollShim();
    let scrollLeft = e.target.scrollLeft;
    let scrollTop = e.target.scrollTop;
    let scroll = { scrollTop, scrollLeft };
    this._scroll = scroll;
    this.props.onScroll(scroll);
  },

  getStyle() {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'absolute'
    };
  },

  getRenderer(column) {
    const Summary = column.summary;
    if (Summary) {
      return (
        <Summary {...this.props} column={column} />
      );
    }
    return <div />;
  },

  getCells() {
    const cells = [];
    const lockedCells = [];

    this.props.columns.forEach((column, idx) => {
      const renderer = this.getRenderer(column);

      const cell = (
        <BaseFooterCell
          ref={(node) => this.cells[idx] = node}
          key={idx}
          height={this.props.height}
          column={column}
          renderer={renderer}
          resizing={this.props.resizing === column}
          onResize={this.props.onColumnResize}
          onResizeEnd={this.props.onColumnResizeEnd}
          onScroll={this.onScroll}
        />
      );
      if (column.locked) {
        lockedCells.push(cell);
      } else {
        cells.push(cell);
      }
    });
    return cells.concat(lockedCells);
  },

  setScrollLeft(scrollLeft: number) {
    this.props.columns.forEach( (column, i) => {
      if (column.locked) {
        this.cells[i].setScrollLeft(scrollLeft);
      } else {
        if (this.cells[i] && this.cells[i].removeScroll) {
          this.cells[i].removeScroll();
        }
      }
    });
  },

  getKnownDivProps() {
    return createObjectWithProperties(this.props, knownDivPropertyKeys);
  },

  render() {
    let cellsStyle = {
      width: this.props.width ? (this.props.width + getScrollbarSize()) : '100%',
      height: this.props.height,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };

    let cells = this.getCells();
    return (
      
      <div
        {...this.getKnownDivProps()}
        className="react-grid-HeaderRow"
        onScroll={this.onScroll}
      >
        <div style={cellsStyle} >
          {cells}
        </div>
      </div>
    );
  }
});

export default FooterRow;
