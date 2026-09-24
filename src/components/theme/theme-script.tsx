// Submission lock: DevHub is forced to the light white + wine theme.
// The dark-theme architecture is preserved in globals.css and the provider
// for later work — this script intentionally ignores stored preferences
// and OS color-scheme detection.
const script = /* js */ `(function(){try{document.documentElement.dataset.theme="light";document.documentElement.style.colorScheme="light"}}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
