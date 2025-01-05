import { Account } from "../types.js";
import { createTransaction, consume } from "./activity.js";
import { activities, accounts, world, assets, current, market } from "./model.js";
import { exploreCost } from "../common/pricing.js";

export function queueBankActivities(): void {
    console.log(`TX${activities.length}: processing banking activities...`);
    let worldBank = accounts.find(a => a.id == 'world') as Account
    if (!worldBank) {
        worldBank = {
            id: 'world',
            credits: {
                balance: 0
            },
            times: {
                created: current.time
            },
            visual: 'world.png'
        }

        accounts.push(worldBank)
    }

    const { creditCost, mineralCost, waterCost } = exploreCost(current.resources.water.balance, current.resources.mineral.balance);

    if (worldBank && worldBank.credits.balance - creditCost < -1 * world.bank.maxDeficit) {
        console.warn(`TX${activities.length}: world's max deficit reached`);
        return
    }

    buyFloorListing('water')
    buyFloorListing('mineral')
    buyFloorListing('bankstone')

    const userWaters = assets.filter(a => a.owner == worldBank.id && a.type == "water")
    const userMinerals = assets.filter(a => a.owner == worldBank.id && a.type == "mineral")

    if (userWaters.reduce((sum, c) => sum + c.amount, 0) < waterCost ||
        userMinerals.reduce((sum, c) => sum + c.amount, 0) < mineralCost) {
        console.warn(`not enough balance to consume`)
        return
    }

    const creditConsumption = consume(worldBank.id, "credits", creditCost);
    const waterConsumption = consume(worldBank.id, 'water', waterCost);
    const mineralConsumption = consume(worldBank.id, "mineral", mineralCost);

    // mint a bankstone
    const mintActivity = createTransaction(
        worldBank.id,
        worldBank.id,
        1,
        'bankstone',
        `Minting of a bankstone for ${worldBank.id}`
    );
}

export function buyFloorListing(type: string): void {
    const itemPrefix = type == 'water' ? 'WTR' : type == 'mineral' ? 'MNR' : 'BNK'

    const medianPrice = getMedianPrice(itemPrefix);

    const floorListings = market.filter(l => !l.times.sold && !l.times.expired && l.item.startsWith(itemPrefix))
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? -1 : 1 });

    if (!floorListings || floorListings.length == 0) {
        //console.debug(`TX${activities.length}: listing not found, skipping`)
        return
    }

    const floorListing = floorListings[0];
    if (floorListing.price/floorListing.amount > medianPrice) {
        console.warn(`TX${activities.length}: listing price exceeds median sold price, skipping`);
        return;
    }

    const creditTx = createTransaction(
        'world',
        floorListing.owner,
        floorListing.price,
        "credit",
        `Purchase of ${floorListing.item} at ${floorListing.price} credit`
    );

    const itemTx = createTransaction(
        floorListing.owner,
        'world',
        floorListing.amount,
        floorListing.item,
        `Sale of ${floorListing.item} at ${floorListing.price} credit`
    );

    floorListing.times.sold = current.time
}

function getMedianPrice(txPrefix: string) {
    const soldListings = market.filter(l => l.times.sold && l.item.startsWith(txPrefix))
        .sort((a, b) => (a.price / a.amount) - (b.price / b.amount));

    const medianPrice = soldListings.length > 0 ?
        soldListings[Math.floor(soldListings.length / 2)].price / soldListings[Math.floor(soldListings.length / 2)].amount : Infinity;

    return medianPrice;
}
