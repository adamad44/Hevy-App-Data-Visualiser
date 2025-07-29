import { listOfExerciseNames, listOfExercises, workouts } from "./parser.js";
import { exerciseMuscleGroups } from "./assets/exercise-muscle-groups.js";

const muscleGroupData = exerciseMuscleGroups;

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

export function getSetCountsByMuscleGroup() {
  const setCounts = {};

  workouts.forEach((workout) => {
    workout.forEach((set) => {
      if (set.set_type === "warmup" || !set.exercise_title) {
        return;
      }

      const muscleGroup = muscleGroupData[set.exercise_title];

      if (muscleGroup) {
        if (!setCounts[muscleGroup]) {
          setCounts[muscleGroup] = 0;
        }
        setCounts[muscleGroup]++;
      }
    });
  });

  return setCounts;
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

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a[0].start_time) - new Date(b[0].start_time)
  );

  const daysBetween = [];
  for (let i = 1; i < sortedWorkouts.length; i++) {
    const prevWorkoutDate = new Date(sortedWorkouts[i - 1][0].start_time);
    const currentWorkoutDate = new Date(sortedWorkouts[i][0].start_time);

    if (!isNaN(prevWorkoutDate) && !isNaN(currentWorkoutDate)) {
      const diffDays =
        (currentWorkoutDate - prevWorkoutDate) / (1000 * 60 * 60 * 24);

      if (diffDays > 0) {
        daysBetween.push(diffDays);
      }
    }
  }

  if (daysBetween.length === 0) return 0;

  daysBetween.sort((a, b) => a - b);

  const midIndex = Math.floor(daysBetween.length / 2);

  let median;
  if (daysBetween.length % 2 === 0) {
    median = (daysBetween[midIndex - 1] + daysBetween[midIndex]) / 2;
  } else {
    median = daysBetween[midIndex];
  }

  return Math.round(median * 10) / 10;
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
        const improvementPercent =
          ((lastWeight - firstWeight) / firstWeight) * 100;

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
        if (set.weight_kg > highestWeight)
          highestWeight = Number(set.weight_kg);
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

export function getDaysOfWeekWorkoutWeighted() {
  let daysOfWeek = [
    {
      day: "monday",
      count: 0,
    },
    {
      day: "tuesday",
      count: 0,
    },
    {
      day: "wednesday",
      count: 0,
    },
    {
      day: "thursday",
      count: 0,
    },
    {
      day: "friday",
      count: 0,
    },
    {
      day: "saturday",
      count: 0,
    },
    {
      day: "sunday",
      count: 0,
    },
  ];
  workouts.forEach((workout) => {
    if (workout[0]) {
      const date = new Date(workout[0].start_time);
      const weekday = date
        .toLocaleDateString("en", { weekday: "long" })
        .toLowerCase();
      daysOfWeek.forEach((obj) => {
        if (obj.day === weekday) {
          obj.count += 1;
        }
      });
    }
  });
  return daysOfWeek;
}

export function getAvgVolumePerWorkout() {
  let volumes = [];
  workouts.forEach((workout) => {
    let workoutVolume = 0;
    workout.forEach((set) => {
      if (set.weight_kg && set.reps) {
        workoutVolume += set.weight_kg * set.reps;
      }
    });
    volumes.push(workoutVolume);
  });
  let totalVolume = 0;
  volumes.forEach((volume) => {
    totalVolume += volume;
  });

  const avgVolume = totalVolume / volumes.length;
  return Math.round(avgVolume);
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

export function getConsistencyHistoryData() {
  const monthCounts = {};

  // Step 1: Loop through all workouts ONCE.
  workouts.forEach((workout) => {
    const workoutDate = new Date(workout[0].start_time);

    // Create a consistent key for each month (e.g., "July 2025").
    const monthKey = workoutDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!monthCounts[monthKey]) {
      monthCounts[monthKey] = 1;
    } else {
      monthCounts[monthKey]++;
    }
  });

  const months = Object.keys(monthCounts).map((monthKey) => ({
    month: monthKey,
    count: monthCounts[monthKey],
  }));

  months.sort((a, b) => new Date(a.month) - new Date(b.month));

  return months;
}
