export const options = {
  responsive: true,
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