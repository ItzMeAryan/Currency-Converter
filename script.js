const apiUrl = `https://api.exchangerate-api.com/v4/latest/USD`;
const countriesUrl = `https://restcountries.com/v3.1/all`;

let currencyToCountries = {};

// Helper function to fetch flag URLs 
function getFlagUrl(flagObject) {
    return flagObject?.png || flagObject?.svg || flagObject?.webp || '';
}

async function fetchCurrencies() {
    // Fetch currency data
    const response = await fetch(apiUrl);
    const data = await response.json();
    const currencies = Object.keys(data.rates);

    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    // Fetch country data
    const countriesResponse = await fetch(countriesUrl);
    const countriesData = await countriesResponse.json();

    // Map currency codes to countries and flags
    countriesData.forEach(country => {
        if (country.currencies) {
            Object.keys(country.currencies).forEach(code => {
                if (!currencyToCountries[code]) {
                    currencyToCountries[code] = {
                        countries: [],
                        flag: getFlagUrl(country.flags)
                    };
                }
                currencyToCountries[code].countries.push(country.name.common);
            });
        }
    });

    // Populate currency dropdowns
    currencies.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency;
        const countriesList1 = currencyToCountries[currency]?.countries.join(', ') || '';
        option1.textContent = `${currency} (${countriesList1})`;
        fromCurrency.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = currency;
        const countriesList2 = currencyToCountries[currency]?.countries.join(', ') || '';
        option2.textContent = `${currency} (${countriesList2})`;
        toCurrency.appendChild(option2);
    });

    // Set default values
    fromCurrency.value = 'USD';
    toCurrency.value = 'INR';

    // Update flags initially
    updateFlags();
}

async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    if (amount === '' || isNaN(amount)) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Fetch conversion rate
    const response = await fetch(`${apiUrl}?base=${fromCurrency}`);
    const data = await response.json();
    const rate = data.rates[toCurrency];
    const result = amount * rate;
    
    document.getElementById('result').textContent = `${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;
    
    // Update flags
    updateFlags();
}

function updateFlags() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    const fromCountryData = currencyToCountries[fromCurrency] || {};
    const toCountryData = currencyToCountries[toCurrency] || {};
    
    document.getElementById('fromCountry').src = fromCountryData.flag || '';
    document.getElementById('toCountry').src = toCountryData.flag || '';
}

// Add event listeners to update flags when currency changes
document.getElementById('fromCurrency').addEventListener('change', updateFlags);
document.getElementById('toCurrency').addEventListener('change', updateFlags);

document.getElementById('swapButton').addEventListener('click', () => {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    
    convertCurrency(); // Update conversion after swapping
});

// Initial fetch to populate the currencies and update flags
fetchCurrencies();
