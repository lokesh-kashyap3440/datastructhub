/**
 * ChartManager — Chart.js wrapper for complexity visualizations
 */
class ChartManager {
    constructor() {
        this.chart = null;
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Initialize the chart
     * @param {string} canvasId - Canvas element ID
     */
    init(canvasId = 'timeChart') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Default chart config
        this.chart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: ['Access', 'Search', 'Insert', 'Delete'],
                datasets: [{
                    label: 'Time Complexity',
                    data: [1, 1, 1, 1],
                    backgroundColor: [
                        'rgba(0, 229, 255, 0.6)',
                        'rgba(0, 229, 255, 0.6)',
                        'rgba(0, 229, 255, 0.6)',
                        'rgba(0, 229, 255, 0.6)'
                    ],
                    borderColor: [
                        '#00e5ff',
                        '#00e5ff',
                        '#00e5ff',
                        '#00e5ff'
                    ],
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 600,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 24, 0.9)',
                        titleColor: '#f0f0f5',
                        bodyColor: '#8888aa',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: {
                            family: "'JetBrains Mono', monospace",
                            size: 12
                        },
                        bodyFont: {
                            family: "'JetBrains Mono', monospace",
                            size: 11
                        },
                        callbacks: {
                            label: (context) => ` O(${context.raw}) `
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#55557a',
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255,255,255,0.03)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#55557a',
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 10
                            },
                            callback: (value) => `O(${value})`
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Update chart with new complexity data
     * @param {Object} data - { access, search, insert, delete } with O values
     * @param {string} color - Primary color for bars
     */
    update(data, color = '#00e5ff') {
        if (!this.chart) return;

        const complexityMap = {
            'O(1)': 1,
            'O(log n)': 2,
            'O(n)': 3,
            'O(n log n)': 4,
            'O(n²)': 5,
            'O(n!)': 6,
            '—': 0
        };

        const labels = ['Access', 'Search', 'Insert', 'Delete'];
        const values = [
            complexityMap[data.access] || 0,
            complexityMap[data.search] || 0,
            complexityMap[data.insert] || 0,
            complexityMap[data.delete] || 0
        ];

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = values;
        this.chart.data.datasets[0].backgroundColor = values.map(v =>
            v === 0 ? 'rgba(85, 85, 122, 0.3)' : `${color}99`
        );
        this.chart.data.datasets[0].borderColor = values.map(v =>
            v === 0 ? '#55557a' : color
        );

        this.chart.update();
    }

    /**
     * Highlight a specific operation bar
     * @param {number} index - Bar index (0-3)
     * @param {string} highlightColor - Highlight color
     */
    highlightBar(index, highlightColor = '#ffd600') {
        if (!this.chart) return;

        const bg = this.chart.data.datasets[0].backgroundColor;
        const border = this.chart.data.datasets[0].borderColor;

        // Reset all
        this.chart.data.datasets[0].backgroundColor = bg.map(() =>
            bg[0]
        );

        // Highlight target
        this.chart.data.datasets[0].backgroundColor[index] = `${highlightColor}99`;
        this.chart.data.datasets[0].borderColor[index] = highlightColor;

        this.chart.update();

        // Reset after delay
        setTimeout(() => {
            this.chart.data.datasets[0].borderColor = bg.map((_, i) =>
                border[i] === highlightColor ? color : border[i]
            );
            this.chart.update();
        }, 1500);
    }

    /**
     * Reset chart appearance
     */
    reset() {
        if (!this.chart) return;
        this.chart.data.datasets[0].backgroundColor = 'rgba(0, 229, 255, 0.6)';
        this.chart.data.datasets[0].borderColor = '#00e5ff';
        this.chart.update();
    }

    /**
     * Dispose chart
     */
    dispose() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Export singleton instance
const chartManager = new ChartManager();