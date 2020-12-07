const Twilio = require('twilio');

const {
  ACCOUNT_SID,
  AUTH_TOKEN,
  WORKSPACE_SID
} = process.env;

const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

const getEventsForReservation = async (reservationSid) => {
  try {
    console.log('Retrieving events for reservation', reservationSid);
    const events = await client.taskrouter
      .workspaces(WORKSPACE_SID)
      .events
      .list({
        minutes: 600,
        reservationSid
      });
    console.log(`Found ${events && events.length} events`);
    return events || [];
  } catch (error) {
    console.error(`Error getting events for reservation ${reservationSid}.`, error);
    return [];
  }
};

const getEventsForTask = async (taskSid) => {
  try {
    console.log('Retrieving events for task', taskSid);
    const events = await client.taskrouter
      .workspaces(WORKSPACE_SID)
      .events
      .list({
        minutes: 600,
        taskSid
      });
    console.log(`Found ${events && events.length} events`);
    return events || [];
  } catch (error) {
    console.error(`Error getting events for task ${taskSid}.`, error);
    return [];
  }
};

const cancelTask = async (taskSid, cancelReason) => {
  try {
    await client.taskrouter
      .workspaces(WORKSPACE_SID)
      .tasks(taskSid)
      .update({
        assignmentStatus: 'canceled',
        reason: cancelReason
      });
    console.log('Canceled task', taskSid);
  } catch (error) {
    console.error(`Error cancelling task ${taskSid}.`, error);
  }
}

module.exports = {
  getEventsForReservation,
  getEventsForTask,
  cancelTask
}
