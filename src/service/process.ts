import { accounts, assets, current, world, market, activities } from './model.js'
import { Activity } from '../types.js'
import * as util from '../common/utility.js'
import * as fs from 'fs';
import { getPlaceTier } from '../common/places.js';

export function processResources(): void {
    const waterRate = util.getRandomNumber(world.resources.water.rateLo, world.resources.water.rateHi) / 100 / world.interval.year / world.interval.day / world.interval.minute
    const mineralRate = util.getRandomNumber(world.resources.mineral.rateLo, world.resources.mineral.rateHi) / 100 / world.interval.year / world.interval.day / world.interval.minute

    const remainingWater = (world.resources.water.total - current.resources.water.supplied)
    const adjustedWaterRate = waterRate * (1 - (current.resources.water.balance / 100) * 0.08)
    const water = remainingWater * adjustedWaterRate

    const remainingMineral = (world.resources.water.total - current.resources.water.supplied)
    const adjustedMineralRate = mineralRate * (1 - (current.resources.mineral.balance / 100) * 0.08)
    const mineral = remainingMineral * adjustedMineralRate

    // This should be only place resource balance and supply increases
    current.resources.water.balance += water
    current.resources.water.supplied += water

    current.resources.mineral.balance += mineral
    current.resources.mineral.supplied += mineral
}

export function processCurrentActivities(): void {
    const notFoundActivities: string[] = []
    current.activities.pending.forEach((id) => {
        const activity = activities.find(a => a.id == id)
        if (!activity) {
            console.error(`pending activity ${id} not found`)
            notFoundActivities.push(id)
            return
        } else {
            // console.debug(`processing activity ${activity.id}..`)
            switch (activity.type) {
                case "system":
                    processPendingSystemActivity(activity)
                    break
                case "transaction":
                    processPendingTransaction(activity)
                    break
                case "mint":
                    processPendingMint(activity)
                    break
                case "collect":
                    processPendingCollect(activity)
                    break
                case "consume":
                    processPendingConsume(activity)
                    break
                default:
                    break
            }

            activity.times.completed = current.time
            current.activities.completed.push(activity.id)
            current.activities.pending = current.activities.pending.filter(id => id != activity.id)
        }
    })

    //console.debug(`cleaning ${notFoundActivities.length} invalid activities...`)
}

type ResourceType = 'water' | 'mineral' | 'credits'
function processPendingConsume(consume: Activity): void {
    console.debug(`${consume.id}: consuming ${consume.of} from ${consume.from}...`)

    switch (consume.of) {
        case "credits":
            const account = accounts.find(a => a.id == consume.from)
            if (account) {
                account.credits.balance -= consume.amount
                current.resources.credits.balance -= consume.amount
            }
            break
        default:
            const resource = assets.find(a => a.type == consume.of && a.owner == consume.from && a.amount > 0)
            if (resource) {
                resource.amount -= consume.amount
            }
            break
    }

    console.log(`${consume.id}: ${consume.amount.toFixed(2)} ${consume.of} burnt ${current.resources[consume.of as ResourceType].balance.toFixed(2)}/${current.resources[consume.of as ResourceType].supplied.toFixed(2)} (${(current.resources[consume.of as ResourceType].balance/current.resources[consume.of as ResourceType].supplied *100).toFixed(2)}%) circulating..`)
}

/**
 * 
 * @param collect 
 */
function processPendingCollect(collect: Activity): void {
    console.log(`${collect.id}: collecting ${collect.amount} ${collect.of} from ${collect.from} to ${collect.to}...`)
    current.resources[collect.of as ResourceType].balance -= collect.amount

    const resource = assets.find(a => a.type == collect.of && a.owner == collect.to && a.amount > 0)
    if (resource) {
        resource.amount += collect.amount
    } else {
        let id = collect.id
        let visual
        switch (collect.of) {
            case "water":
                id = `WTR${assets.length}`
                visual = 'water.webp'
                break
            case "mineral":
                id = `MNR${assets.length}`
                visual = 'mineral.webp'
                break
            default:
                break
        }

        assets.push({
            id: id,
            type: collect.of,
            amount: collect.amount,
            owner: collect.to,
            visual: visual
        })
    }
}

function processPendingMint(mint: Activity): void {
    console.log(`${mint.id}: minting an ${mint.of} from ${mint.from} to ${mint.to}...`)

    switch (mint.of) {
        case "account":
            accounts.push({
                id: mint.to.toLowerCase(),
                credits: {
                    balance: 0
                },
                times: {
                    created: current.time,
                    lastActive: current.time
                },
                visual: getRandomFileName('./public/images/profiles')
            })
            break
        case "bankstone":
            const yld = util.getRandomNumber(world.items.bankstone.rateLo, world.items.bankstone.rateHi) / 100
            const cap = util.getRandomNumber(world.items.bankstone.capLo, world.items.bankstone.capHi)

            const id = `BNK${assets.length}`
            const { place, tier } = getPlaceTier(yld, cap)

            assets.push({
                id: id,
                type: "bankstone",
                amount: 1,
                properties: {
                    "yield": yld,
                    "cap": cap,
                    "staked": cap
                },
                owner: mint.to,
                visual: getRandomFileName(`./public/images/places/${place}/${tier}`)
            })
            break
        default:
            break
    }
}

function processPendingTransaction(transaction: Activity): void {
    console.debug(`${transaction.id}: sending ${transaction.amount.toFixed(2)} ${transaction.of} from ${transaction.from} to ${transaction.to}...`)

    const from = accounts.find(a => a.id == transaction.from)
    const to = accounts.find(a => a.id == transaction.to)

    switch (transaction.of) {
        case "credit":
            if (transaction.from.startsWith("BNK")) {
                const bank = assets.find(a => a.id == transaction.from)
                if (bank && bank.properties?.staked) {
                    bank.properties.staked -= transaction.amount
                    current.resources.credits.balance += transaction.amount
                    current.resources.credits.supplied += transaction.amount
                }
            } else if (from && to) {
                from.credits.balance -= transaction.amount
                to.credits.balance += transaction.amount
            }
            break
        default:
            const item = assets.find(a => a.id == transaction.of)
            if (item && to) {
                item.owner = to.id
                item.amount += transaction.amount

                if (item.amount - transaction.amount < 0) {
                    console.error(`item amount cannot go below 0`)
                    return
                }
            }
            break
    }
}

function processPendingSystemActivity(activity: Activity): void {
    switch (activity.of) {
        case "connection":
            console.log(`processing connection from ${activity.from} to ${activity.to}...`)
            const existingConnection = current.accounts.find(id => id == activity.from)
            if (!existingConnection) {
                current.accounts.push(activity.from)
            }

            const account = accounts.find(a => a.id == activity.from);
            if (account) {
                account.times.lastActive = current.time
            }
            break
        default:
            break
    }
}

function getRandomFileName(folderPath: string): string | null {
    try {
        const files = fs.readdirSync(folderPath);
        if (files.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * files.length);
        return files[randomIndex];
    } catch (error) {
        console.error(`Error reading folder: ${error.message}`);
        return null;
    }
}