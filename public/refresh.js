import { Current } from './app.js'
import { getItemElement, getListingElement } from './dom.js'
import { onSellItemForm, onBuyDelistForm } from './events.js'

export async function refreshInventoryAsync() {
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

export async function refreshMarketListingAsync() {
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
