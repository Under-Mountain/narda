import { Current } from './app.js'
import { updateUserInventory, updateMarketListings } from './dom.js'

export async function refreshInventoryAsync() {
  await fetch(`/api/assets?user=${Current.user.id}`).then(async (res) => {
    const items = await res.json()
    updateUserInventory(Current, items)
  }).catch(err => console.error(err))
}

export async function refreshMarketListingAsync() {
  await fetch(`/api/market?user=${Current.user.id}`).then(async (res) => {
    const listings = await res.json()
    updateMarketListings(Current, listings)
  }).catch(err => console.error(err))
}
