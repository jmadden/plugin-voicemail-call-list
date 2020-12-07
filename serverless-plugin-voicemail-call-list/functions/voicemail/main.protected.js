const Twilio = require('twilio');
const Base64 = require('js-base64').Base64

exports.handler = async function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  const twimlSayOptions = {
    voice: 'Polly.Joanna-Neural',
    language: 'en-US'
  };

  const {
    ACCOUNT_SID,
    AUTH_TOKEN,
    DOMAIN_NAME,
    WORKSPACE_SID
  } = context;

  const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);
  
  const {
    CallSid: customerCallSid,
    directExtension,
    step,
    direction,
    from,
    name,
    targetWorkerSid
  } = event;

  console.log(`Received request for step ${step} and worker extension ${directExtension} and targetWorkerSid ${targetWorkerSid}`);

  const recordingCallbackParams = {
    customerCallSid,
    direction,
    name,
    number: from,
    type: 'voicemail',
    workerSid: undefined // Set later after worker is retrieved from TaskRouter API
  };

  const getRecordVerbOptions = () => {
    return {
      action: `https://${DOMAIN_NAME}/voicemail/main?step=recordingFinished`,
      timeout: 0,
      finishOnKey: '#',
      maxLength: 110,
      recordingStatusCallback: `https://${DOMAIN_NAME}/recording/status-handler?`
        + `jsonParametersBase64=${Base64.encodeURI(JSON.stringify(recordingCallbackParams))}`,
      recordingStatusCallbackEvent: 'in-progress, completed'
    }
  }

  const getWorkerByTargetExpression = async (extension) => {
    let matchingWorker;
    try {
      console.log('Looking up worker with extension', directExtension);
      let workers = await client.taskrouter
        .workspaces(WORKSPACE_SID)
        .workers
        .list({
          targetWorkersExpression: `directExtension == '${extension}'`
        });
      workers = Array.isArray(workers) ? workers : [];
      console.log(`Workers with extension ${extension}:`, workers.length);

      matchingWorker = workers.length > 0 && workers[0];
    } catch (error) {
      console.error('Error retrieving worker with extension', directExtension, error);
    }
    return matchingWorker || {};
  }

  const getWorkerBySid = async (workerSid) => {
    let matchingWorker;
    try {
      console.log('Looking up worker with sid', workerSid);
      matchingWorker  = await client.taskrouter
        .workspaces(WORKSPACE_SID)
        .workers(workerSid)
        .fetch();
      console.log(workers);
      console.log(`Workers with sid ${workerSid}:`, matchingWorker);

    } catch (error) {
      console.error('Error retrieving worker with workerSid', workerSid, error);
    }
    return matchingWorker || {};
  }

  const getMatchingWorker = async (extension, workerSid) => {
    if(workerSid){
      return await getWorkerBySid(workerSid);
    }else{
      return await getWorkerByTargetExpression(extension);
    }
  }

  const parseWorkerAttributes = (worker) => {
    let workerAttributes
    try {
      const attributes = worker && worker.attributes;
      workerAttributes = attributes && JSON.parse(attributes);

      console.log('Worker attributes:', workerAttributes);
    } catch (error) {
      console.error('Error parsing attributes for worker', worker, error);
    }
    return workerAttributes || {};
  }

  switch(step) {
    case 'greeting': {
      const worker = await getMatchingWorker(directExtension, targetWorkerSid);
      recordingCallbackParams.workerSid = worker.sid;

      const workerAttributes = parseWorkerAttributes(worker);
      const { vm_enabled, vm_greeting } = workerAttributes;

      if (!vm_enabled) {
        const message = "I'm sorry, the party you're trying to reach is not available, "
          + "and does not have a voicemail box. Please try your call again later. Goodbye."
        twiml.say(twimlSayOptions, message);
        twiml.hangup;
      } else if (!vm_greeting) {
        const message = "The party you're trying to reach is not available at this time. "
          + "Please leave a message at the tone and they'll get back with you promptly.";
        twiml.say(twimlSayOptions, message)
        twiml.record(getRecordVerbOptions());
      } else {
        twiml.play(vm_greeting);
        twiml.record(getRecordVerbOptions());
      }
      break;
    }
    case 'recordingFinished': {
      const message = "Thank you, your message has been recorded and will be reviewed. Goodbye."
      twiml.say(twimlSayOptions, message);
      twiml.hangup();
      break;
    }
    default:
      console.log('Unhandled step parameter value:', step);
      twiml.hangup();
  }

  callback(null, twiml)
}