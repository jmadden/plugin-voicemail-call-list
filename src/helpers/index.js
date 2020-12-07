import moment from 'moment-timezone';

import FlexState from '../states/FlexState';

export const baseServerlessUrl = `https://${process.env.REACT_APP_SERVERLESS_DOMAIN}`;

export const isVoicemailItem = (itemType) => {
  return itemType.toLowerCase() === 'voicemail';
}

export const formatSecondsToHHMMSS = (duration) => {
  const hours = Math.floor(duration / 60 / 60);
  const minutes = Math.floor(duration / 60) - (hours * 60);

  const seconds = duration % 60;

  const formattedHours = hours === 0 ? '' : `${hours.toString().padStart(2, '0')}:`;

  const formattedMinutes = `${minutes.toString().padStart(2, '0')}:`;

  const formattedSeconds = seconds.toString().padStart(2, '0');

  const formatted = `${formattedHours}${formattedMinutes}${formattedSeconds}`;

  return formatted;
}

export const formatTimestamp = (timestamp) => {
  const timestampMoment = moment(timestamp);
  return timestampMoment.format('M/D/YYYY hh:mm A');
}

export const capitalizeFirstLetter = (s) => {
  return typeof s !== 'string' ? undefined
    : s.charAt(0).toUpperCase() + s.slice(1);
}

export const fetchPostUrlEncoded = (body) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams(body)
});

export const fetchGetOptions = (headers) => ({
  method: 'GET',
  headers
});

export const addTokenQueryParam = (url) => {
  const isExistingQueryParam = url.includes('?');
  const paramConnector = isExistingQueryParam ? '&' : '?';

  return `${url}${paramConnector}Token=${FlexState.userToken}`;
}
