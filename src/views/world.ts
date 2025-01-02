import { activities, assets, world } from '../service/model.js'
import { getRandomNumber } from '../service/utility.js'
import * as fs from 'fs'
import { Asset, Activity } from '../types.js'

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
    
    let assetsHtml = `<p style="text-align:center">Empty<p>`
    if (filtered.length > 0) {
        assetsHtml = `<ul style="font-weight:normal;padding:.3em">`
        filtered.slice(0, 100000).forEach((a, idx) => {
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

export function ActivitiesView(): string {
    const filtered = activities.filter(a => true)
        .sort((a, b) => { return (a.times.completed && b.times.completed) && a.times.completed > b.times.completed ? -1 : 1 })
    
    let entriesHtml = `<div class="p-2 sm:p-4 lg:p-8">`
    if (filtered.length > 0) {
        entriesHtml += `<ul style="font-weight:normal;padding:.3em">`
        filtered.slice(0, 100000).forEach((t, idx) => {
            entriesHtml += `<oi><div><small>
                    ${t.id}: Transaction of
                    <strong>${t.amount.toFixed(2)}</strong>
                    <strong>${t.of}</strong>
                    from <strong>${t.from}</strong>
                    to <strong>${t.to}</strong>
                    on ${TimeView(t.times.completed as number)}
                    <strong>note:</strong> ${t.note}
                </small></div></oi>`
        })
        entriesHtml += "</ul>"
    } else entriesHtml += `<p style="text-align:center">Empty<p>`
    entriesHtml += "</div>"

    return entriesHtml
}

export function AssetImageUrl(item: Asset): string {
    if (!item.properties || !item.properties.cap || !item.properties.yield) return ``

    let asset: string | undefined
    let place: string | undefined
    let tier: string | undefined

    switch (item.type) {
        case 'water':
            break
        case 'mineral':
            break
        case 'bankstone':
            asset = 'places'
            if (item.properties.cap > 6000) place = 'house'
            else if (item.properties.cap > 2000) place = 'settlement'
            else place = 'camp'

            if (item.properties.yield > .20) tier = 'h'
            else if (item.properties.yield > .10) tier = 'm'
            else tier = 'l'
            break
        default:
            break
    }

    if (asset && place) {
        if (!item.visual) {
            const dir = `./public/images/${asset}/${place}/${tier}`
            fs.readdir(dir, (err, files) => {
                if (err) {
                    console.error('Error reading directory:', err)
                    return;
                }
            
                const number = getRandomNumber(0, files.length-1)
                item['visual'] = number
                
            })
        }

        return `/images/${asset}/${place}/${tier}/${item.visual}.png`
    }

    return `/images/places/camp/l/0.png`
}