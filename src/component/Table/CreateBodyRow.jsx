import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { omit } from 'lodash';

const createTableRow = (RowComponent = 'tr') => {
  class BodyRow extends Component {
    static propTypes = {
      store: PropTypes.object,
      className: PropTypes.string,
      rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]),
      prefixCls: PropTypes.string,
      children: PropTypes.node,
    };

    constructor(props) {
      super(props);
      this.store = props.store;
      const { selectedRowKeys } = this.store.getState();

      this.state = {
        selected: selectedRowKeys.indexOf(props.rowKey) >= 0,
      };
    }

    componentDidMount() {
      this.subscribe();
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    subscribe() {
      const { store, rowKey } = this.props;
      this.unsubscribe = store.subscribe(() => {
        const { selectedRowKeys } = this.store.getState();
        const selected = selectedRowKeys.indexOf(rowKey) >= 0;
        const { selected: stateSelected } = this.state;
        if (selected !== stateSelected) {
          this.setState({ selected });
        }
      });
    }

    render() {
      const { className: propsClassName, prefixCls, children } = this.props;
      const { selected } = this.state;
      const rowProps = omit(this.props, ['prefixCls', 'rowKey', 'store']);
      const className = classnames(propsClassName, {
        [`${prefixCls}-row-selected`]: selected,
      });

      return (
        <RowComponent
          {...rowProps}
          className={className}
        >
          {children}
        </RowComponent>
      );
    }
  }

  return BodyRow;
};

export default createTableRow;
