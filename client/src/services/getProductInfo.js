import axios from 'axios';

const getProductInfo = props =>
  axios.get(`${process.env.IP}/api/auction/product`, {
    params: props,
  });

export default getProductInfo;
