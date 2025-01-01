const Current = {
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
  refreshClockResources(world, current.global.time, current.global.resources)
  refreshUserCreditResources(current.account, current.inventory)
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const queryUser = urlParams.get('user');

function refreshUserCreditResources(account, inventory) {
  Current.user.balance = account?.credits.balance
  Current.user.id = account?.id
  Current.user.water = inventory?.filter(i => i.type == 'water').reduce((sum, c) => sum + c.amount, 0)
  Current.user.mithril = inventory?.filter(i => i.type == 'mineral').reduce((sum, c) => sum + c.amount, 0)

  const userBalance = document.getElementById("userBalance")
  if (userBalance) userBalance.innerHTML = Current.user?.balance?.toFixed(2)
  
  const profileBalance = document.getElementById('profileBalance')
  if (profileBalance && queryUser == Current.user.id) profileBalance.innerHTML = Current.user?.balance?.toFixed(2)

  const userWater = document.getElementById("userWater")
  if (userWater) userWater.innerHTML = Current.user?.water

  const userMineral = document.getElementById("userMineral")
  if (userMineral) userMineral.innerHTML = Current.user?.mithril

  const mintBankBtn = document.getElementById('mintBankBtn')
  const alert = document.getElementById('alert')
  if (mintBankBtn && alert.classList.contains('hidden'))
    mintBankBtn.disabled = Current.user.mithril < 200 ||
      Current.user.water < Math.ceil(Math.pow(Current.resources.water / Current.resources.mithril, 7)) || Current.user.balance < 200
}

function refreshClockResources(world, time, resources) {
  Current.time = `${Math.floor(time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${time % (world.interval.hour) < 10 ? '0' : ''}${time % (world.interval.hour)}\
                <small class="hidden md:inline">(${(time % (world.interval.hour) / world.interval.hour * 100).toFixed(0)}% to yield)</small>
  `

  Current.date = `<small class="hidden md:inline">Year ${Math.floor(time / (world.interval.hour * world.interval.day * world.interval.year))}\
                Day ${Math.floor(time / (world.interval.hour * world.interval.day))}\
                <small class="hidden md:inline">(x${60000 / world.interval.minute})</small></small>
  `

  Current.resources.water = resources.water.balance.toFixed(0).toLocaleString()
  Current.resources.mithril = resources.mineral.balance.toFixed(0).toLocaleString()

  const headerTime = document.getElementById("headerTime");
  headerTime.innerHTML = Current.time;

  const headerDate = document.getElementById("headerDate");
  headerDate.innerHTML = Current.date;

  const headerWater = document.getElementById("headerWater");
  headerWater.innerHTML = Current.resources.water;

  const headerMithril = document.getElementById("headerMithril");
  headerMithril.innerHTML = Current.resources.mithril;
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
if (invitationCode) { invitationCode.addEventListener('input', (e) => {
  if (e.target.value == '1892') {
    const usernameControl = document.getElementById('usernameControl')
    const passwordControl = document.getElementById('passwordControl')
    const registerBtn = document.getElementById('registerBtn')

    usernameControl.classList.remove('hidden')
    passwordControl.classList.remove('hidden')
    registerBtn.disabled = false

    invitationCode.classList.add('hidden')
    usernameControl.firstElementChild.focus()
  } else {
    usernameControl.classList.add('hidden')
    passwordControl.classList.add('hidden')
    registerBtn.disabled = true

    invitationCode.classList.remove('hidden')
  }
})
}

const collectWaterForm = document.getElementById('collectWaterForm')
collectWaterForm.addEventListener('submit', (e) => {
  e.preventDefault()
  onCollect('water')
})

const collectMineralForm = document.getElementById('collectMineralForm')
collectMineralForm.addEventListener('submit', (e) => {
  e.preventDefault()
  onCollect('mineral')
})

const updateBioForm = document.getElementById('updateBioForm')
if (updateBioForm) {
updateBioForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')
  const updateBioBtn = document.getElementById('updateBioBtn')

  alert.classList.add('alert-warning')
  alertContent.innerHTML = `Updating bio... (-100.00sl)`
  updateBioBtn.disabled = true

  alert.classList.remove('hidden')

  fetch('/api/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bio: formData.get('bio') })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
    alert.classList.replace('alert-warning', 'alert-success')
    alertContent.innerHTML = `User bio has been successfully updated. (-100.00sl)`

    if (!alert.classList.contains('hidden')) setTimeout(() => {
      alert.classList.add('hidden')
      updateBioBtn.disabled = false
    }, 1500)
  })  
})
}

const sendCreditForm = document.getElementById('sendCreditForm')
if (sendCreditForm) {
sendCreditForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')
  const sendBtn = document.getElementById('sendBtn')

  alert.classList.add('alert-warning')
  alertContent.innerHTML = `Sending credit to ${formData.get('to')} ... (-${formData.get('amount')}sl)`
  sendBtn.disabled = true

  alert.classList.remove('hidden')
  
  fetch('/api/transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: formData.get('to'),
      amount: formData.get('amount'),
      of: 'credit'
    })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
    alert.classList.replace('alert-warning', 'alert-success')
    alertContent.innerHTML = `Credit successfully sent to ${formData.get('to')}. (-${formData.get('amount')}sl)`

    if (!alert.classList.contains('hidden')) setTimeout(() => {
      alert.classList.add('hidden')
      sendBtn.disabled = false
    }, 1500)
  })  
})
}

const mintBankForm = document.getElementById('mintBankForm')
if (mintBankForm) {
  mintBankForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const alert = document.getElementById('alert')
    const alertContent = document.getElementById('alertContent')
    const mintBankBtn = document.getElementById('mintBankBtn')

    alert.classList.add('alert-warning')
    alertContent.innerHTML = `Minting bank item... (-200.00sl - wtr - mth)`
    mintBankBtn.disabled = true

    alert.classList.remove('hidden')
    
    fetch('/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: formData.get('type')
      })
    }).catch(err => {
      console.error(err)
    }).then(res => res.json()).then(res => {
      alert.classList.replace('alert-warning', 'alert-success')
      alertContent.innerHTML = `Bank item successfully minted. (-200.00sl - wtr - mth)`

      refreshInventoryAsync()
      if (!alert.classList.contains('hidden')) setTimeout(() => {alert.classList.add('hidden')}, 1500)
    })  
  })
}

const postForm = document.getElementById('postForm')
if (postForm) {
postForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')
  const postBtn = document.getElementById('postBtn')

  alert.classList.add('alert-warning')
  alertContent.innerHTML = `Creating a post... (-10.00sl)`
  postBtn.disabled = true

  alert.classList.remove('hidden')
  
  fetch('/api/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: formData.get('title'),
      channels: formData.get('channels'),
      content: formData.get('content')
    })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
    alert.classList.replace('alert-warning', 'alert-success')
    alertContent.innerHTML = `Post successfully created. (-10.00sl)`

    if (!alert.classList.contains('hidden')) setTimeout(() => {
      alert.classList.add('hidden')
      postBtn.disabled = false
    }, 1500)
  })
})
}

const itemForms = document.querySelectorAll('.itemForm')
itemForms.forEach(f => {
  f.addEventListener('submit', onSubmitSell)
})

const listingForms = document.querySelectorAll('.listingForm')
listingForms.forEach(f => {
  f.addEventListener('submit', onSubmitDelistBuy)
})

// need common function between front and back
function getItemElement(i) {
  const element = document.createElement('li')
  element.innerHTML = `
    <form class="itemForm p-2 bg-base-200">
        <div>
            ${i.amount} unit(s) of ${i.owner}'s ${i.type}
            <input name="id" type="hidden" value="${i.id}" class="input input-xs" />
        </div>
        <div>
            ${i.type=="bankstone" ? `
                <small>
                    APR ${(i.properties.yield*100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked/i.properties.cap * 100).toFixed(0)}%)
                </small>
                ` : ``}
        </div>
        <div class="m-auto">
        </div>
        <div class ="mt-4 text-right">
            <button class="btn btn-xs"
                ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "disabled" : ""}>
                ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "Sell (min.100)" : `Sell ${i.amount}`}
            </button>
            <input name="amount" type="hidden" value="${i.amount}" />
            <small for="id">${i.id}</small>
            for <input name="price" type="number" class="input input-xs w-20" value="${i.type == "bankstone" ?
                (i.properties.staked * i.properties.yield * .33).toFixed(2) :
                (i.amount * (i.type == 'water' ? .03 : .09)).toFixed(2)}" max="1000.00" step=".01" />
        </div>
    </form>`
    return element
}

function getListingElement(l, i) {
  const element = document.createElement('li')
  element.innerHTML = `
    <form class="p-2 bg-base-200">
      <div>
          ${l.amount}
          unit of ${l.owner}'s ${i.type} 
          <input name="id" type="hidden" value="${l.id}" />
      </div>
      <div>
          ${i.type == "bankstone" ?
              `<small>
                  APR ${(i.properties.yield * 100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked / i.properties.cap * 100).toFixed(0)}%)
              </small>` : ``}
      </div>
      <div class="m-auto">
      </div>
      <div class="text-right mt-4"><small>(${(l.price / l.amount).toFixed(2)}/unit)</small></div>
      <div class="text-right">
          <button name="buyer" value="${Current.user.id}" class="btn btn-xs"
              ${Current.user.id != queryUser && Current.user.balance < l.price ?
                  `disabled` : ``}>
              ${Current.user.id == queryUser && l.owner == queryUser ? 'Delist' : 'Buy'}
          </button>
          ${l.amount}
          <small for="id">${l.id}</small> for
          <input name="price" type="number" value="${l.price.toFixed(2)}" class="input input-xs w-20" readonly />
      </div>
    </form>`
    return element
}

function onSubmitDelistBuy(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')

  alert.classList.add('alert-warning')
  alertContent.innerHTML = `Delisting/Purchasing item from market... (+ units)`

  alert.classList.remove('hidden')

  fetch('/api/trade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: formData.get('id')
    })
  }).catch(err => {
    alert.classList.replace('alert-warning', 'alert-error')
    alertContent.innerHTML = `Failed to delist/purchase item ${formData.get('id')} from market. (- units)`
    console.error(err)
  }).then(res => res.json()).then(async res => {
    alert.classList.replace('alert-warning', 'alert-success')
    alertContent.innerHTML = `Item ${formData.get('id')} successfully delisted/purchased. (+ units)`

    await refreshInventoryAsync()
    await refreshMarketListingAsync()

    if (!alert.classList.contains('hidden')) setTimeout(() => {alert.classList.add('hidden')}, 1500)
  })
}

function onSubmitSell(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')

  alert.classList.add('alert-warning')
  alertContent.innerHTML = `Listing item for sale... (- units)`

  alert.classList.remove('hidden')

  fetch('/api/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: formData.get('id'),
      price: formData.get('price'),
      amount: formData.get('amount')
    })
  }).catch(err => {
    alert.classList.replace('alert-warning', 'alert-error')
    alertContent.innerHTML = `Failed to list item ${formData.get('id')} for sale. (- units)`
    console.error(err)
  }).then(res => res.json()).then(async res => {
    alert.classList.replace('alert-warning', 'alert-success')
    alertContent.innerHTML = `Item ${formData.get('id')} successfully listed. (- units)`

    await refreshInventoryAsync()
    await refreshMarketListingAsync()
    if (!alert.classList.contains('hidden')) setTimeout(() => {alert.classList.add('hidden')}, 1500)
  })
}

async function refreshMarketListingAsync() {
  fetch(`/api/market?user=${Current.user.id}`).then(async (res) => {
    let listings = await res.json()
    const marketElement = document.getElementById('market')
    if (!marketElement) return

    marketElement.innerHTML = ''
    const activeListings = listings.filter(l => !l.times.sold && !l.times.expired)
      .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
      .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    activeListings.slice(0, 100).forEach(l => {
      const item = Current.user.inventory.find(i => i.id == l.item)
      if (item) {
        const listingElement = getListingElement(l, item)
        marketElement.appendChild(listingElement)

        listingElement.children[0].addEventListener('submit', onSubmitDelistBuy)
      } else {
        console.warn(`item ${l.item} not found in current user inventory. user's inventory: ${Current.user.inventory.length} items`)
      }
    })

    marketTotal.innerHTML = activeListings.length
  })
}

async function refreshInventoryAsync() {
  fetch(`/api/assets?user=${Current.user.id}`).then(async (res) => {
    const items = await res.json()
    const inventoryElement = document.getElementById('inventory')
    if (!inventoryElement) return

    inventoryElement.innerHTML = ''
    Current.user.inventory = items.sort((a, b) => { return a.properties && b.properties &&
        (a.properties.staked * a.properties.yield) > (b.properties.staked * b.properties.yield) ? 1 : -1})
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1})

    Current.user.inventory.filter(i => i.amount > 0).slice(0, 100).forEach(i => {
      const itemElement = getItemElement(i)
      inventoryElement.appendChild(itemElement)

      itemElement.children[0].addEventListener('submit', onSubmitSell)
    })

    inventoryTotal.innerHTML = items.filter(a => a.amount > 0).length
  })
}

function onCollect(resource) {
  const collectWaterBtn = document.getElementById('collectWaterBtn')
  const collectWaterIcon = document.getElementById('collectWaterIcon')
  const collectingWaterIcon = document.getElementById('collectingWaterIcon')

  const collectMineralBtn = document.getElementById('collectMineralBtn')
  const collectMineralIcon = document.getElementById('collectMineralIcon')
  const collectingMineralIcon = document.getElementById('collectingMineralIcon')

  switch(resource) {
    case 'water':
      collectWaterBtn.disabled = true
      collectWaterIcon.classList.add('hidden')
      collectingWaterIcon.classList.remove('hidden')
      break
    case 'mineral':
      collectMineralBtn.disabled = true
      collectMineralIcon.classList.add('hidden')
      collectingMineralIcon.classList.remove('hidden')
      break
    default:
      break
  }

  fetch('/api/collect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ resource: resource })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
    const topRight = document.getElementById("topRightStatus");
    topRight.innerHTML = `+${res.amount} ${res.of}`;
    topRight.classList.remove('text-blue-400')
    topRight.classList.remove('text-white')

    const topLeft = document.getElementById("topLeftStatus");
    topLeft.innerHTML = `-${res.amount} ${res.of}`;
    topLeft.classList.remove('text-blue-500')
    topLeft.classList.remove('text-gray-300')

    switch(res.of) {
      case 'water':
        topRight.classList.add('text-blue-400')
        topLeft.classList.add('text-blue-500')
        collectWaterBtn.disabled = false
        collectWaterIcon.classList.remove('hidden')
        collectingWaterIcon.classList.add('hidden')
        break
      case 'mineral':
        topRight.classList.add('text-white')
        topLeft.classList.add('text-gray-300')
        collectMineralBtn.disabled = false
        collectMineralIcon.classList.remove('hidden')
        collectingMineralIcon.classList.add('hidden')
        break
      default:
        break
    }

    topRight.classList.remove('hidden')
    topLeft.classList.remove('hidden')

    setTimeout(() => {
      topRight.classList.add('hidden')
      topLeft.classList.add('hidden')

      refreshInventoryAsync()
    }, 500)
  })
}