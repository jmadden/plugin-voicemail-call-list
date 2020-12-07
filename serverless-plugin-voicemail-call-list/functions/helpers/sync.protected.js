const Twilio = require('twilio');

const {
  ACCOUNT_SID,
  AUTH_TOKEN,
  SYNC_SERVICE_SID
} = process.env;

const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

const createSyncMap = async (mapName) => {
  console.log(`Creating Sync Map ${mapName}`);
  try {
    await client.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps
      .create({
        uniqueName: mapName
      });
  } catch (error) {
    console.error(`Error creating sync map ${mapName}.`, error);
  }
};

const getSyncMapItem = async (mapName, itemKey) => {
  console.log(`Getting ${itemKey} from sync map ${mapName}`);

  let item;
  try {
    item = await client.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps(mapName)
      .syncMapItems(itemKey)
      .fetch();
    
    console.log('Retrieved item:', item);
  } catch (error) {
    if (error.status === 404) {
      console.log(`No item matching ${itemKey} found in ${mapName}`);
    } else {
      console.error(`Failed to fetch ${itemKey} from sync map ${mapName}`);
      for (prop in error) {
        console.log(`Error ${prop}: ${error[prop]}`);
      }
    }
  }
  return item;
};

const getSyncMapItems = async (mapName) => {
  console.log(`Getting sync map items for ${mapName}`);
  
  let items;
  try {
    items = await client.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps(mapName)
      .syncMapItems
      .list();
    
    const itemCount = (Array.isArray(items) && items.length);

    console.log('Retrieved item count:', itemCount);
  } catch (error) {
    console.error(`Failed to fetch items from sync map ${mapName}.`, error);
    for (prop in error) {
      console.log(`Error ${prop}: ${error[prop]}`);
    }
  }
  return items;
};

const addSyncMapItem = async (mapName, itemKey, itemData, isRetry) => {
  console.log(`Adding ${itemKey} to Sync Map ${mapName}`);
  try {
    await client.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps(mapName)
      .syncMapItems
      .create({
        key: itemKey,
        data: itemData,
      });

    console.log(`${itemKey} added to sync map ${mapName}`);
  } catch (error) {
    if (isRetry) {
      console.error(`Failed to create ${itemKey} in Sync Map ${mapName}.`, error);
    } else {
      await createSyncMap(mapName);
      await addSyncMapItem(mapName, itemKey, itemData, true);
    }
  }
};

const deleteSyncMapItem = async (mapName, itemKey) => {
  console.log(`Deleting ${itemKey} from sync map ${mapName}`);
  try {
    await client.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps(mapName)
      .syncMapItems(itemKey)
      .remove();
    
    console.log(`${itemKey} deleted from sync map ${mapName}`);
  } catch (error) {
    console.error(`Error deleting ${itemKey} from sync map ${mapName}.`, error);
  }
};

module.exports = {
  addSyncMapItem,
  createSyncMap,
  deleteSyncMapItem,
  getSyncMapItem,
  getSyncMapItems,
}
