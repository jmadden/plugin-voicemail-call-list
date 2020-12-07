const Twilio = require('twilio');
const Base64 = require('js-base64').Base64;

const syncHelperPath = Runtime.getFunctions()['helpers/sync'].path;
const syncHelper = require(syncHelperPath);

const observeHelperPath = Runtime.getFunctions()['helpers/observe-ai'].path;
const observeHelper = require(observeHelperPath);

exports.handler = async function(context, event, callback) {
  const response = {};

  const {
    RecordingDuration,
    RecordingSid,
    RecordingStartTime,
    RecordingStatus,
    RecordingUrl,
    jsonParametersBase64,
  } = event;

  console.log('Event properties:');
  Object.keys(event).forEach(key => {
    console.log(`${key}: ${event[key]}`);
  });

  const recStatus = {
    inProgress: 'in-progress',
    completed: 'completed'
  }

  const recordingType = {
    call: 'call',
    voicemail: 'voicemail'
  };
  
  let parameters;
  try {
    parameters = (jsonParametersBase64 && JSON.parse(Base64.decode(jsonParametersBase64))) || {};
    console.log('Decoded JSON parameters:', parameters);
  } catch (error) {
    console.log('Error decoding and parsing jsonParameters.', error);
  }
  
  const {
    conversationId,
    customerCallSid,
    direction,
    name,
    number,
    reservationSid,
    taskSid,
    type,
    workerSid,
  } = parameters;

  const voicemailSyncMapSuffix = 'Voicemail';
  const callHistorySyncMapSuffix = 'CallHistory';

  const maxCallHistoryCount = 20;
  
  const completeFunction = (error, response) => {
    callback(error, response);
  }

  const generateSyncMapItemData = (type) => {
    const itemData = {
      callSid: customerCallSid,
      direction,
      duration: parseInt(RecordingDuration),
      name,
      number,
      playCount: 0,
      recordings: [{
        duration: RecordingDuration,
        sid: RecordingSid,
        timestamp: RecordingStartTime,
        url: RecordingUrl
      }],
      timestamp: RecordingStartTime,
    };

    return itemData;
  }

  const handleVoicemailRecording = async () => {
    const syncMapName = `${workerSid}.${voicemailSyncMapSuffix}`;

    const syncMapItemData = generateSyncMapItemData(type);

    await syncHelper.addSyncMapItem(syncMapName, customerCallSid, syncMapItemData);
  }

  const addRecordingToCallHistoryItem = async (item) => {
    console.log('Adding recording to call history item recording list');
    const { data } = item;
    const { duration, recordings } = data;

    recordings.push({
      duration: RecordingDuration,
      sid: RecordingSid,
      timestamp: RecordingStartTime,
      url: RecordingUrl
    });

    const newItemData = {
      ...item.data,
      duration: duration + parseInt(RecordingDuration),
      recordings
    };

    try {
      await item.update({ data: newItemData });
    } catch (error) {
      console.error('Error updating item with new recording.', error);
    }
  }

  const callHistoryComparer = (a, b) => {
    const aData = a.data;
    const aTimestamp = aData.timestamp;
    const aDateObject = new Date(aTimestamp);

    const bData = b.data;
    const bTimestamp = bData.timestamp;
    const bDateObject = new Date(bTimestamp);

    return bDateObject - aDateObject;
  }

  const trimCallHistory = async (callHistory, syncMapName) => {
    const sortedCallHistory = callHistory.slice().sort(callHistoryComparer);

    console.log('Sorted call history');
    sortedCallHistory.forEach(item => {
      const { data } = item;
      console.log('Item Timestamp:', data && data.timestamp);
    });

    const itemsToDelete = sortedCallHistory.slice(maxCallHistoryCount);

    const deleteItemPromises = [];

    itemsToDelete.forEach(item => {
      const { key } = item;
      deleteItemPromises.push(syncHelper.deleteSyncMapItem(syncMapName, key));
    });

    console.log(`Deleting ${itemsToDelete.length} items from call history`);
    await Promise.all(deleteItemPromises);
  }

  const handleCallRecording = async () => {
    const syncMapName = `${workerSid}.${callHistorySyncMapSuffix}`;
    
    const existingCallHistoryItem = await syncHelper.getSyncMapItem(syncMapName, customerCallSid);
    
    if (existingCallHistoryItem) {
      await addRecordingToCallHistoryItem(existingCallHistoryItem);
    } else {
      const syncMapItemData = generateSyncMapItemData(type);
  
      await syncHelper.addSyncMapItem(syncMapName, customerCallSid, syncMapItemData);
  
      const callHistory = await syncHelper.getSyncMapItems(syncMapName);
      const callHistoryCount = Array.isArray(callHistory) && callHistory.length;
  
      if (callHistoryCount >= maxCallHistoryCount) {
        console.log(`Call history of ${callHistoryCount} items exceeds max of ${maxCallHistoryCount}`);
        await trimCallHistory(callHistory, syncMapName);
      }
    }

    await observeHelper.post(event, taskSid, reservationSid, conversationId);
  }

  if (RecordingStatus !== recStatus.completed) {
    completeFunction(null, response);
    return;
  }

  switch(type) {
    case recordingType.call: {
      await handleCallRecording();
      break;
    }
    case recordingType.voicemail: {
      await handleVoicemailRecording();
      break;
    }
    default: {
      console.log('Unhandled recording type:', type);
    }
  }

  completeFunction(null, response);
};
