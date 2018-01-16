import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import joinClasses from 'classnames';
import shallowCloneObject from './shallowCloneObject';
import ColumnMetrics from'./ColumnMetrics';
import ColumnUtils from'./ColumnUtils';
import getScrollbarSize  from'./getScrollbarSize';
import PropTypes from 'prop-types';
import createObjectWithProperties from'./createObjectWithProperties';
import cellMetaDataShape from './PropTypeShapes/CellMetaDataShape';
import FooterRow from './FooterRow';

// The list of the propTypes that we want to include in the Footer div
const knownDivPropertyKeys = ['height', 'onScroll'];

class Footer extends Component {
  static propTypes = {
    columnMetrics: PropTypes.shape({  width: PropTypes.number.isRequired, columns: PropTypes.any }).isRequired,
    totalWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number.isRequired,
    onColumnResize: PropTypes.func,
    onScroll: PropTypes.func,
    cellMetaData: PropTypes.shape(cellMetaDataShape)
  };

  state = {resizing: null};

  componentWillReceiveProps() {
    this.setState({resizing: null});
  }

  shouldComponentUpdate(nextProps, nextState) {
    // let update =  !(ColumnMetrics.sameColumns(this.props.columnMetrics.columns, nextProps.columnMetrics.columns, ColumnMetrics.sameColumn))
    // || this.props.totalWidth !== nextProps.totalWidth
    // || (this.state.resizing !== nextState.resizing);
    // return update;
    return true;
  }

  onColumnResize = (column, width) => {
    let state = this.state.resizing || this.props;

    let pos = this.getColumnPosition(column);

    if (pos != null) {
      let resizing = {
        columnMetrics: shallowCloneObject(state.columnMetrics)
      };
      resizing.columnMetrics = ColumnMetrics.resizeColumn(
          resizing.columnMetrics, pos, width);

      // we don't want to influence scrollLeft while resizing
      if (resizing.columnMetrics.totalWidth < state.columnMetrics.totalWidth) {
        resizing.columnMetrics.totalWidth = state.columnMetrics.totalWidth;
      }

      resizing.column = ColumnUtils.getColumn(resizing.columnMetrics.columns, pos);
      this.setState({resizing});
    }
  };

  onColumnResizeEnd = (column, width) => {
    let pos = this.getColumnPosition(column);
    if (pos !== null && this.props.onColumnResize) {
      this.props.onColumnResize(pos, width || column.width);
    }
  };

  getFooterRows = (): Array<HeaderRow> => {
    let columnMetrics = this.getColumnMetrics();
    let resizeColumn;
    if (this.state.resizing) {
      resizeColumn = this.state.resizing.column;
    }
    let footerRows = [];
    let rowHeight = 'auto';
    let scrollbarSize = getScrollbarSize() > 0 ? getScrollbarSize() : 0;
    let updatedWidth = isNaN(this.props.totalWidth - scrollbarSize) ? this.props.totalWidth : this.props.totalWidth - scrollbarSize;
    let footerRowStyle = {
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: updatedWidth,
      overflowX: 'hidden',
      minHeight: rowHeight
    };

    footerRows.push(<FooterRow
      ref={(node) => this.footerRow = node}
      style={footerRowStyle}
      onColumnResize={this.onColumnResize}
      onColumnResizeEnd={this.onColumnResizeEnd}
      width={columnMetrics.width}
      height={this.props.height}
      columns={columnMetrics.columns}
      resizing={resizeColumn}
      onScroll={this.props.onScroll}
      rowGetter={this.props.rowGetter}
      rowsCount={this.props.rowsCount}
    />);

    return footerRows;
  };

  getColumnMetrics = () => {
    let columnMetrics;
    if (this.state.resizing) {
      columnMetrics = this.state.resizing.columnMetrics;
    } else {
      columnMetrics = this.props.columnMetrics;
    }
    return columnMetrics;
  };

  getColumnPosition = (column: Column): ?number => {
    let columnMetrics = this.getColumnMetrics();
    let pos = -1;
    columnMetrics.columns.forEach((c, idx) => {
      if (c.key === column.key) {
        pos = idx;
      }
    });
    return pos === -1 ? null : pos;
  };

  getStyle = (): {position: string; height: number} => {
    return {
      position: 'relative',
      height: this.props.height
    };
  };

  setScrollLeft = (scrollLeft: number) => {
    let node = ReactDOM.findDOMNode(this.footerRow);
    node.scrollLeft = scrollLeft;
    this.footerRow.setScrollLeft(scrollLeft);
  };

  getKnownDivProps = () => {
    return createObjectWithProperties(this.props, knownDivPropertyKeys);
  };

  render(): ?ReactElement {
    let className = joinClasses({
      'react-grid-Header': true,
      'react-grid-Header--resizing': !!this.state.resizing
    });
    let footerRows = this.getFooterRows();

    return (
      <div {...this.getKnownDivProps()} style={this.getStyle()} className={className}>
        {footerRows}
      </div>
    );
  }
}

export default Footer;
