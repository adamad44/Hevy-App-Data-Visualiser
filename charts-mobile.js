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
  getDaysOfWeekWorkoutWeighted,
  getSetCountsByMuscleGroup,
  getConsistencyHistoryData,
  getSetCountsByMuscleGroupOverTime,
  mainPRCountLogic,
} from "./calculations.js";
import {
  workouts,
  getWeightUnit,
  getVolumeUnit,
  getDisplayWeight,
  sortMonths,
} from "./parser.js";

export async function renderChart(
  title,
  yLabel,
  lineLabel,
  xData,
  yData,
  exerciseName,
  timeFrame,
  hoverLabel,
  chartId = null
) {
  const dataPointsNumber = yData.length;

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.className = "chart-1rm";
  chartCanvas.id = chartId || `chart-${exerciseName}`;

  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById(chartCanvas.id);

  const maxIndex = yData.indexOf(Math.max(...yData));
  const pointBackgroundColors = yData.map((_, i) =>
    i === maxIndex && timeFrame === "all" ? "rgba(239, 68, 68, 0.8)" : "#3b82f6"
  );
  const pointBorderColors = yData.map((_, i) =>
    i === maxIndex && timeFrame === "all" ? "#ef4444" : "#0b70ebff"
  );

  const newChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xData,
      datasets: [
        {
          label: hoverLabel,
          data: yData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `${title} (${yLabel})`,
          font: {
            size: 14,
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
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
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
            display: false,
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: {
              size: 10,
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
        axis: "x",
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
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

  newChart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = newChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: false },
      false
    );
    if (elements.length > 0) {
      newChart.setActiveElements(elements);
      newChart.update("none");
    }
  });

  newChart.canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const elements = newChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: false },
      false
    );
    if (elements.length > 0) {
      newChart.setActiveElements(elements);
      newChart.update("none");
    }
  });

  newChart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    newChart.setActiveElements([]);
    newChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    newChart.update("none");
  });

  newChart.canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

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

  renderChart(
    `1RM for ${exerciseName} (${selectedFrame})`,
    `Weight (${getWeightUnit()})`,
    "1RM",
    dates,
    weights,
    exerciseName,
    timeFrame,
    "1RM"
  );
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

  renderChart(
    `Weight Progress for ${exerciseName} (${selectedFrame})`,
    `Weight (${getWeightUnit()})`,
    "Weight",
    dates,
    weights,
    exerciseName,
    timeFrame,
    "weight",
    `chart-weight-${exerciseName}`
  );
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

  renderChart(
    `Reps/set for ${exerciseName} (${selectedFrame})`,
    "Reps",
    "Reps per set",
    dates,
    reps,
    exerciseName,
    timeFrame,
    "reps",
    `chart-reps-${exerciseName}`
  );
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

  const workoutTimeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Number of Workouts",
          data: hourCounts,
          backgroundColor: hourCounts.map((count, i) =>
            i === hourCounts.indexOf(Math.max(...hourCounts))
              ? "rgba(239, 68, 68, 0.8)"
              : "rgba(59, 130, 246, 0.5)"
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
          text: `Workout Frequency by Hour (Number of Workouts)`,
          font: { size: 14, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
        },
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: false,
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
          },
        },
        x: {
          title: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
      },
    },
  });

  workoutTimeChart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = workoutTimeChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      workoutTimeChart.setActiveElements(elements);
      workoutTimeChart.update("none");
    }
  });

  workoutTimeChart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    workoutTimeChart.setActiveElements([]);
    workoutTimeChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    workoutTimeChart.update("none");
  });
}

export async function renderVolumeChart() {
  let workoutVolumes = [];
  workouts.forEach((workout) => {
    let workoutVolume = 0;
    let date = "";
    workout.forEach((set) => {
      if (set.reps && set.weight_kg) {
        const displayWeight = parseFloat(getDisplayWeight(set.weight_kg));
        workoutVolume += set.reps * displayWeight;
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

  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById(`chart-volumes`);

  const volumeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: `volume (${getVolumeUnit()})`,
          data: volumes,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 1,
          fill: true,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Volume/workout (${getVolumeUnit()})`,
          font: {
            size: 14,
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
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
        },
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
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
            display: false,
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: {
              size: 10,
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
        axis: "x",
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

  volumeChart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = volumeChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      volumeChart.setActiveElements(elements);
      volumeChart.update("none");
    }
  });

  volumeChart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    volumeChart.setActiveElements([]);
    volumeChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    volumeChart.update("none");
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

  const dayOfWeekChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [
        {
          label: "Number of Workouts",
          data: workoutCounts,
          backgroundColor: workoutCounts.map((count, i) =>
            i === workoutCounts.indexOf(Math.max(...workoutCounts))
              ? "rgba(239, 68, 68, 0.8)"
              : "rgba(59, 130, 246, 0.5)"
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
          text: "Workout Frequency by day of week (Number of Workouts)",
          font: { size: 14, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
        },
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: false,
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
          },
        },
        x: {
          title: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
      },
    },
  });

  dayOfWeekChart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = dayOfWeekChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      dayOfWeekChart.setActiveElements(elements);
      dayOfWeekChart.update("none");
    }
  });

  dayOfWeekChart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    dayOfWeekChart.setActiveElements([]);
    dayOfWeekChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    dayOfWeekChart.update("none");
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

  const muscleGroupChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: muscleGroups,
      datasets: [
        {
          label: "Sets Performed",
          data: setCounts,
          backgroundColor: setCounts.map((_, i) =>
            i === 0 ? "rgba(239, 68, 68, 0.8)" : "rgba(59, 130, 246, 0.5)"
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
          text: "Training Distribution by Muscle Group (Number of Sets)",
          font: { size: 14, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw} sets`;
            },
          },
        },
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: false,
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
          },
        },
        x: {
          title: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
      },
    },
  });

  muscleGroupChart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = muscleGroupChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      muscleGroupChart.setActiveElements(elements);
      muscleGroupChart.update("none");
    }
  });

  muscleGroupChart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    muscleGroupChart.setActiveElements([]);
    muscleGroupChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    muscleGroupChart.update("none");
  });
}

export async function renderConsistencyChart() {
  const monthsData = getConsistencyHistoryData();
  sortMonths(monthsData);

  const months = monthsData.map((obj) => obj.month);
  const counts = monthsData.map((obj) => obj.count);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-consistency";
  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

  const ctx = document.getElementById("chart-consistency");

  const consistencyChart = new Chart(ctx, {
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
          borderColor: "rgba(239, 68, 68, 0.8)",
          borderWidth: "rgba(239, 68, 68, 0.8)",
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
          text: `Workouts per Month (AVG: ${Math.round(
            avg
          )}) - Number of Workouts`,
          font: { size: 14, weight: "bold" },
          color: "#ffffffff",
          padding: {
            top: 20,
            bottom: 5,
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
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
          callbacks: {
            label: function (context) {
              const idx = context.dataIndex;
              const count = counts[idx];
              return `Workouts: ${count}`;
            },
          },
        },
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
      },
      scales: {
        x: {
          title: {
            display: false,
          },
          grid: { display: false },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
        y: {
          beginAtZero: true,
          max: 31,
          title: {
            display: false,
          },
          grid: { color: "rgba(156, 163, 175, 0.2)" },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
        axis: "x",
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

  consistencyChart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = consistencyChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      consistencyChart.setActiveElements(elements);
      consistencyChart.update("none");
    }
  });

  consistencyChart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    consistencyChart.setActiveElements([]);
    consistencyChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    consistencyChart.update("none");
  });
}

export async function renderPRCountChart() {
  const prData = mainPRCountLogic();

  prData.sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"));

  const months = prData.map((item) => item.month);
  const prCounts = prData.map((item) => item.prCount);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-pr-count";
  chartContainer.appendChild(chartCanvas);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById("chart-pr-count");

  const prCountChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Personal Records",
          data: prCounts,
          backgroundColor: prCounts.map((count, i) => {
            if (count === Math.max(...prCounts)) {
              return "rgba(34, 197, 94, 0.8)";
            } else if (count === 0) {
              return "rgba(239, 68, 68, 0.5)";
            } else {
              return "rgba(59, 130, 246, 0.7)";
            }
          }),
          borderColor: prCounts.map((count, i) => {
            if (count === Math.max(...prCounts)) {
              return "#22c55e";
            } else if (count === 0) {
              return "#ef4444";
            } else {
              return "#3b82f6";
            }
          }),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Personal Records Achieved Per Month (Number of PRs)",
          font: { size: 14, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
          callbacks: {
            label: function (context) {
              const count = context.raw;
              if (count === 0) {
                return "No PRs achieved this month";
              } else if (count === 1) {
                return "1 Personal Record";
              } else {
                return `${count} Personal Records`;
              }
            },
          },
        },
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: false,
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
            stepSize: 1,
          },
        },
        x: {
          title: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
            maxRotation: 60,
            minRotation: 60,
          },
        },
      },
    },
  });

  prCountChart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = prCountChart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: true },
      false
    );
    if (elements.length > 0) {
      prCountChart.setActiveElements(elements);
      prCountChart.update("none");
    }
  });

  prCountChart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    prCountChart.setActiveElements([]);
    prCountChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    prCountChart.update("none");
  });
}

export async function renderMuscleGroupOverTimeChart() {
  const muscleGroupOverTimeData = getSetCountsByMuscleGroupOverTime();

  sortMonths(muscleGroupOverTimeData);
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
  chartContainer.style.height = "460px";
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
    checkbox.checked = false;
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

  const chartWrapper = document.createElement("div");
  chartWrapper.style.height = "300px";
  chartWrapper.style.width = "100%";
  chartWrapper.style.position = "relative";

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "chart-muscle-groups-over-time";
  chartWrapper.appendChild(chartCanvas);
  chartContainer.appendChild(chartWrapper);

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.appendChild(chartContainer);

  const ctx = chartCanvas.getContext("2d");

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: createDatasets([]),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Muscle Groups Over Time (Sets)",
          font: { size: 14, weight: "bold" },
          color: "#ffffffff",
          padding: 20,
        },
        legend: {
          display: true,
          labels: {
            color: "#ffffffff",
            font: { size: 8 },
            usePointStyle: true,
            pointStyle: "line",
            boxWidth: 10,
            boxHeight: 2,
          },
          position: "top",
        },
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw} sets`;
            },
          },
        },
      },
      events: ["touchstart", "touchmove"],
      onHover: function (event, activeElements) {
        return;
      },
      scales: {
        x: {
          display: false,
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          title: {
            display: false,
          },
          grid: { color: "rgba(156, 163, 175, 0.2)" },
          ticks: {
            color: "#ffffffff",
            font: { size: 10 },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
        axis: "x",
      },
      elements: {
        point: {
          radius: 1,
          hoverRadius: 4,
          borderWidth: 1,
        },
        line: {
          borderWidth: 1.5,
        },
      },
    },
  });

  chart.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const elements = chart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: false },
      false
    );
    if (elements.length > 0) {
      chart.setActiveElements(elements);
      chart.update("none");
    }
  });

  chart.canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const elements = chart.getElementsAtEventForMode(
      e,
      "nearest",
      { intersect: false },
      false
    );
    if (elements.length > 0) {
      chart.setActiveElements(elements);
      chart.update("none");
    }
  });

  chart.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    chart.setActiveElements([]);
    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    chart.update("none");
  });

  chart.canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
