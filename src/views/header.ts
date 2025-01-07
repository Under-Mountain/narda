import { accounts, assets, posts, current, world, market, activities } from "../service/model.js"
import { WaterIcon, WaterCollectingIcon, MineralIcon, MineralCollectingIcon, ClockIcon, ExitIcon, QuestionIcon, PostIcon, PlaceIcon, TrophyIcon, ScaleIcon, BookIcon, RecordIcon, RadioIcon } from "../common/svg.js"
import { BroadcastLinks } from "../common/html.js"

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
    <html class="scroll-smooth">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=devide-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.23/dist/full.min.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Arda v.1 - Open World Metaverse in tribute to JRR Toklien</title>
    </head>
    <body class="content-center">
    <div class="relative sticky top-0 z-40">
        <nav class="navbar bg-black p-0 min-h-min shadow-lg">
            <div class="flex-1 p-0">
                <a href="/" class="btn btn-ghost btn-md p-1 no-animation">
                    ${ClockIcon}
                    <div class="text-xs hidden sm:inline">
                        <div id="headerTime" class="">
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
                    <button id="collectWaterBtn" class="gap-0 btn btn-ghost btn-md p-0.5 hover:animate-pulse"  name="resource" value="water"
                        ${!session.username || session.username == username && current.resources.water.balance <= 0 ? "disabled" : ""}>
                        ${WaterIcon}
                        ${WaterCollectingIcon}
                        <div class="text-base-content">
                            <div id="headerWater" class="text-blue-500 text-xs min-w-10">${current.resources.water.balance.toFixed(0)}</div>
                            <small class="p-0 text-xs text-blue-400">water</small>
                        </div>
                    </button>
                </form>
                <form id="collectMineralForm">
                    <button id="collectMineralBtn" class="gap-0 btn btn-ghost btn-md p-0.5 hover:animate-pulse" name="resource" value="mineral"
                        ${!session.username || session.username == username && current.resources.mineral.balance <= 0 ? "disabled" : ""}>
                        ${MineralIcon}
                        ${MineralCollectingIcon}
                        <div class="text-base-content">
                            <div id="headerMineral" class="text-yellow-500 text-xs min-w-10">${current.resources.mineral.balance.toFixed(0)}</div>
                            <small class="p-0 text-xs text-yellow-400">mineral</small>
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
                        <div class="text-xs text-yellow-400 text-bold leading-3">
                            mnr <strong id="userMineral">${resources.mineral}</strong><span class="hidden md:inline"><small>/${current.resources.mineral.supplied.toFixed(0)}(${(resources.mineral / current.resources.mineral.supplied * 100).toFixed(2)}%)</small></span>
                        </div>
                    </div>
                    <a href="/?user=${session.username}" class="btn btn-ghost btn-md p-1">
                        <div>
                            <div class="text-xs">${session.username}</div>
                            <div><span id="userBalance" class="text-white">${accounts.find(a => a.id == session.username)?.credits.balance.toFixed(2)}</span><small class="lowercase">sl</small></div>
                        </div>
                    </a>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar online">
                            <div class="w-9 rounded-full ring-base ring-offset-base-100 ring ring-offset-1">
                            <img alt="Profile photo of ${session.username}" src="/images/profiles/${account.visual}" />
                            </div>
                        </div>
                        <ul tabindex="0" class="menu menu-sm dropdown-content bg-black rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li><a href="/posts" class="hover:text-secondary">${QuestionIcon} Getting started</a></li>
                            <li><a href="/api/exit" class="hover:text-warning">${ExitIcon} Exit</a></li>
                        </ul>
                    </div>
                    ` : `
                    <a href="/#register"><small class="text-bold hover:text-yellow-500">Arda v.1</small></a>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                            <div class="w-9 rounded-full">
                            <img alt="Profile photo of ${session.username}" src="/images/logo.webp" />
                            </div>
                        </div>
                        <ul tabindex="0" class="menu menu-sm dropdown-content bg-black rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li><a href="/posts" class="hover:text-secondary">${QuestionIcon} Getting started</a></li>
                        </ul>
                    </div>
                `}
            </div>
        </nav>
        <div class="text-xs text-gray-400 bg-base-300">
            <div class="flex justify-start gap-1 p-2 opacity-50 hover:opacity-60">
                <button id="radioBtn" class="btn btn-ghost btn-xs min-w-min p-0">
                    ${RadioIcon}
                </button>
                <div id="connection" class="mt-1 ml-1 animate-pulse text-warning hidden">
                    loading broadcasts from ${posts.length} streams..
                </div>
                <div id="broadcast" class="mt-1 ml-1 flex justify-start gap-5 truncate">
                    ${BroadcastLinks(
                        posts.filter(p => p.channels.indexOf('broadcast') >= 0)
                        .sort((a, b) => a.times.created < b.times.created ? -1:1)
                        .slice(0, 20)
                        .sort((a, b) => a.times.created < b.times.created ? 1:-1))}
                </div>
            </div>
        </div>
        <div class="flex justify-between text-xs absolute top-0 left-0 right-0 z-50">
            <div class="flex-none w-44 text-right md:w-56">
                <small id="topLeftStatus" class="hidden" text-bold"></small>
            </div>
            <div class="flex-auto"></div>
            <div class="flex-none w-40">
                <small id="topRightStatus" class="hidden text-bold"></small>
            </div>
        </div>
        <div class="max-w-screen bg-base-200 overflow-x-auto text-center text-gray-200 shadow-lg">
            <ul class="menu-horizontal text-xs gap-4 p-1.5">
                <li class="min-w-fit"><a href="/posts" class="hover:text-primary">
                    ${PostIcon} Posts
                    <small>(${posts.length})</small>
                </a></li>
                <li class="min-w-fit"><a href="/channels" class="hover:text-secondary">
                    ${PlaceIcon} Places
                    <small>(${channels.length})</small>
                </a></li>
                <li class="min-w-fit"><a href="/leaderboard" class="hover:text-yellow-500">
                    ${TrophyIcon} Leaderboard
                    <small>(${accounts.length})</small>
                </a></li>
                <li class="min-w-fit"><a href="/marketplace" class="hover:text-accent">
                    ${ScaleIcon} Marketplace
                    <small>(${market.length})</small>
                </a></li>
                <li class="min-w-fit"><a href="/world?type=item" class="hover:text-info">
                    ${BookIcon} Items
                    <small>(${assets.length})</small>
                </a></li>
                <li class="min-w-fit"><a href="/world?type=transaction" class="hover:text-info">
                    ${RecordIcon} Transactions
                    <small>(${activities.length})</small>
                </a></li>
            </ul>
        </div>
    </div>
    <main class="bg-neutral p-2 sm:p-4 lg:px-8 xl:px-12">
    `
}