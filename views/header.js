import { accounts, activities, assets, world, market, current, posts } from '../service/model.js'

export function HeaderView(session, username) {
    const resources = {
        water: 0,
        mithril: 0
    }

    if (session.username) {
        const account = accounts.find(a => a.id == username)

        const userWaters = assets.filter((a) => a.type=="water" && a.owner == account.id)
        const userWaterTotal = userWaters.reduce((sum, c) => {return sum + c.amount}, 0)
    
        const userMinerals = assets.filter((a) => a.type=="mineral" && a.owner == account.id)
        const userMineralTotal = userMinerals.reduce((sum, c) => {return sum + c.amount}, 0)

        resources.water = userWaterTotal
        resources.mithril = userMineralTotal
    }

    const channels = []
    posts.forEach(p => {
        p.channels.forEach(t => {
            if (channels.indexOf(t) < 0) channels.push(t)
        })
    })

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=devide-width, initial-scale=1.0" />
        <link href="https://cdn.jsdelivr.net/npm/daisyui@2.6.0/dist/full.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Arda v.1 - Open World Metaverse in tribute to JRR Toklien</title>
    </head>
    <body class="content-center">
    <div class="text-center p-2"><small>
        <a href="https://under-mountain.github.com" target="_blank">
            📢 Interested in joining this open project?
        </a>
        <small class="pl-1">AD by <span>undermount</span></small>
    </small></div>
    <nav class="navbar bg-base-300 sticky top-0 z-50 class="">
        <div class="flex-1">
            <a href="/" class="btn btn-ghost btn-md p-1 no-animation">
                <svg class="p-1" width="2em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="gray" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"/><rect fill="lightgray" x="11" y="6" rx="1" width="2" height="7"><animateTransform attributeName="transform" type="rotate" dur="2160s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect><rect fill="lightgray" x="11" y="4" rx="1" width="2" height="9"><animateTransform attributeName="transform" type="rotate" dur="3s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect></svg>
                <div class="text-xs pl-1">
                    <div id="headerTime">
                        ${Math.floor(current.time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${current.time % (world.interval.hour) < 10 ? '0' : ''}${current.time % (world.interval.hour)}\
                        <small class="hidden md:inline">(${(current.time % (world.interval.hour) / world.interval.hour * 100).toFixed(0)}% to yield)</small>
                    </div>
                    <div id="headerDate">
                        <small class="hidden md:inline">
                            Year ${Math.floor(current.time / (world.interval.hour * world.interval.day * world.interval.year))}\
                            Day ${Math.floor(current.time / (world.interval.hour * world.interval.day))}\
                        <small class="hidden md:inline">(x${60000 / world.interval.minute})</small>
                        </small>
                    </div>
                </div>
            </a>
            <form id="collectWaterForm">
                <button class="btn btn-ghost btn-md p-1 no-animation"  name="resource" value="water"
                    ${!session.username || session.username == username && current.resources.water.balance <= 0 ? "disabled" : ""}>
                    <svg class="p-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="2em"><circle fill="#00A0FF" stroke="#00A0FF" stroke-width="30" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
                    <div class="text-base-content">
                        <div id="headerWater">${current.resources.water.balance.toFixed(0)}</div>
                        <small class="p-1 text-xs text-blue-400"><small>water</small></small>
                    </div>
                </button>
            </form>
            <form id="collectMineralForm">
                <button class="btn btn-ghost btn-md p-1 no-animation" name="resource" value="mineral"
                    ${!session.username || session.username == username && current.resources.mineral.balance <= 0 ? "disabled" : ""}>
                    <svg class="p-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="2em"><path stroke="white" stroke-width="30" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="3.5" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>
                    <div class="text-base-content">
                        <div id="headerMithril">${current.resources.mineral.balance.toFixed(0)}</div>
                        <small class="p-1 text-xs text-white"><small>mithril</small></small>
                    </div>
                </button>
            </form>
        </div>
        <div class="flex-none gap-1">
            ${session.username ? `
                <div class="">
                    <div class="text-xs text-blue-400 text-bold leading-3">
                        wtr <strong id="userWater">${resources.water}</strong><small>/<span class="hidden lg:inline">${current.resources.water.supplied.toFixed(0)}</span>(${(resources.water/current.resources.water.supplied*100).toFixed(2)}%)</small>
                    </div>
                    <div class="text-xs text-white text-bold leading-3">
                        mth <strong id="userMineral">${resources.mithril}</strong><small>/<span class="hidden lg:inline">${current.resources.mineral.supplied.toFixed(0)}</span>(${(resources.mithril/current.resources.mineral.supplied*100).toFixed(2)}%)</small>
                    </div>
                </div>
                <a href="/?user=${session.username}" class="btn btn-ghost btn-md p-1">
                    <div>
                        <div class="text-xs">${session.username}</div>
                        <div><span id="userBalance">${accounts.find(a=>a.id==session.username)?.credits.balance.toFixed(2)}</span><small class="lowercase">sl</small></div>
                    </div>
                </a>
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full">
                        <img alt="Profile photo of ${session.username}"
                            src="https://upload.wikimedia.org/wikipedia/en/f/f8/Sauron_Tolkien_illustration.jpg" />
                        </div>
                    </div>
                    <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li><a href="/api/exit">Exit</a></li>
                    </ul>
                </div>
                ` : `
                <a href="/#register"><small class="text-bold p-1">Get Invited</small></a>
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full">
                        <img alt="Profile photo of ${session.username}"
                            src="https://upload.wikimedia.org/wikipedia/en/f/f8/Sauron_Tolkien_illustration.jpg" />
                        </div>
                    </div>
                    <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li><a href="/posts">Getting started</a></li>
                    </ul>
                </div>
            `}
        </div>
    </nav>
    
    <main>
    <div class="bg-base-200 text-center text-xs overflow-x-auto">
        <ul class="menu menu-horizontal bg-base-200">
        <li>
            <a href="/posts">Posts(${posts.length})</a>
        </li>
        <li>
            <a href="/channels">Channels(${channels.length})</a>
        </li>
        <li>
            <a href="/leaderboard">Leaderboard(${accounts.length})</a>
        </li>
        <li>
            <a href="/marketplace">Marketplace(${market.length})</a>
        </li>
        <li>
            <a href="/explorer?type=item">Items(${assets.length})</a>
        </li>
        <li>
            <a href="/explorer?type=transaction">Transactions(${activities.length})</a>
        </li>
        </ul>
    </div>
    `
}