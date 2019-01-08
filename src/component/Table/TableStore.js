// import createStore from 'react-waterfall';
import createStore from '../../utils/store/index';

const config = {
  initialState: { selectedRowKeys: [] },
  actionsCreators: {
    add: ({ selectedRowKeys }, actions, rowKey) => {
      if (!selectedRowKeys.includes(rowKey)) {
        return {
          selectedRowKeys: [...selectedRowKeys, rowKey],
        };
      }
      return { selectedRowKeys };
    },
    remove: ({ selectedRowKeys }, actions, rowKey) => {
      if (selectedRowKeys.includes(rowKey)) {
        return {
          selectedRowKeys: selectedRowKeys.filter(key => key !== rowKey),
        };
      }
      return { selectedRowKeys };
    },
  },
};

export const { Provider, connect, actions } = createStore(config);
