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
} from "./calculations.js";

export async function render1RMCharts(exerciseName) {
	const history = get1RMHistory(exerciseName);
	history.sort((a, b) => new Date(a.date) - new Date(b.date));
	let dates = [];
	let weights = [];

	history.forEach((obj) => {
		dates.push(obj.date);
		weights.push(obj.weight);
	});

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
					display: false,
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
