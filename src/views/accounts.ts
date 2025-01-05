import { accounts, current, market, assets } from '../service/model.js';
import { Account, Asset } from '../types.js';
import { ItemForm } from "../common/html.js";
import { exploreCost } from "../common/pricing.js";

export function ProfileView(account: Account, session: any): string {
    const items = assets.filter(a => a.owner == account.id && a.amount > 0)
        .sort((a, b) => { return a.properties?.staked && a.properties?.yield && b.properties?.staked && b.properties?.yield &&
            (a.properties.staked * a.properties.yield) > (b.properties.staked * b.properties.yield) ?
            1 : -1})
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1})

    const userActiveBankstones = items.filter((a) => a.type == "bankstone" && a.amount > 0)
    const activeEffectsTotal = current.effects.pending.length + current.effects.completed.length + current.effects.rejected.length

    const userWaters = assets.filter((a) => a.type == "water" && a.owner == account.id)
    const userWaterTotal = userWaters.reduce((sum, c) => { return sum + c.amount }, 0)

    const userMinerals = assets.filter((a) => a.type == "mineral" && a.owner == account.id)
    const userMineralTotal = userMinerals.reduce((sum, c) => { return sum + c.amount }, 0)
    
    return `
        <div class="card bg-base-200 m-2 sm:m-4 lg:mt-8">
            <div class="card-title m-auto pt-4 lg:pt-8">
                <div class="btn-circle avatar">
                    <div class="w-15 rounded-full">
                    <img alt="Profile photo of ${account.id}"
                        src="/images/profiles/${account.visual}" />
                    </div>
                </div>
                <h2 class="text-white-100 text-5xl">${account.id}</h2>
            </div>
            <div class="card-body">
                ${session.username && session.username == account.id ? `
                <form id="updateBioForm" class="mb-2">
                    <div class="form-control">
                        <textarea name="bio" row="3" class="textarea w-full" placeholder="Write description of this account.">${account.bio ? account.bio : ''}</textarea>
                    </div>
                    <div class="text-right">
                        <button id="updateBioBtn" class="btn btn-sm mt-1"
                            ${(session.username && account.credits.balance < 100) ? `disabled` : ``}>
                            Update Bio (-100.00 credit)
                        </button>
                    </div>
                </form>` : `
                <p class="py-4">${account.bio ? account.bio : `No description`}</p>`}

                <div style="text-align:right">
                    <h1 class="text-5xl" class="text-white-100">
                        <span id="profileBalance">${account.credits.balance.toFixed(2)}</span><small class="text-white-300">sl</small>
                    </h1>
                    <small>
                        holding ${(account.credits.balance / current.resources.credits.balance * 100).toFixed(2)}% of
                        ${current.resources.credits.balance.toFixed(2)} credits circulating..
                    </small>
                    <div style="text-align:right">
                        <small style="color:${"#00A0FF"}"><strong>water</strong></small> ${userWaterTotal}<small style="color:${"#BBB"}">/${current.resources.water.supplied.toFixed(0)}(${(userWaterTotal / current.resources.water.supplied * 100).toFixed(2)}%)</small>
                        <small style="color:${"#FF03EA"}"><strong>mineral</strong></small> ${userMineralTotal}<small style="color:${"#BBB"}">/${current.resources.mineral.supplied.toFixed(0)}(${(userMineralTotal / current.resources.mineral.supplied * 100).toFixed(2)}%)</small>
                        <small style="color:${"gray"}"><strong>bankstones</strong></small> ${userActiveBankstones.length}<small style="color:${"#BBB"}">/${activeEffectsTotal}(${(userActiveBankstones.length / activeEffectsTotal * 100).toFixed(2)}%)</small>
                    </div>
                </div>

                ${InventoryView(account, items, userMineralTotal, userWaterTotal, session.username != account.id)}

                ${session.username && session.username == account.id ? `
                    ${SendCreditView(account, session)}
                    ` : ``}
            </div>
        </div>
    `
}

export function SendCreditView(account: Account, session: any): string {
    return `
        <form id="sendCreditForm" class="text-right">
            <input type="hidden" name="from" value="${session.username}" />
            <div class="form-control">
                <label for="to" class="label text-xs">Account</label>
                <input name="to" placeholder="receiver's username" required class="input input-md m-1" />
            </div>
            <div class="form-control">
                <label for="amount" class="label text-xs">Amount</label>
                <input name="amount" type="number" min=".01" max="1000.00" value="0.01" step=".01" required class="input input-md m-1" />
            </div>
            <button id="sendBtn" ${(session.username && account.credits.balance < .01) ? `disabled` : ``} class="btn btn-primary btn-md m-1">Send</button>
        </form>
        <form id="postForm" class="text-right">
            <div class="form-control">
                <label for="title" class="label text-xs">Title</label>
                <input name="title" class="input" placeholder="Title is required to post" required />
            </div>
            <div class="form-control">
                <label for="channels" class="label text-xs">Channel</label>
                <input name="channels" class="input" placeholder="general, question, issue, ..." />
            </div>
            <div class="form-control">
                <label for="content" class="label text-xs">Content (optional)</label>
                <textarea class="textarea" name="content" rows="4" cols="60" placeholder="Each credit consumption on the post will be fully rewarded to content creator."></textarea>
            </div>
            <button id="postBtn" class="btn btn-secondary m-1" ${(session.username && account.credits.balance < 10) ? `disabled` : ``}>Post (-10.00 credit)</button>
        </form>
    `
}

export function InventoryView(account: Account, items: Asset[], userMineralTotal: number, userWaterTotal: number, readonly = true): string {
    const { creditCost, mineralCost, waterCost } = exploreCost(current.resources.water.balance, current.resources.mineral.balance);

    let inventoryHtml = `<div class="bg-base-100 p-2 sm:p-4 lg:p-8">
        <h3>Inventory (<a id="inventoryTotal" href="/assets?user=${account.id}" class="link link-hover">${items.filter(i => i.owner == account.id).length}</a>)</h3>
        <form id="mintBankForm" class="${readonly? 'hidden' : ''}">
            <div class="form-control">
                <input type="hidden" name="type" value="bankstone" />
                <label for="type" class="text-xs">
                    consumes <small id="waterCost">${waterCost}</small>
                    water + <small>${mineralCost}</small> mineral
                </label>
            </div>
            <button id="mintBankBtn" class="btn btn-xs"
                ${(userMineralTotal < mineralCost || userWaterTotal < waterCost ||
                    account.credits.balance < creditCost) ? "disabled" : ""}>
                Mint Bankstone (-${creditCost.toFixed(2)} credit)
            </button>
        </form>
        <ul id="inventory" class="text-xs grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-screen-md gap-1 justify-between">
        `
    if (items.length > 0) {
        items.slice(0, 100).forEach(i => {
            inventoryHtml += `<li>${ItemForm(i, readonly)}</li>`
        })
    } else inventoryHtml += `<li class="text-center">Empty. Collect resources or buy items from Marketplace</li>`
    inventoryHtml += `</ul></div>`
    return inventoryHtml
}

export function LeaderboardView(): string {
    const balanceLeaders = accounts.sort((a, b) => { return a.credits.balance > b.credits.balance ? -1 : 1 })
    let LeaderHtml = `<div class="p-2 sm:p-4 lg:p-8">
        <h1 id="leaderboard" class="text-bold text-2xl text-white mb-2">
            Leaderboard
        </h1>
        <div role="tablist" class="tabs bg-base-200 mb-2">
            <a role="tab" class="tab tab-active">Balance</a>
            <a role="tab" class="tab">Items</a>
            <a role="tab" class="tab">Yield</a>
        </div>
        <div role="tabpanel" class="tab-content grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-1 justify-between">
    `
    if (balanceLeaders.length > 0) {
        balanceLeaders.slice(0, 100).forEach((a, idx) => {
            LeaderHtml += `<div class="card bg-base-300 p-2">
                <div class="p-2 card-title ${idx < 3 ? 'text-white text-2xl': idx < 10 ? 'text-gray-200 text-xl' : 'text-lg'}">
                    <small>${idx + 1}.</small> <a href="/?user=${a.id}">${a.id}</a>
                </div>
                <div class="p-2 card-body">
                    <div class="btn-circle avatar m-auto">
                        <div class="w-15 rounded-full">
                        <img alt="Profile photo of ${a.id}"
                            src="https://upload.wikimedia.org/wikipedia/en/f/f8/Sauron_Tolkien_illustration.jpg" />
                        </div>
                    </div>
                    <div class="text-right text-xs">
                        <small class="text-sm">bal. ${a.credits.balance.toFixed(2)}sl</small>
                    </div>
                </div>
            </div>`
        })
    } else LeaderHtml += `<p class="p-4 text-center">Empty<p>`
    LeaderHtml += `</div></div>`
    return LeaderHtml
}