import { Component } from 'react';

type State = {
  hash?: string;
  results: any;
  inputValue?: string;
};

class Index extends Component {
  state: State = {
    results: null,
    inputValue: '',
  };

  private db: any;

  componentDidMount() {
    const IPFS = require('ipfs');
    const OrbitDB = require('orbit-db');

    // OrbitDB uses Pubsub which is an experimental feature
    // and need to be turned on manually.
    // Note that these options need to be passed to IPFS in
    // all examples even if not specified so.
    const ipfsOptions = {
      EXPERIMENTAL: {
        pubsub: true
      }
    };

    // Create IPFS instance
    const ipfs = new IPFS(ipfsOptions);

    ipfs.on('error', (error: Error) => {
      console.error(error);
    });

    ipfs.on('ready', async () => {
      const address = require('../config/address.json').value;
      const orbitdb = await OrbitDB.createInstance(ipfs);
      const options = {
        accessController: {
          write: ['*']
        }
      }

      // Create / Open a database
      const db = window.__db = this.db = await orbitdb.docs('orbit.test', options);
      await db.load();

      // Listen for updates from peers
      db.events.on('replicated', () => {
        console.log('replicated', db.iterator({ limit: -1 }).collect());
      });
    });
  }

  onInputChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      inputValue: ev.currentTarget.value,
    });
  }

  onInsertDocument = async () => {
    const { inputValue } = this.state;

    const hash = await this.db.put({
      _id: Math.random().toString(32).slice(2),
      name: inputValue
    });

    // Query
    const results = this.db.get('');

    this.setState({
      hash,
      results,
    });
  }

  render() {
    const {
      hash,
      results,
      inputValue,
    } = this.state;

    return (
      <div>
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={this.onInputChange}
            placeholder="Insert"
          />
          <button
            type="button"
            onClick={this.onInsertDocument}
          >
            insert
          </button>
        </div>

        {hash && (
          <div>
            <h3>Hash</h3>
            <pre>{JSON.stringify(hash, null, 2)}</pre>
          </div>
        )}

        {results && (
          <div>
            <h3>Result</h3>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
}

export default Index;
