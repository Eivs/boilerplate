import React from 'react';

// Import React Table
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import checkboxHOC from 'react-table/lib/hoc/selectTable';

const CheckboxTable = checkboxHOC(ReactTable);

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      selection: [],
      selectAll: false,
      results: 100,
      pagination: {
        pageSize: 100,
      },
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = (params = {}) => {
    const { results } = this.state;
    const url = new URL('https://randomuser.me/api');
    const newParams = { ...params, results };
    Object.keys(newParams).forEach(key => url.searchParams.append(key, newParams[key]));
    fetch(url, {
      method: 'get',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then((data) => {
        const { pagination } = this.state;
        pagination.total = 200;
        this.setState({
          data: data.results.map(item => ({
            _id: item.login.uuid,
            ...item,
          })),
          pagination,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  toggleSelection = (key) => {
    const { selection: stateSelection } = this.state;
    let selection = [...stateSelection];
    const keyIndex = selection.indexOf(key);
    if (keyIndex >= 0) {
      selection = [...selection.slice(0, keyIndex), ...selection.slice(keyIndex + 1)];
    } else {
      selection.push(key);
    }
    this.setState({ selection });
  };

  toggleAll = () => {
    const { selectAll } = this.state;
    const selection = [];
    if (!selectAll) {
      const wrappedInstance = this.checkboxTable.getWrappedInstance();
      const currentRecords = wrappedInstance.getResolvedState().data;
      currentRecords.forEach((item) => {
        selection.push(item.login.uuid);
      });
    }
    this.setState({ selectAll: !selectAll, selection });
  };

  isSelected = (key) => {
    const { selection } = this.state;
    return selection.includes(key);
  };

  logSelection = () => {
    const { selection } = this.state;
    console.log('selection:', selection);
  };

  render() {
    const {
      toggleSelection, toggleAll, isSelected, logSelection,
    } = this;
    const { data, selectAll } = this.state;

    const checkboxProps = {
      keyField: '_id',
      selectAll,
      isSelected,
      toggleSelection,
      toggleAll,
      selectType: 'checkbox',
      getTrProps: (state, row) => {
        if (row !== undefined) {
          const { uuid } = row.original.login;
          const selected = this.isSelected(uuid);
          return {
            style: {
              backgroundColor: selected ? 'lightgreen' : 'inherit',
            },
          };
        }
        return {};
      },
    };

    return (
      <div>
        <button
          type="button"
          onClick={logSelection}
        >
          Log Selection
        </button>
        <CheckboxTable
          ref={(r) => {
            this.checkboxTable = r;
          }}
          data={data}
          columns={[
            {
              Header: 'Name',
              accessor: 'name',
              Cell: ({ row }) => `${row.name.first} ${row.name.last}`,
            },
            {
              Header: 'Gender',
              accessor: 'gender',
            },
            {
              Header: 'Email',
              accessor: 'email',
            },
            {
              Header: 'Phone',
              accessor: 'phone',
            },
          ]}
          defaultPageSize={100}
          className="-striped -highlight"
          {...checkboxProps}
        />
      </div>
    );
  }
}

export default App;
