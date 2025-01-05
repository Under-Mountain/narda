import { Account, Asset } from "../types.js"

function Properties(properties: any): string {
    return properties?.yield && properties.staked && properties.cap ? `
        <small>
            APR ${(properties.yield * 100).toFixed(0)}% ${Math.floor(properties.staked)}/${properties.cap} (${(properties.staked / properties.cap * 100).toFixed(0)}%)
        </small>` : '';
}

function SellButton(i: any): string {
    const disabled = (i.type == "water" || i.type == "mineral") && i.amount < 100;
    return `
        <button class="btn btn-xs" ${disabled ? "disabled" : ""}>
            ${disabled ? "Sell (min.100)" : `Sell ${i.amount}`}
        </button>`;
}

function PriceInput(i: any): string {
    const value = i.type == "bankstone" && i.properties?.yield && i.properties.staked && i.properties.cap ?
        (i.properties.staked * i.properties.yield * .33).toFixed(2) :
        (i.amount * (i.type == 'water' ? .03 : .09)).toFixed(2);
    return `<input name="price" type="number" class="input input-xs w-20" value="${value}" max="1000" step=".01" />`;
}

export function ItemForm(i: any): string {
    const html = `
        <form class="itemForm p-2 bg-base-200">
            <div>
                ${i.amount} unit(s) of ${i.owner}'s ${i.type}
                <input name="id" type="hidden" value="${i.id}" class="input input-xs" />
            </div>
            <div>${Properties(i.properties)}</div>
            <div class="text-center">
                <img class="m-auto" src="${AssetImageUrl(i)}" />
            </div>
            <div class="mt-4 text-right">
                ${SellButton(i)}
                <input name="amount" type="hidden" value="${i.amount}" />
                <small for="id">${i.id}</small>
                for ${PriceInput(i)}
            </div>
        </form>`;
    
    return html;
}

export function ListingForm(l: any, i: any, session: any = null, username: string = '', account: Account = null): string {
    const html = `
        <form class="p-2 bg-base-200">
            <div>
                ${l.amount} unit of ${l.owner}'s ${i.type}
                <input name="id" type="hidden" value="${l.id}" />
            </div>
            <div>${Properties(i.properties)}</div>
            <div class="text-center">
                <img class="m-auto" src="${AssetImageUrl(i)}" />
            </div>
            <div class="text-right mt-4"><small>(${(l.price / l.amount).toFixed(2)}/unit)</small></div>
            <div class="text-right">
                ${session ? `
                <button name="buyer" value="${session?.username}" class="delistBuyBtn btn btn-xs"
                    ${!session || !session.username || (session.username != username && account && account.credits.balance < l.price) ? "disabled" : ""}>
                    ${session?.username && l.owner == username ? 'Delist' : 'Buy'}
                </button>` : ''}
                ${l.amount}
                <small for="id">${l.id}</small> for
                <input name="price" type="number" value="${l.price.toFixed(2)}" class="input input-xs w-20" readonly />
            </div>
        </form>`;
    
    return html;
}

function AssetImageUrl(item: Asset): string {
    let asset: string | undefined
    let place: string | undefined
    let tier: string | undefined

    switch (item.type) {
        case 'water':
            return `/images/resources/water.png`
            break
        case 'mineral':
            return `/images/resources/mineral.png`
        case 'bankstone':
            if (!item.properties || !item.properties.cap || !item.properties.yield) {
                console.error('Bankstone properties missing', item)
                break
            }

            asset = 'places'
            if (item.properties.cap > 6000) place = 'house'
            else if (item.properties.cap > 2000) place = 'settlement'
            else place = 'camp'

            if (item.properties.yield > .20) tier = 'h'
            else if (item.properties.yield > .10) tier = 'm'
            else tier = 'l'
            return `/images/${asset}/${place}/${tier}/${item.visual}`
        default:
            return `/images/logo.png`
    }
}