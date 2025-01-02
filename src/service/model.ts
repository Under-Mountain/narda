import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"
import { Activity, Account, Asset, Current, World, Listing, Auth, Post } from '../types.js'

const activityDb = new Low<Activity[]>(new JSONFile('./data/activities.json'), [])
const accountDb = new Low(new JSONFile<Account[]>('./data/accounts.json'), [])
const assetDb = new Low(new JSONFile<Asset[]>('./data/assets.json'), [])
const currentDb = new Low(new JSONFile<Current>('./data/current.json'), {} as Current)
const worldDb = new Low<World>(new JSONFile('./data/world.json'), {} as World)
const marketDb = new Low<Listing[]>(new JSONFile('./data/market.json'), [])
const authDb = new Low<Auth[]>(new JSONFile('./data/auth.json'), [])
const postDb = new Low<Post[]>(new JSONFile('./data/posts.json'), [])

await activityDb.read()
await accountDb.read()
await assetDb.read()
await currentDb.read()
await worldDb.read()
await marketDb.read()
await authDb.read()
await postDb.read()

export const activities: Activity[] = activityDb.data || []
export const accounts: Account[] = accountDb.data || []
export const assets: Asset[] = assetDb.data || []
export const current: Current = currentDb.data || {} as Current
export const world: World = worldDb.data || {} as World
export const market: Listing[] = marketDb.data || []
export const auth: Auth[] = authDb.data || []
export const posts: Post[] = postDb.data || []

export async function backupAsync(data: any, filename: string): Promise<void> {
    const backupDb = new Low<any>(new JSONFile(`./data/backup/${filename}`), {})
    backupDb.data = data
    await backupDb.write()
}

export async function updateAllAsync() {
    const writePromises = [
            assetDb.write(),
            accountDb.write(),
            worldDb.write(),
            marketDb.write(),
            authDb.write(),
            postDb.write(),
            activityDb.write()]

    return await Promise.all(writePromises)
}

export async function updateCurrentAsync() {
    await currentDb.write()
}