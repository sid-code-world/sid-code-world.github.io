document.addEventListener("DOMContentLoaded", function () {
    const rocket = document.querySelector(".rocket");
    const speedDisplay = document.getElementById("speed-display");
    let rocketSpeed = 0;
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

    let interval; // Higher scope

    launchButton = document.getElementById("launch-button");
    fuelInput = document.getElementById("fuel-input");
    addFuelButton = document.getElementById("add-fuel-button");
    massInput = document.getElementById("mass-input");
    changeMassButton = document.getElementById("change-mass-button");
    resetButton = document.getElementById("reset-button");

    launchButton.addEventListener("click", function () {
        if (!rocketLaunched) {
            const thrustAcceleration = calculateThrustAcceleration();
            const objectMass = rocketProperties.currentMass;

            interval = setInterval(function () {
                rocketSpeed += thrustAcceleration * timeStep;
                timeElapsed += timeStep;

                const newBottom = parseFloat(rocket.style.bottom) + (rocketSpeed * timeStep);
                rocket.style.bottom = newBottom + "px";
                speedDisplay.textContent = `Rocket speed: ${rocketSpeed.toFixed(2)} m/s`;

                if (rocketProperties.fuel <= 0 || newBottom >= window.innerHeight) {
                    clearInterval(interval);
                    resetRocket();
                }
            }, timeStep * 1000);

            rocketLaunched = true; // Set rocketLaunched to true
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

    resetButton.addEventListener("click", function () {
        resetRocket();
    });

    function calculateThrustAcceleration() {
        return 20;
    }

    function collectFuel(fuelAmount) {
        rocketProperties.fuel += fuelAmount;
    }

    function changeRocketMass(newMass) {
        rocketProperties.currentMass = newMass;
    }

    function resetRocket() {
        rocket.style.bottom = "0";
        rocketLaunched = false;
        speedDisplay.textContent = "Rocket speed: 0 m/s";
    }


    function updateMiniRocketPosition(rocketPosition) {
        const scaleHeight = document.querySelector('.scale').offsetHeight;
        const rocketMini = document.querySelector('.rocket-mini');
        const newPosition = (rocketPosition / scaleHeight) * 100; // Adjust as needed
        rocketMini.style.bottom = newPosition + '%';
    }

});
