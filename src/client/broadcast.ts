import { BroadcastLinks } from "../common/html.js";
import { Post } from "../interfaces/Post";
import { Connection } from "./app.js";

let radioBtn: HTMLElement | null;
let voices: SpeechSynthesisVoice[] = [];
let script = ``;
let radioOn = false;

export function initializeBroadcastHandlers() {
    if ('speechSynthesis' in window) {
        voices = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
        };
    }

    radioBtn = document.getElementById('radioBtn');
    if (radioBtn) {
        radioBtn.addEventListener('click', togglePlay);
    }
}

export default function broadcast(posts: Post[]) {
    const connection = document.getElementById('connection');
    const broadcastElement = document.getElementById('broadcast');

    if (!radioBtn || !posts || !connection || !broadcastElement) {
        console.warn('standing by...');
        return;
    }

    if (radioOn) radioBtn.classList.add('text-accent');
    else {
        radioBtn.classList.remove('text-accent');
    }

    if (broadcastElement.classList.contains('animate-pulse')) {
        broadcastElement.classList.remove('hidden');
        broadcastElement.classList.remove('animate-pulse');
        connection.classList.add('hidden');
    } else if (broadcastElement.firstChild.nodeValue.indexOf(posts[0].title) >= 0) {
        // offsync detected
        broadcastElement.classList.add('hidden');
        broadcastElement.classList.add('animate-pulse');
        connection.classList.remove('hidden');
    } else return;

    script = `You're listening to the official Broadcast by Global Arda network...`;
    broadcastElement.innerHTML = BroadcastLinks(posts);

    posts.forEach((post, idx) => {
        script += `Message left by ${post.author} in ${post.channels.length > 2 ? post.channels[1] : `unspecified`} place...`;
        script += `${post.title}...`;
        script += `${post.content}...`;
        script += `There are ${post.comments.length} comments left so far, and there are ${post.likes} likes and ${post.dislikes} dislikes...`;
    });
}

function togglePlay(e: Event): void {
    e.preventDefault();

    radioOn = !radioOn;
    if (!radioOn) {
        window.speechSynthesis.pause();
    } else {
        if (!!script) window.speechSynthesis.resume();
    }

    script += `
    Thanks for listening to Global Arda Broadcasting service sponsored by Under Mountain Development Group.
    We are building sustainable virtual socio-economy for better future in real life. Value through openness and connection.
    Project Arda is to build Open Socio-Economic Metaverse & Trading Community of digital assets.
    Here, user can collect resources, craft items, and trade in marketplace.
    Create a settlement for passive income, join houses and participate in activities to build friendship and receive greater incentives.
    `;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(script);
        //utterance.lang = 'en-GB';

        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error(e);
        }
    } else {
        alert("Text-to-Speech is not supported in this browser.");
    }
}
