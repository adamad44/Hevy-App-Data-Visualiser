import {
	getExerciseWeightsHistory,
	get1RMHistory,
	getExerciseSessionVolumeHistory,
	getAvgWorkoutDuration,
	getAvgRepRange,
	getAvgTimeBetweenWorkouts,
	getMostImprovedExercise,
} from "./calculations.js";

import { render1RMCharts } from "./charts.js";

export let listOfExerciseNames = [];
export let workouts = [];
export let listOfExercises = {};

export function onCSVParsed(results) {
	const rows = results.data;
	let temp = [];

	rows.forEach((row, index) => {
		temp.push(row);

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

		listOfExercises[row.exercise_title].history.push(row);
	});

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
	];

	listOfExerciseNames = Object.keys(listOfExercises);

	populateExerciseDropdown();

	document.getElementById("exercise-selector-container").style.display = "block";

	const accountStatsElement = document.querySelector("#account-stats-container");

	stats.forEach((stat) => {
		const p = document.createElement("p");
		p.textContent = `${stat.label}: ${stat.value}`;
		accountStatsElement.appendChild(p);
	});
}

function populateExerciseDropdown() {
	const select = document.getElementById("exercise-select");

	select.innerHTML = '<option value="">Choose an exercise...</option>';

	listOfExerciseNames.forEach((exerciseName) => {
		const option = document.createElement("option");
		option.value = exerciseName;
		option.textContent = exerciseName;
		select.appendChild(option);
	});

	select.addEventListener("change", handleExerciseSelection);
}

function handleExerciseSelection(event) {
	const selectedExercise = event.target.value;

	if (selectedExercise) {
		const chartsContainer = document.getElementById("charts-container");
		chartsContainer.innerHTML = "";

		render1RMCharts(selectedExercise);
	}
}
