
import { JSONFilePreset } from 'lowdb/node'

export const activityDb = await JSONFilePreset('./data/activities.json', [])
export const activities = activityDb.data

export const accountDb = await JSONFilePreset('./data/accounts.json', [])
export const accounts = accountDb.data

export const assetDb = await JSONFilePreset('./data/assets.json', [])
export const assets = assetDb.data

export const currentDb = await JSONFilePreset('./data/current.json', {})
export const current = currentDb.data

export const worldDb = await JSONFilePreset('./data/world.json', {})
export const world = worldDb.data

export const marketDb = await JSONFilePreset('./data/market.json', [])
export const market = marketDb.data

export const authDb = await JSONFilePreset('./data/auth.json', [])
export const auth = authDb.data

export const blogDb = await JSONFilePreset('./data/blog.json', [])
export const blog = blogDb.data

export async function backupAsync(data, filename) {
    const backupDb = await JSONFilePreset(`./data/backup/${filename}`, data)
    backupDb.write()
}