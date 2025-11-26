(function () {
  let failureCount = 0;
  const maxFailures = 3;

  function pollTheme() {
    const url = "http://localhost:8080/theme.css";
    fetch(url, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.text();
      })
      .then((css) => {
        failureCount = 0;

        let styleEl = document.getElementById("dev-theme");

        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "dev-theme";
          document.head.appendChild(styleEl);
        }

        if (styleEl.textContent !== css) {
          styleEl.textContent = css;
        }

        setTimeout(pollTheme, 1000);
      })
      .catch((error) => {
        failureCount++;
        console.error("Error fetching CSS:", error);
        if (failureCount < maxFailures) {
          setTimeout(pollTheme, 1000);
        } else {
          console.error(
            `Stopped polling after ${maxFailures} failed attempts.`
          );
        }
      });
  }

  pollTheme();
})();
