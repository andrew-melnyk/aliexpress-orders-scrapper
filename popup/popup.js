document.addEventListener('DOMContentLoaded', () => {
  const exportButton = document.getElementById('exportButton');
  const errorElement = document.getElementById('error');
  const exportFormat = document.getElementById('exportFormat');

  exportButton.addEventListener('click', async () => {
    try {
      // Get selected statuses
      const statusCheckboxes = document.querySelectorAll('input[name="status"]:checked');
      console.log('Found status checkboxes:', statusCheckboxes);
      
      const selectedStatuses = Array.from(statusCheckboxes).map(checkbox => checkbox.value);
      console.log('Selected statuses:', selectedStatuses);

      if (selectedStatuses.length === 0) {
        throw new Error('Please select at least one status to export');
      }

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);

      if (!tab) {
        throw new Error('No active tab found');
      }

      // Check if we're on the correct page
      if (!tab.url.includes('aliexpress.com')) {
        throw new Error('Please navigate to AliExpress orders page first');
      }

      // Update button state
      exportButton.disabled = true;
      exportButton.textContent = 'Exporting...';

      // Hide any previous error
      errorElement.style.display = 'none';

      // Send message to content script with selected statuses and format
      console.log('Sending message to content script with statuses:', selectedStatuses);
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'exportOrders',
        selectedStatuses: selectedStatuses,
        format: exportFormat.value
      });
      console.log('Response from content script:', response);

      if (!response || !response.success) {
        throw new Error(response?.error || 'Failed to export orders');
      }

      // Update button to show success
      exportButton.textContent = 'Export Complete!';
      setTimeout(() => {
        exportButton.disabled = false;
        exportButton.textContent = 'Export Orders';
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      
      // Show error in popup
      errorElement.textContent = error.message;
      errorElement.style.display = 'block';

      // Reset button
      exportButton.disabled = false;
      exportButton.textContent = 'Export Orders';
    }
  });
}); 