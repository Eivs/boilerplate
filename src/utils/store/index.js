import { createContext } from 'react';

import createProvider from './Provider';
import createConnect from './Connect';
import Subscriptions from './subscriptions';
import devtools from './devtools';

const defaultMiddlewares = process.env.NODE_ENV === 'development'
  && typeof window !== 'undefined'
  && window.devToolsExtension
  ? [devtools]
  : [];

const createStore = (
  { initialState, actionsCreators = {} },
  middlewares = [],
) => {
  let provider;
  const context = createContext();

  const { getSubscriptions, subscribe, unsubscribe } = new Subscriptions();

  let state = initialState;

  const setState = (action, result, ...args) => {
    state = { ...state, ...result };
    return new Promise(resolve => {
      const subscriptions = getSubscriptions();
      subscriptions.forEach(fn => fn(action, result, ...args));
      provider.setState(state, () => {
        provider.initializedMiddlewares.forEach(m => m(action, ...args));
        resolve();
      });
    });
  };

  const actions = Object.keys(actionsCreators).reduce(
    (r, v) => ({
      ...r,
      [v]: (...args) => {
        if (!provider) {
          // eslint-disable-next-line no-console
          return console.error('<Provider /> is not initialized yet');
        }

        const result = actionsCreators[v](state, actions, ...args);

        return result.then
          ? result.then(res => setState(v, res, ...args))
          : setState(v, result, ...args);
      },
    }),
    {},
  );

  const setProvider = self => {
    const initializedMiddlewares = [...middlewares, ...defaultMiddlewares].map(
      middleware => middleware({ initialState, actionsCreators }, self, actions),
    );

    provider = {
      setState: (s, callback) => self.setState(s, callback),
      initializedMiddlewares,
    };
  };

  const Provider = createProvider(setProvider, context.Provider, initialState);
  const connect = createConnect(context.Consumer);

  return {
    Provider,
    connect,
    actions,
    subscribe,
    unsubscribe,
  };
};

export default createStore;
