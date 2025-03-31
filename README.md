# AliExpress Order Exporter

A Chrome extension that allows you to easily export your AliExpress orders to XLSX or CSV format for better order management and record keeping.

![Extension Icon](icons/icon128.png)

## Features

- 🚀 One-click export of AliExpress orders
- 📊 Export to XLSX/CSV format
- 📦 Comprehensive order details including:
  - Order information
  - Product details
  - Shipping information
  - Price and payment details
- 💫 Works offline after initial page load
- 🔒 Privacy-focused: all data processing happens locally

## Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (link coming soon)
2. Click "Add to Chrome"
3. Follow the prompts to install the extension

### From Source

1. Clone this repository:

   ```bash
   git clone https://github.com/andrew-melnyk/aliexpress-order-exporter.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ./download_deps.sh
   ```

3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to your AliExpress orders page (https://aliexpress.com/p/order/*)
2. Click the extension icon in your browser toolbar
3. Click "Export Orders" in the popup
4. Choose your preferred export format (XLSX/CSV)
5. Your orders will be exported and downloaded automatically

## Privacy

This extension processes all data locally on your machine. No data is sent to external servers. For more details, see our [Privacy Policy](PRIVACY.md).

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ./download_deps.sh
   ```

### Building

- The extension uses vanilla JavaScript and doesn't require a build step

### Project Structure

```plaintext
├── manifest.json          # Extension manifest
├── content.js            # Content script for order processing
├── background.js         # Background service worker
├── popup/                # Popup UI files
├── lib/                  # Third-party libraries
├── icons/               # Extension icons
└── store-assets/        # Assets for Web Store listing
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [SheetJS](https://sheetjs.com/) for Excel file handling
