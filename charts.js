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

	// Calculate line of best fit
	function calculateLinearRegression(x, y) {
		const n = x.length;
		const sumX = x.reduce((a, b) => a + b, 0);
		const sumY = y.reduce((a, b) => a + b, 0);
		const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
		const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

		const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
		const intercept = (sumY - slope * sumX) / n;

		return { slope, intercept };
	}

	// Convert dates to numeric values for regression calculation
	const numericX = dates.map((_, index) => index);
	const { slope, intercept } = calculateLinearRegression(numericX, weights);

	// Generate trend line data
	const trendLineData = numericX.map((x) => slope * x + intercept);

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
					label: "Trend",
					data: trendLineData,
					borderColor: "#ef4444",
					backgroundColor: "transparent",
					borderWidth: 2,
					borderDash: [5, 5],
					fill: false,
					tension: 0,
					pointRadius: 0,
					pointHoverRadius: 0,
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

	// Calculate line of best fit
	function calculateLinearRegression(x, y) {
		const n = x.length;
		const sumX = x.reduce((a, b) => a + b, 0);
		const sumY = y.reduce((a, b) => a + b, 0);
		const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
		const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

		const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
		const intercept = (sumY - slope * sumX) / n;

		return { slope, intercept };
	}

	// Convert dates to numeric values for regression calculation
	const numericX = dates.map((_, index) => index);
	const { slope, intercept } = calculateLinearRegression(numericX, weights);

	// Generate trend line data
	const trendLineData = numericX.map((x) => slope * x + intercept);

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
					label: "Trend",
					data: trendLineData,
					borderColor: "#ef4444",
					backgroundColor: "transparent",
					borderWidth: 2,
					borderDash: [5, 5],
					fill: false,
					tension: 0,
					pointRadius: 0,
					pointHoverRadius: 0,
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

	// Calculate line of best fit
	function calculateLinearRegression(x, y) {
		const n = x.length;
		const sumX = x.reduce((a, b) => a + b, 0);
		const sumY = y.reduce((a, b) => a + b, 0);
		const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
		const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

		const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
		const intercept = (sumY - slope * sumX) / n;

		return { slope, intercept };
	}

	// Convert dates to numeric values for regression calculation
	const numericX = dates.map((_, index) => index);
	const { slope, intercept } = calculateLinearRegression(numericX, reps);

	// Generate trend line data
	const trendLineData = numericX.map((x) => slope * x + intercept);

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
					label: "Trend",
					data: trendLineData,
					borderColor: "#ef4444",
					backgroundColor: "transparent",
					borderWidth: 2,
					borderDash: [5, 5], // Dashed line
					fill: false,
					tension: 0,
					pointRadius: 0, // Hide points on trend line
					pointHoverRadius: 0,
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
					display: true, // Changed to show legend for trend line
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
