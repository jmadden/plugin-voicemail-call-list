import { Manager } from '@twilio/flex-ui';

class WorkerState {
  _manager = Manager.getInstance();

  get workerClient() { return this._manager.workerClient; }

  get workerSid() { return this.workerClient.sid; }

  get workerAttributes() { return this.workerClient.attributes; }
}

const WorkerStateSingleton = new WorkerState();

export default WorkerStateSingleton;
