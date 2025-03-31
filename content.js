class AliExpressOrderExporter {
  constructor() {
    this.orders = [];
    this.isCollecting = false;
    this.selectedStatuses = ['Awaiting delivery', 'Completed']; // Default statuses
  }

  setSelectedStatuses(statuses) {
    if (!Array.isArray(statuses) || statuses.length === 0) {
      console.warn('Invalid or empty statuses provided, using defaults');
      this.selectedStatuses = ['Awaiting delivery', 'Completed'];
    } else {
      this.selectedStatuses = statuses;
    }
  }

  async collectOrders() {
    if (this.isCollecting) {
      console.warn('Already collecting orders');
      return;
    }
    
    this.isCollecting = true;
    this.orders = [];

    try {
      // First, collect orders from the current page
      await this.collectOrdersFromCurrentPage();

      // Then click "View Orders" button and wait for new orders
      while (await this.loadMoreOrders()) {
        // Wait longer for the API call to complete and DOM to update
        await this.waitForNewOrders();
        const previousCount = this.orders.length;
        await this.collectOrdersFromCurrentPage();
        const newCount = this.orders.length;

        // Break if no new orders were found to prevent infinite loop
        if (newCount === previousCount) {
          break;
        }
      }

      return this.orders;
    } catch (error) {
      console.error('Error collecting orders:', error);
      throw error;
    } finally {
      this.isCollecting = false;
    }
  }

  async collectOrdersFromCurrentPage() {
    const orderElements = document.querySelectorAll('.order-item');
    
    for (const orderElement of orderElements) {
      const orderData = await this.extractOrderData(orderElement);
      if (orderData) {
        const status = orderData.status.trim();
        const isDuplicate = this.orders.some(order => order.orderId === orderData.orderId);
        const isSelectedStatus = this.selectedStatuses.includes(status);
        
        if (!isDuplicate && isSelectedStatus) {
          this.orders.push(orderData);
        }
      }
    }
  }

  async extractOrderData(orderElement) {
    try {
      // Extract order ID and date from the header info div
      const headerInfoDiv = orderElement.querySelector('.order-item-header-right-info');
      const orderDateText = headerInfoDiv?.querySelector('div')?.textContent?.trim() || '';
      const orderDate = orderDateText.replace('Order date:', '').trim();
      
      // Get order ID from the second div, removing "Order ID:" and "Copy" text
      const orderIdText = headerInfoDiv?.querySelectorAll('div')[1]?.textContent?.trim() || '';
      const orderId = orderIdText.replace('Order ID:', '').replace('Copy', '').trim();
      
      // Extract status
      const statusElement = orderElement.querySelector('.order-item-header-status-text');
      const status = statusElement?.textContent?.trim() || '';
      
      // Extract product details - using the title attribute for full text
      const productElement = orderElement.querySelector('.order-item-content-info-name a span');
      const productTitle = productElement?.getAttribute('title') || productElement?.textContent?.trim() || '';
      const productLink = orderElement.querySelector('.order-item-content-info-name a')?.href || '';
      
      // Extract price - try both old and new HTML structures
      let currency = '';
      let amount = '';
      
      // Try to get price from content-info-number first (item price)
      const itemPriceContainer = orderElement.querySelector('.order-item-content-info-number');
      if (itemPriceContainer) {
        // Get all text content from spans inside this container
        const allSpans = itemPriceContainer.querySelectorAll('span');
        const priceText = Array.from(allSpans)
          .map(span => span.textContent)
          .join('')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Handle format like "US $26.70x1" or similar variations
        const match = priceText.match(/([A-Z]{2})\s*\$\s*([\d.]+)/);
        if (match) {
          currency = match[1];
          amount = match[2];
        }
      }
      
      // Only if we couldn't get the item price, try the total price as fallback
      if (!currency || !amount) {
        const totalPriceElement = orderElement.querySelector('.order-item-content-opt-price-total');
        if (totalPriceElement) {
          const priceText = totalPriceElement.textContent.trim();
          // Handle format like "Total:US $1.99" or "US $1.99"
          const match = priceText.match(/(?:Total:)?([A-Z]{2})\s*\$\s*([\d.]+)/);
          if (match) {
            currency = match[1];
            amount = match[2];
          }
        }
      }

      // Extract store info
      const storeElement = orderElement.querySelector('.order-item-store-name a span');
      const storeName = storeElement?.textContent?.trim() || '';
      const storeLink = orderElement.querySelector('.order-item-store-name a')?.href || '';

      const orderData = {
        orderId,
        orderDate,
        status,
        productTitle,
        productLink,
        currency,
        amount,
        storeName,
        storeLink,
      };

      return orderData;
    } catch (error) {
      console.error('Error extracting order data:', error);
      return null;
    }
  }

  async loadMoreOrders() {
    // Look for the "View Orders" button in the order-more div
    const viewOrdersButton = document.querySelector('.order-more button');
    
    if (viewOrdersButton) {
      // Click the button to trigger the API call
      viewOrdersButton.click();
      return true;
    }
    
    return false;
  }

  async waitForNewOrders() {
    // Increase wait time to 3 seconds to account for API call
    return new Promise(resolve => setTimeout(resolve, 3000));
  }

  generateCSV() {
    if (!this.orders.length) {
      console.warn('No orders to export');
      return null;
    }

    const csvData = Papa.unparse({
      fields: ['Order ID', 'Order Date', 'Status', 'Product Title', 'Product Link', 'Currency', 'Price', 'Store Name', 'Store Link'],
      data: this.orders.map(order => [
        order.orderId,
        order.orderDate,
        order.status,
        order.productTitle,
        order.productLink,
        order.currency,
        order.amount,
        order.storeName,
        order.storeLink,
      ])
    });

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }

  generateXLSX() {
    if (!this.orders.length) {
      console.warn('No orders to export');
      return null;
    }

    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Order ID', 'Order Date', 'Status', 'Product Title', 'Product Link', 'Currency', 'Price', 'Store Name', 'Store Link'],
      ...this.orders.map(order => [
        order.orderId,
        order.orderDate,
        order.status,
        order.productTitle,
        order.productLink,
        order.currency,
        order.amount,
        order.storeName,
        order.storeLink,
      ])
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return URL.createObjectURL(blob);
  }
}

// Initialize the exporter
const exporter = new AliExpressOrderExporter();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'exportOrders') {
    
    // Update selected statuses before collecting orders
    exporter.setSelectedStatuses(message.selectedStatuses || ['Awaiting delivery', 'Completed']);
    
    exporter.collectOrders()
      .then(orders => {
        if (!orders || orders.length === 0) {
          console.error('No orders found');
          sendResponse({ success: false, error: 'No orders found' });
          return;
        }

        let fileUrl;
        let fileExtension;
        if (message.format === 'xlsx') {
          fileUrl = exporter.generateXLSX();
          fileExtension = 'xlsx';
        } else {
          fileUrl = exporter.generateCSV();
          fileExtension = 'csv';
        }

        if (!fileUrl) {
          console.error('Failed to generate file');
          sendResponse({ success: false, error: `Failed to generate ${fileExtension.toUpperCase()} file` });
          return;
        }

        chrome.runtime.sendMessage({
          action: 'downloadCSV',
          url: fileUrl,
          filename: `aliexpress_orders_${new Date().toISOString().split('T')[0]}.${fileExtension}`
        });

        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Error during export:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Required for async response
  }
}); 