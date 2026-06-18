document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var globalForms = document.querySelectorAll(".js-global-search");
  globalForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[type='search']");
      var query = input ? input.value.trim() : "";
      if (query) {
        event.preventDefault();
        window.location.href = "search.html?q=" + encodeURIComponent(query);
      }
    });
  });

  var filterForm = document.querySelector(".movie-filter");
  var scope = document.querySelector(".filter-scope");
  var emptyState = document.querySelector(".empty-state");

  function filterCards() {
    if (!filterForm || !scope) {
      return;
    }
    var input = filterForm.querySelector("input[type='search']");
    var select = filterForm.querySelector("select");
    var query = input ? input.value.trim().toLowerCase() : "";
    var category = select ? select.value.trim().toLowerCase() : "";
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-category") || ""
      ].join(" ").toLowerCase();
      var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedCategory = !category || cardCategory === category;
      var matched = matchedQuery && matchedCategory;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (filterForm) {
    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      filterCards();
    });
    filterForm.addEventListener("input", filterCards);
    filterForm.addEventListener("change", filterCards);

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var input = filterForm.querySelector("input[type='search']");
    if (q && input) {
      input.value = q;
      filterCards();
    }
  }
});
