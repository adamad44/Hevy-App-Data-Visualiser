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

function getHighestWeight(exerciseObj) {
	let highestWeight = 0;

	exerciseObj.history.forEach((entry) => {
		if (entry.weight_kg && !isNaN(entry.weight_kg)) {
			highestWeight = Math.max(highestWeight, parseFloat(entry.weight_kg));
		}
	});

	return highestWeight;
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

	const workoutCountElement = document.createElement("p");
	workoutCountElement.textContent = `Workout count: ${workouts.length}`;
	document.body.appendChild(workoutCountElement);
}
