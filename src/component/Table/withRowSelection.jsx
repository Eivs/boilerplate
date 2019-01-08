import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withProps } from 'recompose';
import { actions, connect } from './TableStore';

@connect(state => ({ selectedRowKeys: state.selectedRowKeys }))
class CheckBox extends PureComponent {
  static propTypes = {
    selectType: PropTypes.string,
    onChange: PropTypes.func,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    record: PropTypes.object,
    selectedRowKeys: PropTypes.array,
  };

  static defaultProps = {
    selectedRowKeys: [],
  };

  get checked() {
    const { selectedRowKeys, rowKey } = this.props;
    return selectedRowKeys.includes(rowKey);
  }

  onChange = e => {
    const { onChange, record, rowKey } = this.props;
    const { currentTarget } = e;
    e.stopPropagation();
    if (currentTarget.checked) {
      actions.add(rowKey);
    } else {
      actions.remove(rowKey);
    }
    onChange(rowKey, record);
  };

  render() {
    const { selectType } = this.props;
    return (
      <input type={selectType || 'checkbox'} checked={this.checked} onChange={this.onChange} />
    );
  }
}

const createCheckBoxCol = props => {
  const { rowSelection, columns } = props;
  const { type, onChange } = rowSelection;

  const renderCheckBox = (record, index, rowKey) => (
    <CheckBox record={record} selectType={type} onChange={onChange} rowKey={rowKey} />
  );

  return [
    {
      dataIndex: 'selection-column',
      title: '',
      render: renderCheckBox,
    },
    ...columns,
  ];
};

const withRowSelection = withProps(props => ({
  columns: createCheckBoxCol(props),
}));

export default withRowSelection;
