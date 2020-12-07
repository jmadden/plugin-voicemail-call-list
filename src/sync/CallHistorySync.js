import FlexState from '../states/FlexState';
import SharedState from '../states/SharedState';
import WorkerState from '../states/WorkerState';
import { Actions as CallHistoryActions } from '../states/CallHistoryState';

class CallHistorySync {
  _syncClient;

  _syncMapName = `${WorkerState.workerSid}.CallHistory`;

  _syncMapTtlSeconds = 31536000 // 365 Days * 24 Hours * 3600 Seconds

  _syncMap;

  _syncMapItems;

  _stateUpdateDelayMs = 100;

  _initialized;

  _updateCallHistory = () => {
    setTimeout(() => {
      console.debug('Sync map items', this._syncMapItems);
      const calls = [];
      this._syncMapItems.forEach(itemValue => {
        if (itemValue) {
          calls.push(itemValue);
        }
      });
      const payload = CallHistoryActions.updateCallHistory(calls);
      FlexState.dispatchStoreAction(payload);
    }, this._stateUpdateDelayMs);
  }

  _syncMapItemAdded = (data) => {
    const { item } = data;
    console.debug('CallHistorySync itemAdded', item);
    this._syncMapItems.set(item.key, item.value);
    this._updateCallHistory();
  }

  _syncMapItemUpdated = (data) => {
    const { item } = data;
    console.debug('CallHistorySync itemUpdated', item);
    this._syncMapItems.set(item.key, item.value);
    this._updateCallHistory();
  }

  _syncMapItemRemoved = (item) => {
    console.debug('CallHistorySync itemRemoved', item.key);
    this._syncMapItems.delete(item.key);
    this._updateCallHistory();
  }

  _setSyncMapItem = async (key, value) => {
    try {
      console.debug('Setting sync map item', key, value);
      await this._syncMap.set(key, value);

      // this._syncMapItems.set(key, value);
      // this._updateVoicemailMessages();
    } catch (error) {
      console.error('Error setting sync map item', key, value, error);
    }
  }

  _removeSyncMapItem = async (key) => {
    try {
      await this._syncMap.remove(key);

      // this._syncMapItems.delete(key);
      // this._updateVoicemailMessages();
    } catch (error) {
      console.error('Error removing sync map item', key, error);
    }
  }

  initialize = async () => {
    console.debug('CallHistorySync initialize started');

    this._syncClient = SharedState.syncClient;
    const syncMap = await this._syncClient.getSyncMap(this._syncMapName, this._syncMapTtlSeconds);
    if (syncMap.sid) {
      this._syncMap = syncMap;
    } else {
      console.error('CallHistorySync failed to initialize. Unable to retrieve sync map.', syncMap.error);
      return;
    }
    const syncMapItems = await this._syncMap.getItems();
    this._syncMapItems = new Map(syncMapItems.items.map(item => {
      return [item.key, item.value];
    }));
    this._updateCallHistory();
    this._syncMap.on('itemAdded', this._syncMapItemAdded);
    this._syncMap.on('itemUpdated', this._syncMapItemUpdated);
    this._syncMap.on('itemRemoved', this._syncMapItemRemoved);

    // Refreshing the sync map TTL so it doesn't expire while actively being used
    await this._syncClient.resetSyncMapTtl(this._syncMap, this._syncMapTtlSeconds);
    
    this._initialized = true;
    console.debug('CallHistorySync initialize finished');
  }
}

const CallHistorySyncSingleton = new CallHistorySync();

export default CallHistorySyncSingleton;
