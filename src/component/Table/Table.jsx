import { compose, pure } from 'recompose';
import BaseTable from './BaseTable';
import withRowSelection from './withRowSelection';

const withTableLogic = compose(
  pure,
  withRowSelection,
);

export default withTableLogic(BaseTable);
