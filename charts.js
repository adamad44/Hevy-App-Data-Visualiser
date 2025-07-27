import {
	getHighestWeightPR,
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
	calculateMovingAverage,
	getDaysOfWeekWorkoutWeighted,
} from "./calculations.js";
import { workouts } from "./parser.js";

export async function render1RMCharts(exerciseName) {
	const history = get1RMHistory(exerciseName);
	history.sort((a, b) => new Date(a.date) - new Date(b.date));
	let dates = [];
	let weights = [];

	history.forEach((obj) => {
		dates.push(obj.date);
		weights.push(obj.weight);
	});

	const movingAverageData = calculateMovingAverage(weights, 10);

	const chartContainer = document.createElement("div");
	chartContainer.className = "chart-container";

	const chartCanvas = document.createElement("canvas");
	chartCanvas.className = "chart-1rm";
	chartCanvas.id = `chart-${exerciseName}`;

	chartContainer.appendChild(chartCanvas);

	const chartsContainer = document.getElementById("charts-container");
	chartsContainer.appendChild(chartContainer);

	const ctx = document.getElementById(`chart-${exerciseName}`);

	new Chart(ctx, {
		type: "line",
		data: {
			labels: dates,
			datasets: [
				{
					label: "1RM",
					data: weights,
					borderColor: "#3b82f6",
					backgroundColor: "rgba(59, 130, 246, 0.1)",
					borderWidth: 2,
					fill: true,
					tension: 0.2,
				},
				{
					label: "Moving Average",
					data: movingAverageData,
					borderColor: "#ef4444",
					backgroundColor: "transparent",
					borderWidth: 2,
					fill: false,
					tension: 0.3,
					pointRadius: 0,
					pointHoverRadius: 4,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: `1RM Progress for ${exerciseName}`,
					font: {
						size: 18,
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
						display: true,
						text: "Weight (kg)",
						font: {
							size: 14,
							weight: "bold",
						},
						color: "#f4f4f4ff",
					},
					grid: {
						color: "rgba(156, 163, 175, 0.2)",
					},
					ticks: {
						color: "#ffffffff",
						font: {
							size: 12,
						},
					},
				},
			},
			interaction: {
				intersect: false,
				mode: "index",
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
}

export async function renderHeaviestWeightCharts(exerciseName) {
	const history = getExerciseWeightsHistory(exerciseName);
	history.sort((a, b) => new Date(a.date) - new Date(b.date));
	let dates = [];
	let weights = [];

	history.forEach((obj) => {
		dates.push(obj.date);
		weights.push(obj.weight);
	});

	const movingAverageData = calculateMovingAverage(weights, 10);

	const chartContainer = document.createElement("div");
	chartContainer.className = "chart-container";

	const chartCanvas = document.createElement("canvas");
	chartCanvas.className = "chart-1rm";
	chartCanvas.id = `chart-weight-${exerciseName}`;

	chartContainer.appendChild(chartCanvas);

	const chartsContainer = document.getElementById("charts-container");
	chartsContainer.appendChild(chartContainer);

	const ctx = document.getElementById(`chart-weight-${exerciseName}`);

	new Chart(ctx, {
		type: "line",
		data: {
			labels: dates,
			datasets: [
				{
					label: "weight",
					data: weights,
					borderColor: "#3b82f6",
					backgroundColor: "rgba(59, 130, 246, 0.1)",
					borderWidth: 2,
					fill: true,
					tension: 0.2,
				},
				{
					label: "Moving Average",
					data: movingAverageData,
					borderColor: "#ef4444",
					backgroundColor: "transparent",
					borderWidth: 2,
					fill: false,
					tension: 0.3,
					pointRadius: 0,
					pointHoverRadius: 4,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: `Weight Progress for ${exerciseName}`,
					font: {
						size: 18,
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
						display: true,
						text: "Weight (kg)",
						font: {
							size: 14,
							weight: "bold",
						},
						color: "#f4f4f4ff",
					},
					grid: {
						color: "rgba(156, 163, 175, 0.2)",
					},
					ticks: {
						color: "#ffffffff",
						font: {
							size: 12,
						},
					},
				},
			},
			interaction: {
				intersect: false,
				mode: "index",
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
}

export async function renderRepsCharts(exerciseName) {
	const history = getAvgRepRangeList(exerciseName);
	history.sort((a, b) => new Date(a.date) - new Date(b.date));
	let dates = [];
	let reps = [];

	history.forEach((obj) => {
		dates.push(obj.date);
		reps.push(obj.reps);
	});

	const movingAverageData = calculateMovingAverage(reps, 20);

	const chartContainer = document.createElement("div");
	chartContainer.className = "chart-container";

	const chartCanvas = document.createElement("canvas");
	chartCanvas.className = "chart-1rm";
	chartCanvas.id = `chart-reps-${exerciseName}`;

	chartContainer.appendChild(chartCanvas);

	const chartsContainer = document.getElementById("charts-container");
	chartsContainer.appendChild(chartContainer);

	const ctx = document.getElementById(`chart-reps-${exerciseName}`);

	new Chart(ctx, {
		type: "line",
		data: {
			labels: dates,
			datasets: [
				{
					label: "reps",
					data: reps,
					borderColor: "#3b82f6",
					backgroundColor: "rgba(59, 130, 246, 0.1)",
					borderWidth: 2,
					fill: true,
					tension: 0.2,
				},
				{
					label: "Moving Average",
					data: movingAverageData,
					borderColor: "#ef4444",
					backgroundColor: "transparent",
					borderWidth: 2,
					fill: false,
					tension: 0.3,
					pointRadius: 0,
					pointHoverRadius: 4,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: `reps/set for ${exerciseName}`,
					font: {
						size: 18,
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
						display: true,
						text: "reps",
						font: {
							size: 14,
							weight: "bold",
						},
						color: "#f4f4f4ff",
					},
					grid: {
						color: "rgba(156, 163, 175, 0.2)",
					},
					ticks: {
						color: "#ffffffff",
						font: {
							size: 12,
						},
					},
				},
			},
			interaction: {
				intersect: false,
				mode: "index",
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

	new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Number of Workouts",
					data: hourCounts,
					backgroundColor: "rgba(59, 130, 246, 0.5)",
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
					text: "Workout Frequency by Hour",
					font: { size: 18, weight: "bold" },
					color: "#ffffffff",
					padding: 20,
				},
				legend: {
					display: false,
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: "Frequency (Number of Workouts)",
						font: { size: 14, weight: "bold" },
						color: "#f4f4f4ff",
					},
					grid: {
						color: "rgba(156, 163, 175, 0.2)",
					},
					ticks: {
						color: "#ffffffff",
						font: { size: 12 },
					},
				},
				x: {
					title: {
						display: true,
						text: "Hour of Day",
						font: { size: 14, weight: "bold" },
						color: "#f4f4f4ff",
					},
					grid: {
						display: false,
					},
					ticks: {
						color: "#ffffffff",
						font: { size: 12 },
						maxRotation: 60,
						minRotation: 60,
					},
				},
			},
		},
	});
}

export async function renderVolumeChart() {
	let workoutVolumes = [];
	workouts.forEach((workout) => {
		let workoutVolume = 0;
		let date = "";
		workout.forEach((set) => {
			if (set.reps && set.weight_kg) {
				workoutVolume += set.reps * set.weight_kg;
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

	const movingAverageData = calculateMovingAverage(volumes, 20);

	chartContainer.appendChild(chartCanvas);

	const chartsContainer = document.getElementById("charts-container");
	chartsContainer.appendChild(chartContainer);

	const ctx = document.getElementById(`chart-volumes`);

	new Chart(ctx, {
		type: "line",
		data: {
			labels: dates,
			datasets: [
				{
					label: "volume (KG)",
					data: volumes,
					borderColor: "#3b82f6",
					backgroundColor: "rgba(59, 130, 246, 0.1)",
					borderWidth: 1,
					fill: true,
					tension: 0.2,
				},
				{
					label: "Moving Average",
					data: movingAverageData,
					borderColor: "#ef4444",
					backgroundColor: "transparent",
					borderWidth: 2,
					fill: false,
					tension: 0.3,
					pointRadius: 0,
					pointHoverRadius: 4,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: `volume/workout`,
					font: {
						size: 18,
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
						display: true,
						text: "volume (KG)",
						font: {
							size: 14,
							weight: "bold",
						},
						color: "#f4f4f4ff",
					},
					grid: {
						color: "rgba(156, 163, 175, 0.2)",
					},
					ticks: {
						color: "#ffffffff",
						font: {
							size: 12,
						},
					},
				},
			},
			interaction: {
				intersect: false,
				mode: "index",
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

	new Chart(ctx, {
		type: "bar",
		data: {
			labels: days,
			datasets: [
				{
					label: "Number of Workouts",
					data: workoutCounts,
					backgroundColor: "rgba(59, 130, 246, 0.5)",
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
					text: "Workout Frequency by day of week",
					font: { size: 18, weight: "bold" },
					color: "#ffffffff",
					padding: 20,
				},
				legend: {
					display: false,
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: "Frequency (Number of Workouts)",
						font: { size: 14, weight: "bold" },
						color: "#f4f4f4ff",
					},
					grid: {
						color: "rgba(156, 163, 175, 0.2)",
					},
					ticks: {
						color: "#ffffffff",
						font: { size: 12 },
					},
				},
				x: {
					title: {
						display: true,
						text: "Day",
						font: { size: 18, weight: "bold" },
						color: "#f4f4f4ff",
					},
					grid: {
						display: false,
					},
					ticks: {
						color: "#ffffffff",
						font: { size: 12 },
						maxRotation: 60,
						minRotation: 60,
					},
				},
			},
		},
	});
}
