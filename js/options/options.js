let Options = (function() {
    let self = {};

    function loadOptions() {

        // Set the value or state for each input
        let nodes = document.querySelectorAll("[data-setting]");
        console.log(nodes)
        for (let node of nodes) {
            let setting = node.dataset.setting;
            let value = SyncedStorage.get(setting);

            if (node.type && node.type === "checkbox") {
                node.checked = value;

                let parentOption = node.closest(".parent_option");
                if (parentOption) {
                    if (node.id === "stores_all") value = !value;
                    for (let nextSibling = parentOption.nextElementSibling; nextSibling.classList.contains("sub_option"); nextSibling = nextSibling.nextElementSibling) {
                        nextSibling.classList.toggle("disabled", !value);
                    }
                }
            } else {
                if (value) {
                    node.value = value;
                }
            }
        }
    }

    function saveOptionFromEvent(e) {
        if (!e.target || !e.target.closest) return; // "blur" fires when the window loses focus
        let node = e.target.closest("[data-setting]");
        if (!node) {
            if (e.target.closest("#store_stores")) {
                saveOption("stores");
            }
            return;
        }
        saveOption(node.dataset.setting);
    }
    async function saveOption(option) {
        let value;

        if (option === "stores") {

            value = [];
            let nodes = document.querySelectorAll("#store_stores input[type=checkbox]");
            for (let node of nodes) {
                if (node.checked) {
                    value.push(node.id);
                }
            }

        } else {

            let node = document.querySelector("[data-setting='" + option + "']");
            if (!node) { return; }

            if (node.type && node.type === "checkbox") {
                value = node.checked;
            } else {
                value = node.value;
            }

            if (option === "quickinv_diff") {
                value = parseFloat(value.trim()).toFixed(2);
            }
        }

        SyncedStorage.set(option, value);

    }
    self.init = async function() {
        let settings = SyncedStorage.init();
        await Promise.all([settings]);
        loadOptions();


        document.addEventListener("change", saveOptionFromEvent);
        document.addEventListener("blur", saveOptionFromEvent);
        document.addEventListener("select", saveOptionFromEvent);
    }

    return self;
})();

document.addEventListener("DOMContentLoaded", Options.init);