(() => {
  const buttonId = "jumpToNowPlaying";

  // Requires https://github.com/feederbox826/plugins/tree/main/plugins/fontawesome-js
  const addJumpToCurrentVideoBtn = () => {
    if (document.getElementById(buttonId)) {
      return;
    }

    const qc = document.querySelector(".queue-controls");
    if (qc && qc.firstElementChild) {
      const btn = document.createElement("button");
      btn.id = buttonId;
      btn.className = "minimal btn btn-secondary";
      btn.innerHTML = '<i class="fa-solid fa-angles-up"></i>';

      btn.addEventListener("click", () =>
        document
          .querySelector("#queue-content .current")
          ?.scrollIntoView({ behavior: "smooth" })
      );
      qc.insertBefore(btn, qc.firstElementChild.nextSibling);
    }
  };

  csLib.PathElementListener(
    "/scenes/",
    ".queue-controls",
    addJumpToCurrentVideoBtn
  );
})();
