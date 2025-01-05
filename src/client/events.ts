import { showAlert, hideAlert, toggleElementVisibility, getElementById, getElementByIdAsButton, updateElementContent } from './dom.js'
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
    mintBankForm.addEventListener('submit', onRecruitPlaces)
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

function onCollectForm(e: Event, resource: string) {
  e.preventDefault()
  collectResource(resource)
}

function onUpdateBioForm(e: Event) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)

  const alert = getElementById('alert')
  const alertContent = getElementById('alertContent')
  const updateBioBtn = getElementByIdAsButton('updateBioBtn')

  showAlert(alert, alertContent, 'alert-warning', `Updating bio... (-100.00sl)`, updateBioBtn)

  fetch('/api/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bio: formData.get('bio') })
  }).then(res => {
    if (!res) throw new Error('No response received')
    return res.json()
  }).then(account => {
    showAlert(alert, alertContent, 'alert-success', `User bio has been successfully updated. (-100.00sl)`);
    updateElementContent('accountBio', account.bio);
    (getElementById('editAccountModal') as HTMLFormElement).close()
    hideAlert(alert, updateBioBtn)
  })
}

function onSendCreditForm(e: Event) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)

  const alert = getElementById('alert')
  const alertContent = getElementById('alertContent')
  const sendBtn = getElementByIdAsButton('sendBtn')

  showAlert(alert, alertContent, 'alert-warning', `Sending credit to ${formData.get('to')} ... (-${formData.get('amount')}sl)`, sendBtn)

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
  }).then(res => {
    if (!res) throw new Error('No response received')
    return res.json()
  }).then(res => {
    showAlert(alert, alertContent, 'alert-success', `Credit successfully sent to ${formData.get('to')}. (-${formData.get('amount')}sl)`);
    (getElementById('sendCreditModal') as HTMLFormElement).close()
    hideAlert(alert, sendBtn)
  })
}

function onRecruitPlaces(e: Event) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)

  const alert = getElementById('alert')
  const alertContent = getElementById('alertContent')
  const mintBankBtn = getElementByIdAsButton('mintBankBtn')

  showAlert(alert, alertContent, 'alert-warning', `Minting bank item... (-200.00sl - wtr - mth)`, mintBankBtn)

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
  }).then(res => {
    if (!res) throw new Error('No response received')
    return res.json()
  }).then(async res => {
    showAlert(alert, alertContent, 'alert-success', `Bank item successfully minted. (-200.00sl - wtr - mth)`)
    await refreshInventoryAsync()
    hideAlert(alert)
  })
}

function onPostForm(e: Event) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)

  const alert = getElementById('alert')
  const alertContent = getElementById('alertContent')
  const postBtn = getElementByIdAsButton('postBtn')

  showAlert(alert, alertContent, 'alert-warning', `Creating a post... (-10.00sl)`, postBtn)

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
  }).then(res => {
    if (!res) throw new Error('No response received')
    return res.json()
  }).then(res => {
    showAlert(alert, alertContent, 'alert-success', `Post successfully created. (-10.00sl)`);
    (getElementById('postContentModal') as HTMLFormElement).close()
    hideAlert(alert, postBtn)
  })
}

export function onSellItemForm(e: Event) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)

  const alert = getElementById('alert')
  const alertContent = getElementById('alertContent')

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
  }).then(res => {
    if (!res) throw new Error('No response received')
    return res.json()
  }).then(async res => {
    showAlert(alert, alertContent, 'alert-success', `Item ${formData.get('id')} successfully listed. (- units)`)
    await refreshInventoryAsync()
    await refreshMarketListingAsync()
    hideAlert(alert)
  })
}

export function onBuyDelistForm(e: Event) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)

  const alert = getElementById('alert')
  const alertContent = getElementById('alertContent')

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
  }).then(res => {
    if (!res) throw new Error('No response received')
    return res.json()
  }).then(async res => {
    showAlert(alert, alertContent, 'alert-success', `Item ${formData.get('id')} successfully delisted/purchased. (+ units)`)
    await refreshInventoryAsync()
    await refreshMarketListingAsync()
    hideAlert(alert)
  })
}

export function onInvitationCodeInput(e: Event) {
  const usernameControl = getElementById('usernameControl')
  const passwordControl = getElementById('passwordControl')
  const registerBtn = getElementByIdAsButton('registerBtn')

  if ((e.target as HTMLInputElement).value == '1892') {
    toggleElementVisibility(usernameControl, false)
    toggleElementVisibility(passwordControl, false)
    registerBtn.disabled = false

    toggleElementVisibility(getElementById('invitationCode'), true)
    const usernameInput = usernameControl.firstElementChild as HTMLElement
    usernameInput.focus()
  } else {
    toggleElementVisibility(usernameControl, true)
    toggleElementVisibility(passwordControl, true)
    registerBtn.disabled = true

    toggleElementVisibility(getElementById('invitationCode'), false)
  }
}
