import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Radio from '../Radio/Radio';
import Checkbox from '../Checkbox/Checkbox';

class SelectionBox extends Component {
  static propTypes = {
    rowIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]),
    type: PropTypes.string,
    store: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      checked: this.getCheckState(props),
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

  getCheckState = props => {
    const { store, defaultSelection, rowIndex } = props;
    let checked = false;
    if (store.getState().selectionDirty) {
      checked = store.getState().selectedRowKeys.indexOf(rowIndex) >= 0;
    } else {
      checked = store.getState().selectedRowKeys.indexOf(rowIndex) >= 0
        || defaultSelection.indexOf(rowIndex) >= 0;
    }
    return checked;
  };

  subscribe() {
    const { store } = this.props;
    this.unsubscribe = store.subscribe(() => {
      const checked = this.getCheckState(this.props);
      this.setState({ checked });
    });
  }

  render() {
    const { type, rowIndex, onChange, disabled } = this.props;
    const { checked } = this.state;
    if (type === 'radio') {
      return (
        <Radio
          checked={checked}
          value={rowIndex}
          onChange={onChange}
          disabled={disabled}
        />
      );
    }
    return (
      <Checkbox
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }
}

export default SelectionBox;
