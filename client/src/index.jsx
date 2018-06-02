import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
      name: '',
      condition: '',
      price: 0,
      minimum: 0,
      watchers: 0,
      endtime: '0d0h',
      bids: 0,
      bidAmount: 0
    }
    this.handleBidChange = this.handleBidChange.bind(this);
    this.handleBidSubmit = this.handleBidSubmit.bind(this);
    this.addWatcher = this.addWatcher.bind(this);
  }

  componentDidMount() {
    axios.get('/api/auction')
    .then(({ data }) => {
      this.setState({
        id: data.id,
        name: data.name,
        condition: data.condition,
        minimum: data.minimum,
        watchers: data.watchers,
        endtime: data.endtime
      })
    }).catch(err => {
      console.log('error fetching product data', err);
    })
  }

  handleBidChange(e) {
    this.setState({
      bidAmount: e.target.value
    }, () => console.log('this.state.bidAmount =', this.state.bidAmount))
  }

  handleBidSubmit() {
    axios.post('/api/auction/bid', {
      id: this.state.id,
      bidAmount: this.state.bidAmount
    }).then(data => {
      this.setState({
        bids: data.bids,
        price: data.price
      })
    }).catch(err => {
      console.log('error submitting bid', err);
    })
  }

  addWatcher() {
    axios.post('/api/auction', {
      id: this.state.id
    }).then(data => {
      console.log('now watching item');
      this.componentDidMount();
    }).catch(err => {
      console.log('we\'re sorry, there was an error when trying to add this item to your watchlist');
    })
  }

  render() {
    return (
      <div>
        <div id="name">{this.state.name}</div>
        <div id="watchers">Watchers: {this.state.watchers}</div>
        <div id="condition">Condition: {this.state.condition}</div>
        <form id="bid-form" onSubmit={this.handleBidSubmit}>
          <input onChange={this.handleBidChange}/>
          <button>Make Offer</button>
        </form>
        <div id="bids">Bids made: {this.props.bids}</div>
        <div id="price">Current Bid: {this.state.price}</div>
        <div id="minimum">Minimum Bid: {this.state.minimum}</div>
        <div id="endtime">Bid Ends: {this.state.endtime}</div>
        <div id="watchers-button">
          <button onClick={this.addWatcher}>Watch this item</button>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
