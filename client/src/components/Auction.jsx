import React from 'react';
import moment from 'moment';
import CSSModules from 'react-css-modules';
import getProductInfo from '../services/getProductInfo';
import getBids from '../services/getBids';
import postBid from '../services/postBid';
import postWatcher from '../services/postWatcher';
import styles from './Auction.css';

export class Auction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: 1,
      condition: '',
      minimum: '',
      watchers: '',
      daysLeft: '',
      hoursLeft: '',
      secondsLeft: '',
      endDate: '',
      bidInput: '',
      bidCount: '',
      currentBid: '',
      message: '',
      alert: '',
    };
    this.fetchProductInfo = this.fetchProductInfo.bind(this);
    this.fetchBids = this.fetchBids.bind(this);
    this.handleBidChange = this.handleBidChange.bind(this);
    this.handleBidSubmit = this.handleBidSubmit.bind(this);
    this.addWatcher = this.addWatcher.bind(this);
  }

  componentDidMount() {
    this.fetchProductInfo();
  }

  fetchProductInfo() {
    const { id } = this.state;
    getProductInfo({ id })
      .then(({ data }) => {
        const endDate = moment(data.createdAt).add(7, 'days');
        const timeLeft = moment.duration(endDate.diff(moment()));
        this.setState({
          id: data.id,
          condition: data.condition,
          minimum: data.minimum,
          watchers: data.watchers,
          daysLeft: timeLeft.days(),
          hoursLeft: timeLeft.hours(),
          secondsLeft: timeLeft.seconds(),
          endDate: endDate.format('dddd, h:mmA'),
        });
      })
      .then(() => {
        this.fetchBids();
      }).catch(e =>
        console.error(e)
      );
  }

  fetchBids() {
    const { id } = this.state;
    getBids({
      productId: id,
    }).then(({ data }) => {
      const currentBid = data[1].toFixed(2);
      let bidCount = `${data[0]} bid`;
      if (data[0] > 1) {
        bidCount = `${data[0]} bids`;
      }
      this.setState({
        bidCount,
        currentBid,
        message: `Enter $${parseInt(currentBid, 10) + 0.01} or more`,
      });
    }).catch(e => 
      console.error(e)
    );
  }

  addWatcher() {
    const { id } = this.state;
    postWatcher({ id }).then(() => {
      this.fetchProductInfo();
    }).catch(e =>
      console.error(e)
    );
  }

  handleBidChange(e) {
    this.setState({ bidInput: e.target.value });
  }

  handleBidSubmit(e) {
    e.preventDefault();
    e.target.reset();
    const regex = /^[1-9]\d*(?:\.\d{0,2})$/;
    const { secondsLeft, bidInput, minimum, currentBid, id } = this.state;
    if (!parseInt(secondsLeft, 10)) {
      this.setState({
        alert: 'This auction has ended',
      });
    } else if (
      !regex.test(bidInput) ||
      parseInt(bidInput, 10) === parseInt(currentBid, 10)
    ) {
      this.setState({
        alert: 'Please enter a valid bid amount',
      });
    } else if (parseInt(bidInput, 10) < parseInt(minimum, 10)) {
      this.setState({
        alert: 'Invalid bid, your bid is below the minimum',
      });
    } else if (parseInt(bidInput, 10) < parseInt(currentBid, 10)) {
      this.setState({
        alert: 'Invalid bid, your bid is lower than the current bid',
      });
    } else {
      postBid({ id, bidInput }).then(() => {
        this.fetchBids();
        this.setState({
          alert: '',
        });
      }).catch(e =>
        console.error(e)
      );
    }
  }

  render() {
    const {
      condition,
      daysLeft,
      hoursLeft,
      endDate,
      currentBid,
      bidCount,
      watchers,
      message,
      alert,
    } = this.state;
    return (
      <div styleName="auction-container">
        <div styleName="info-bids-container">
          <div styleName="info-container">
            <div styleName="col-1">Condition: </div>
            <div styleName="condition">{condition}</div>
            <div>
              <div styleName="col-1">Time left: </div>
              <div styleName="end-time">
                {`${daysLeft}d ${hoursLeft}h `}
                <span styleName="end-date">{endDate}</span>
              </div>
            </div>
          </div>
          <div styleName="bid-container">
            <div styleName="col-1">Current bid: </div>
            <div styleName="col-2">
              <span styleName="current-bid">{`$${currentBid}`}</span>
            </div>
            <div styleName="col-3">
              <a href="/">{`[ ${bidCount} ]`}</a>
            </div>
            <div styleName="bid-form">
              <form onSubmit={this.handleBidSubmit}>
                <div styleName="col-1" />
                <div styleName="col-2">
                  <input
                    styleName="bid-input"
                    onChange={this.handleBidChange}
                  />
                </div>
                <div styleName="col-3">
                  <button styleName="place-bid" type="submit">
                    Place bid
                  </button>
                </div>
              </form>
            </div>
            <div styleName="col-1" />
            <div styleName="col-2">
              <span styleName="instruction">{message}</span>
              <div styleName="alert">{alert}</div>
            </div>
            <div styleName="col-3" />
            <div>
              <div styleName="col-1" />
              <div styleName="col-2" />
              <div styleName="col-3">
                <button
                  styleName="add-watcher"
                  type="button"
                  onClick={this.addWatcher}
                >
                  <i className="fa fa-eye" />
                  {` Add to watch list`}
                </button>
              </div>
            </div>
            <div styleName="watchers">{`${watchers} watchers `}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default CSSModules(Auction, styles);
