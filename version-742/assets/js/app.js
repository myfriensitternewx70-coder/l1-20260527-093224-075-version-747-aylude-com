(function () {
    var ready = function (callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    };

    var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');

        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (!query) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            });
        });

        initHeroCarousel();
        initFilters();
        initPlayer();
    });

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var play = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        var reset = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                reset();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                reset();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                reset();
            });
        }

        carousel.addEventListener('mouseenter', function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });

        carousel.addEventListener('mouseleave', function () {
            reset();
        });

        show(0);
        play();
    }

    function initFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        if (!scope) {
            applyQueryToSearchInput();
            return;
        }

        var input = scope.querySelector('[data-filter-input]');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = scope.querySelector('[data-empty-state]');
        var activeCategory = 'all';

        var apply = function () {
            var query = normalize(input ? input.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var category = card.getAttribute('data-category') || '';
                var matchQuery = !query || text.indexOf(query) >= 0;
                var matchCategory = activeCategory === 'all' || category === activeCategory;
                var visible = matchQuery && matchCategory;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        };

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeCategory = chip.getAttribute('data-filter') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });

        if (input) {
            input.addEventListener('input', apply);
        }

        if (scope.hasAttribute('data-search-page')) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (input && query) {
                input.value = query;
            }
        }

        apply();
    }

    function applyQueryToSearchInput() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        document.querySelectorAll('input[name="q"]').forEach(function (input) {
            input.value = query;
        });
    }

    function initPlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }

        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var message = player.querySelector('[data-player-message]');
        var instance = null;
        var prepared = false;

        var showMessage = function (text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.toggle('is-visible', Boolean(text));
        };

        var prepare = function () {
            if (prepared) {
                return true;
            }

            var url = video.getAttribute('data-hls');
            if (!url) {
                showMessage('播放失败，请稍后重试');
                return false;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                prepared = true;
                return true;
            }

            if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                instance.loadSource(url);
                instance.attachMedia(video);
                prepared = true;
                return true;
            }

            showMessage('播放失败，请稍后重试');
            return false;
        };

        var start = function () {
            if (!prepare()) {
                return;
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            var playRequest = video.play();
            if (playRequest && playRequest.catch) {
                playRequest.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                    showMessage('点击视频继续播放');
                });
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
            showMessage('');
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });

        video.addEventListener('error', function () {
            showMessage('播放失败，请稍后重试');
            if (button) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (instance) {
                instance.destroy();
            }
        });
    }
})();
