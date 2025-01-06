import { Post } from "../interfaces/Post";
import { Connection } from "./app.js";

export default function broadcast(posts: Post[]) {
    //console.debug(`Broadcasting ${posts.length} posts`);
    const connectionLink = document.getElementById('connectionLink');
    const connection = document.getElementById('connection');
    const broadcastElement = document.getElementById('broadcast');

    if (!connectionLink || !posts || !connection || !broadcastElement) {
        console.warn('standing by...');
        return;
    }

    if (broadcastElement.classList.contains('animate-pulse')) {
        broadcastElement.classList.remove('hidden');
        broadcastElement.classList.remove('animate-pulse');
        connection.classList.add('hidden');
        connectionLink.classList.replace('text-accent', 'text-gray-100');
    } else if (posts[0].id != Connection.lastCast) {
        broadcastElement.classList.add('hidden');
        broadcastElement.classList.add('animate-pulse');
        connection.classList.remove('hidden');
        connectionLink.classList.replace('text-gray-100', 'text-accent');
    }

    Connection.lastCast = posts[0].id;
    broadcastElement.innerHTML = '';
    posts.forEach((post, idx) => {
        const postElement = `
        <a href="#" onclick="document.getElementById('contentModal').showModal()" class="${`
            text-gray-${idx < 9/3 ? idx*3+1 : 9}00 xs:text-gray-${idx < 9/2 ? idx*2+1 : 9}00 md:text-gray-${idx < 9 ? Math.floor(idx)+1 : 9}00 xl:text-gray-${idx/1.5 < 9 ? Math.floor(idx/1.5)+1 : 9}00
            `} hover:text-accent">
            ${post.title} <small>(${post.id} at T${post.times.created} by ${post.author})</small>
        </a>`;
        broadcastElement.innerHTML += postElement;
    });
}