import { workouts } from "./parser.js";

export function getHighestWeightPR(exerciseObj) {
	let highestWeight = 0;

	exerciseObj.history.forEach((entry) => {
		if (entry.weight_kg && !isNaN(entry.weight_kg)) {
			highestWeight = Math.max(highestWeight, parseFloat(entry.weight_kg));
		}
	});

	return highestWeight;
}

export function getExerciseWeightsHistory(ExerciseName) {
	let weightHistory = [];

	let highestWeight = 0;
	let date = "";
	workouts.forEach((workout) => {
		date = "";
		highestWeight = 0;
		workout.forEach((set) => {
			if (set.exercise_title === ExerciseName && set.set_type !== "warmup") {
				if (set.weight_kg > highestWeight) highestWeight = Number(set.weight_kg);
				date = set.start_time;
			}
		});

		if (date.trim() !== "" && highestWeight !== 0) {
			weightHistory.push({
				weight: highestWeight,
				date: date,
			});
		}
	});

	return weightHistory;
}

export function estimate1RM(weight, reps) {
	if (reps <= 1) return weight;
	return weight * (1 + reps / 30);
}

export function get1RMHistory(exerciseName) {
	let history1RM = [];

	let highest1RM = 0;
	let date = "";
	workouts.forEach((workout) => {
		date = "";
		highest1RM = 0;
		workout.forEach((set) => {
			if (set.exercise_title === exerciseName && set.set_type !== "warmup") {
				const currentSet1RM = estimate1RM(set.weight_kg, set.reps);
				if (currentSet1RM > highest1RM) highest1RM = currentSet1RM;
				date = set.start_time;
			}
		});

		if (date.trim() !== "" && highest1RM !== 0) {
			const rounded1RM = isNaN(highest1RM)
				? 0
				: Number(parseFloat(highest1RM).toFixed(2));

			history1RM.push({
				weight: rounded1RM,
				date: String(date),
			});
		}
	});
	return history1RM;
}

export function getExerciseSessionVolumeHistory(exerciseName) {
	let volHistory = [];

	workouts.forEach((workout) => {
		let cumulativeVolForSession = 0;
		let date = "";
		workout.forEach((set) => {
			if (set.exercise_title === exerciseName && set.set_type !== "warmup") {
				cumulativeVolForSession += set.weight_kg * set.reps;
				date = set.start_time;
			}
		});

		if (date.trim() !== "" && cumulativeVolForSession !== 0) {
			volHistory.push({
				weight: cumulativeVolForSession,
				date: String(date),
			});
		}
	});
	return volHistory;
}
