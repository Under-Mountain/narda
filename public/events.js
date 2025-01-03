import { Current, queryUser } from './app.js'
import { showAlert, hideAlert, toggleElementVisibility, updateStatus, toggleButtonState, getItemElement, getListingElement } from './dom.js'
import { refreshInventoryAsync, refreshMarketListingAsync } from './refresh.js'
import { collectResource } from './collect.js'

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

  const invitationCode = document.getElementById('invitationCode')
  if (invitationCode) {
      invitationCode.addEventListener('input', onInvitationCodeInput)
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
  }).then(res => res.json()).then(async res => {
    showAlert(alert, alertContent, 'alert-success', `Bank item successfully minted. (-200.00sl - wtr - mth)`)
    await refreshInventoryAsync()
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

export function onSellItemForm(e) {
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

export function onBuyDelistForm(e) {
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

export function onInvitationCodeInput(e) {
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