const create = initialState => {
  let state = initialState;
  const listeners = [];

  const setState = partial => {
    state = { ...state, ...partial };
    for (let i = 0; i < listeners.length; i += 1) {
      listeners[i]();
    }
  };

  const getState = () => state;

  const subscribe = listener => {
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  return {
    setState,
    getState,
    subscribe,
  };
};

export default create;
