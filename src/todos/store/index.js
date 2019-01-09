import createStore from '../../utils/store';

import initialState from './state';
import actionsCreators from './actions';

const config = {
  initialState,
  actionsCreators,
};

export const { Provider, connect, actions } = createStore(config);
