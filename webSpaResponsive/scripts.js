const valorSelect = document.getElementById("valores");
const priceElements = document.querySelectorAll(".card-price, .aside-price");
const currencyOptions = valorSelect.querySelectorAll('option:not([value="MXN"])');

const exchangeRates = {
    MXN: 1
};

function formatPrice(value, currency) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: currency,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: currency === "JPY" ? 0 : 2,
        maximumFractionDigits: currency === "JPY" ? 0 : 2
    }).format(value);
}

function renderPrices(currency) {
    const rate = exchangeRates[currency];

    if (typeof rate !== "number") {
        return;
    }

    priceElements.forEach(function (priceElement) {
        const basePrice = Number(priceElement.dataset.price);

        if (!Number.isFinite(basePrice)) {
            return;
        }

        priceElement.textContent = formatPrice(basePrice * rate, currency);
    });
}

async function loadExchangeRates() {
    try {
        const response = await fetch("https://api.frankfurter.dev/v2/rates?base=MXN&quotes=USD,JPY");

        if (!response.ok) {
            throw new Error(`La API respondió con el estado ${response.status}`);
        }

        const data = await response.json();

        data.forEach(function (item) {
            if ((item.quote === "USD" || item.quote === "JPY") && Number.isFinite(item.rate)) {
                exchangeRates[item.quote] = item.rate;
            }
        });

        currencyOptions.forEach(function (option) {
            option.disabled = typeof exchangeRates[option.value] !== "number";
        });
    } catch (error) {
        console.error("No fue posible cargar los tipos de cambio:", error);
    } finally {
        valorSelect.setAttribute("aria-busy", "false");
    }
}

valorSelect.addEventListener("change", function () {
    renderPrices(valorSelect.value);
});

renderPrices("MXN");
loadExchangeRates();
