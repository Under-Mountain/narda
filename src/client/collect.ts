import { updateStatus, toggleButtonState, toggleElementVisibility, getElementById, getElementByIdAsButton } from './dom.js'
import { refreshInventoryAsync } from './refresh.js'

export function collectResource(resource: string) {
  const collectWaterBtn = getElementByIdAsButton('collectWaterBtn')
  const collectWaterIcon = getElementById('collectWaterIcon')
  const collectingWaterIcon = getElementById('collectingWaterIcon')

  const collectMineralBtn = getElementByIdAsButton('collectMineralBtn')
  const collectMineralIcon = getElementById('collectMineralIcon')
  const collectingMineralIcon = getElementById('collectingMineralIcon')

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
  }).then(res => {
    if (!res || !res.json) {
      throw new Error('Invalid response');
    }
    return res.json();
  }).then(res => {
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

    setTimeout(async () => {
      toggleElementVisibility(getElementById("topRightStatus"), true)
      toggleElementVisibility(getElementById("topLeftStatus"), true)
      await refreshInventoryAsync()
    }, 500)
  })
}
