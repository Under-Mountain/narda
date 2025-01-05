import { Account } from "../types"

export function SendCreditView(account: Account, session: any): string {
    return `
        <form id="sendCreditForm" class="text-right">
            <input type="hidden" name="from" value="${session.username}" />
            <div class="form-control">
                <label for="to" class="label text-xs">Account</label>
                <input name="to" placeholder="receiver's username" required class="bg-base-300 input input-md m-1" />
            </div>
            <div class="form-control">
                <label for="amount" class="label text-xs">Amount</label>
                <input name="amount" type="number" min=".01" max="1000.00" value="0.01" step=".01" required class="bg-base-300 input input-md m-1" />
            </div>
            <button id="sendBtn" ${(session.username && account.credits.balance < .01) ? `disabled` : ``} class="btn btn-sm btn-secondary m-1">Send</button>
        </form>
    `
}

export function PostContentView(account: any, session: any) {
    return `
    <form id="postForm" class="text-right">
        <div class="form-control">
            <label for="title" class="label text-xs">Title</label>
            <input name="title" class="bg-base-300 input" placeholder="Title is required to post" required />
        </div>
        <div class="form-control">
            <label for="channels" class="label text-xs">Channel</label>
            <input name="channels" class="bg-base-300 input" placeholder="general, question, issue, ..." />
        </div>
        <div class="form-control">
            <label for="content" class="label text-xs">Content (optional)</label>
            <textarea class="bg-base-300 textarea" name="content" rows="4" cols="60" placeholder="Optional details"></textarea>
        </div>
        <button id="postBtn" class="btn btn-sm btn-accent m-1" ${(session.username && account.credits.balance < 10) ? `disabled` : ``}>Post (-10.00 credit)</button>
    </form>
    `
}

export function Modals(session, account) {
    return `
        <dialog id="editAccountModal" class="modal">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold">Edit Account</h3>
            <p class="py-4">Customize your account. Build unique profile to stand out.</p>
            ${session?.username && session.username == account?.id ? `
            <form id="updateBioForm" class="">
                <div class="form-control mb-2">
                    <textarea name="bio" row="4" class="textarea w-full bg-base-300" placeholder="Write description of this account.">${account.bio ? account.bio : ''}</textarea>
                </div>
                <div class="text-right">
                    <button id="updateBioBtn" class="btn btn-sm btn-primary" ${session?.username && account.credits.balance >= 100 && session.username == account?.id ? ``: `disabled`}>Update (-100.00sl)</button>
                </div>
            </form>
            ` : `<p class="text-xs">You need to login to edit this account.</p>`}
        </div>
        </dialog>

        <dialog id="sendCreditModal" class="modal">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold">Send Credit</h3>
            <p class="py-4">Send credit to any account in the platform with 0 fee.</p>
            ${session?.username && session.username == account.id ? `
            ${SendCreditView(account, session)}
            ` : `<p class="text-xs">You need to login to edit this account.</p>`}
        </div>
        </dialog>

        <dialog id="postContentModal" class="modal">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold">Post Content</h3>
            <p class="py-4">Post content and receive tips or rage a war</p>
            ${session?.username && session.username == account.id ? `
            ${PostContentView(account, session)}
            ` : `<p class="text-xs">You need to login to edit this account.</p>`}
        </div>
        </dialog>
    `
}
