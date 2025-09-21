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
  mainPRCountLogic,
} from "./calculations.js";

import { loadChartsModule } from "./chart-loader.js";

export let listOfExerciseNames = [];
export let workouts = [];
export let listOfExercises = {};
export let weightUnit = "kg";
export let isUsingLbs = false;
let chartsModule;

export async function onCSVParsed(results) {
  if (!chartsModule) {
    chartsModule = await loadChartsModule();
  }

  document.getElementById("intro-title").style.display = "none";
  workouts = [];
  listOfExercises = {};
  listOfExerciseNames = [];

  const accountStatsElement = document.getElementById(
    "account-stats-container"
  );
  accountStatsElement.innerHTML = "";

  const chartsContainer = document.getElementById("charts-container");
  chartsContainer.innerHTML = "";

  const rows = results.data;

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

  stats.forEach((stat) => {
    const p = document.createElement("p");
    p.textContent = `${stat.label}: ${stat.value}`;
    accountStatsElement.appendChild(p);
  });
  chartsModule.renderWorkoutTimeBarChart();
  chartsModule.renderWorkoutDayOfWeekBarChart();
  chartsModule.renderVolumeChart();
  chartsModule.renderMuscleGroupChart();
  chartsModule.renderConsistencyChart();
  chartsModule.renderMuscleGroupOverTimeChart();
  chartsModule.renderPRCountChart();
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

async function handleExerciseSelection(event) {
  if (!chartsModule) {
    chartsModule = await loadChartsModule();
  }

  const selectedExercise = document.getElementById("exercise-select").value;
  const selectedTimeFrame = document.getElementById("time-select").value;

  if (selectedExercise && selectedTimeFrame) {
    const chartsContainer = document.getElementById("charts-container");
    chartsContainer.innerHTML = "";

    chartsModule.render1RMCharts(selectedExercise, selectedTimeFrame);
    chartsModule.renderHeaviestWeightCharts(
      selectedExercise,
      selectedTimeFrame
    );
    chartsModule.renderRepsCharts(selectedExercise, selectedTimeFrame);
    chartsModule.renderWorkoutTimeBarChart();
    chartsModule.renderWorkoutDayOfWeekBarChart();
    chartsModule.renderVolumeChart();
    chartsModule.renderMuscleGroupOverTimeChart();
    chartsModule.renderPRCountChart();
  }
}

export function getDisplayWeight(weightKg) {
  if (isUsingLbs) {
    return (parseFloat(weightKg) * 2.20462).toFixed(1);
  }
  return parseFloat(weightKg).toFixed(1);
}

export function getWeightUnit() {
  return weightUnit;
}

export function getVolumeUnit() {
  return isUsingLbs ? "lbs" : "KG";
}

export function sortMonths(monthsData) {
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  monthsData.sort((a, b) => {
    const [aMonth, aYear] = a.month.split(" ");
    const [bMonth, bYear] = b.month.split(" ");
    const aIdx = monthOrder.indexOf(aMonth);
    const bIdx = monthOrder.indexOf(bMonth);

    return new Date(aYear, aIdx) - new Date(bYear, bIdx);
  });
}
