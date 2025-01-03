import { Current, queryUser } from './app.js'
import { showAlert, hideAlert, toggleElementVisibility, updateStatus, toggleButtonState } from './dom.js'

export function initializeFormHandlers() {
  const collectWaterForm = document.getElementById('collectWaterForm')
  if (collectWaterForm) {
    collectWaterForm.addEventListener('submit', (e) => onCollectForm(e, 'water'))
  }

  const collectMineralForm = document.getElementById('collectMineralForm')
  if (collectMineralForm) {
    collectMineralForm.addEventListener('submit', (e) => onCollectForm(e, 'mineral'))
  }

  const updateBioForm = document.getElementById('updateBioForm')
  if (updateBioForm) {
    updateBioForm.addEventListener('submit', onUpdateBioForm)
  }

  const sendCreditForm = document.getElementById('sendCreditForm')
  if (sendCreditForm) {
    sendCreditForm.addEventListener('submit', onSendCreditForm)
  }

  const mintBankForm = document.getElementById('mintBankForm')
  if (mintBankForm) {
    mintBankForm.addEventListener('submit', onExploreForm)
  }

  const postForm = document.getElementById('postForm')
  if (postForm) {
    postForm.addEventListener('submit', onPostForm)
  }

  const itemForms = document.querySelectorAll('.itemForm')
  itemForms.forEach(f => {
    f.addEventListener('submit', onSellItemForm)
  })

  const listingForms = document.querySelectorAll('.listingForm')
  listingForms.forEach(f => {
    f.addEventListener('submit', onBuyDelistForm)
  })
}

function onCollectForm(e, resource) {
  e.preventDefault()
  collectResource(resource)
}

function onUpdateBioForm(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')
  const updateBioBtn = document.getElementById('updateBioBtn')

  showAlert(alert, alertContent, 'alert-warning', `Updating bio... (-100.00sl)`)
  updateBioBtn.disabled = true

  fetch('/api/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bio: formData.get('bio') })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
    showAlert(alert, alertContent, 'alert-success', `User bio has been successfully updated. (-100.00sl)`)
    hideAlert(alert, updateBioBtn)
  })  
}

function onSendCreditForm(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')
  const sendBtn = document.getElementById('sendBtn')

  showAlert(alert, alertContent, 'alert-warning', `Sending credit to ${formData.get('to')} ... (-${formData.get('amount')}sl)`)
  sendBtn.disabled = true

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
    showAlert(alert, alertContent, 'alert-success', `Credit successfully sent to ${formData.get('to')}. (-${formData.get('amount')}sl)`)
    hideAlert(alert, sendBtn)
  })  
}

function onExploreForm(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')
  const mintBankBtn = document.getElementById('mintBankBtn')

  showAlert(alert, alertContent, 'alert-warning', `Minting bank item... (-200.00sl - wtr - mth)`)
  mintBankBtn.disabled = true

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
    showAlert(alert, alertContent, 'alert-success', `Bank item successfully minted. (-200.00sl - wtr - mth)`)
    refreshInventoryAsync()
    hideAlert(alert)
  })  
}

function onPostForm(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')
  const postBtn = document.getElementById('postBtn')

  showAlert(alert, alertContent, 'alert-warning', `Creating a post... (-10.00sl)`)
  postBtn.disabled = true

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
    showAlert(alert, alertContent, 'alert-success', `Post successfully created. (-10.00sl)`)
    hideAlert(alert, postBtn)
  })
}

function onSellItemForm(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')

  showAlert(alert, alertContent, 'alert-warning', `Listing item for sale... (- units)`)

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
    showAlert(alert, alertContent, 'alert-error', `Failed to list item ${formData.get('id')} for sale. (- units)`)
    console.error(err)
  }).then(res => res.json()).then(async res => {
    showAlert(alert, alertContent, 'alert-success', `Item ${formData.get('id')} successfully listed. (- units)`)
    await refreshInventoryAsync()
    await refreshMarketListingAsync()
    hideAlert(alert)
  })
}

function onBuyDelistForm(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

  const alert = document.getElementById('alert')
  const alertContent = document.getElementById('alertContent')

  showAlert(alert, alertContent, 'alert-warning', `Delisting/Purchasing item from market... (+ units)`)

  fetch('/api/trade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: formData.get('id')
    })
  }).catch(err => {
    showAlert(alert, alertContent, 'alert-error', `Failed to delist/purchase item ${formData.get('id')} from market. (- units)`)
    console.error(err)
  }).then(res => res.json()).then(async res => {
    showAlert(alert, alertContent, 'alert-success', `Item ${formData.get('id')} successfully delisted/purchased. (+ units)`)
    await refreshInventoryAsync()
    await refreshMarketListingAsync()
    hideAlert(alert)
  })
}

function collectResource(resource) {
  const collectWaterBtn = document.getElementById('collectWaterBtn')
  const collectWaterIcon = document.getElementById('collectWaterIcon')
  const collectingWaterIcon = document.getElementById('collectingWaterIcon')

  const collectMineralBtn = document.getElementById('collectMineralBtn')
  const collectMineralIcon = document.getElementById('collectMineralIcon')
  const collectingMineralIcon = document.getElementById('collectingMineralIcon')

  switch(resource) {
    case 'water':
      toggleButtonState(collectWaterBtn, collectWaterIcon, collectingWaterIcon, true)
      break
    case 'mineral':
      toggleButtonState(collectMineralBtn, collectMineralIcon, collectingMineralIcon, true)
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
    updateStatus(res)

    switch(res.of) {
      case 'water':
        toggleButtonState(collectWaterBtn, collectWaterIcon, collectingWaterIcon, false)
        break
      case 'mineral':
        toggleButtonState(collectMineralBtn, collectMineralIcon, collectingMineralIcon, false)
        break
      default:
        break
    }

    setTimeout(() => {
      toggleElementVisibility(document.getElementById("topRightStatus"), true)
      toggleElementVisibility(document.getElementById("topLeftStatus"), true)
      refreshInventoryAsync()
    }, 500)
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

      itemElement.children[0].addEventListener('submit', onSellItemForm)
    })

    inventoryTotal.innerHTML = items.filter(a => a.amount > 0).length
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

        listingElement.children[0].addEventListener('submit', onBuyDelistForm)
      } else {
        console.warn(`item ${l.item} not found in current user inventory. user's inventory: ${Current.user.inventory.length} items`)
      }
    })

    marketTotal.innerHTML = activeListings.length
  })
}

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