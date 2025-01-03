import { initializeFormHandlers } from './events.js';
import { updateElementContent, toggleElementVisibility, buildTimeString, buildDateString, updateHeader } from './dom.js';

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
    inventory: []
  }
}

function onSync(world, current) {
  updateClockAndResources(world, current.global.time, current.global.resources)
  updateUserResources(current.account, current.inventory)
}

function updateUserResources(account, inventory) {
  Current.user.balance = account?.credits.balance
  Current.user.id = account?.id
  Current.user.water = getResourceAmount(inventory, 'water')
  Current.user.mithril = getResourceAmount(inventory, 'mineral')

  updateUserInterface()
}

function getResourceAmount(inventory, type) {
  return inventory?.filter(i => i.type == type).reduce((sum, c) => sum + c.amount, 0)
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
export const queryUser = urlParams.get('user');

function updateUserInterface() {
  updateElementContent("userBalance", Current.user?.balance?.toFixed(2))
  if (queryUser == Current.user.id) updateElementContent('profileBalance', Current.user?.balance?.toFixed(2))
  updateElementContent("userWater", Current.user?.water)
  updateElementContent("userMineral", Current.user.mithril)

  const mintBankBtn = document.getElementById('mintBankBtn')
  const alert = document.getElementById('alert')
  if (mintBankBtn && alert.classList.contains('hidden'))
    mintBankBtn.disabled = Current.user.mithril < 200 ||
      Current.user.water < Math.ceil(Math.pow(Current.resources.water / Current.resources.mithril, 7)) || Current.user.balance < 200
}

function updateClockAndResources(world, time, resources) {
  Current.time = buildTimeString(world, time);
  Current.date = buildDateString(world, time);
  Current.resources.water = resources.water.balance.toFixed(0).toLocaleString();
  Current.resources.mithril = resources.mineral.balance.toFixed(0).toLocaleString();

  updateHeader(Current);
}

let inProgress = false

async function sync(world) {
  if (!inProgress) {
    inProgress = true
    return fetch('/api/current').then(async (res) => {
      const current = await res.json()
      console.debug(`T${current.global.time}: ...`)
      onSync(world, current)
      inProgress = false
    })
  } else console.log(`skipping sync as in progress...`)
}

fetch('/api/world').then(async (res) => {
  const world = await res.json()
  setInterval(async () => {
    await sync(world)
  }, world.interval.minute);
})

const invitationCode = document.getElementById('invitationCode')
if (invitationCode) { invitationCode.addEventListener('input', handleInvitationCodeInput) }

function handleInvitationCodeInput(e) {
  const usernameControl = document.getElementById('usernameControl')
  const passwordControl = document.getElementById('passwordControl')
  const registerBtn = document.getElementById('registerBtn')

  if (e.target.value == '1892') {
    toggleElementVisibility(usernameControl, false)
    toggleElementVisibility(passwordControl, false)
    registerBtn.disabled = false

    toggleElementVisibility(invitationCode, true)
    usernameControl.firstElementChild.focus()
  } else {
    toggleElementVisibility(usernameControl, true)
    toggleElementVisibility(passwordControl, true)
    registerBtn.disabled = true

    toggleElementVisibility(invitationCode, false)
  }
}

initializeFormHandlers();