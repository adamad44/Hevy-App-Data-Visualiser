import {
  getAvgWorkoutDuration,
  getAvgRepRange,
  getAvgTimeBetweenWorkouts,
  getMostImprovedExercise,
  getExerciseWeightsHistory,
  estimate1RM,
  get1RMHistory,
  getExerciseSessionVolumeHistory,
  getAvgRepRangeList,
  getTimesOfDays,
  calculateMovingAverage,
  getDaysOfWeekWorkoutWeighted,
  getSetCountsByMuscleGroup,
  getConsistencyHistoryData,
  getSetCountsByMuscleGroupOverTime,
} from "./calculations.js";
import { workouts } from "./parser.js";

export async function render1RMCharts(exerciseName, timeFrame) {
  let selectedFrame = "all time";
  let history = get1RMHistory(exerciseName);
  history.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (timeFrame !== "all") {
    const today = new Date();
    let startDate;
    if (timeFrame === "90") {
      selectedFrame = "past 90 days";
      startDate = new Date(today.setDate(today.getDate() - 90));
    } else if (timeFrame === "365") {
      selectedFrame = "past year";
      startDate = new Date(today.setDate(today.getDate() - 365));
    }
    history = history.filter((item) => new Date(item.date) >= startDate);
  }

  let dates = [];
  let weights = [];

  history.forEach((obj) => {
    dates.push(obj.date);
    weights.push(obj.weight);
  });

  const movingAverageData = calculateMovingAverage(weights, 10);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.className = "chart-1rm";
  chartCanvas.id = `chart-${exerciseName}`;

  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById(`chart-${exerciseName}`);

  const maxIndex = weights.indexOf(Math.max(...weights));
  const pointBackgroundColors = weights.map((_, i) =>
    i === maxIndex && timeFrame === "all" ? "rgba(239, 68, 68, 0.8)" : "#3b82f6"
  );
  const pointBorderColors = weights.map((_, i) =>
    i === maxIndex && timeFrame === "all" ? "#ef4444" : "#0b70ebff"
  );

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "1RM",
          data: weights,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Moving Average",
          data: movingAverageData,
          borderColor: "#ef4444",
          backgroundColor: "transparent",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `1RM Progress for ${exerciseName} (${selectedFrame})`,
          font: {
            size: 18,
            weight: "bold",
          },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: true,
          labels: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Weight (kg)",
            font: {
              size: 14,
              weight: "bold",
            },
            color: "#f4f4f4ff",
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: "#3b82f6",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        line: {
          borderWidth: 2,
        },
      },
    },
  });
}

export async function renderHeaviestWeightCharts(exerciseName, timeFrame) {
  let selectedFrame = "all time";
  const historyRaw = getExerciseWeightsHistory(exerciseName);
  let history = [...historyRaw];
  history.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (timeFrame !== "all") {
    const today = new Date();
    let startDate;
    if (timeFrame === "90") {
      selectedFrame = "past 90 days";
      startDate = new Date(today.setDate(today.getDate() - 90));
    } else if (timeFrame === "365") {
      selectedFrame = "past year";
      startDate = new Date(today.setDate(today.getDate() - 365));
    }
    history = history.filter((item) => new Date(item.date) >= startDate);
  }

  let dates = [];
  let weights = [];
  history.forEach((obj) => {
    dates.push(obj.date);
    weights.push(obj.weight);
  });

  const movingAverageData = calculateMovingAverage(weights, 10);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.className = "chart-1rm";
  chartCanvas.id = `chart-weight-${exerciseName}`;

  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById(`chart-weight-${exerciseName}`);

  const maxIndex = weights.indexOf(Math.max(...weights));
  const pointBackgroundColors = weights.map((_, i) =>
    i === maxIndex && timeFrame === "all" ? "rgba(239, 68, 68, 0.8)" : "#3b82f6"
  );
  const pointBorderColors = weights.map((_, i) =>
    i === maxIndex && timeFrame === "all" ? "#ef4444" : "#0b70ebff"
  );

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "weight",
          data: weights,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Moving Average",
          data: movingAverageData,
          borderColor: "#ef4444",
          backgroundColor: "transparent",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Weight Progress for ${exerciseName} (${selectedFrame})`,
          font: {
            size: 18,
            weight: "bold",
          },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: true,
          labels: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Weight (kg)",
            font: {
              size: 14,
              weight: "bold",
            },
            color: "#f4f4f4ff",
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: "#3b82f6",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        line: {
          borderWidth: 2,
        },
      },
    },
  });
}

export async function renderRepsCharts(exerciseName, timeFrame) {
  let selectedFrame = "all time";
  const historyRaw = getAvgRepRangeList(exerciseName);
  let history = [...historyRaw];
  history.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (timeFrame !== "all") {
    const today = new Date();
    let startDate;
    if (timeFrame === "90") {
      selectedFrame = "past 90 days";
      startDate = new Date(today.setDate(today.getDate() - 90));
    } else if (timeFrame === "365") {
      selectedFrame = "past year";
      startDate = new Date(today.setDate(today.getDate() - 365));
    }
    history = history.filter((item) => new Date(item.date) >= startDate);
  }

  let dates = [];
  let reps = [];
  history.forEach((obj) => {
    dates.push(obj.date);
    reps.push(obj.reps);
  });

  const movingAverageData = calculateMovingAverage(reps, 20);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.className = "chart-1rm";
  chartCanvas.id = `chart-reps-${exerciseName}`;

  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById(`chart-reps-${exerciseName}`);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "reps",
          data: reps,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Moving Average",
          data: movingAverageData,
          borderColor: "#ef4444",
          backgroundColor: "transparent",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `reps/set for ${exerciseName} (${selectedFrame})`,
          font: {
            size: 18,
            weight: "bold",
          },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: true,
          labels: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "reps",
            font: {
              size: 14,
              weight: "bold",
            },
            color: "#f4f4f4ff",
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: "#3b82f6",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        line: {
          borderWidth: 2,
        },
      },
    },
  });
}
export async function renderWorkoutTimeBarChart() {
  const workoutTimes = getTimesOfDays();

  const hourCounts = Array(24).fill(0);

  workoutTimes.forEach((timeString) => {
    const date = new Date(timeString);
    if (!isNaN(date)) {
      const hour = date.getHours();
      hourCounts[hour]++;
    }
  });

  const labels = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  });

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-workout-times";
  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById("chart-workout-times");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Number of Workouts",
          data: hourCounts,
          backgroundColor: hourCounts.map(
            (count, i) =>
              i === hourCounts.indexOf(Math.max(...hourCounts))
                ? "rgba(239, 68, 68, 0.8)" // highlight color (red)
                : "rgba(59, 130, 246, 0.5)" // default color (blue)
          ),
          borderColor: "#3b82f6",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Workout Frequency by Hour`,
          font: { size: 18, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Frequency (Number of Workouts)",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
          },
        },
        x: {
          title: {
            display: true,
            text: "Hour of Day",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
      },
    },
  });
}

export async function renderVolumeChart() {
  let workoutVolumes = [];
  workouts.forEach((workout) => {
    let workoutVolume = 0;
    let date = "";
    workout.forEach((set) => {
      if (set.reps && set.weight_kg) {
        workoutVolume += set.reps * set.weight_kg;
        date = set.start_time;
      }
    });

    if (date.trim() !== "" && workoutVolume > 0) {
      workoutVolumes.push({
        volume: Math.round(workoutVolume),
        date: date,
      });
    }
  });

  workoutVolumes.sort((a, b) => new Date(a.date) - new Date(b.date));

  let dates = [];
  let volumes = [];

  workoutVolumes.forEach((obj) => {
    if (obj.volume !== 0) {
      dates.push(obj.date);
      volumes.push(obj.volume);
    }
  });

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.className = "chart-volumes";
  chartCanvas.id = `chart-volumes`;

  const movingAverageData = calculateMovingAverage(volumes, 20);

  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById(`chart-volumes`);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "volume (KG)",
          data: volumes,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 1,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Moving Average",
          data: movingAverageData,
          borderColor: "#ef4444",
          backgroundColor: "transparent",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `volume/workout`,
          font: {
            size: 18,
            weight: "bold",
          },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: true,
          labels: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "volume (KG)",
            font: {
              size: 14,
              weight: "bold",
            },
            color: "#f4f4f4ff",
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: {
              size: 12,
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: "#3b82f6",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        line: {
          borderWidth: 2,
        },
      },
    },
  });
}

export async function renderWorkoutDayOfWeekBarChart() {
  const mainData = getDaysOfWeekWorkoutWeighted();
  let workoutCounts = [];
  let days = [];

  mainData.forEach((obj) => {
    workoutCounts.push(obj.count);
    days.push(obj.day);
  });

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-workout-days";
  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById("chart-workout-days");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [
        {
          label: "Number of Workouts",
          data: workoutCounts,
          backgroundColor: workoutCounts.map(
            (count, i) =>
              i === workoutCounts.indexOf(Math.max(...workoutCounts))
                ? "rgba(239, 68, 68, 0.8)" // highlight color (red)
                : "rgba(59, 130, 246, 0.5)" // default color (blue)
          ),
          borderColor: "#3b82f6",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Workout Frequency by day of week",
          font: { size: 18, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Frequency (Number of Workouts)",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
          },
        },
        x: {
          title: {
            display: true,
            text: "Day",
            font: { size: 18, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
      },
    },
  });
}

export async function renderMuscleGroupChart() {
  const muscleGroupData = getSetCountsByMuscleGroup();
  let muscleGroups = [];
  let setCounts = [];

  Object.entries(muscleGroupData).forEach(([group, count]) => {
    muscleGroups.push(group);
    setCounts.push(count);
  });

  const sortedData = muscleGroups
    .map((group, i) => ({ group, count: setCounts[i] }))
    .sort((a, b) => b.count - a.count);

  muscleGroups = sortedData.map((item) => item.group);
  setCounts = sortedData.map((item) => item.count);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-muscle-groups";
  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById("chart-muscle-groups");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: muscleGroups,
      datasets: [
        {
          label: "Sets Performed",
          data: setCounts,
          backgroundColor: setCounts.map(
            (_, i) =>
              i === 0
                ? "rgba(239, 68, 68, 0.8)" // highlight color (red)
                : "rgba(59, 130, 246, 0.5)" // default color (blue)
          ),
          borderColor: "#3b82f6",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Training Distribution by Muscle Group",
          font: { size: 18, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw} sets`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Sets",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
          },
        },
        x: {
          title: {
            display: true,
            text: "Muscle Group",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
      },
    },
  });
}

export async function renderConsistencyChart() {
  const monthsData = getConsistencyHistoryData();
  monthsData.sort((a, b) => new Date(a.month) - new Date(b.month));

  const months = monthsData.map((obj) => obj.month);
  const counts = monthsData.map((obj) => obj.count);
  const movingAvg = calculateMovingAverage(counts, 3);

  const performanceStatus = counts.map((count, i) =>
    i >= 3 && count > movingAvg[i] ? "above" : "below"
  );

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-consistency";
  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

  const ctx = document.getElementById("chart-consistency");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Workouts per Month",
          data: counts,
          backgroundColor: counts.map((count, i) => {
            if (i === counts.indexOf(Math.max(...counts))) {
              return "rgba(239, 68, 68, 0.8)";
            } else {
              return "#1459c8ff";
            }
          }),
          borderColor: counts.map((count, i) =>
            i >= 3 && count > movingAvg[i] ? "#0f9d43ff" : "#3b82f6"
          ),
          borderWidth: counts.map((count, i) =>
            i >= 3 && count > movingAvg[i] ? 2 : 1
          ),
          yAxisID: "y",
        },
        {
          label: "Moving Average",
          type: "line",
          data: movingAvg,
          borderColor: "#ef4444",
          backgroundColor: "transparent",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: "y",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Workout Consistency (Workouts per Month) (AVG: ${Math.round(
            avg
          )})`,
          font: { size: 18, weight: "bold" },
          color: "#ffffffff",
          padding: {
            top: 20,
            bottom: 5,
          },
        },
        subtitle: {
          display: true,
          text: "Keeping each bar above the moving average (green outline) ensures progression in consistency",
          color: "#dddddd",
          font: {
            size: 12,
            style: "italic",
          },
          padding: {
            bottom: 20,
          },
        },
        legend: {
          display: true,
          labels: {
            color: "#ffffffff",
            font: { size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.dataset.type === "line") {
                return `Moving Avg: ${context.raw.toFixed(2)}`;
              }

              const idx = context.dataIndex;
              const count = counts[idx];
              const movingAvgValue = movingAvg[idx];

              if (idx >= 3) {
                if (count > movingAvgValue) {
                  return [
                    `Workouts: ${count}`,
                    `Above average - Keep it up! 👍`,
                  ];
                } else {
                  return [
                    `Workouts: ${count}`,
                    `Below average - Try to do more! 💪`,
                  ];
                }
              }

              return `Workouts: ${count}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: { display: false },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
        y: {
          beginAtZero: true,
          max: 31,
          title: {
            display: true,
            text: "Number of Workouts",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: { color: "rgba(156, 163, 175, 0.2)" },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: "#3b82f6",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        line: {
          borderWidth: 2,
        },
      },
    },
  });
}
export async function renderMuscleGroupOverTimeChart() {
  const muscleGroupOverTimeData = getSetCountsByMuscleGroupOverTime();

  muscleGroupOverTimeData.sort((a, b) => new Date(a.month) - new Date(b.month));
  const months = muscleGroupOverTimeData.map((item) => item.month);

  const allMuscleGroups = [];
  muscleGroupOverTimeData.forEach((monthData) => {
    Object.keys(monthData.muscleGroups).forEach((muscleGroup) => {
      if (!allMuscleGroups.includes(muscleGroup)) {
        allMuscleGroups.push(muscleGroup);
      }
    });
  });

  // Define colors
  const colors = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(34, 197, 94, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(14, 165, 233, 0.8)",
    "rgba(251, 146, 60, 0.8)",
    "rgba(132, 204, 22, 0.8)",
    "rgba(156, 163, 175, 0.8)",
    "rgba(45, 212, 191, 0.8)",
    "rgba(139, 69, 19, 0.8)",
  ];

  // Create datasets for selected muscle groups
  const createDatasets = (selectedGroups) => {
    return allMuscleGroups
      .filter((group) => selectedGroups.includes(group))
      .map((muscleGroup, index) => {
        const data = muscleGroupOverTimeData.map(
          (monthData) => monthData.muscleGroups[muscleGroup]?.count || 0
        );

        return {
          label: muscleGroup,
          data: data,
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length].replace("0.8", "1"),
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        };
      });
  };

  // Chart container with fixed height
  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";
  chartContainer.style.position = "relative";
  chartContainer.style.height = "400px";
  chartContainer.style.marginBottom = "2rem";
  chartContainer.style.width = "100%";

  // Checkboxes
  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";
  checkboxContainer.style.marginBottom = "1rem";
  checkboxContainer.style.display = "flex";
  checkboxContainer.style.flexWrap = "wrap";
  checkboxContainer.style.gap = "8px";
  checkboxContainer.style.color = "#ffffff";

  allMuscleGroups.forEach((muscleGroup) => {
    const label = document.createElement("label");
    label.style.marginRight = "12px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.value = muscleGroup;

    checkbox.addEventListener("change", () => {
      const selectedGroups = Array.from(
        checkboxContainer.querySelectorAll("input:checked")
      ).map((cb) => cb.value);

      chart.data.datasets = createDatasets(selectedGroups);
      chart.update();
    });

    label.appendChild(checkbox);
    label.append(" " + muscleGroup);
    checkboxContainer.appendChild(label);
  });

  chartContainer.appendChild(checkboxContainer);

  // Create chart canvas
  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-muscle-groups-over-time";
  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = chartCanvas.getContext("2d");

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: createDatasets(allMuscleGroups),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Muscle Group Training Volume Over Time",
          font: { size: 18, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: true,
          labels: {
            color: "#ffffffff",
            font: { size: 10 },
            usePointStyle: true,
            pointStyle: "line",
          },
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw} sets`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: { display: false },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Sets",
            font: { size: 14, weight: "bold" },
            color: "#f4f4f4ff",
          },
          grid: { color: "rgba(156, 163, 175, 0.2)" },
          ticks: {
            color: "#ffffffff",
            font: { size: 12 },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 3,
          hoverRadius: 6,
          borderWidth: 2,
        },
        line: {
          borderWidth: 2,
        },
      },
    },
  });
}
