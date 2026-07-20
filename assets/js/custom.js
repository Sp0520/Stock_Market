document.addEventListener("DOMContentLoaded", () => {
    // Theme Manager
    const themeToggleBtn = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "dark";
    
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
            updateThemeIcon(theme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector("i");
        if (icon) {
            if (theme === "dark") {
                icon.className = "bi bi-sun-fill";
            } else {
                icon.className = "bi bi-moon-fill";
            }
        }
    }

    // Sidebar toggler for mobile
    const toggleSidebarBtn = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");
    
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener("click", (e) => {
            sidebar.classList.toggle("active");
            e.stopPropagation();
        });
        
        document.addEventListener("click", (e) => {
            if (sidebar.classList.contains("active") && !sidebar.contains(e.target) && e.target !== toggleSidebarBtn) {
                sidebar.classList.remove("active");
            }
        });
    }

    // Dropdown utilities
    const dropdownBtns = document.querySelectorAll(".dropbtn");
    dropdownBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const dropdownContent = btn.nextElementSibling;
            if (dropdownContent) {
                dropdownContent.classList.toggle("show");
            }
            e.stopPropagation();
        });
    });

    window.addEventListener("click", () => {
        const dropdowns = document.querySelectorAll(".dropdown_content, .search-suggestions");
        dropdowns.forEach(d => {
            if (d.classList.contains("show")) {
                d.classList.remove("show");
            }
            // If it's a display: flex or block suggestion container, hide it
            if (window.getComputedStyle(d).display !== "none" && d.classList.contains("search-suggestions")) {
                d.style.display = "none";
            }
        });
    });

    // Number counters animator
    const counters = document.querySelectorAll(".counter-animate");
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute("data-target") || 0);
        const decimals = parseInt(counter.getAttribute("data-decimals") || 0);
        const duration = 1000; // ms
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad
            const ease = progress * (2 - progress);
            const value = ease * target;
            
            if (decimals > 0) {
                counter.innerText = value.toFixed(decimals);
            } else {
                counter.innerText = Math.floor(value).toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                if (decimals > 0) {
                    counter.innerText = target.toFixed(decimals);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            }
        }
        requestAnimationFrame(updateCounter);
    });
});
