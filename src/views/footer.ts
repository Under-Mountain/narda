import { Modals } from "./modals.js";

export function FooterView(session = undefined, account = undefined): string {
    return `
        </main>
        <footer class="footer footer-center bg-base-300 text-base-content p-4">
            <aside class="">
                Arda v.1
            </aside>
        </footer>
        <div id="alert" role="alert" class="hidden alert rounded-none opacity-80 text-xs text-bold z-50 p-1 fixed top-0">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="inline h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span id="alertContent"></span>
            </div>
        </div>
        ${Modals(session, account)}
        </body>
        <script type="module" src="/scripts/app.js"></script>
        <script>
            function toggleNavbar(collapseID) {
                document.getElementById(collapseID).classList.toggle("hidden");
                document.getElementById(collapseID).classList.toggle("block");
            }
        </script></html>`
}