const THEME_STORAGE_KEY = "devhub-theme";

const script = /* js */ `(function(){try{var k="${THEME_STORAGE_KEY}";var p=localStorage.getItem(k);var t="dark";if(p==="light"||p==="dark"){t=p}else if(p==="system"||!p){if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches){t="light"}}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}