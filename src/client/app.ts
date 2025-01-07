import { initializeFormHandlers } from './events.js';
import { buildTimeString, buildDateString, updateHeader, updateUserBalance } from './dom.js';
import broadcast, { initializeBroadcastHandlers } from './broadcast.js';
import { Post } from '../interfaces/Post.js';

export const Connection = {
  time: '..:.. (..% to yield)',
  date: 'Year .. Day .. (x..)',
  resources: {
    water: -1,
    mineral: -1
  },
  user: {
    id: undefined,
    balance: 0,
    water: 0,
    mineral: 0,
    inventory: [] as any[]
  },
  broadcast: []
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
initializeBroadcastHandlers();

async function syncCurrentAsync(world: any) {
  if (!inProgress) {
    inProgress = true
    return fetch('/api/current').then(async (res) => {
      const current = await res.json()
      console.debug(`T${current.global.time}: ...`)

      updateConnection(current.account, current.inventory, current.broadcast)
      updateWorld(world, current.global.time, current.global.resources, current.broadcast)
      
      inProgress = false
    })
  } else console.log(`skipping sync as in progress...`)
}

function updateWorld(world: any, time: number, resources: any, posts: Post[]) {
  Connection.time = buildTimeString(world, time);
  Connection.date = buildDateString(world, time);
  Connection.resources.water = resources.water.balance.toFixed(0).toLocaleString();
  Connection.resources.mineral = resources.mineral.balance.toFixed(0).toLocaleString();

  updateHeader(Connection);
  broadcast(posts);
}

function updateConnection(account: any, inventory: any, broadcast: any[]) {
  if (!account) return

  Connection.user.balance = account.credits.balance
  Connection.user.id = account.id
  Connection.user.water = getResourceAmount(inventory, 'water')
  Connection.user.mineral = getResourceAmount(inventory, 'mineral')
  Connection.broadcast = broadcast
  
  updateUserBalance(Connection, queryUser)
}

function getResourceAmount(inventory: any[], type: string) {
  return inventory?.filter(i => i.type == type).reduce((sum, c) => sum + c.amount, 0)
}

