document.addEventListener("DOMContentLoaded", function () {

  /* FAQ */
  document.querySelectorAll(".faq-item").forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });

  /* ABOUT (accordion style) */
  const aboutItems = document.querySelectorAll(".about-item");

  if (aboutItems.length > 0) {
    aboutItems.forEach(item => {
      item.addEventListener("click", () => {

        // close others
        aboutItems.forEach(i => {
          if (i !== item) i.classList.remove("active");
        });

        // open clicked
        item.classList.toggle("active");
      });
    });
  }

});