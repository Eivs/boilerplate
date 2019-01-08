import createStore from 'react-waterfall';

const config = {
  initialState: { count: 0 },
  actionsCreators: {
    increment: ({ count }) => ({ count: count + 1 }),
  },
};

export const { Provider, connect, actions } = createStore(config);
