// Fetch and inject Header Component
fetch('components/header_component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-container').outerHTML = data;
    })
    .catch(error => console.error('Error loading header component:', error));

// Fetch and inject Sidebar Component
fetch('components/sidebar_component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar-container').outerHTML = data;
    })
    .catch(error => console.error('Error loading sidebar component:', error));
