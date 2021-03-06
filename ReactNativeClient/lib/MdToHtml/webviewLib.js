const webviewLib = {};

webviewLib.handleInternalLink = function(event, anchorNode) {
	const href = anchorNode.getAttribute('href');
	if (href.indexOf('#') === 0) {
		event.preventDefault();
		let old_hash = location.hash;

		location.hash = href;

		// HACK 
		// For some reason anchors at the bottom cause the webview to move itself
		// so that the content is aligned with the top of the screen
		// This basically refreshes the scroll view so that is returns to a normal
		// position, the scroll positions stays correct though
		// Additionally an anchor could not be clicked twice because the location
		// would not change, this fixes that also
		setTimeout(function() { location.hash = old_hash; }, 10);
		return true;
	}
	return false;
}

webviewLib.getParentAnchorElement = function(element) {
	let counter = 0;
	while (true) {

		if (counter++ >= 10000) {
			console.warn('been looping for too long - exiting')
			return null;
		}

		if (!element) return null;
		if (element.nodeName === 'A') return element;
		element = element.parentElement;
	}
}

webviewLib.initialize = function(options) {
	webviewLib.options_ = options;
}

document.addEventListener('click', function(event) {
	const anchor = webviewLib.getParentAnchorElement(event.target);
	if (!anchor) return;

	// Prevent URLs added via <a> tags from being opened within the application itself
	// otherwise it would open the whole website within the WebView.

	// Note that we already handle some links in html_inline.js, however not all of them
	// go through this plugin, in particular links coming from third-party packages such
	// as Katex.
	if (!anchor.hasAttribute('data-from-md')) {
		if (webviewLib.handleInternalLink(event, anchor)) return;

		event.preventDefault();
		webviewLib.options_.postMessage(anchor.getAttribute('href'));
		return;
	}

	// If this is an internal link, jump to the anchor directly
	if (anchor.hasAttribute('data-from-md')) {
		if (webviewLib.handleInternalLink(event, anchor)) return;
	}
});
