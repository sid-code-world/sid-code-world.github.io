document.addEventListener("DOMContentLoaded", function () {
    const rocket = document.querySelector(".rocket");
    const speedDisplay = document.getElementById("speed-display");
    const heightDisplay = document.getElementById("height-display");
    const minirocket = document.getElementById("minirocket");
    const atmosphereMilestone = document.getElementById("atmosphere-milestone");
    const spaceMilestone = document.getElementById("space-milestone");
    let rocketSpeed = 0;
    const gravity = 9.81;
    let rocketLaunched = false;
    let timeElapsed = 0;
    const timeStep = 0.1;
    let launchButton;
    let fuelInput;
    let addFuelButton;
    let massInput;
    let changeMassButton;
    let resetButton;

    // Properties of the Rocket
    let rocketProperties = {
        currentMass: 100,
        fuel: 1000,
    };

    let interval;

    launchButton = document.getElementById("launch-button");
    fuelInput = document.getElementById("fuel-input");
    addFuelButton = document.getElementById("add-fuel-button");
    massInput = document.getElementById("mass-input");
    changeMassButton = document.getElementById("change-mass-button");
    resetButton = document.getElementById("reset-button");
    launchButton.addEventListener("click", function () {
        if (!rocketLaunched) {
            const objectMass = rocketProperties.currentMass;

            interval = setInterval(function () {
                const thrustAcceleration = calculateThrustAcceleration();
                rocketSpeed += thrustAcceleration * timeStep;
                timeElapsed += timeStep;

                const newBottom = parseFloat(rocket.style.bottom) + (rocketSpeed * timeStep);

                if (newBottom < 0) {
                    newBottom = 0;
                } else if (newBottom > 280) {
                    newBottom = 280;
                }

                rocket.style.bottom = newBottom + "px";
                speedDisplay.textContent = `Rocket speed: ${rocketSpeed.toFixed(2)} m/s`;

                // Calculate height and update milestones
                const height = calculateHeight();
                updateMilestones(height);

                if (rocketProperties.fuel <= 0 || newBottom >= 280) {
                    clearInterval(interval);
                    resetRocket();

                    // Calculate and print the maximum height
                    const maxPossibleHeight = calculateMaxPossibleHeight();
                    if (maxPossibleHeight > 110000) {
                        console.log("Success");
                    }
                    if(maxPossibleHeight < 110000){
                        console.log("Fail");
                    }
                }
            }, timeStep * 1000);

            rocketLaunched = true;
        }
    });

    resetButton.addEventListener("click", function () {
        resetRocket();
    });

    function resetRocket() {
        if (rocketLaunched) {
            clearInterval(interval);
            rocketLaunched = false;
        }

        rocket.style.bottom = "0";
        speedDisplay.textContent = "Rocket speed: 0 m/s";
        heightDisplay.textContent = "Rocket height: 0 m";
        minirocket.style.bottom = "0"; // Reset minirocket position
        rocketSpeed = 0;
        timeElapsed = 0;
    }

    addFuelButton.addEventListener("click", function () {
        const fuelAmount = parseFloat(fuelInput.value);
        if (!isNaN(fuelAmount) && fuelAmount > 0) {
            collectFuel(fuelAmount);
            fuelInput.value = "";
        }
    });

    changeMassButton.addEventListener("click", function () {
        const newMass = parseFloat(massInput.value);
        if (!isNaN(newMass) && newMass > 0) {
            changeRocketMass(newMass);
            massInput.value = "";
        }
    });

    function calculateThrustAcceleration() {
        const maxThrust = 40;
        const fuelBurnRate = 5;
        const currentFuel = rocketProperties.fuel;
        const currentMass = rocketProperties.currentMass;

        const thrust = Math.min(maxThrust, fuelBurnRate * currentFuel);
        const thrustAcceleration = thrust / currentMass;

        rocketProperties.fuel -= (thrust / fuelBurnRate);

        return thrustAcceleration;
    }

    function collectFuel(fuelAmount) {
        rocketProperties.fuel += fuelAmount;
    }

    function changeRocketMass(newMass) {
        rocketProperties.currentMass = newMass;
    }

    function calculateHeight() {
        const height = rocketSpeed * timeElapsed + 0.5 * gravity * timeElapsed * timeElapsed;
        heightDisplay.textContent = `Rocket height: ${Math.abs(height).toFixed(2)} m`;
        return height;
    }

    function calculateMaxPossibleHeight() {
        const maxThrust = 40;
        const fuelBurnRate = 5;
        const currentFuel = rocketProperties.fuel;
        const currentMass = rocketProperties.currentMass;

        // Calculate the maximum height using the rocket equation
        const maxPossibleHeight = (currentFuel / fuelBurnRate) * (maxThrust / currentMass) +
            (currentFuel / fuelBurnRate) * (currentFuel / (2 * currentMass)) * gravity;

        return maxPossibleHeight;
        console.log(maxPossibleHeight);
    }

    function updateMilestones(height) {
        const atmosphereHeight = 80000; // 80 km
        const spaceHeight = 100000; // 100 km

        if (height >= atmosphereHeight) {
            atmosphereMilestone.textContent = "Earth's Atmosphere (80 km)";
        } else {
            atmosphereMilestone.textContent = "";
        }

        if (height >= spaceHeight) {
            spaceMilestone.textContent = "Space (100 km)";
        } else {
            spaceMilestone.textContent = "";
        }

        minirocket.style.bottom = (height / spaceHeight) * 100 + "%";
    }
});
