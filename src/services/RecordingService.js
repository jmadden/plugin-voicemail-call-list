import FlexState from '../states/FlexState';
import {
  baseServerlessUrl,
  fetchGetOptions,
  fetchPostUrlEncoded } from '../helpers';

class RecordingService {
  deleteRecording = async (recordingSid) => {
    console.debug('Deleting recording', recordingSid);
    const fetchUrl = `${baseServerlessUrl}/recording/delete`;

    const fetchBody = {
      Token: FlexState.userToken,
      recordingSid
    };
    const fetchOptions = fetchPostUrlEncoded(fetchBody);
    const fetchResponse = await fetch(fetchUrl, fetchOptions);
    const deleteRecResult = fetchResponse && await fetchResponse.json();
    console.debug('Delete recording result:', deleteRecResult);
  }

  getMediaUrl = async (recordingSid) => {
    const fetchUrl = `https://voice.twilio.com/v1/Recordings/${recordingSid}/MediaUrl`;

    const authHeader = `Basic ${btoa(`token:${FlexState.userToken}`)}`;
    const fetchHeaders = {
      Authorization: authHeader
    };
    const fetchOptions = fetchGetOptions(fetchHeaders);
    const fetchResponse = await fetch(fetchUrl, fetchOptions);
    const mediaUrlResult = fetchResponse && await fetchResponse.json();

    return mediaUrlResult && mediaUrlResult.media_url;
  }
}

const RecordingServiceSingleton = new RecordingService();

export default RecordingServiceSingleton;
