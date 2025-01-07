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

    if (!radioBtn || !posts || posts.length == 0 || !connection || !broadcastElement) {
        console.warn('standing by...');
        return;
    }

    if (broadcastElement.classList.contains('animate-pulse')) {
        broadcastElement.classList.remove('hidden');
        broadcastElement.classList.remove('animate-pulse');
        connection.classList.add('hidden');
    } else if (broadcastElement.firstElementChild.getHTML().trim().indexOf(posts[0].title) < 0) {
        // offsync detected
        if (radioOn) {
            script = `${posts[0].title}`;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(script);
            window.speechSynthesis.speak(utterance);
        }

        broadcastElement.classList.add('hidden');
        broadcastElement.classList.add('animate-pulse');
        connection.classList.remove('hidden');
        return;
    }

    broadcastElement.innerHTML = BroadcastLinks(posts);

    posts.forEach((post, idx) => {
        script += `${post.title}.`;
        script += `${post.content}.`;
    });
}

function togglePlay(): void {
    // script += `
    // Thanks for listening to Global Arda Broadcasting service sponsored by Under Mountain Development Group.
    // We are building sustainable virtual socio-economy for better future in real life. Value through openness and connection.
    // Project Arda is to build Open Socio-Economic Metaverse & Trading Community of digital assets.
    // Here, user can collect resources, craft items, and trade in marketplace.
    // Create a settlement for passive income, join houses and participate in activities to build friendship and receive greater incentives.
    // `;

    if ('speechSynthesis' in window) {
        radioOn = !radioOn;

        try {
            if (radioOn) {
                radioBtn.classList.add('text-accent');
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(script);
                window.speechSynthesis.speak(utterance);

                utterance.onend = () => {
                    console.debug(`broadcast ended`)
                    //radioBtn.classList.remove('text-accent');
                    //radioOn = false
                    script = ''
                }

                utterance.onerror = (e) => {
                    console.error(`TTS error`, e.error)
                    radioBtn.classList.remove('text-accent');
                    radioOn = false
                    script = ''
                }
            }
            else {
                radioBtn.classList.remove('text-accent');
                window.speechSynthesis.cancel();
                script = ''
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        alert("Text-to-Speech is not supported in this browser.");
    }
}
