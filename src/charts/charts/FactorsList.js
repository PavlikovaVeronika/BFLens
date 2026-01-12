export default class FactorsList {
    constructor(element, dataStore, height = 500, markFactorCallback = null) {
        this.element = element;
        this.dataStore = dataStore;
        this.factors = this.dataStore.getFactorsForDisplay();
        this.height = height;
        this.markFactorCallback = markFactorCallback;

        this.activeCheckbox = null;
        this.activeFactor = null;

        this.initDOM();
        this.renderFactors();
    }

    initDOM() {
        this.element.innerHTML = `
            <div style="display: grid; grid-auto-rows: max-content; gap: 6px; width: 100%; height: ${this.height}px; background-color: white;">
                <input type="text" placeholder="Search..." style="
                    padding: 4px 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    outline: none;
                "/>
                <div class="factors-list" style="
                    overflow: auto;
                    display: grid;
                    grid-auto-rows: max-content;
                    gap: 6px;
                    border-radius: 4px;
                    padding: 4px;
                    background-color: white;
                "></div>
            </div>
        `;

        this.searchInput = this.element.querySelector("input");
        this.listEl = this.element.querySelector(".factors-list");

        const debounce = (fn, delay) => {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn(...args), delay);
            };
        };

        this.searchInput.addEventListener(
            "input",
            debounce(() => {
                if (this.activeFactor) return;
                this.renderFactors(this.searchInput.value);
            }, 200)
        );
    }

    renderFactors(filterText = "") {
        this.listEl.innerHTML = "";

        const lowerFilter = filterText.toLowerCase();

        this.factors.forEach((factor, index) => {
            const attrTextLower = factor.attributeNames.join(", ").toLowerCase();
            const objTextLower = factor.objectNames.join(", ").toLowerCase();

            if (
                lowerFilter &&
                !attrTextLower.includes(lowerFilter) &&
                !objTextLower.includes(lowerFilter)
            ) {
                return;
            }

            const row = document.createElement("div");
            row.style.display = "flex";
            row.style.gap = "8px";
            row.style.padding = "6px 4px";
            row.style.borderBottom = "1px solid #e0e0e0";
            row.style.alignItems = "center";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.style.cursor = "pointer";

            const indexEl = document.createElement("div");
            indexEl.textContent = index + 1;
            indexEl.style.marginRight = "8px";
            indexEl.style.color = "#666";

            const textWrapper = document.createElement("div");
            textWrapper.style.display = "flex";
            textWrapper.style.flexDirection = "column";
            textWrapper.style.gap = "2px";

            const attrText = factor.attributeNames.join(", ");
            const objText = factor.objectNames.join(", ");

            const attrHTML = this.highlightMatch(attrText, filterText);
            const objHTML = this.highlightMatch(objText, filterText);

            const attrRow = this.createRow("Attributes:", attrHTML);
            const objRow = this.createRow("Objects:", objHTML);

            textWrapper.appendChild(attrRow);
            textWrapper.appendChild(objRow);

            const selectFactor = () => {
                if (this.activeCheckbox && this.activeCheckbox !== checkbox) {
                    this.activeCheckbox.checked = false;
                }

                checkbox.checked = true;
                this.activeCheckbox = checkbox;
                this.activeFactor = factor;

                this.setFilteringEnabled(false);

                this.clearRowHighlight();
                row.style.background = "#fffde7";

                this.markFactorCallback(index);
            };

            const unSelectFactor = () => {
                this.activeCheckbox = null;
                this.activeFactor = null;
                this.clearRowHighlight();
                this.markFactorCallback(null);
                this.setFilteringEnabled(true);
            };

            checkbox.addEventListener("change", () => {
                checkbox.checked ? selectFactor() : unSelectFactor();
            });

            row.appendChild(checkbox);
            row.appendChild(indexEl);
            row.appendChild(textWrapper);

            this.listEl.appendChild(row);
        });
    }

    clearRowHighlight() {
        Array.from(this.listEl.children).forEach(row => {
            row.style.background = "transparent";
        });
    }

    highlightMatch(text, filterText) {
        if (!filterText) return text;

        const escaped = filterText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escaped})`, "ig");

        return text.replace(
            regex,
            `<span style="
                background-color: #fff3b0;
                border-radius: 3px;
                padding: 0 2px;
            ">$1</span>`
        );
    }

    createRow(labelText, valueHTML) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.gap = "4px";
        wrapper.style.whiteSpace = "nowrap";

        const labelSpan = document.createElement("span");
        labelSpan.textContent = labelText;
        labelSpan.style.fontWeight = "600";

        const valueSpan = document.createElement("span");
        valueSpan.innerHTML = valueHTML;
        valueSpan.style.color = "#444";

        wrapper.appendChild(labelSpan);
        wrapper.appendChild(valueSpan);

        return wrapper;
    }

    setFilteringEnabled(enabled) {
        this.searchInput.disabled = !enabled;
        this.searchInput.style.opacity = enabled ? "1" : "0.5";
        this.searchInput.style.cursor = enabled ? "text" : "not-allowed";
    }

}