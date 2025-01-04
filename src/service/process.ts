import { accounts, assets, current, world, market, activities } from './model.js'
import { Activity } from '../types.js'
import * as util from '../common/utility.js'
import { createTransaction, consume } from './activity.js'

type ResourceType = 'water' | 'mineral' | 'credits'

export function processPendingConsume(consume: Activity): void {
    console.debug(`${consume.id}: consuming ${consume.of} from ${consume.from} to ${consume.to}...`)
    current.resources[consume.of as ResourceType].supplied += consume.amount

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
}

export function processPendingCollect(collect: Activity): void {
    console.log(`${collect.id}: collecting ${collect.amount} ${collect.of} from ${collect.from} to ${collect.to}...`)

    current.resources[collect.of as ResourceType].balance -= collect.amount
    current.resources[collect.of as ResourceType].supplied += collect.amount

    const resource = assets.find(a => a.type == collect.of && a.owner == collect.to && a.amount > 0)
    if (resource) {
        resource.amount += collect.amount
    } else {
        let id = collect.id
        switch (collect.of) {
            case "water":
                id = `WTR${assets.length}`
                break
            case "mineral":
                id = `MNR${assets.length}`
                break
            default:
                break
        }

        assets.push({
            "id": id,
            "type": collect.of,
            "amount": collect.amount,
            "owner": collect.to,
            visual: undefined
        })
    }
}

export function processPendingMint(mint: Activity): void {
    console.log(`${mint.id}: minting an ${mint.of} from ${mint.from} to ${mint.to}...`)

    switch (mint.of) {
        case "account":
            accounts.push({
                "id": mint.to.toLowerCase(),
                "credits": {
                    "balance": 0
                },
                "times": {
                    "created": current.time,
                    "lastActive": current.time
                }
            })
            break
        case "bankstone":
            const yld = util.getRandomNumber(world.items.bankstone.rateLo, world.items.bankstone.rateHi) / 100
            const cap = util.getRandomNumber(world.items.bankstone.capLo, world.items.bankstone.capHi)

            const id = `BNK${assets.length}`
            assets.push({
                "id": id,
                "type": "bankstone",
                "amount": 1,
                "properties": {
                    "yield": yld,
                    "cap": cap,
                    "staked": cap
                },
                "owner": mint.to,
                visual: undefined
            })
            break
        default:
            break
    }
}

export function processPendingTransaction(transaction: Activity): void {
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

export function processPendingSystemActivity(activity: Activity): void {
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

export function queueWorldbankActivities(): void {
    console.log(`TX${activities.length}: processing worldbank activities...`);
    const account = accounts.find(a => a.id == 'worldbank')
    if (account && account.credits.balance <= -1 * world.worldbank.maxDeficit) {
        console.warn(`TX${activities.length}: worldbank's max deficit reached`);
        return
    }

    buyFloorListing('water')
    buyFloorListing('mineral')

    const userWaters = assets.filter(a => a.owner == account?.id && a.type == "water")
    const userMinerals = assets.filter(a => a.owner == account?.id && a.type == "mineral")

    if (userWaters.reduce((sum, c) => sum + c.amount, 0) < 6 ||
        userMinerals.reduce((sum, c) => sum + c.amount, 0) < 1) {
        console.warn(`not enough balance to consume`)
        return
    }

    // mint a bankstone
    const mintActivity = createTransaction(
        "world",
        account?.id || '',
        1,
        'bankstone',
        `Minting of a bankstone for ${account?.id}`
    );

    const creditConsumption = consume(
        account?.id || '',
        "credits",
        100
    );

    const waterCost = Math.ceil(current.resources.water.supplied * Math.log(accounts.length * accounts.length) / current.resources.mineral.supplied);
    const waterConsumption = consume(
        account?.id || '',
        'water',
        waterCost
    );

    const mineralConsumption = consume(
        account?.id || '',
        "mineral",
        10
    );

    current.activities.pending.push(...[creditConsumption.id, mineralConsumption.id, waterConsumption.id, mintActivity.id]);
}

export function buyFloorListing(type: string): void {
    const txPrefix = type == 'water' ? 'WTR' : type == 'mineral' ? 'MNR' : 'BNK'

    const floorListings = market.filter(l => !l.times.sold && !l.times.expired && l.item.startsWith(txPrefix))
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? -1 : 1 })

    if (!floorListings || floorListings.length == 0) {
        //console.debug(`TX${activities.length}: listing not found, skipping`)
        return
    }

    const floorListing = floorListings[0]
    const creditTx = createTransaction(
        'worldbank',
        floorListing.owner,
        floorListing.price,
        "credit",
        `Purchase of ${floorListing.item} at ${floorListing.price} credit`
    );

    const itemTx = createTransaction(
        floorListing.owner,
        'worldbank',
        floorListing.amount,
        floorListing.item,
        `Sale of ${floorListing.item} at ${floorListing.price} credit`
    );

    current.activities.pending.push(creditTx.id)
    current.activities.pending.push(itemTx.id)
    floorListing.times.sold = current.time
}

export function processResources(): void {
    const waterRate = util.getRandomNumber(world.resources.water.rateLo, world.resources.water.rateHi) / 100 / world.interval.year / world.interval.day / world.interval.minute
    const mineralRate = util.getRandomNumber(world.resources.mineral.rateLo, world.resources.mineral.rateHi) / 100 / world.interval.year / world.interval.day / world.interval.minute

    const remainingWater = (world.resources.water.total - current.resources.water.supplied)
    const water = remainingWater * waterRate

    const remainingMineral = (world.resources.water.total - current.resources.water.supplied)
    const mineral = remainingMineral * mineralRate

    current.resources.water.balance += water
    current.resources.water.supplied += water

    current.resources.mineral.balance += mineral
    current.resources.mineral.supplied += mineral
}
