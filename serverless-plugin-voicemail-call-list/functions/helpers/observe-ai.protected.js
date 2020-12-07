const https = require('https');

const taskHelperPath = Runtime.getFunctions()['helpers/taskrouter'].path;
const taskHelper = require(taskHelperPath);

const sleep = (seconds) => new Promise(resolve => {
  setTimeout(() => {
    resolve();
  }, seconds * 1000);
});

const verifyTaskEvents = (events, reservationSid) => {
  const taskCreatedEvent = events.find(e => e.eventType === 'task.created');
  if (!taskCreatedEvent) console.log('Missing task.created event');

  const reservationAcceptedEvent = events.find(e => (
    e.eventType === 'reservation.accepted' && e.resourceSid === reservationSid
  ));
  if (!reservationAcceptedEvent) console.log('Missing reservation.accepted event for', reservationSid);

  const reservationWrapupEvent = events.find(e => (
    e.eventType === 'reservation.wrapup' && e.resourceSid === reservationSid
  ));
  if (!reservationWrapupEvent) console.log('Missing reservation.wrapup event for', reservationSid);

  return taskCreatedEvent && reservationAcceptedEvent && reservationWrapupEvent;
}

const postToObserveAI = (data) => new Promise(resolve => {
	const options = {
	  hostname: process.env.OBSERVE_HOST,
	  path: process.env.OBSERVE_POST_PATH,
	  method: 'POST',
	  headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'x-api-key':process.env.OBSERVE_API_KEY
	  }
  };
  
  const req = https.request(options, (res) => {
    var resBody = "";

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      resBody += chunk;
    });
    res.on('end', () => {
      console.log('Final resBody:');
      console.log(resBody);
      resolve();
    });
  })

  req.on('error', (error) => {
    console.error('Observe AI request error.', error);
    resolve();
  });

  req.write(data);
  req.end();
})

module.exports.post = async (recordingEvent, taskSid, reservationSid, conversationId) => {
  try {
    if(process.env.OBSERVE_ENABLED && process.env.OBSERVE_ENABLED.toLowerCase() !== 'true'){
      console.log('Observe integration is disabled');
      return;
    }

    // Constructing the full request object here for documentation purposes
    const reqObj = {
      abandoned: "",
      agent_conference: "",
      agent_email: "",
      agent_first_name: "",
      agent_last_name: "",
      agent_user_id: "",
      agent_user_name: "",
      call_direction: "",
      call_id: reservationSid,
      caller_number: "",
      campaign: "",
      conversation_attribute_1: "",
      conversation_attribute_2: "",
      conversation_id: conversationId,
      customer_account:	"",
      customer_account_link: "",
      customer_record_id: "",
      date: "",
      end_at: "",
      market_segment: "",
      queue: "",
      recipient_number: "",
      segment_link: "",
      start_at: "",
      talk_time: "",
      team_id: "",
      wait_time: "",
    };
    
    let getEventsAttempts = 1;
    let maxGetEventsAttempts = 3;

    let taskEvents = await taskHelper.getEventsForTask(taskSid);
    let isAllTaskEventsPresent = verifyTaskEvents(taskEvents, reservationSid);;

    while (!isAllTaskEventsPresent && (getEventsAttempts <= maxGetEventsAttempts)) {
      console.log(`Missing task events on attempt ${getEventsAttempts}. Waiting to retry`);
      await sleep(2);
      getEventsAttempts += 1;
      taskEvents = await taskHelper.getEventsForTask(taskSid);
      isAllTaskEventsPresent = verifyTaskEvents(taskEvents, reservationSid);
    }

    if (!isAllTaskEventsPresent) {
      console.error('Unable to find all required task events');
      return;
    }

    if (taskEvents.length === 0) {
      console.warn('Could not find any events for task', taskSid);
      return;
    }

    const taskCreatedEvent = taskEvents.find(e => e.eventType === 'task.created');

    const reservationAcceptedEvent = taskEvents.find(e => (
      e.eventType === 'reservation.accepted' && e.resourceSid === reservationSid
    ));

    const reservationWrapupEvent = taskEvents.find(e => (
      e.eventType === 'reservation.wrapup' && e.resourceSid === reservationSid
    ));

    if (taskCreatedEvent) {
      reqObj.date = taskCreatedEvent.eventDate;
    }
    let workerAttributes;
    if (reservationAcceptedEvent) {
      const {
        eventData,
        eventDate
      } = reservationAcceptedEvent;
      reqObj.start_at = eventDate;
      reqObj.wait_time = eventData.task_age;
      workerAttributes = JSON.parse(eventData.worker_attributes);
    }
    let taskAttributes;
    if (reservationWrapupEvent) {
      const {
        eventData,
        eventDate
      } = reservationWrapupEvent;
      reqObj.end_at = eventDate;
      taskAttributes = JSON.parse(eventData.task_attributes);
    }

    if (workerAttributes) {
      const {
        contact_uri,
        email,
        first_name,
        last_name,
        location,
        sf_user_id,
        team_id
      } = workerAttributes;
      reqObj.agent_conference = location || "";
      reqObj.agent_email = email || "";
      reqObj.agent_first_name = first_name || "";
      reqObj.agent_last_name = last_name || "";
      reqObj.agent_user_id =  sf_user_id || "";
      reqObj.agent_user_name = contact_uri || "";
      reqObj.team_id = team_id || "";
    }

    if (taskAttributes) {
      const {
        direction,
        from,
        queue,
        to
      } = taskAttributes;
      reqObj.call_direction = direction || "";
      reqObj.caller_number = from || "";
      reqObj.queue = queue || "";
      reqObj.recipient_number = to || "";
    }
    
    if (taskAttributes && taskAttributes.customers) {
      const {
        customer_attribute_1,
        customer_link,
        market_segment
      } = taskAttributes.customers;
      reqObj.customer_account_link = customer_link || "";
      reqObj.customer_account = customer_attribute_1 || "";
      reqObj.market_segment = market_segment || "";
    }

    if (taskAttributes && taskAttributes.conversations) {
      const { 
        abandoned,
        campaign,
        conversation_attribute_1,
        conversation_attribute_2,
      } = taskAttributes.conversations;
      reqObj.abandoned = abandoned || "";
      reqObj.campaign = campaign || "";
      reqObj.conversation_attribute_1 = conversation_attribute_1 || "";
      reqObj.conversation_attribute_2 = conversation_attribute_2 || "";
    }

    if (recordingEvent) {
      const {
        RecordingDuration,
        RecordingUrl
      } = recordingEvent;
      reqObj.talk_time = RecordingDuration || "";
      reqObj.segment_link = RecordingUrl || "";
    }

    await postToObserveAI(JSON.stringify(reqObj));
  } catch (error) {
    console.error('Error posting to Observe AI.', error);
  }
}
