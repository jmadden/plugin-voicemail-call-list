import FlexState from '../states/FlexState';
import SharedState from '../states/SharedState';
import WorkerState from '../states/WorkerState';
import { Actions as VoicemailActions } from '../states/VoicemailListState';

class VoicemailListSync {
  _syncClient;

  _syncMapName = `${WorkerState.workerSid}.Voicemail`;

  _syncMapTtlSeconds = 31536000 // 365 Days * 24 Hours * 3600 Seconds

  _syncMap;

  _syncMapItems;

  _stateUpdateDelayMs = 100;

  _initialized;

  _updateVoicemailMessages = () => {
    setTimeout(() => {
      console.debug('Sync map items', this._syncMapItems);
      const messages = [];
      this._syncMapItems.forEach(itemValue => {
        if (itemValue) {
          messages.push(itemValue);
        }
      });
      const payload = VoicemailActions.updateVoicemailMessages(messages);
      FlexState.dispatchStoreAction(payload);
    }, this._stateUpdateDelayMs);
  }

  _syncMapItemAdded = (data) => {
    const { item } = data;
    console.debug('VoicemailListSync itemAdded', item);
    this._syncMapItems.set(item.key, item.value);
    this._updateVoicemailMessages();
  }

  _syncMapItemUpdated = (data) => {
    const { item } = data;
    console.debug('VoicemailListSync itemUpdated', item);
    this._syncMapItems.set(item.key, item.value);
    this._updateVoicemailMessages();
  }

  _syncMapItemRemoved = (item) => {
    console.debug('VoicemailListSync itemRemoved', item.key);
    this._syncMapItems.delete(item.key);
    this._updateVoicemailMessages();
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
    console.debug('VoicemailListSync initialize started');
    
    this._syncClient = SharedState.syncClient;
    const syncMap = await this._syncClient.getSyncMap(this._syncMapName, this._syncMapTtlSeconds);
    if (syncMap.sid) {
      this._syncMap = syncMap;
    } else {
      console.error('VoicemailListSync failed to initialize. Unable to retrieve sync map.', syncMap.error);
      return;
    }
    const syncMapItems = await this._syncMap.getItems();
    this._syncMapItems = new Map(syncMapItems.items.map(item => {
      return [item.key, item.value];
    }));
    this._updateVoicemailMessages();
    this._syncMap.on('itemAdded', this._syncMapItemAdded);
    this._syncMap.on('itemUpdated', this._syncMapItemUpdated);
    this._syncMap.on('itemRemoved', this._syncMapItemRemoved);

    // Refreshing the sync map TTL so it doesn't expire while actively being used
    await this._syncClient.resetSyncMapTtl(this._syncMap, this._syncMapTtlSeconds);

    this._initialized = true;
    console.debug('VoicemailListSync initialize finished');
  }

  incrementMessagePlayCount = (message) => {
    const { callSid, playCount } = message;

    const updatedMessage = {
      ...message,
      playCount: playCount + 1
    }

    this._setSyncMapItem(callSid, updatedMessage);
  }

  deleteMessage = (message) => {
    const { callSid } = message;
    
    this._removeSyncMapItem(callSid);
  }
}

const VoicemailListSyncSingleton = new VoicemailListSync();

export default VoicemailListSyncSingleton;
