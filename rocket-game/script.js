document.addEventListener("DOMContentLoaded", function () {
    const rocket = document.querySelector(".rocket");
    const speedDisplay = document.getElementById("speed-display");
    const heightDisplay = document.getElementById("height-display");
    const fuelDisplay = document.getElementById("fuel-display");
    const massDisplay = document.getElementById("mass-display");
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

    fuelDisplay.textContent = `Fuel: ${rocketProperties.fuel}`;
    massDisplay.textContent = `Mass: ${rocketProperties.currentMass}`;

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
                    } else {
                        console.log("Fail");
                    }
                }
    
                // Update fuel display
                fuelDisplay.textContent = `Fuel: ${rocketProperties.fuel.toFixed(2)}`;
    
            }, timeStep * 1000);
    
            rocketLaunched = true;
    
            document.querySelector(".game-container").style.display = "none";
            document.querySelector(".rocket-container").style.display = "flex";
    
            // Position buttons at the top left
            launchButton.style.position = "absolute";
            resetButton.style.position = "absolute";
            launchButton.style.top = "10px";
            launchButton.style.left = "10px";
            resetButton.style.top = "40px";
            resetButton.style.left = "10px";
        }
    });
    
    const minStartingFuel = 1000;
    const minStartingMass = 100;

    addFuelButton.addEventListener("click", function () {
        const fuelAmount = parseFloat(fuelInput.value);
        if (!isNaN(fuelAmount) && fuelAmount > 0 && rocketProperties.fuel + fuelAmount >= minStartingFuel) {
            collectFuel(fuelAmount);
            fuelInput.value = "";
            fuelDisplay.textContent = `Fuel: ${rocketProperties.fuel.toFixed(2)}`;
        }
    });

    changeMassButton.addEventListener("click", function () {
        const newMass = parseFloat(massInput.value);
        if (!isNaN(newMass) && newMass > 0 && newMass <= rocketProperties.fuel && newMass >= minStartingMass) {
            changeRocketMass(newMass);
            massInput.value = "";
            massDisplay.textContent = `Mass: ${rocketProperties.currentMass.toFixed(2)}`;
        }
    });


    resetButton.addEventListener("click", function () {
        resetRocket();
        document.querySelector(".game-container").style.display = "flex";
        document.querySelector(".rocket-container").style.display = "none";
        launchButton.style.position = "static";
        resetButton.style.position = "static";
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
    
        // Reset fuel and mass values
        rocketProperties.fuel = 1000;
        rocketProperties.currentMass = 100;
    
        // Update fuel and mass displays
        fuelDisplay.textContent = `Fuel: ${rocketProperties.fuel.toFixed(2)}`;
        massDisplay.textContent = `Mass: ${rocketProperties.currentMass.toFixed(2)} kg`;


    }
    

    addFuelButton.addEventListener("click", function () {
        const fuelAmount = parseFloat(fuelInput.value);
        if (!isNaN(fuelAmount) && fuelAmount > 0 && rocketProperties.fuel + fuelAmount >= minStartingFuel) {
            collectFuel(fuelAmount);
            fuelInput.value = "";
            fuelDisplay.textContent = `Fuel: ${rocketProperties.fuel.toFixed(2)}`;
        }
    });

    changeMassButton.addEventListener("click", function () {
        const newMass = parseFloat(massInput.value);
        if (!isNaN(newMass) && newMass > 0 && newMass <= rocketProperties.fuel && newMass >= minStartingMass) {
            changeRocketMass(newMass);
            massInput.value = "";
            massDisplay.textContent = `Mass: ${rocketProperties.currentMass.toFixed(2)}`;
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
