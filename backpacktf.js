const axios = require('axios');
const { BPTF_API_KEY, BPTF_USER_TOKEN } = require('./config');
const Logger = require('./logger');

const logger = new Logger("BPTF");

const BASE_URL = 'https://backpack.tf/api/';

async function makeRequest(endpoint, params) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const clonedParams = { ...params, key: BPTF_API_KEY }; // Clone and add API key

    const headers = {
      'X-Auth-Token': BPTF_USER_TOKEN
    };

    // Debug logs
    logger.debug(`Making request to URL: ${url}`);
    logger.debug(`With parameters: ${JSON.stringify(clonedParams, null, 2)}`);
    logger.debug(`And headers: ${JSON.stringify(headers, null, 2)}`);

    const response = await axios.get(url, { params: clonedParams, headers });
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`Error in API request: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      // The request was made but no response was received
      logger.error(`No response received: ${JSON.stringify(error.request, null, 2)}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error(`Error in API request setup: ${error.message}`);
    }
    return null;
  }
}

async function getCurrencies(raw = 2) {
  const endpoint = 'IGetCurrencies/v1';
  const params = { raw };
  const data = await makeRequest(endpoint, params);
  return data ? data.currencies : null;
}

async function getPriceHistory({ item, quality, tradable, craftable, priceindex }) {
  const endpoint = 'IGetPriceHistory/v1';
  const params = {
    appid: 440,
    item,
    quality,
    tradable,
    craftable,
    priceindex  // Include the priceindex if available
  };

  const data = await makeRequest(endpoint, params);
  return data ? data.response.history : null;
}



async function getPrices(raw = 1, since = 0) {
  const endpoint = 'IGetPrices/v4';
  const params = { raw, since };
  const data = await makeRequest(endpoint, params);
  return data ? data.items : null;
}

async function getSpecialItems(appid = 440) {
  const endpoint = 'IGetSpecialItems/v1';
  const params = { appid };
  const data = await makeRequest(endpoint, params);
  return data ? data.response : null;
}

module.exports = {
  getCurrencies,
  getPriceHistory,
  getPrices,
  getSpecialItems
};
