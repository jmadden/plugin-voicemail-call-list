const Twilio = require('twilio');

const {
  ACCOUNT_SID,
  AUTH_TOKEN,
  DOMAIN_NAME
} = process.env;

const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

const routeCallToVoicemail = async (taskAttributes) => {

  console.log('In routeCallToVoicemail:', taskAttributes);

  try {
    const attributes = taskAttributes && JSON.parse(taskAttributes);
    const {
      call_sid: callSid,
      directExtension,
      direction,
      from,
      name,
      targetWorkerSid,
    } = attributes;
    const twimlUrlParams = new URLSearchParams({
      step: 'greeting',
      directExtension,
      direction,
      from,
      name,
      targetWorkerSid
    });
    const twimlUrl = `https://${DOMAIN_NAME}/voicemail/main?${twimlUrlParams.toString()}`;
    
    await client.calls(callSid)
      .update({
        url: twimlUrl
      });
    console.log('Call updated and routed to voicemail main');
  } catch (error) {
    console.error('Error routing call to voicemail', error);
  }
}

module.exports = {
  routeCallToVoicemail
}
