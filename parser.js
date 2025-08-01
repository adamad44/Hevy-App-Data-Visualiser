import {
  getExerciseWeightsHistory,
  get1RMHistory,
  getExerciseSessionVolumeHistory,
  getAvgWorkoutDuration,
  getAvgRepRange,
  getAvgTimeBetweenWorkouts,
  getMostImprovedExercise,
  getAvgRepRangeList,
  getTimesOfDays,
  getTotalVolume,
  getMostCommonExercise,
  getDaysOfWeekWorkoutWeighted,
  getAvgVolumePerWorkout,
  getSetCountsByMuscleGroup,
  getConsistencyHistoryData,
} from "./calculations.js";

import {
  render1RMCharts,
  renderHeaviestWeightCharts,
  renderWorkoutTimeBarChart,
  renderRepsCharts,
  renderVolumeChart,
  renderWorkoutDayOfWeekBarChart,
  renderMuscleGroupChart,
  renderConsistencyChart,
  renderMuscleGroupOverTimeChart,
} from "./charts.js";

export let listOfExerciseNames = [];
export let workouts = [];
export let listOfExercises = {};
export let weightUnit = "kg"; // Default unit
export let isUsingLbs = false;

export function onCSVParsed(results) {
  const rows = results.data;

  // Detect weight unit from CSV headers
  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    if (headers.includes("weight_lbs")) {
      weightUnit = "lbs";
      isUsingLbs = true;
    } else if (headers.includes("weight_kg")) {
      weightUnit = "kg";
      isUsingLbs = false;
    }
  }

  let temp = [];

  rows.forEach((row, index) => {
    // Normalize weight to kg for internal calculations
    let normalizedRow = { ...row };
    if (isUsingLbs && row.weight_lbs) {
      normalizedRow.weight_kg = (parseFloat(row.weight_lbs) / 2.20462).toFixed(
        2
      );
    } else if (!isUsingLbs && row.weight_kg) {
      normalizedRow.weight_kg = row.weight_kg;
    }

    temp.push(normalizedRow);

    if (
      index === rows.length - 1 ||
      row.start_time !== rows[index + 1].start_time
    ) {
      workouts.push([...temp]);
      temp = [];
    }

    if (!(row.exercise_title in listOfExercises)) {
      listOfExercises[row.exercise_title] = {
        name: row.exercise_title,
        history: [],
      };
    }

    listOfExercises[row.exercise_title].history.push(normalizedRow);
  });

  listOfExerciseNames = Object.keys(listOfExercises);
  const stats = [
    { label: "Workout count", value: workouts.length },
    {
      label: "Avg workout duration",
      value: `${getAvgWorkoutDuration()} minutes`,
    },
    { label: "Avg reps per set", value: getAvgRepRange() },
    {
      label: "Avg time between workouts",
      value: `${getAvgTimeBetweenWorkouts()} days`,
    },
    {
      label: "Most improved exercise",
      value: getMostImprovedExercise(),
    },
    {
      label: "Total volume",
      value: `${getTotalVolume().toLocaleString()} ${getVolumeUnit()}`,
    },
    {
      label: "Most common exercise",
      value: `${getMostCommonExercise()}`,
    },
    {
      label: "Avg volume/workout",
      value: `${getAvgVolumePerWorkout()} ${getVolumeUnit()}`,
    },
  ];

  populateExerciseDropdown();

  document.getElementById("exercise-selector-container").style.display =
    "block";
  document.getElementById("time-period-selector-container").style.display =
    "block";

  const accountStatsElement = document.getElementById(
    "account-stats-container"
  );
  stats.forEach((stat) => {
    const p = document.createElement("p");
    p.textContent = `${stat.label}: ${stat.value}`;
    accountStatsElement.appendChild(p);
  });
  renderWorkoutTimeBarChart();
  renderWorkoutDayOfWeekBarChart();
  renderVolumeChart();
  renderMuscleGroupChart();
  renderConsistencyChart();
  renderMuscleGroupOverTimeChart();
}

function populateExerciseDropdown() {
  const select = document.getElementById("exercise-select");
  const selectTime = document.getElementById("time-select");

  select.innerHTML = '<option value="">Choose an exercise...</option>';

  listOfExerciseNames.forEach((exerciseName) => {
    const option = document.createElement("option");
    option.value = exerciseName;
    option.textContent = exerciseName;
    select.appendChild(option);
  });

  selectTime.addEventListener("change", handleExerciseSelection);
  select.addEventListener("change", handleExerciseSelection);
}

function handleExerciseSelection(event) {
  const selectedExercise = document.getElementById("exercise-select").value;
  const selectedTimeFrame = document.getElementById("time-select").value;

  if (selectedExercise && selectedTimeFrame) {
    const chartsContainer = document.getElementById("charts-container");
    chartsContainer.innerHTML = "";

    render1RMCharts(selectedExercise, selectedTimeFrame);
    renderHeaviestWeightCharts(selectedExercise, selectedTimeFrame);
    renderRepsCharts(selectedExercise, selectedTimeFrame);
    renderWorkoutTimeBarChart();
    renderWorkoutDayOfWeekBarChart();
    renderVolumeChart();
  }
}

// Helper function to get display weight
export function getDisplayWeight(weightKg) {
  if (isUsingLbs) {
    return (parseFloat(weightKg) * 2.20462).toFixed(1);
  }
  return parseFloat(weightKg).toFixed(1);
}

// Helper function to get weight unit for display
export function getWeightUnit() {
  return weightUnit;
}

// Helper function to get volume unit for display
export function getVolumeUnit() {
  return isUsingLbs ? "lbs" : "KG";
}
