import { Connection } from './app.js'
import { updateUserInventory, updateMarketListings } from './dom.js'

export async function refreshInventoryAsync() {
  await fetch(`/api/assets?user=${Connection.user.id}`).then(async (res) => {
    const items = await res.json()
    updateUserInventory(Connection, items)
  }).catch(err => console.error(err))
}

export async function refreshMarketListingAsync() {
  await fetch(`/api/market?user=${Connection.user.id}`).then(async (res) => {
    const listings = await res.json()
    updateMarketListings(Connection, listings)
  }).catch(err => console.error(err))
}
