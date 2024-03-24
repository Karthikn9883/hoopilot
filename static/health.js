document.addEventListener('DOMContentLoaded', () => {
    fetchHealthData();
    checkForStress();
    document.getElementById('goalForm').addEventListener('submit', handleGoalSubmit);
    document.getElementById('exerciseForm').addEventListener('submit', handleExerciseSubmit);
    document.getElementById('healthDataForm').addEventListener('submit', handleHealthDataSubmit);
    toggleGoalSpecificFields();
    //displayWorkoutHistory();
    document.getElementById('resetWorkoutHistory').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset your workout history? This action cannot be undone.')) {
            resetWorkoutHistory();
        }
    });
});



function fetchHealthData() {
    const healthData = getMockHealthData();
    compareHealthData(healthData);
}

function getMockHealthData() {
    return {
        sleepData: { today: 8, historical: [7, 7.5, 6, 8, 7] },
        heartRate: { today: 70, historical: [72, 68, 75, 71, 69] },
        activityLevel: { today: 12000, historical: [11500, 11000, 13000, 12500, 12000] },
    };
}

function compareHealthData(data) {
    const healthStatsElement = document.getElementById('healthStats');
    const summaries = [];

    // Existing warnings
    if (data.sleepData.today < 6 || data.sleepData.today > 9) {
        summaries.push("<div><strong style='color: red;'>Warning: Your sleep is out of the recommended range (6-9 hours).</strong></div>");
    }
    if (data.heartRate.today < 40 || data.heartRate.today > 125) {
        summaries.push("<div><strong style='color: red;'>Warning: Your heart rate is out of the recommended range (40-125 bpm).</strong></div>");
    }
    if (data.activityLevel.today < 8000) {
        summaries.push("<div><strong style='color: red;'>Warning: Your activity levels is under the recommended amount (8000).</strong></div>");
    }

    // Updated calls to generateUserFriendlyMessage to include recommended min/max
    summaries.push(
        generateUserFriendlyMessage('sleep', data.sleepData.today, average(data.sleepData.historical), 'hours', 6, 9), // Updated
        generateUserFriendlyMessage('heart rate', data.heartRate.today, average(data.heartRate.historical), 'bpm', 40, 125), // Updated
        generateUserFriendlyMessage('activity level', data.activityLevel.today, average(data.activityLevel.historical), 'steps', 8000, 15000) // Assuming 8000-15000 as the range
    );

    healthStatsElement.innerHTML = summaries.join('');
}


function generateUserFriendlyMessage(metricName, todayValue, historicalAverage, unit, recommendedMin, recommendedMax) {
    let message = `Today's ${metricName}: <strong>${todayValue} ${unit}</strong>. `;

    // Check if today's value is outside the recommended range
    if (todayValue < recommendedMin || todayValue > recommendedMax) {
        message += `You are a little bit off of the recommended average. In order to maintain a healthy lifestyle, you should aim to ${todayValue < recommendedMin ? 'increase' : 'decrease'} your ${metricName} within the expected range (${recommendedMin}-${recommendedMax} ${unit}). `;
    } else {
        // Handle the case when today's value is within the recommended range
        const difference = todayValue - historicalAverage;
        if (difference > 0) {
            message += `You've surpassed your average by ${Math.abs(difference).toFixed(2)} ${unit}. Keep up the great work! `;
        } else if (difference < 0) {
            message += `You're a bit below your average by ${Math.abs(difference).toFixed(2)} ${unit}. No worries, every day is a new opportunity to reach your goals! `;
        } else {
            message += `You're exactly on point with your average. Consistency is key, and you're doing fantastic! `;
        }
    }

    switch (metricName) {
        case 'sleep':
            message += `Getting a good night's sleep is crucial for your health and well-being.`;
            break;
        case 'heart rate':
            message += `Monitoring your heart rate can help you understand your fitness level and health status.`;
            break;
        case 'activity level':
            message += `Staying active is important for maintaining your health and achieving your fitness goals.`;
            break;
    }

    return `<div>${message}</div>`;
}


function average(arr) {
    return (arr.reduce((acc, curr) => acc + curr, 0) / arr.length).toFixed(2);
}

function checkForStress() {
    const healthData = getMockHealthData();
    if (healthData.heartRate.today > 100) {
        displayStressPopup();
    }
}

function displayStressPopup() {
    const popupMessage = `
        <div id="stressPopup" style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); background-color: white; padding: 20px; border: 2px solid #007bff; border-radius: 5px; z-index: 100;">
            <h2>Take a Moment to Relax 🧘‍♂️</h2>
            <p>Your heart rate is a bit high, which might indicate stress. Consider taking a short break to meditate or do some deep breathing exercises. Remember, taking care of your mental health is as important as your physical health.</p>
            <button onclick="closeStressPopup()">Okay, Got It</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupMessage);
}

function handleGoalSubmit(event) {
    event.preventDefault();
    // Adapted for direct display without localStorage use
    const goalType = document.getElementById('goalType').value;

    if (goalType === 'weightLoss') {
        const currentWeight = parseFloat(document.getElementById('currentWeight').value);
        const weightGoal = parseFloat(document.getElementById('weightGoal').value);
        displayWeightLossProgress(currentWeight, weightGoal);
    }
    // Add handling for other goal types as necessary
}

function saveWeightEntry(currentWeight) {
    let weightEntries = JSON.parse(localStorage.getItem('weightEntries')) || [];
    weightEntries.push(currentWeight);
    localStorage.setItem('weightEntries', JSON.stringify(weightEntries));
}

function displayWeightLossProgress(currentWeight, weightGoal) {
    // Adapted for direct display
    let progressMessage = `Current Weight: ${currentWeight} kg. Weight Goal: ${weightGoal} kg.`;
    const remaining = currentWeight - weightGoal;

    if (remaining <= 0) {
        progressMessage += " Congratulations! You've reached your weight loss goal!";
    } else {
        progressMessage += ` Keep going! You have ${remaining} kg to reach your goal.`;
    }

    displayPopup("Weight Loss Progress", progressMessage);
}

function displayPopup(title, message, htmlContent = '') {
    const popupHtml = `
        <div style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); background-color: white; padding: 20px; border: 2px solid #007bff; border-radius: 5px; z-index: 100; overflow-y: auto; max-height: 80vh;">
            <h2>${title}</h2>
            <p>${message}</p>
            <div style="max-height: 200px; overflow-y: auto;">${htmlContent}</div>
            <button onclick="this.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHtml);
}

function toggleGoalSpecificFields() {
    const goalTypeSelection = document.getElementById('goalType').value;
    const weightLossFields = document.getElementById('weightLossFields');
    const exerciseLogging = document.getElementById('exerciseLogging');

    weightLossFields.style.display = 'none';
    exerciseLogging.style.display = 'none';

    if (goalTypeSelection === 'weightLoss') {
        weightLossFields.style.display = 'block';
    } else if (goalTypeSelection === 'gainStrength') {
        exerciseLogging.style.display = 'block';
    }
}


function fetchHealthStatsMessages() {
    // Example messages, adjusted to ensure proper HTML formatting
    const messages = [
        "Today's sleep: 8 hours. Awesome! You've surpassed your average by 0.90 hours. Keep up the great work! Getting a good night's sleep is crucial for your health and well-being.",
        "Today's heart rate: 70 bpm. You're a bit below your average by 1.00 bpm. No worries, every day is a new opportunity to reach your goals! Monitoring your heart rate can help you understand your fitness level and health status.",
        "Today's activity level: 12000 steps. You're exactly on point with your average. Consistency is key, and you're doing fantastic! Staying active is important for maintaining your health and achieving your fitness goals."
    ].join('<br>');

    return messages;
}

function handleExerciseSubmit(event) {
    event.preventDefault();
    const exerciseType = document.getElementById('exerciseType').value;
    const weightLifted = parseFloat(document.getElementById('weightLifted').value);
    const repsDone = parseInt(document.getElementById('repsDone').value);

    logExercise(exerciseType, weightLifted, repsDone);
}

function saveWorkoutData(exerciseType, weight, reps) {
    const workoutLog = JSON.parse(localStorage.getItem('workoutLog')) || [];
    workoutLog.push({ exerciseType, weight, reps, date: new Date().toISOString() });
    localStorage.setItem('workoutLog', JSON.stringify(workoutLog));
}

function displayExerciseProgress(exerciseType) {
    const workoutLog = JSON.parse(localStorage.getItem('workoutLog')) || [];
    console.log("Workout Log:", workoutLog); // Debug: Check the retrieved workout log
    const exerciseLog = workoutLog.filter(workout => workout.exerciseType === exerciseType);

    console.log(`Filtered Log for ${exerciseType}:`, exerciseLog); // Debug: Inspect filtered log

    if (exerciseLog.length > 0) {
        const latestWorkout = exerciseLog[exerciseLog.length - 1];
        console.log(`Latest Workout for ${exerciseType}:`, latestWorkout); // Debug: Show latest workout details

        // Calculate the maximum weight lifted for the exerciseType
        const maxWeightLifted = Math.max(...exerciseLog.map(workout => parseFloat(workout.weight)));
        console.log(`Max Weight Lifted for ${exerciseType}: ${maxWeightLifted}kg`); // Debug: Log max weight lifted

        // Prepare the progress message
        const progressMessage = `Great job! You last did ${latestWorkout.reps} reps of ${latestWorkout.weight}kg in ${exerciseType}.`;

        // Check if the latest workout weight matches the max weight lifted
        if (parseFloat(latestWorkout.weight) === maxWeightLifted) {
            console.log('Displaying strength achievement popup'); // Debug: Confirming popup display logic
            displayStrengthAchievementPopup(exerciseType, latestWorkout.weight, progressMessage);
        } else {
            document.getElementById('exerciseFeedback').innerHTML = progressMessage;
        }
    } else {
        document.getElementById('exerciseFeedback').innerHTML = "No recent workout found for this exercise. Keep going!";
    }
}


function logExercise(exerciseType, weightLifted, repsDone) {
    let workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
    const newLog = {
        date: new Date().toISOString(),
        exerciseType,
        weightLifted,
        repsDone
    };
    workoutLogs.push(newLog);
    localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
    displayWorkoutHistory(); // Refresh workout history display
    analyzeProgress(exerciseType, workoutLogs); // Analyze progress based on the new log
}


function displayLoggedWorkouts() {
    const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
    const workoutsContainer = document.getElementById('loggedWorkouts'); // Make sure you have a div with this ID in your HTML

    // Clear previous entries to avoid duplication
    workoutsContainer.innerHTML = '';

    workoutLogs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.textContent = `On ${new Date(log.date).toLocaleDateString()} you did ${log.exerciseType}, lifting ${log.weightLifted} kg for ${log.repsDone} reps.`;
        workoutsContainer.appendChild(logEntry);
    });
}

function displayStrengthAchievementPopup(exerciseType, weight, additionalMessage) {
    const popupMessage = `
        <div id="strengthPopup" style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); background-color: white; padding: 20px; border: 2px solid #007bff; border-radius: 5px; z-index: 100;">
            <h2>New Personal Best in ${exerciseType}!</h2>
            <p>You've lifted ${weight} kg! This is your new personal best. Keep pushing your limits!</p>
            <p>${additionalMessage}</p>
            <button onclick="closePopup('strengthPopup')">Okay, Got It</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupMessage);
}

function closePopup(popupId) {
    const popupElement = document.getElementById(popupId);
    if (popupElement) {
        popupElement.remove();
    }
}

function displayWorkoutLoggedPopup(workout) {
    const message = `You've just logged a workout: ${workout.repsDone} reps of ${workout.weightLifted}kg ${workout.exerciseType}. Keep up the great work!`;
    displayPopup("Workout Logged", message);
}

function displayWorkoutHistory() {
    // Fetch the workout logs from localStorage
    const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || [];

    // Start building the table HTML
    let tableHTML = '<table><tr><th>Weight Lifted (kg)</th><th>Reps</th></tr>';

    // Loop through the workout logs and add each as a row in the table
    workoutLogs.forEach(log => {
        tableHTML += `<tr><td>${log.weightLifted}</td><td>${log.repsDone}</td></tr>`;
    });

    // Close the table tag
    tableHTML += '</table>';

    // Insert the table into the 'workoutHistory' div
    document.getElementById('workoutHistory').innerHTML = tableHTML;
}


function analyzeProgress(exerciseType, workoutLogs, lastNLogs = 50) {
    const exerciseLogs = workoutLogs.filter(log => log.exerciseType === exerciseType);
    const overallAvgWeight = calculateAverage(exerciseLogs.map(log => log.weightLifted));
    const recentLogs = exerciseLogs.slice(-lastNLogs);
    const recentAvgWeight = calculateAverage(recentLogs.map(log => log.weightLifted));

    let progressMessage;
    if (recentAvgWeight > overallAvgWeight) {
        progressMessage = `You've improved! Your recent average weight lifted for ${exerciseType} is ${recentAvgWeight}kg, above your overall average of ${overallAvgWeight}kg.`;
    } else if (recentAvgWeight < overallAvgWeight) {
        progressMessage = `Keep pushing! Your recent average weight lifted for ${exerciseType} is ${recentAvgWeight}kg, below your overall average of ${overallAvgWeight}kg.`;
    } else {
        progressMessage = `You're consistent! Your recent weight lifting matches your overall average of ${overallAvgWeight}kg for ${exerciseType}.`;
    }

    // Generate the workout history table HTML
    const workoutHistoryTableHtml = generateWorkoutHistoryTable(workoutLogs.slice(-lastNLogs));

    // Call displayPopup with the progress message and the workout history table
    displayPopup("Workout Progress", progressMessage, workoutHistoryTableHtml);
}


function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, curr) => acc + parseFloat(curr), 0);
    return (sum / numbers.length).toFixed(2); // Formats the average to two decimal places.
}

function handleHealthDataSubmit(event) {
    event.preventDefault();
    
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const heartRate = parseInt(document.getElementById('heartRate').value);
    const activityLevel = parseInt(document.getElementById('activityLevel').value);
    
    const healthData = {
        sleepData: { today: sleepHours, historical: [] }, // Historical data can be left empty for now
        heartRate: { today: heartRate, historical: [] },
        activityLevel: { today: activityLevel, historical: [] }
    };
    
    compareHealthData(healthData);
}

function generateWorkoutHistoryTable(workoutLogs) {
    let tableHtml = '<table><tr><th>Weight Lifted (kg)</th><th>Reps</th></tr>';
    workoutLogs.forEach(log => {
        tableHtml += `<tr><td>${log.weightLifted}</td><td>${log.repsDone}</td></tr>`;
    });
    tableHtml += '</table>';
    return tableHtml;
}

function resetWorkoutHistory() {
    // Clear the workout logs from localStorage
    localStorage.removeItem('workoutLogs');
    
    // Optionally, clear the workout history display on the page
    document.getElementById('workoutHistory').innerHTML = '';
    
    // Display a message or perform any additional actions needed after reset
    alert('Workout history has been reset.');
}

