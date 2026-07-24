document.addEventListener("DOMContentLoaded", () => {
    const searchInputs = document.querySelectorAll(".autocomplete-search");
    
    searchInputs.forEach(input => {
        const container = input.closest(".search-bar") || input.parentElement;
        let suggestionsContainer = container.querySelector(".search-suggestions");
        
        // Create suggestion container if not exists
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement("div");
            suggestionsContainer.className = "search-suggestions";
            container.appendChild(suggestionsContainer);
        }
        
        let debounceTimer;
        let activeIndex = -1;
        
        input.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            const query = input.value.trim();
            
            if (query.length < 2) {
                suggestionsContainer.style.display = "none";
                return;
            }
            
            debounceTimer = setTimeout(() => {
                fetchSuggestions(query, suggestionsContainer);
            }, 300);
        });
        
        // Handle keyboard navigation
        input.addEventListener("keydown", (e) => {
            const items = suggestionsContainer.querySelectorAll(".suggestion-item");
            if (!items.length || suggestionsContainer.style.display === "none") return;
            
            if (e.key === "ArrowDown") {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
                highlightItem(items, activeIndex);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
                highlightItem(items, activeIndex);
            } else if (e.key === "Enter") {
                if (activeIndex > -1) {
                    e.preventDefault();
                    items[activeIndex].click();
                }
            } else if (e.key === "Escape") {
                suggestionsContainer.style.display = "none";
                input.blur();
            }
        });
        
        // Close suggestions when clicking outside
        document.addEventListener("click", (e) => {
            if (!container.contains(e.target)) {
                suggestionsContainer.style.display = "none";
            }
        });
        
        input.addEventListener("focus", () => {
            if (input.value.trim().length >= 2) {
                suggestionsContainer.style.display = "block";
            }
        });
    });
    
    function highlightItem(items, index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.style.background = "rgba(255, 255, 255, 0.08)";
                item.scrollIntoView({ block: "nearest" });
            } else {
                item.style.background = "";
            }
        });
    }
    
    function fetchSuggestions(query, container) {
        $.ajax({
            url: "./api/search.php",
            type: "GET",
            data: { q: query },
            dataType: "json",
            success: (data) => {
                container.innerHTML = "";
                if (data && data.length > 0) {
                    data.forEach(item => {
                        const link = document.createElement("a");
                        link.href = "./stock.php?symbol=" + encodeURIComponent(item.symbol);
                        link.className = "suggestion-item";
                        
                        const left = document.createElement("div");
                        left.style.display = "flex";
                        left.style.alignItems = "center";
                        
                        const ticker = document.createElement("span");
                        ticker.className = "ticker";
                        ticker.textContent = item.symbol;
                        
                        const name = document.createElement("span");
                        name.className = "company-name";
                        name.textContent = item.name;
                        
                        left.appendChild(ticker);
                        left.appendChild(name);
                        
                        const badge = document.createElement("span");
                        badge.className = "exchange-badge";
                        badge.textContent = item.exchange;
                        
                        link.appendChild(left);
                        link.appendChild(badge);
                        
                        container.appendChild(link);
                    });
                    container.style.display = "block";
                } else {
                    container.innerHTML = '<div style="padding: 12px 20px; color: var(--text-secondary); font-size: 0.85rem;">No results found.</div>';
                    container.style.display = "block";
                }
            },
            error: () => {
                container.innerHTML = '<div style="padding: 12px 20px; color: var(--color-red); font-size: 0.85rem;">Error loading suggestions.</div>';
                container.style.display = "block";
            }
        });
    }
});
