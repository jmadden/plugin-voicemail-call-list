const Twilio = require('twilio');
const taskHelperPath = Runtime.getFunctions()['helpers/taskrouter'].path;
const taskHelper = require(taskHelperPath);
const callHelperPath = Runtime.getFunctions()['helpers/call'].path;
const callHelper = require(callHelperPath);

exports.handler = async function(context, event, callback) {
  const {
    ACCOUNT_SID,
    AUTH_TOKEN,
    DOMAIN_NAME,
    WORKSPACE_SID
  } = context;
  const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);
  const {
    EventType,
    TaskAttributes,
    TaskQueueName,
    TaskSid,
    TransferType,
    TransferTo
  } = event;

  const taskRouterEvent = {
    taskQueueEntered: 'task-queue.entered',
    taskTransferFailed: 'task.transfer-failed'
  };
  
  const voicemailTaskQueue = 'Voicemail Queue';

  console.log('Received event type', EventType);

  switch(EventType) {
    case taskRouterEvent.taskQueueEntered: {
      if (TaskQueueName === voicemailTaskQueue) {
        await taskHelper.cancelTask(TaskSid,'Voicemail');
        await callHelper.routeCallToVoicemail(TaskAttributes);
      }
    }
    case taskRouterEvent.taskTransferFailed: {
      if (TransferType == "WORKER") {

        //add worker sid so that main.protected.js can get worker details
        let updatedTaskAttributes = JSON.parse(TaskAttributes);
        updatedTaskAttributes.targetWorkerSid = TransferTo;

        //console.log('updatedTaskAttributes: ', updatedTaskAttributes.targetWorkerSid);

        await taskHelper.cancelTask(TaskSid,'Voicemail');
        await callHelper.routeCallToVoicemail(JSON.stringify(updatedTaskAttributes));
      }
    }
    default: 
      // Nothing to do here at this time
  }

  callback(null, {});
};
