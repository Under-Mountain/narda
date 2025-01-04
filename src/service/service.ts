import * as util from '../common/utility.js'
import * as model from './model.js'
import { accounts, activities, assets, world, market, current } from './model.js'
import { Activity } from '../types.js'
import { createTransaction, consume } from './activity.js'
import { processPendingCollect, processPendingMint, processPendingTransaction, processPendingConsume, processPendingSystemActivity, queueWorldbankActivities, buyFloorListing, processResources } from './process.js'

let inProgress = false
export async function onMinuteAsync(): Promise<void> {
    if (inProgress) {
        console.warn(`T${current.time}: data sync still in progress, skipping`)
        return
    }

    // console.debug(`T${current.time}: active accounts: ${current.accounts.length}/${accounts.length} transactions: ${activities.length}/${activities.length}`)
    inProgress = true
    const startTime = new Date().getTime()
    const totalEffectCount = current.effects.pending.length + current.effects.completed.length + current.effects.rejected.length
    const effectBatchSize = Math.ceil((totalEffectCount) / world.interval.day)

    if (current.time % world.interval.hour == 0) {
        await onHourAsync(effectBatchSize)

        if (current.time % (world.interval.hour * world.interval.day) == 0) {
            await onDayAsync()
        }
    }

    processResources()
    processCurrentActivities()

    const writeStart = new Date().getTime()
    if (current.activities.completed.length >= effectBatchSize * 2) {
        console.log(`processing batch store of ${current.activities.completed.length}/${effectBatchSize * 2} activities..`)

        await model.updateAllAsync()
        current.activities.completed.length = 0
    }

    await model.updateCurrentAsync()
    const writeEnd = new Date().getTime()
    const elapsed = new Date().getTime() - startTime

    console.log(`T${current.time}: sync completed in ${elapsed}ms data write ${writeEnd - writeStart}ms`)

    current.time += 1
    inProgress = false
}

async function onDayAsync(): Promise<void> {
    const effectItems = assets.filter(a => a.type == "bankstone" && a.amount > 0)
    effectItems.forEach(i => {
        if (current.effects.pending.findIndex(e => e == i.id) < 0) current.effects.pending.push(i.id)
    })

    current.effects.completed = []
    current.effects.rejected = []
}

async function onHourAsync(effectBatchSize: number): Promise<void> {
    console.debug(`T${current.time}: processing ${effectBatchSize}/${current.effects.pending.length}/${current.effects.completed.length} effects...`)
    current.effects.pending.slice(0, effectBatchSize).forEach(id => {
        const b = assets.find(a => a.id == id && a.amount > 0)
        if (!b) {
            console.warn(`invalid bankstone id ${id}`);
            return;
        }

        const dailyYield = b.properties?.yield ? b.properties.yield / world.interval.year : 0
        const tx = createTransaction(
            b.id,
            b.owner,
            dailyYield * (b.properties?.staked ? b.properties.staked : 0),
            "credit",
            `${id}: yield for day ${Math.floor(current.time % (world.interval.year / world.interval.day))}`
        );

        current.effects.completed.push(id)
        current.effects.pending = current.effects.pending.filter(e => e != id)
    });

    queueWorldbankActivities()
}

function processCurrentActivities(): void {
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