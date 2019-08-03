import fetch from 'node-fetch';

const {HOST, TOKEN} = process.env;

const sleep = (ms) => (
  new Promise((resolve, reject) => setTimeout(resolve, ms))
);

const getQueryString = (queries = {}) => {
  const keys = Object.keys(queries).filter(k => queries[k] !== undefined);
  if(keys.length === 0) {
    return '';
  }

  const kvStrings = keys.map(k => `${k}=${queries[k]}`);
  return '?' + kvStrings.join('&');
};

const retryAfterSeconds = async (response, ...request) => {
  const retryAfter = +response.headers.get('Retry-After');
  console.warn(`retryAfter ${retryAfter} seconds`);
  await sleep(retryAfter * 1010);
  return await callApi(...request);
}

const callApi = async (path, queries) => {
  const url = `${HOST}${path}${getQueryString(queries)}`;
  console.log('URL:', url);

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": TOKEN
    }
  });

  if(response.status === 429) {
    return retryAfterSeconds(response, path, queries);
  }

  if(`${response.status}`.startsWith('4')) {
    console.error(response)
    throw `response.status: ${response.status}`;
  }

  return {
    status: response.status,
    body: await response.json(),
  };
};

export default callApi;