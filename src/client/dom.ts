import { Current, queryUser } from './app.js'
import { onSellItemForm, onBuyDelistForm } from './events.js'

export function showAlert(alert: HTMLElement, alertContent: HTMLElement, alertClass: string, message: string, button?: HTMLButtonElement) {
  alert.classList.remove('alert-warning', 'alert-error', 'alert-success')
  alert.classList.add(alertClass)
  alertContent.innerHTML = message
  alert.classList.remove('hidden')
  if (button) button.disabled = true
}

export function hideAlert(alert: HTMLElement, button?: HTMLButtonElement) {
  if (button) button.disabled = false
  setTimeout(() => {
    alert.classList.add('hidden')
  }, 1500)
}

export function updateElementContent(elementId: string, content: string) {
  const element = document.getElementById(elementId)
  if (element) element.innerHTML = content
}

export function toggleElementVisibility(element: HTMLElement, hidden: boolean) {
  if (hidden) element.classList.add('hidden')
  else element.classList.remove('hidden')
}

export function buildTimeString(world: any, time: number): string {
  return `${Math.floor(time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${time % (world.interval.hour) < 10 ? '0' : ''}${time % (world.interval.hour)}\
          <small class="hidden md:inline">(${(time % (world.interval.hour) / world.interval.hour * 100).toFixed(0)}% to yield)</small>`;
}

export function buildDateString(world: any, time: number): string {
  return `<small class="hidden md:inline">Year ${Math.floor(time / (world.interval.hour * world.interval.day * world.interval.year))}\
          Day ${Math.floor(time / (world.interval.hour * world.interval.day))}\
          <small class="hidden md:inline">(x${60000 / world.interval.minute})</small></small>`;
}

export function updateHeader(Current: any) {
  updateElementContent("headerTime", Current.time);
  updateElementContent("headerDate", Current.date);
  updateElementContent("headerWater", Current.resources.water);
  updateElementContent("headerMithril", Current.resources.mithril);
}

export function updateStatus(res: any) {
  const topRight = getElementById("topRightStatus");
  updateElementContent("topRightStatus", `+${res.amount} ${res.of}`);
  topRight.classList.remove('text-blue-400', 'text-white')

  const topLeft = getElementById("topLeftStatus");
  updateElementContent("topLeftStatus", `-${res.amount} ${res.of}`);
  topLeft.classList.remove('text-blue-500', 'text-gray-300')

  switch(res.of) {
    case 'water':
      topRight.classList.add('text-blue-400')
      topLeft.classList.add('text-blue-500')
      break
    case 'mineral':
      topRight.classList.add('text-white')
      topLeft.classList.add('text-gray-300')
      break
    default:
      break
  }

  toggleElementVisibility(topRight, false)
  toggleElementVisibility(topLeft, false)
}

export function toggleButtonState(button: HTMLButtonElement, icon: HTMLElement, loadingIcon: HTMLElement, isLoading: boolean) {
  button.disabled = isLoading
  toggleElementVisibility(icon, isLoading)
  toggleElementVisibility(loadingIcon, !isLoading)
}

export function getItemElement(i: any): HTMLElement {
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

export function getListingElement(l: any, i: any): HTMLElement {
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
    </form>`
    return element
}

export function updateUserBalance(Current: any, queryUser: string) {
  updateElementContent("userBalance", Current.user?.balance?.toFixed(2))
  if (queryUser == Current.user.id) updateElementContent('profileBalance', Current.user?.balance?.toFixed(2))
  updateElementContent("userWater", Current.user?.water)
  updateElementContent("userMineral", Current.user.mithril)

  const mintBankBtn = getElementById('mintBankBtn')
  const alert = getElementById('alert')
  if (mintBankBtn && alert.classList.contains('hidden'))
    (mintBankBtn as HTMLButtonElement).disabled = Current.user.mithril < 200 ||
      Current.user.water < Math.ceil(Math.pow(Current.resources.water / Current.resources.mithril, 7)) || Current.user.balance < 200
}

export function updateUserInventory(Current: any, inventory: any[]) {
  const inventoryElement = getElementById('inventory')
  if (!inventoryElement) return

  inventoryElement.innerHTML = ''
  Current.user.inventory = inventory.sort((a, b) => {
    return a.properties && b.properties &&
      (a.properties.staked * a.properties.yield) > (b.properties.staked * b.properties.yield) ? 1 : -1
  }).sort((a, b) => {
    return a.amount < b.amount ? 1 : -1
  })

  Current.user.inventory.filter(i => i.amount > 0).slice(0, 100).forEach(i => {
    const itemElement = getItemElement(i)
    inventoryElement.appendChild(itemElement)

    itemElement.children[0].addEventListener('submit', onSellItemForm)
  })

  const inventoryTotal = getElementById('inventoryTotal')
  if (inventoryTotal) inventoryTotal.innerHTML = inventory.filter(a => a.amount > 0).length.toString()
}

export function updateMarketListings(Current: any, listings: any[]) {
  const marketElement = getElementById('market')
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

  const marketTotal = getElementById('marketTotal')
  if (marketTotal) marketTotal.innerHTML = activeListings.length.toString()
}

export function getElementById(id: string): HTMLElement {
  return document.getElementById(id)
}

export function getElementByIdAsButton(id: string): HTMLButtonElement {
  return document.getElementById(id) as HTMLButtonElement
}