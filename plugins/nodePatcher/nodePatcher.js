(function () {
	function patchNodeContent(selector, fn) {
		if (typeof fn !== "function") {
			console.error(`[nodePatcher] fn is ${typeof fn}, expected 'function'`);
			return;
		}

		const config = { childList: true, subtree: true, attributes: true };

		const patchId = [...crypto.getRandomValues(new Uint8Array(6))]
			.map((m) => ("0" + m.toString(16)).slice(-2))
			.join("");
		const patchedSelector = `[data-patched='${patchId}']`;

		const nodeOrChildMatches = (node) =>
			node.matches(selector) || node.matches(`:has(${selector})`);

		const nodesToPatch = new Set();

		/**
		 *
		 * @param {string} selector
		 * @param {MutationRecord[]} mutations
		 * @returns {Element[]} target nodes
		 */
		function getTargetNodes(mutations) {
			const targetSet = new Set();

			for (const mut of mutations) {
				mut.addedNodes.forEach((node) => {
					if (node.nodeType === Node.ELEMENT_NODE && nodeOrChildMatches(node))
						targetSet.add(node);
				});

				if (
					mut.target.nodeType === Node.ELEMENT_NODE &&
					nodeOrChildMatches(mut.target)
				)
					targetSet.add(mut.target);
			}

			return [...targetSet];
		}

		const observer = new MutationObserver((mutations) => {
			getTargetNodes(mutations).forEach(nodesToPatch.add, nodesToPatch);

			requestAnimationFrame(() => {
				observer.disconnect();

				getTargetNodes(mutations).forEach((node) => {
					node.querySelectorAll(selector).forEach((node) => {
						if (node.matches(patchedSelector)) {
							return;
						}

						node.setAttribute("data-patched", patchId);
						node.innerHTML = fn(node);
					});
				});

				nodesToPatch.clear();
				observer.observe(document, config);
			});
		});

		observer.observe(document, config);
	}

	window.patchNodeContent = patchNodeContent;
})();
