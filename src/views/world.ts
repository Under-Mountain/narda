import { activities, assets, world } from '../service/model.js'

export function TimeView(time: number): string {
    return `
        Year ${Math.floor(time / (world.interval.hour * world.interval.day * world.interval.year))}
        Day ${Math.floor(time / (world.interval.hour * world.interval.day))}
        <a>${Math.floor(time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${time % (world.interval.hour) < 10 ? '0' : ''}${time % (world.interval.hour)}</a>
    `
}

export function AssetsView(): string {
    const filtered = assets
        .sort((a, b) => { return a.properties && b.properties && a.properties.staked && b.properties.staked && a.properties.yield && b.properties.yield &&
            (a.properties.staked * a.properties.yield) > (b.properties.staked * b.properties.yield) ?
            1 : -1})
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1})
    
    let placesHtml = ``
    if (filtered.length > 0) {
        filtered.forEach((a, idx) => { placesHtml += `
        <tr>
            <th>${a.id}</th>
            <td>${a.type}</td>
            <td>${a.amount}</td>
            <td>${a.properties? `${(a.properties.yield * 100).toFixed(0)}% yield ${a.properties.staked.toFixed(0)}/${a.properties.cap}(${(a.properties.staked/a.properties.cap*100).toFixed(2)}%) remaining` : ``}</td>
            <td>${a.owner}</td></tr>
        `})
    } else placesHtml += `<tr><td class="text-center">Not found. Filter didn't return any result.</td></tr>`

    return `
    <div class="">
        <h1 id="leaderboard" class="text-bold text-2xl text-white mb-2">
            World Explorer (${filtered.length} assets)
        </h1>
        <div role="tablist" class="tabs tabs-bordered tabs-sm mb-2 justify-start">
            <a role="tab" class="tab tab-active">Balance</a>
            <a role="tab" class="tab">Items</a>
            <a role="tab" class="tab">Yield</a>
        </div>
        <div class="bg-base-100 overflow-x-auto">
            <table class="table table-xs">
                <thead>
                    <tr><th>ID</th><th>Type</th><th>Amount</th><th>Properties</th><th>Owner</th></tr>
                </thead>
                ${placesHtml}
            </table>
        </div>
    </div>
    `
}

export function ActivitiesView(): string {
    const filtered = activities.filter(a => true)
        .sort((a, b) => { return (a.times.completed && b.times.completed) && a.times.completed > b.times.completed ? -1 : 1 })
    
    let activitiesRow = ``
    if (filtered.length > 0) {
        filtered.forEach((a, idx) => { activitiesRow += `
        <tr>
            <th>${a.id}</th>
            <td>${a.amount}</td>
            <td>${a.of}</td>
            <td>${a.from}</td>
            <td>${a.to}</td>
            <td>${a.note}</td>
        </tr>
        `})
    } else activitiesRow += `<tr><td class="text-center">Not found. Filter didn't return any result.</td></tr>`

    return `
    <div class="">
        <h1 id="leaderboard" class="text-bold text-2xl text-white mb-2">
            World Explorer (${filtered.length} transactions)
        </h1>
        <div role="tablist" class="tabs tabs-bordered tabs-sm mb-2 justify-start">
            <a role="tab" class="tab tab-active">Balance</a>
            <a role="tab" class="tab">Items</a>
            <a role="tab" class="tab">Yield</a>
        </div>
        <div class="bg-base-100 overflow-x-auto">
            <table class="table table-xs">
                <thead>
                    <tr><th>Tx ID</th><th>Amount</th><th>Of</th><th>From</th><th>To</th><th>Note</th></tr>
                </thead>
                ${activitiesRow}
            </table>
        </div>
    </div>
    `
}