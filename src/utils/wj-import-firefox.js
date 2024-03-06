window.isFirefox = true;
window.isChrome = false;

window.WjImport = async function (link) {
    const cssModule = await import(link);

    if (this.document) {
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, cssModule.default];
    } else {
        this.shadowRoot && (this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, cssModule.default])
    }
}