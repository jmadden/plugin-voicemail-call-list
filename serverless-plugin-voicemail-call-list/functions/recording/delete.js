const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const Twilio = require('twilio');

exports.handler = TokenValidator(async function(context, event, callback) {
  const {
    ACCOUNT_SID,
    AUTH_TOKEN,
  } = context;

  const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const {
    recordingSid
  } = event;

  if (!recordingSid) {
    response.appendHeader('Content-Type', 'plain/text');
    response.setBody('Missing recordingSid parameter');
    response.setStatusCode(400);
    return callback(null, response);
  }

  try {
    console.log('Deleting recording', recordingSid);
    await client
      .recordings(recordingSid)
      .remove();
    
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({
      success: true
    });
  } catch (error) {
    response.appendHeader('Content-Type', 'plain/text');
    response.setBody(error.message);
    response.setStatusCode(500);
  }

  callback(null, response);
});
