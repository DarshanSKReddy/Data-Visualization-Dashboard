// DOM Elements
const salesChartCtx = document.getElementById('sales-chart').getContext('2d');
const productChartCtx = document.getElementById('product-chart').getContext('2d');
const regionChartCtx = document.getElementById('region-chart').getContext('2d');
const channelChartCtx = document.getElementById('channel-chart').getContext('2d');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const applyFilterBtn = document.getElementById('apply-filter');
const resetFilterBtn = document.getElementById('reset-filter');
const themeToggleBtn = document.getElementById('theme-toggle');
const lastUpdatedSpan = document.getElementById('last-updated');
const currentYearSpan = document.getElementById('current-year');

// Metric elements
const totalRevenueEl = document.getElementById('total-revenue');
const revenueChangeEl = document.getElementById('revenue-change');
const unitsSoldEl = document.getElementById('units-sold');
const unitsChangeEl = document.getElementById('units-change');
const topProductEl = document.getElementById('top-product');
const topProductSalesEl = document.getElementById('top-product-sales');
const avgOrderEl = document.getElementById('avg-order');
const orderChangeEl = document.getElementById('order-change');

// Chart instances
let salesChart, productChart, regionChart, channelChart;

// Initialize dashboard
initDashboard();

async function initDashboard() {
    // Set current year in footer
    currentYearSpan.textContent = new Date().getFullYear();
    
    // Set up theme toggle
    setupThemeToggle();
    
    // Load data and render charts
    try {
        const data = await loadData();
        updateMetadata(data.metadata);
        renderMetrics(data.metrics);
        renderCharts(data);
        setupDateFilters(data);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard data. Please try again later.');
    }
}

async function loadData() {
    try {
        const response = await fetch('data/sales-data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

function updateMetadata(metadata) {
    const lastUpdated = new Date(metadata.lastUpdated);
    lastUpdatedSpan.textContent = lastUpdated.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderMetrics(metrics) {
    // Format currency
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });
    
    // Calculate percentage changes
    const revenueChange = ((metrics.totalRevenue - metrics.previousRevenue) / metrics.previousRevenue * 100).toFixed(1);
    const unitsChange = ((metrics.unitsSold - metrics.previousUnits) / metrics.previousUnits * 100).toFixed(1);
    const orderChange = ((metrics.avgOrderValue - metrics.previousAvgOrder) / metrics.previousAvgOrder * 100).toFixed(1);
    
    // Update DOM elements
    totalRevenueEl.textContent = currencyFormatter.format(metrics.totalRevenue);
    revenueChangeEl.textContent = `${revenueChange}% vs ${metrics.period}`;
    unitsSoldEl.textContent = metrics.unitsSold.toLocaleString();
    unitsChangeEl.textContent = `${unitsChange}% vs ${metrics.period}`;
    topProductEl.textContent = metrics.topProduct;
    topProductSalesEl.textContent = `${metrics.topProductSales} units`;
    avgOrderEl.textContent = currencyFormatter.format(metrics.avgOrderValue);
    orderChangeEl.textContent = `${orderChange}% vs ${metrics.period}`;
    
    // Style changes based on positive/negative
    styleChangeElement(revenueChangeEl, revenueChange);
    styleChangeElement(unitsChangeEl, unitsChange);
    styleChangeElement(orderChangeEl, orderChange);
}

function styleChangeElement(element, change) {
    const changeValue = parseFloat(change);
    if (changeValue > 0) {
        element.innerHTML = `<i class="fas fa-caret-up"></i> ${change}% vs last period`;
        element.style.color = 'var(--success-color)';
    } else if (changeValue < 0) {
        element.innerHTML = `<i class="fas fa-caret-down"></i> ${Math.abs(change)}% vs last period`;
        element.style.color = 'var(--danger-color)';
    } else {
        element.innerHTML = `${change}% vs last period`;
        element.style.color = 'var(--warning-color)';
    }
}

function renderCharts(data) {
    // Destroy existing charts if they exist
    if (salesChart) salesChart.destroy();
    if (productChart) productChart.destroy();
    if (regionChart) regionChart.destroy();
    if (channelChart) channelChart.destroy();
    
    // Sales Trend Chart (Line)
    salesChart = new Chart(salesChartCtx, {
        type: 'line',
        data: {
            labels: data.monthlySales.labels,
            datasets: [
                {
                    label: 'Current Period',
                    data: data.monthlySales.data,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Previous Period',
                    data: data.monthlySales.previousData,
                    borderColor: 'var(--secondary-color)',
                    backgroundColor: 'rgba(22, 96, 136, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: getChartOptions('Sales Trend', 'currency')
    });
    
    // Product Performance Chart (Bar)
    productChart = new Chart(productChartCtx, {
        type: 'bar',
        data: {
            labels: data.productSales.labels,
            datasets: [{
                label: 'Units Sold',
                data: data.productSales.data,
                backgroundColor: data.productSales.colors,
                borderColor: data.productSales.colors.map(color => `${color}cc`),
                borderWidth: 1
            }]
        },
        options: getChartOptions('Units Sold')
    });
    
    // Regional Sales Chart (Doughnut)
    regionChart = new Chart(regionChartCtx, {
        type: 'doughnut',
        data: {
            labels: data.regionalSales.labels,
            datasets: [{
                data: data.regionalSales.data,
                backgroundColor: data.regionalSales.colors,
                borderColor: data.regionalSales.colors.map(color => `${color}cc`),
                borderWidth: 1
            }]
        },
        options: getChartOptions('Regional Distribution', 'percentage', true)
    });
    
    // Sales Channel Chart (Pie)
    channelChart = new Chart(channelChartCtx, {
        type: 'pie',
        data: {
            labels: data.channelSales.labels,
            datasets: [{
                data: data.channelSales.data,
                backgroundColor: data.channelSales.colors,
                borderColor: data.channelSales.colors.map(color => `${color}cc`),
                borderWidth: 1
            }]
        },
        options: getChartOptions('Channel Distribution', 'percentage', true)
    });
}

function getChartOptions(title, valueType = 'number', showLegend = false) {
    const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDarkTheme ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tickColor = isDarkTheme ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)';
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: '500'
                },
                color: textColor,
                padding: {
                    bottom: 20
                }
            },
            legend: {
                display: showLegend,
                position: 'right',
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDarkTheme ? '#fff' : '#333',
                bodyColor: isDarkTheme ? '#fff' : '#333',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                padding: 12,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (valueType === 'currency') {
                            label += new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(context.raw);
                        } else if (valueType === 'percentage') {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            label += `${context.raw} (${percentage}%)`;
                        } else {
                            label += context.raw;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: tickColor
                }
            },
            y: {
                grid: {
                    color: gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: tickColor,
                    callback: function(value) {
                        if (valueType === 'currency') {
                            return new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                        return value;
                    }
                },
                beginAtZero: true
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        }
    };
    
    return options;
}

function setupDateFilters(data) {
    // Set default date range (last 6 months)
    const months = data.monthlySales.labels;
    const defaultStartIndex = Math.max(0, months.length - 6);
    
    // Set min/max dates
    startDateInput.min = '2023-01-01';
    startDateInput.max = '2023-12-31';
    endDateInput.min = '2023-01-01';
    endDateInput.max = '2023-12-31';
    
    // Set default values
    startDateInput.value = '2023-04-01';
    endDateInput.value = '2023-09-30';
    
    // Event listeners
    applyFilterBtn.addEventListener('click', () => {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (startDate > endDate) {
            showError('Start date must be before end date');
            return;
        }
        
        // In a real app, we would filter the data based on dates
        // For this demo, we'll just show a message
        showSuccess(`Data filtered from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    });
    
    resetFilterBtn.addEventListener('click', () => {
        startDateInput.value = '2023-04-01';
        endDateInput.value = '2023-09-30';
        showSuccess('Filters reset to default');
    });
}

function setupThemeToggle() {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.setAttribute('data-theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.body.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
        
        // Update charts to reflect new theme
        if (salesChart) {
            salesChart.options = getChartOptions('Sales Trend', 'currency');
            salesChart.update();
        }
        if (productChart) {
            productChart.options = getChartOptions('Units Sold');
            productChart.update();
        }
        if (regionChart) {
            regionChart.options = getChartOptions('Regional Distribution', 'percentage', true);
            regionChart.update();
        }
        if (channelChart) {
            channelChart.options = getChartOptions('Channel Distribution', 'percentage', true);
            channelChart.update();
        }
    });
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'notification error';
    errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(errorEl);
    
    setTimeout(() => {
        errorEl.classList.add('fade-out');
        setTimeout(() => errorEl.remove(), 500);
    }, 3000);
}

function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'notification success';
    successEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successEl);
    
    setTimeout(() => {
        successEl.classList.add('fade-out');
        setTimeout(() => successEl.remove(), 500);
    }, 3000);
}

// Add some dynamic styles for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    opacity: 1;
    transform: translateY(0);
    transition: all 0.3s ease;
}

.notification i {
    font-size: 1.2rem;
}

.notification.error {
    background-color: var(--danger-color);
}

.notification.success {
    background-color: var(--success-color);
}

.notification.fade-out {
    opacity: 0;
    transform: translateY(20px);
}
`;
document.head.appendChild(notificationStyles);
