import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withProps } from 'recompose';
import { actions, connect } from './TableStore';

@connect(({ selectedRowKeys }, { rowKey }) => ({
  checked: selectedRowKeys.includes(rowKey),
}))
class CheckBox extends PureComponent {
  static propTypes = {
    selectType: PropTypes.oneOf(['checkbox', 'radio']),
    onChange: PropTypes.func,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    record: PropTypes.object,
    checked: PropTypes.bool,
  };

  static defaultProps = {
    onChange: () => {},
    selectType: 'checkbox',
    checked: false,
  };

  onChange = e => {
    const { onChange, record, rowKey } = this.props;
    const { currentTarget } = e;
    if (currentTarget.checked) {
      actions.add(rowKey);
    } else {
      actions.remove(rowKey);
    }
    onChange(rowKey, record);
  };

  render() {
    const { selectType, checked } = this.props;
    return (
      <input
        type={selectType || 'checkbox'}
        checked={checked}
        onChange={this.onChange}
      />
    );
  }
}

const createCheckBoxCol = props => {
  const { rowSelection, columns } = props;
  const { type, onChange } = rowSelection;

  const renderCheckBox = (record, index, rowKey) => (
    <CheckBox
      record={record}
      selectType={type}
      onChange={onChange}
      rowKey={rowKey}
    />
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
