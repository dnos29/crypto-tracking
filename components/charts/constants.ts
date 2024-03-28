export const options = {
  responsive: true,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      grid: {
        drawOnChartArea: false,
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: false,
      text: 'Line Chart',
    },
    tooltip: {
      intersect: false
    },
  },
};

export const presetColors = [
  {
    backgroundColor: 'rgba(20, 184, 166, 0.5)',
    borderColor: 'rgb(20, 184, 166)'
  },
  {
    backgroundColor: 'rgb(254, 202, 202, 0.5)',
    borderColor: 'rgb(254, 202, 202)'
  },
]