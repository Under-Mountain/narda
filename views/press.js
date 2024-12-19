import { blog } from '../service/model.js'
import { TimeView } from './world.js'

export function PostsView(tag) {
    const posts = blog.filter(p => !tag ? true : p.tags.indexOf(tag) >= 0).sort((a, b) => { return a.times.created > b.times.created ? -1 : 1 })
    let blogHtml = ``
    if (blog.length > 0) {
        blogHtml = `<ul style="padding:.3em">`
        posts.slice(0, 100).forEach((p, idx) => {
            blogHtml += `<oi><div>
                    <h3 style="margin-bottom:.1em">
                        <a href="/blog/post?id=${p.id}">${p.title}</a>
                    </h3>
                    <small>${p.tags ? `Tags: <span style="color:gray">${p.tags.map(t => {
                            return `<a href="/blog?tag=${t}">#${t}</a>`
                        }).join(", ")}</span> ` : ''}posted on ${TimeView(p.times.created)} by ${p.author}</small>
                    <p>${p.content}</p>
                    <small>${p.likes} likes</small>
                    <small>${p.dislikes} dislikes</small>
                    <small>${p.comments.length} comments</small>
                </div></oi>`
        })
        blogHtml += "</ul>"
    } else { `<p>Empty</p>`} 
    return blogHtml
}

export function PostView(post) {
    return `${post? `
        <h1>${post.title}</h1>
        <small>
            ${post.tags ? `Tags: <span style="color:gray">${post.tags.map(t => {
                return `<a href="/blog?tag=${t}">#${t}</a>`}).join(", ")}</span>` : ''}
                posted on ${getTimeHtml(post.times.created)} by ${post.author}
        </small>
        <p>${post.content}</p>
        <div><small>
            <form action="/like?return=/blog/post?id=${post.id}" method="post">
                <input type="hidden" name="postId" value="${post.id}" />
                <button ${!session.username || (session.username && account.credits.balance < 1) ? `disabled` :``}>
                    ${post.likes} Like (-1.00 credit)</button>
                <button name="dislike" value="true" ${!session.username || (session.username && account.credits.balance < 1) ? `disabled` :``}>
                    ${post.dislikes} Dislike (-1.00 credit)</button>
            </form>
        </small></div>
        <div>
            <form action="/comment?return=/blog/post?id=${post.id}" method="post" style="text-align:right">
                <textarea style="margin-bottom:.3em" name="comment" rows="4" cols="60" placeholder="Leave your comment"></textarea>
                <div>
                    <button name="postId" value="${post.id}"
                        ${!session.username || (session.username && account.credits.balance < 5) ? `disabled` :``}>Comment (-5.00 credit)</button></div>
            </form>
            <h3 style="text-align:right"><small>${post.comments.length}</small> comments</h3>
            ${commentsHtml}
        </div>` : `<h3>Post id ${id} not found</h3>`}`
}

export function TagsView(tag) {
    const allTags = []
    blog.forEach(p => {
        p.tags.forEach(t => {
            if (allTags.indexOf(t) < 0) allTags.push(t)
        })
    })

    let tagsHtml = ``
    if (allTags.length > 0) {
        tagsHtml = `<div>`
        allTags.slice(0, 1000).forEach((tag, idx) => {
            tagsHtml += `<span style="padding:.1em;background-color:#EEE"><a href="/blog?tag=${tag}">#${tag}</a></span>`
        })
        tagsHtml += "</div>"
    } else { `<p>Empty</p>`} 
    return tagsHtml
}

export function CommentsView() {
    let commentsView = `<p style="text-align:center">No comments left yet</p>`
    if (post.comments.length > 0) {
        commentsHtml = `<ul>`
        post.comments.forEach(c => {
            commentsHtml += `<li>
            <p>${c.comment}</p>
            <small>left by ${c.author} on ${getTimeHtml(c.time)}</small></li>
            `
        })
        commentsHtml += "</ul>"
    }

    return commentsView
}