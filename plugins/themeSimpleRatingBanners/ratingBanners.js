patchNodeContent(".rating-banner", (node) => {
  return (
    node.innerHTML.replaceAll(/[^\d]/g, "") + '<i class="fa-solid fa-star"></i>'
  );
});
