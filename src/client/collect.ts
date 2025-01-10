import { updateStatus, toggleButtonState, toggleElementVisibility, getElementById, getElementByIdAsButton } from './dom.js'
import { refreshInventoryAsync } from './refresh.js'

export function collectResource(resource: string) {
  const waterProgress = getElementById('waterProgress') as HTMLProgressElement
  const mineralProgress = getElementById('mineralProgress') as HTMLProgressElement

  const collectWaterBtn = getElementByIdAsButton('collectWaterBtn')
  const collectWaterIcon = getElementById('collectWaterIcon')
  const collectingWaterIcon = getElementById('collectingWaterIcon')

  const collectMineralBtn = getElementByIdAsButton('collectMineralBtn')
  const collectMineralIcon = getElementById('collectMineralIcon')
  const collectingMineralIcon = getElementById('collectingMineralIcon')

  switch(resource) {
    case 'water':
      waterProgress.removeAttribute('value')
      waterProgress.classList.replace('opacity-0', 'opacity-80')
      toggleButtonState(collectWaterBtn, collectWaterIcon, collectingWaterIcon, true)
      break
    case 'mineral':
      mineralProgress.removeAttribute('value')
      mineralProgress.classList.replace('opacity-0', 'opacity-80')
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
        waterProgress.value = 100
        waterProgress.classList.replace('opacity-80', 'opacity-100')
        toggleButtonState(collectWaterBtn, collectWaterIcon, collectingWaterIcon, false)
        break
      case 'mineral':
        mineralProgress.value = 100
        mineralProgress.classList.replace('opacity-80', 'opacity-100')
        toggleButtonState(collectMineralBtn, collectMineralIcon, collectingMineralIcon, false)
        break
      default:
        break
    }

    setTimeout(async () => {
      mineralProgress.classList.replace('opacity-100', 'opacity-0')
      waterProgress.classList.replace('opacity-100', 'opacity-0')
      toggleElementVisibility(getElementById("topRightStatus"), true)
      await refreshInventoryAsync()
    }, 500)
  })
}
