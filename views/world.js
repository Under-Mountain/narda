import { activities, assets, world } from '../service/model.js'

export function TimeView(time) {
    return `
        Year ${Math.floor(time / (world.interval.hour * world.interval.day * world.interval.year))}
        Day ${Math.floor(time / (world.interval.hour * world.interval.day))}
        <a>${Math.floor(time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${time % (world.interval.hour) < 10 ? '0' : ''}${time % (world.interval.hour)}</a>
    `
}

export function AssetsView() {
    const filtered = assets
        .sort((a, b) => { return a.properties && b.properties &&
            (a.properties.staked * a.properties.yield) > (b.properties.staked * b.properties.yield) ?
            1 : -1})
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1})
    
    let assetsHtml = `<p style="text-align:center">Empty<p>`
    if (filtered.length > 0) {
        assetsHtml = `<ul style="font-weight:normal;padding:.3em">`
        filtered.slice(0, 1000).forEach((a, idx) => {
            assetsHtml += `<oi><div><small>
                    ${a.id}: <strong>${a.amount}</strong> units of
                    <strong>${a.type}</strong>
                    owned by <strong>${a.owner}</strong>
                </small></div></oi>`
        })
        assetsHtml += "</ul>"
    }
    return assetsHtml
}

export function ActivitiesView() {
    const filtered = activities.filter(a => true)
        .sort((a, b) => { return a.times.completed > b.times.completed ? -1 : 1 })
    
    let entriesHtml = `<div class="p-2 sm:p-4 lg:p-8">`
    if (filtered.length > 0) {
        entriesHtml += `<ul style="font-weight:normal;padding:.3em">`
        filtered.slice(0, 1000).forEach((t, idx) => {
            entriesHtml += `<oi><div><small>
                    ${t.id}: Transaction of
                    <strong>${t.amount.toFixed(2)}</strong>
                    <strong>${t.of}</strong>
                    from <strong>${t.from}</strong>
                    to <strong>${t.to}</strong>
                    on ${TimeView(t.times.completed)}
                    <strong>note:</strong> ${t.note}
                </small></div></oi>`
        })
        entriesHtml += "</ul>"
    } else entriesHtml += `<p style="text-align:center">Empty<p>`
    entriesHtml += "</div>"

    return entriesHtml
}