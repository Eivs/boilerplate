import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../Checkbox/Checkbox';

class SelectionCheckboxAll extends PureComponent {
  static propTypes = {
    store: PropTypes.object,
    prefixCls: PropTypes.string,
    disabled: PropTypes.bool,
    onSelect: PropTypes.func,
    getRecordKey: PropTypes.func,
    getCheckboxPropsByItem: PropTypes.func,
    data: PropTypes.array,
  };

  getCheckState() {
    const { store, data } = this.props;
    let checked;
    if (!data.length) {
      checked = false;
    } else {
      checked = store.getState().selectionDirty
        ? this.checkSelection(data, 'every', false)
        : this.checkSelection(data, 'every', false) || this.checkSelection(data, 'every', true);
    }
    return checked;
  }

  getIndeterminateState() {
    const { store, data } = this.props;
    let indeterminate;
    if (!data.length) {
      indeterminate = false;
    } else {
      indeterminate = store.getState().selectionDirty
        ? this.checkSelection(data, 'some', false) && !this.checkSelection(data, 'every', false)
        : (this.checkSelection(data, 'some', false)
            && !this.checkSelection(data, 'every', false))
          || (this.checkSelection(data, 'some', true) && !this.checkSelection(data, 'every', true));
    }
    return indeterminate;
  }

  handleSelectAllChagne = e => {
    const { onSelect } = this.props;
    const { checked } = e.target;
    onSelect(checked ? 'all' : 'removeAll', 0, null);
  };

  checkSelection(data, type, byDefaultChecked) {
    const { store, getCheckboxPropsByItem, getRecordKey } = this.props;
    const { selectedRowKeys } = store.getState();
    if (type === 'every' || type === 'some') {
      let fn = (item, i) => selectedRowKeys.indexOf(getRecordKey(item, i)) >= 0;
      if (byDefaultChecked) {
        fn = (item, i) => getCheckboxPropsByItem(item, i).defaultChecked;
      }
      return data[type](fn);
    }
    return false;
  }

  render() {
    const { disabled, prefixCls } = this.props;
    const selectionPrefixCls = `${prefixCls}-selection`;

    return (
      <div className={selectionPrefixCls}>
        <Checkbox
          checked={this.getCheckState()}
          indeterminate={this.getIndeterminateState()}
          disabled={disabled}
          onChange={this.handleSelectAllChagne}
        />
      </div>
    );
  }
}

export default SelectionCheckboxAll;
