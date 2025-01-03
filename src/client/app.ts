import { initializeFormHandlers } from './events.js';
import { buildTimeString, buildDateString, updateHeader, updateUserBalance } from './dom.js';

export const Current = {
  time: '..:.. (..% to yield)',
  date: 'Year .. Day .. (x..)',
  resources: {
    water: -1,
    mithril: -1
  },
  user: {
    id: undefined,
    balance: 0,
    water: 0,
    mithril: 0,
    inventory: [] as any[]
  }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
export const queryUser = urlParams.get('user');

let inProgress = false

fetch('/api/world').then(async (res) => {
  const world = await res.json()
  setInterval(async () => {
    await syncCurrentAsync(world)
  }, world.interval.minute);
})

initializeFormHandlers();

async function syncCurrentAsync(world: any) {
  if (!inProgress) {
    inProgress = true
    return fetch('/api/current').then(async (res) => {
      const current = await res.json()
      console.debug(`T${current.global.time}: ...`)
      onSyncCurrent(world, current)
      inProgress = false
    })
  } else console.log(`skipping sync as in progress...`)
}

/**
 * Main entry every minute
 * @param {*} world 
 * @param {*} current 
 */
function onSyncCurrent(world: any, current: any) {
  updateWorld(world, current.global.time, current.global.resources)
  updateCurrent(current.account, current.inventory)
}

function updateWorld(world: any, time: number, resources: any) {
  Current.time = buildTimeString(world, time);
  Current.date = buildDateString(world, time);
  Current.resources.water = resources.water.balance.toFixed(0).toLocaleString();
  Current.resources.mithril = resources.mineral.balance.toFixed(0).toLocaleString();

  updateHeader(Current);
}

function updateCurrent(account: any, inventory: any) {
  Current.user.balance = account?.credits.balance
  Current.user.id = account?.id
  Current.user.water = getResourceAmount(inventory, 'water')
  Current.user.mithril = getResourceAmount(inventory, 'mineral')

  updateUserBalance(Current, queryUser)
}

function getResourceAmount(inventory: any[], type: string) {
  return inventory?.filter(i => i.type == type).reduce((sum, c) => sum + c.amount, 0)
}
