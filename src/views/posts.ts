import { accounts, posts } from "../service/model.js"
import { Post, Account } from "../types.js"
import { TimeView } from "./world.js"

export function PostsView(channel?: string): string {
    const filteredPosts = posts.filter(p => !channel ? true : p.channels.indexOf(channel) >= 0).sort((a, b) => { return a.times.created > b.times.created ? -1 : 1 })
    let postsHtml = `<div class="px-2 sm:px-4 lg:px-8">
        <h1 id="posts" class="text-bold text-2xl text-white mb-2">
            ${channel ? channel : `All Posts`}
        </h1>
        <div role="tablist" class="tabs tabs-bordered tabs-sm mb-2 justify-start">
            <a role="tab" class="tab tab-active">News</a>
            <a role="tab" class="tab">Docs</a>
            <a role="tab" class="tab">Jobs</a>
            <a role="tab" class="tab">ADs</a>
        </div>
        <div role="tabpanel" class="tab-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 justify-between">
    `
    if (filteredPosts.length > 0) {
        filteredPosts.slice(0, 100).forEach((p, idx) => {
            postsHtml += `<div class="card bg-base-300 p-4">
                <div class="text-xs">
                    <svg class="size-3 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                        <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd" />
                        </svg>${TimeView(p.times.created)} by <strong>${p.author}</strong>
                </div>
                <div class="p-2 card-title ${p.content.length < 100 ? 'text-2xl': 'text-lg'}">
                    <a href="/post?id=${p.id}" class="link-hover">${p.title}</a>
                </div>
                <div class="p-2 card-body">
                    ${p.channels ? `<div class="badge badge-xs p-1">${p.channels.map(t => {
                        return `<a href="/posts?channel=${t}">#${t}</a>`
                    }).join(", ")}</div> ` : ''}
                    <p class="text-xs text-ellipsis">${p.content}</p>
                    <div class="inline text-right">
                        <small>${p.likes} likes</small>
                        <small>${p.dislikes} dislikes</small>
                        <small>${p.comments.length} comments</small>
                    </div>
                </div>
            </div>`
        })
    } else postsHtml += `<p class="p-4 text-center">Empty<p>`
    postsHtml += `</div></div>`
    return postsHtml
}

export function PostView(post: Post, session: any): string {
    const account = accounts.find(a => a.id == session.username)

    return `${post ? `
        <div class="card bg-base-200 m-2 p-2 sm:m-4 p-4 lg:m-8 p-8">
            <h1 class="card-title text-white-300 text-xl">${post.title}</h1>
            <div class="card-body p-0 my-1">
                <small>
                    ${post.channels ? `channels: <span style="color:gray">${post.channels.map(t => {
                        return `<a href="/posts?channel=${t}">#${t}</a>`}).join(", ")}</span>` : ''}
                        posted on ${TimeView(post.times.created)} by ${post.author}
                </small>
                <p>${post.content}</p>
                <div class="mt-3"><small>
                    <form id="postLikeForm">
                        <input type="hidden" name="postId" value="${post.id}" />
                        <button class="btn btn-success btn-sm"
                            ${!session.username || (account && account.credits.balance < 1) ? `disabled` :``}>
                            ${post.likes} Like (-1.00 credit)</button>
                    </form>
                    <form id="postDislikeForm">
                        <input type="hidden" name="postId" value="${post.id}" />
                        <button class="btn btn-warning btn-sm" ${!session.username || (account && account.credits.balance < 1) ? `disabled` :``}>
                            ${post.dislikes} Dislike (-1.00 credit)</button>
                    </form>
                </small></div>
                <div class="mt-2">
                    <form action="/api/comment?return=/post?id=${post.id}" method="post" style="text-align:right">
                        <textarea class="textarea textarea-md" name="comment" rows="2" cols="60" placeholder="Leave your comment"></textarea>
                        <div>
                            <button name="postId" value="${post.id}" class="btn btn-primary btn-sm"
                                ${!session.username || (account && account.credits.balance < 5) ? `disabled` :``}>Comment (-5.00 credit)</button></div>
                    </form>
                    <h3 class="mb-2"><small>${post.comments.length}</small> comments</h3>
                    ${CommentsView(post)}
                </div>
            </div>
        </div>
        ` : `<h3>Post ${post} not found</h3>`}`
}

export function ChannelsView(): string {
    let channelsHtml = `<div class="px-2 sm:px-4 lg:px-8">
    <h1 id="leaderboard" class="text-bold text-2xl text-white mb-2">
        Channels
    </h1>
    <div role="tablist" class="tabs tabs-bordered tabs-sm mb-2 justify-start">
        <a role="tab" class="tab tab-active">Balance</a>
        <a role="tab" class="tab">Items</a>
        <a role="tab" class="tab">Yield</a>
    </div>
    <div role="tabpanel" class="tab-content">
        ${channelsView()}
    </div>
    </div>
    `

    return channelsHtml
}

export function channelsView(): string {
    const allchannels: string[] = []
    posts.forEach(p => {
        p.channels.forEach(t => {
            if (allchannels.indexOf(t) < 0) allchannels.push(t)
        })
    })

    let channelsHtml = ``
    if (allchannels.length > 0) {
        allchannels.slice(0, 100).forEach((channel, idx) => {
            channelsHtml += `<div class="badge p-4 m-2"><a href="/posts?channel=${channel}">#${channel}</a></div>`
        })
    } else { `<p>Empty</p>`} 
    return channelsHtml
}

export function CommentsView(post: Post): string {
    let commentsHtml = `<p style="text-align:center">No comments left yet</p>`
    if (post.comments.length > 0) {
        commentsHtml = `<ul>`
        post.comments.forEach(c => {
            commentsHtml += `<li>
            <p>${c.comment}</p>
            <small>left by ${c.author} on ${TimeView(c.time)}</small></li>
            `
        })
        commentsHtml += "</ul>"
    }

    return commentsHtml
}