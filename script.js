"use strict";

window.addEventListener("load", start);

let cannonBall = null;

function start() {
  console.log(`Started`);
  
  // Opret og tilføj kugler til visning
  test_createBalls();
  
  // Indlæs kanonen med en tilfældig kugle
  reloadCannon();
}

// A test-function to create six test-balls
// feel free to experiment with, or replace this function
// this is just for a demonstration ...
function test_createBalls() {
  addBallToChain(createBallElement(1));
  addBallToChain(createBallElement(2));
  addBallToChain(createBallElement(3));
  addBallToChain(createBallElement(4));
  addBallToChain(createBallElement(5));
  addBallToChain(createBallElement(6));
  addBallToChain(createBallElement(7));
}

function reloadCannon() {
  // loads the cannon with a random ball
  const balltype = Math.ceil(Math.random() * 6); 
  loadCannonWithBall(createBallElement(balltype));
}

function shootCannonBall() {
  const cannonBallRect = cannonBall.getBoundingClientRect();
  const firstBall = document.querySelector("#balls .ball");
  const firstBallRect = firstBall.getBoundingClientRect();

  const deltaX = firstBallRect.left - cannonBallRect.left;
  const deltaY = firstBallRect.top - cannonBallRect.top;

  cannonBall.style.setProperty('--delta-x', deltaX + 'px');
  cannonBall.style.setProperty('--delta-y', deltaY + 'px');

  cannonBall.addEventListener('animationend', function() {
    cannonBall.style.removeProperty('--delta-x');
    cannonBall.style.removeProperty('--delta-y');
    cannonBall.classList.remove('animate-from-cannon');
    firstBall.parentNode.insertBefore(cannonBall, firstBall);
    reloadCannon();
  });
}

function createBallElement(balltype) {
  const ball = document.createElement("div");
  ball.className = "ball";
  const img = document.createElement("img");
  img.src = `images/marble${balltype}.png`;
  img.dataset.balltype = balltype;
  ball.dataset.balltype = balltype;
  ball.appendChild(img);
  return ball;
}

function addBallToChain(ball) {
  // add ball to element
  document.querySelector("#balls").appendChild(ball);
  makeBallClickable(ball);
}

function removeBallsFromChain(balls) {
  balls.forEach(ball => {
    ball.classList.add("remove");
    // wait for next frame to start new animation
    requestAnimationFrame(() => ball.addEventListener("animationend", removeElement));
    function removeElement() {
      ball.removeEventListener("animationend", removeElement);
      ball.remove();
    }
  });
}

function makeBallClickable(ball) {
  // add eventlistener to click on ball
  ball.querySelector("img").addEventListener("click", clickBall);
}

function loadCannonWithBall(newCannonBall) {
  cannonBall = newCannonBall;
  document.querySelector("#cannon").appendChild(cannonBall);
}

function clickBall(event) {
  console.log('Clicked ball');

  const newBall = cannonBall;
  const existingBall = event.target.parentElement;
  const side = event.offsetX / event.target.offsetWidth < 0.5 ? "before" : "after";

  const cannonBallRect = cannonBall.getBoundingClientRect();

  if (side === "before") {
    existingBall.parentNode.insertBefore(cannonBall, existingBall);
  } else {
    existingBall.parentNode.insertBefore(cannonBall, existingBall.nextElementSibling)
  }

  const matches = findMatchesInModel();
  removeMatchesFromModel(matches);
  animateMatches(matches);

  const finalRect = cannonBall.getBoundingClientRect();
  const deltaWidth = cannonBallRect.width / finalRect.width;
  const deltaHeight = cannonBallRect.height / finalRect.height;

  cannonBall.style.setProperty('--delta-x', finalRect.left - cannonBallRect.left + 'px');
  cannonBall.style.setProperty('--delta-y', finalRect.top - cannonBallRect.top + 'px');
  cannonBall.style.setProperty('--delta-height', deltaHeight);
  cannonBall.style.setProperty('--delta-width', deltaWidth);

  cannonBall.classList.add('animate-from-cannon');

  cannonBall.addEventListener('animationend', animationComplete);

  function animationComplete() {
    cannonBall.removeEventListener('animationend', animationComplete);
    cannonBall.classList.remove('animate-from-cannon');
    cannonBall.style.removeProperty('--delta-x');
    cannonBall.style.removeProperty('--delta-y');

    // Make newBall clickable as well
    makeBallClickable(newBall);

    // Create new cannonball
    reloadCannon();
  }
}

function findMatchesInModel() {
const balls = document.querySelectorAll('.ball img');
const matches = [];

for (let i = 0; i < balls.length; i++) {
  const currentBall = balls[i];
  const nextBall = balls[i + 1];
  const nextNextBall = balls[i + 2];

  if (nextBall && nextNextBall) {
    if (currentBall.dataset.balltype === nextBall.dataset.balltype && currentBall.dataset.balltype === nextNextBall.dataset.balltype) {
      matches.push(currentBall.parentElement, nextNextBall.parentElement);
      i += 2;
    }
  }
}
return matches;
}

function removeMatchesFromModel(matches) {
  matches.forEach(match => {
    match.remove();
  })
}

function animateMatches(matches) {
  matches.forEach(match => {
    match.classList.add('remove')
  })
}

function updateViewWithoutMatches() {
  const balls = document.querySelectorAll('.ball');
  balls.forEach(ball => {
    ball.classList.remove('remove')
  });
}
