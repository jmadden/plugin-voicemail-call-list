const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const Twilio = require('twilio');
const taskHelperPath = Runtime.getFunctions()['helpers/taskrouter'].path;
const taskHelper = require(taskHelperPath);
const callHelperPath = Runtime.getFunctions()['helpers/call'].path;
const callHelper = require(callHelperPath);

exports.handler = TokenValidator(async function(context, event, callback) {

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');
  
  const {
    TaskAttributes,
    TaskSid
  } = event;

  await taskHelper.cancelTask(TaskSid,'Voicemail');
  await callHelper.routeCallToVoicemail(TaskAttributes);

  callback(null, {});
});