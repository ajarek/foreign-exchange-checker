# FX Checker - Foreign Exchange Dashboard

A modern, responsive, and interactive foreign exchange rate checker and converter. This application provides real-time currency data, historical trends, and personal organization features for financial tracking.

## 🚀 Key Features

*   **Real-time Currency Converter**: Instant conversion between dozens of global currencies with high-precision exchange rates.
*   **Live Market Ticker**: A scrolling dashboard at the top showing live rates for major currency pairs (USD/EUR, USD/GBP, etc.).
*   **Interactive Historical Charts**: Visual trend analysis using **Chart.js** for the last 30 days, including interactive tooltips and smooth animations.
*   **Favorites System**: Pin your most-used currency pairs for quick access. Favorites are persisted in your browser's local storage.
*   **Conversion Log**: Keep track of your past conversions with a detailed log including timestamps, exact rates used, and calculated amounts.
*   **Smart Currency Picker**: An intuitive selection interface with a real-time search filter and auto-focus for fast navigation.
*   **Responsive Modern UI**: A sleek dark-themed interface built with professional typography and custom SVG iconography.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
*   **Visualization**: [Chart.js](https://www.chartjs.org/) for interactive data rendering.
*   **APIs**:
    *   [ExchangeRate-API](https://www.exchangerate-api.com/) for reliable, up-to-the-minute rates.
    *   [Frankfurter API](https://www.frankfurter.app/) for historical market data.
    *   [FlagCDN](https://flagcdn.com/) for high-quality currency flag assets.

## 💾 Local Persistence

The application uses `localStorage` to save your data locally. This means your **Pinned Favorites** and **Conversion Logs** will remain available even after refreshing the page or restarting your browser.

## 🏁 How to Run

1.  Clone or download the project files.
2.  Open `index.html` in any modern web browser.
3.  Ensure you have an active internet connection to fetch real-time market data.

---
*Created as a high-performance foreign exchange tracking tool.*
