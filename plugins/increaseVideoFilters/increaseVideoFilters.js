(function () {
    function handleRangeInput() {
        const sceneFilters = document.querySelector('.scene-video-filter');

        if (!sceneFilters) {
            return;
        }

        sceneFilters.querySelectorAll(".row:has(input[type=range])").forEach(filterRow => {
            const rangeInput = filterRow.querySelector('.filter-slider');

            console.log('Range input and TruncatedText found.');

            if (rangeInput.getAttribute("data-range-unlocked")) {
                return;
            }

            rangeInput.setAttribute('data-range-unlocked', "true");

            rangeInput.addEventListener('dblclick', function () {
                rangeInput.min = rangeInput.min * 1.5;
                rangeInput.max = rangeInput.max * 1.5;
            });
        })

    }

    PluginApi.Event.addEventListener("stash:location", (e) => {
        if (e.detail.data.location.pathname.startsWith('/scenes/')) {
            window.csLib.waitForElement(".scene-tabs", () => {
                handleRangeInput();

            })
        }
    })
})();