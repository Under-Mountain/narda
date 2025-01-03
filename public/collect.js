import { updateStatus, toggleButtonState, toggleElementVisibility } from './dom.js'
import { refreshInventoryAsync } from './refresh.js'

export function collectResource(resource) {
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

    setTimeout(async () => {
      toggleElementVisibility(document.getElementById("topRightStatus"), true)
      toggleElementVisibility(document.getElementById("topLeftStatus"), true)
      await refreshInventoryAsync()
    }, 500)
  })
}
