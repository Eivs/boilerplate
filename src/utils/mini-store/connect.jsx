import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import shallowEqual from '../shallowEqual';
import storeShape from './PropTypes';

const getDisplayName = WrappedComponent => WrappedComponent.displayName || WrappedComponent.name || 'Component';

const isStateless = component => !component.prototype.render;

const defaultMapStateToProps = () => ({});

const connect = (mapStateToProps) => {
  const shouldSubscribe = !!mapStateToProps;

  const finnalMapStateToProps = mapStateToProps || defaultMapStateToProps;

  return function wrapWithConnect(WrappedComponent) {
    class Connect extends Component {
      static displayName = `Connect(${getDisplayName(WrappedComponent)})`;

      static contextTypes = {
        miniStore: storeShape.isRequired,
      };

      static getDerivedStateFromProps(props, prevState) {
        if (mapStateToProps && mapStateToProps.length === 2 && props !== prevState.props) {
          return {
            subscribed: finnalMapStateToProps(prevState.store.getState(), props),
            props,
          };
        }
        return { props };
      }

      constructor(props, context) {
        super(props, context);

        this.store = context.miniStore;
        this.state = {
          subscribed: finnalMapStateToProps(this.store.getState(), props),
          store: this.store,
          props,
        };
      }

      componentDidMount() {
        this.trySubscribe();
      }

      shouldComponentUpdate(nextProps, nextState) {
        const { subscribed } = this.state;
        return (
          !shallowEqual(this.props, nextProps) || !shallowEqual(subscribed, nextState.subscribed)
        );
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
      }

      getWrappedInstance() {
        return this.wrappedInstance;
      }

      handleChange = () => {
        if (!this.unsubscribe) {
          return;
        }

        const nextState = finnalMapStateToProps(this.store.getState(), this.props);
        this.setState({ subscribed: nextState });
      };

      tryUnsubscribe() {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }

      trySubscribe() {
        if (shouldSubscribe) {
          this.unsubscribe = this.store.subscribe(this.handleChange);
          this.handleChange();
        }
      }

      render() {
        const { subscribed } = this.state;
        let props = {
          ...this.props,
          ...subscribed,
          store: this.store,
        };

        if (!isStateless(WrappedComponent)) {
          props = {
            ...props,
            ref: (c) => {
              this.wrappedInstance = c;
            },
          };
        }
        return <WrappedComponent {...props} />;
      }
    }

    return hoistStatics(Connect, WrappedComponent);
  };
};

export default connect;
