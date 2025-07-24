import {
	getExerciseWeightsHistory,
	get1RMHistory,
	getExerciseSessionVolumeHistory,
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
	console.log(get1RMHistory("Chest Press (Machine)"));

	const workoutCountElement = document.createElement("p");
	workoutCountElement.textContent = `Workout count: ${workouts.length}`;
	document.body.appendChild(workoutCountElement);
}
