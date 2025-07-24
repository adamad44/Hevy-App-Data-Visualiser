import {
	getExerciseWeightsHistory,
	get1RMHistory,
	getExerciseSessionVolumeHistory,
	getAvgWorkoutDuration,
	getAvgRepRange,
	getAvgTimeBetweenWorkouts,
	getMostImprovedExercise,
} from "./calculations.js";

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

	const accountStatsElement = document.querySelector("#account-stats-container");

	stats.forEach((stat) => {
		const p = document.createElement("p");
		p.textContent = `${stat.label}: ${stat.value}`;
		accountStatsElement.appendChild(p);
	});
}
