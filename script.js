const fileInput = document.querySelector("#file-upload");

fileInput.addEventListener("change", handleFileUpload);

function handleFileUpload(e) {
	const file = e.target.files[0];
	if (!file || !file.name.toLowerCase().endsWith(".csv")) return;

	Papa.parse(file, {
		header: true,
		skipEmptyLines: true,
		complete: onCSVParsed,
	});
}
let workouts = [];
let listOfExercises = {};

function getHighestWeightPR(exerciseObj) {
	let highestWeight = 0;

	exerciseObj.history.forEach((entry) => {
		if (entry.weight_kg && !isNaN(entry.weight_kg)) {
			highestWeight = Math.max(highestWeight, parseFloat(entry.weight_kg));
		}
	});

	return highestWeight;
}

function getExerciseWeightsHistory(ExerciseName) {
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

function onCSVParsed(results) {
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
	// console.log(getExerciseWeightsHistory("Bench Press (Barbell)"));

	const workoutCountElement = document.createElement("p");
	workoutCountElement.textContent = `Workout count: ${workouts.length}`;
	document.body.appendChild(workoutCountElement);
}
