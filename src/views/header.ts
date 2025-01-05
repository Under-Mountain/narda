import { accounts, assets, posts, current, world, market, activities } from "../service/model.js"

export function HeaderView(session: any, username: string): string {
    const resources = {
        water: 0,
        mineral: 0
    }

    let account
    if (session.username) {
        account = accounts.find(a => a.id == username)

        if (account) {
            const userWaters = assets.filter((a) => a.type == "water" && a.owner == account.id)
            const userWaterTotal = userWaters.reduce((sum, c) => { return sum + c.amount }, 0)

            const userMinerals = assets.filter((a) => a.type == "mineral" && a.owner == account.id)
            const userMineralTotal = userMinerals.reduce((sum, c) => { return sum + c.amount }, 0)

            resources.water = userWaterTotal
            resources.mineral = userMineralTotal
        }
    }

    const channels: string[] = []
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
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link href="https://cdn.jsdelivr.net/npm/daisyui@2.6.0/dist/full.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Arda v.1 - Open World Metaverse in tribute to JRR Toklien</title>
    </head>
    <body class="content-center">
    <div id="statusMain" class="p-0.5 text-xs text-white bg-black text-center">
        <a href="https://under-mountain.github.com" target="_blank">
            📢 Sponsored messages starting from 100.00sl/day
        </a>
    </div>
    <div class="relative sticky top-0 z-40">
        <nav class="navbar bg-base-300 p-0 min-h-min">
            <div class="flex-1 p-0">
                <a href="/" class="btn btn-ghost btn-md p-1 no-animation">
                    <svg class="p-1" width="2em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="gray" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"/><rect fill="lightgray" x="11" y="6" rx="1" width="2" height="7"><animateTransform attributeName="transform" type="rotate" dur="2160s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect><rect fill="lightgray" x="11" y="4" rx="1" width="2" height="9"><animateTransform attributeName="transform" type="rotate" dur="3s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect></svg>
                    <div class="text-xs pl-1 hidden sm:inline">
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
                    <button id="collectWaterBtn" class="btn btn-ghost btn-md p-1 hover:animate-pulse"  name="resource" value="water"
                        ${!session.username || session.username == username && current.resources.water.balance <= 0 ? "disabled" : ""}>
                        <svg id="collectWaterIcon" class="p-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="2em"><circle fill="#00A0FF" stroke="#00A0FF" stroke-width="30" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
                        <svg id="collectingWaterIcon" width="2em" class="hidden p-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_mHwL{animation:spinner_OeFQ 1.5s cubic-bezier(0.56,.52,.17,.98) infinite}.spinner_ote2{animation:spinner_ZEPt 1.5s cubic-bezier(0.56,.52,.17,.98) infinite}@keyframes spinner_OeFQ{0%{cx:4px;r:3px}50%{cx:9px;r:8px}}@keyframes spinner_ZEPt{0%{cx:15px;r:8px}50%{cx:20px;r:3px}}</style><defs><filter id="spinner-gF00"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="y"/><feColorMatrix in="y" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="z"/><feBlend in="SourceGraphic" in2="z"/></filter></defs><g filter="url(#spinner-gF00)"><circle class="spinner_mHwL fill-blue-600" cx="4" cy="12" r="3"/><circle class="spinner_ote2 fill-blue-400" cx="15" cy="12" r="8"/></g></svg>
                        <div class="text-base-content">
                            <div id="headerWater" class="min-w-12">${current.resources.water.balance.toFixed(0)}</div>
                            <small class="p-1 text-xs text-blue-400"><small>water</small></small>
                        </div>
                    </button>
                </form>
                <form id="collectMineralForm">
                    <button id="collectMineralBtn" class="btn btn-ghost btn-md p-1 hover:animate-pulse" name="resource" value="mineral"
                        ${!session.username || session.username == username && current.resources.mineral.balance <= 0 ? "disabled" : ""}>
                        <svg id="collectMineralIcon" class="p-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="2em"><path stroke="white" stroke-width="30" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="3.5" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>
                        <svg id="collectingMineralIcon" width="2em" class="hidden p-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA 1.5s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect class="fill-white"x="11" y="1" width="2" height="5" opacity=".14"/><rect class="fill-white"x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect class="fill-white"x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity=".43"/><rect class="fill-white"x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".57"/><rect class="fill-white"x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect class="fill-white"x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>
                        <div class="text-base-content">
                            <div id="headerMineral" class="min-w-12">${current.resources.mineral.balance.toFixed(0)}</div>
                            <small class="p-1 text-xs text-white"><small>mineral</small></small>
                        </div>
                    </button>
                </form>
            </div>
            <div class="flex-none gap-1">
                ${session.username ? `
                    <div class="">
                        <div class="text-xs text-blue-400 text-bold leading-3">
                            wtr <strong id="userWater">${resources.water}</strong><span class="hidden md:inline"><small>/${current.resources.water.supplied.toFixed(0)}(${(resources.water / current.resources.water.supplied * 100).toFixed(2)}%)</small></span>
                        </div>
                        <div class="text-xs text-white text-bold leading-3">
                            mth <strong id="userMineral">${resources.mineral}</strong><span class="hidden md:inline"><small>/${current.resources.mineral.supplied.toFixed(0)}(${(resources.mineral / current.resources.mineral.supplied * 100).toFixed(2)}%)</small></span>
                        </div>
                    </div>
                    <a href="/?user=${session.username}" class="btn btn-ghost btn-md p-1">
                        <div>
                            <div class="text-xs">${session.username}</div>
                            <div><span id="userBalance">${accounts.find(a => a.id == session.username)?.credits.balance.toFixed(2)}</span><small class="lowercase">sl</small></div>
                        </div>
                    </a>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                            <div class="w-10 rounded-full">
                            <img alt="Profile photo of ${session.username}"
                                src="/images/profiles/${account.visual}" />
                            </div>
                        </div>
                        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li><a href="/api/exit">Exit</a></li>
                        </ul>
                    </div>
                    ` : `
                    <a href="/#register"><small class="text-bold p-1">Arda v.1</small></a>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                            <div class="w-10 rounded-full">
                            <img alt="Profile photo of ${session.username}"
                                src="/images/logo.png" />
                            </div>
                        </div>
                        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li><a href="/posts">Getting started</a></li>
                        </ul>
                    </div>
                `}
            </div>
        </nav>
        <div class="flex justify-between text-xs absolute top-0 left-0 right-0 z-50">
            <div class="flex-none w-44 text-right md:w-64">
                <small id="topLeftStatus" class="hidden" text-bold"></small>
            </div>
            <div class="flex-auto"></div>
            <div class="flex-none w-40">
                <small id="topRightStatus" class="hidden text-bold"></small>
            </div>
        </div>
    </div>
    
    <main class="">
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