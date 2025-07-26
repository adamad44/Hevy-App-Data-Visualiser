import { listOfExerciseNames, listOfExercises, workouts } from "./parser.js";

export function getHighestWeightPR(exerciseObj) {
	let highestWeight = 0;

	exerciseObj.history.forEach((entry) => {
		if (entry.weight_kg && !isNaN(entry.weight_kg)) {
			highestWeight = Math.max(highestWeight, parseFloat(entry.weight_kg));
		}
	});

	return highestWeight;
}

export function getTimesOfDays() {
	let times = [];
	workouts.forEach((workout) => {
		times.push(workout[0].start_time);
	});

	return times;
}

export function getAvgWorkoutDuration() {
	if (!workouts || workouts.length === 0) return 0;

	let totalDuration = 0;
	let validSessions = 0;

	workouts.forEach((workout) => {
		const start = new Date(workout[0].start_time);
		const end = new Date(workout[0].end_time);

		if (!isNaN(start) && !isNaN(end)) {
			const durationMinutes = (end - start) / (1000 * 60);
			if (durationMinutes > 0) {
				totalDuration += durationMinutes;
				validSessions++;
			}
		}
	});

	if (validSessions === 0) return 0;

	const averageDuration = totalDuration / validSessions;
	return Math.round(averageDuration);
}

export function getAvgRepRange() {
	let allReps = [];
	if (!workouts || workouts.length === 0) return 0;
	workouts.forEach((workout) => {
		workout.forEach((set) => {
			allReps.push(Number(set.reps));
		});
	});

	const totalReps = allReps.reduce((sum, reps) => sum + reps, 0);
	const avgReps = totalReps / allReps.length;
	return Math.round(avgReps);
}

export function getAvgRepRangeList(exName) {
	let allReps = [];
	if (!workouts || workouts.length === 0) return 0;
	workouts.forEach((workout) => {
		workout.forEach((set) => {
			if (set.exercise_title === exName && set.set_type !== "warmup") {
				allReps.push({
					reps: Number(set.reps),
					date: set.start_time,
				});
			}
		});
	});
	return allReps;
}

export function getAvgTimeBetweenWorkouts() {
	if (!workouts || workouts.length <= 1) return 0;

	const workoutDates = workouts.map(
		(workout) => new Date(workout[0].start_time)
	);

	workoutDates.sort((a, b) => a - b);

	let totalDaysBetween = 0;
	let validIntervals = 0;

	for (let i = 1; i < workoutDates.length; i++) {
		const currentDate = workoutDates[i];
		const previousDate = workoutDates[i - 1];

		if (!isNaN(currentDate) && !isNaN(previousDate)) {
			const daysBetween = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
			if (daysBetween > 0) {
				totalDaysBetween += daysBetween;
				validIntervals++;
			}
		}
	}

	if (validIntervals === 0) return 0;

	const averageDays = totalDaysBetween / validIntervals;
	return Math.round(averageDays * 10) / 10;
}

export function getMostImprovedExercise() {
	let highestImprovementPercent = 0;
	let mostImprovedName = "";

	Object.keys(listOfExercises).forEach((exName) => {
		const hist = get1RMHistory(exName);

		const totalSets = listOfExercises[exName].history.length;
		if (totalSets < 10) return;

		hist.sort((a, b) => new Date(a.date) - new Date(b.date));

		if (hist.length > 1) {
			const firstWeight = hist[0].weight;
			const lastWeight = hist[hist.length - 1].weight;

			if (firstWeight > 0) {
				const improvementPercent = ((lastWeight - firstWeight) / firstWeight) * 100;

				if (improvementPercent > highestImprovementPercent) {
					highestImprovementPercent = improvementPercent;
					mostImprovedName = exName;
				}
			}
		}
	});

	return mostImprovedName;
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

export function getTotalVolume() {
	let totalVolume = 0;
	workouts.forEach((workout) => {
		workout.forEach((set) => {
			const setWeight = Number(set.weight_kg * set.reps);
			if (setWeight && setWeight !== NaN) {
				totalVolume += Math.round(setWeight);
			}
		});
	});
	return totalVolume;
}

export function getMostCommonExercise() {
	let listOfSetExercises = [];
	let maxCount = {
		name: "",
		count: 0,
	};
	workouts.forEach((workout) => {
		workout.forEach((set) => {
			listOfSetExercises.push(set.exercise_title);
		});
	});

	listOfExerciseNames.forEach((exercise) => {
		const count = listOfSetExercises.filter((item) => item === exercise).length;

		if (count > Number(maxCount.count)) {
			maxCount = {
				name: exercise,
				count: Number(count),
			};
		}
	});

	return maxCount.name;
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

export function calculateMovingAverage(data, windowSize = 5) {
	const movingAverages = [];

	for (let i = 0; i < data.length; i++) {
		const start = Math.max(0, i - Math.floor(windowSize / 2));
		const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
		const window = data.slice(start, end);
		const average = window.reduce((sum, val) => sum + val, 0) / window.length;
		movingAverages.push(average);
	}

	return movingAverages;
}
