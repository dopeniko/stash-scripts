patchNodeContent(".rating-banner", (node) => {
  node.innerHTML.replaceAll(/[^\d]/g, "");
  node.innerHTML += '<i class="fa-solid fa-star"></i>';
});
