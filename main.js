// Fetch the JSON data
fetch('data/sales-data.json')
    .then(response => response.json())
    .then(data => {
        // Render Monthly Sales Chart
        const salesCtx = document.getElementById('sales-chart').getContext('2d');
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: data.monthlySales.labels,
                datasets: [{
                    label: 'Monthly Sales',
                    data: data.monthlySales.data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });

        // Render Product Sales Chart
        const productCtx = document.getElementById('product-chart').getContext('2d');
        new Chart(productCtx, {
            type: 'bar',
            data: {
                labels: data.productSales.labels,
                datasets: [{
                    label: 'Product Sales',
                    data: data.productSales.data,
                    backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
