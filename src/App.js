import './App.css';
import React, {useEffect, useState} from 'react';

const StarDisplay = props => (
  <>
    {utils.range(1, props.count).map(starId =>
      <div key={starId} className="star"/>
      )}
  </>
);

const PlayNumber = props => (
  //this Onlcik is an example of js closure being take place. each function close over scope of
  // its ownwer number(PlayNumber) and give access to its props 9 different onclick handler that close over 9 different
  // closure scopes
  <button className="number" 
  style={{background: colors[props.status]}}
  onClick={() => props.onClick(props.number, props.status)}
  >
    {props.number}
  </button>
);

const PlayAgain = props => (
  <div className="game-done">
    <div 
    className='message'
    style={ {color: props.gameStatus === 'lost' ? 'red' : 'green'}}>
      {props.gameStatus === 'lost' ? 'Game Over' : 'Nice'}
    </div>
    <button onClick={props.onClick}>Play Again</button>
  </div>
);

// Custom Hook
const useGameState = () =>{
  const [stars, setStars] = useState(utils.random(1, 9));
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(10);

  // setTimeout
  useEffect(() => {
    if(secondsLeft > 0 && availableNums.length > 0){
      console.log('Rendered...');
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
    console.log('Done rendering');
    return () => console.log('Component is going to rerender');
  });

  const setGameState = (newCandidateNums) => {
    if(utils.sum(newCandidateNums) !== stars){
      setCandidateNums(newCandidateNums);
    }
    else{
      const newAvailableNums = availableNums.filter(
        n => !newCandidateNums.includes(n)
      );
      
      // redraw stars (from what's available)
      setStars(utils.randomSumIn(newAvailableNums, 9));
      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
    }
  };

  return {stars, availableNums, candidateNums, secondsLeft, setGameState};
};


const Game = (props) => {
   const{
      stars,
      availableNums,
      candidateNums,
      secondsLeft,
      setGameState,
    } = useGameState();

  const candidatesAreWrong = utils.sum(candidateNums) > stars;
 // const gameIsWon = availableNums.length === 0;
  //const gameIsLost = secondsLeft === 0;
  const gameStatus = availableNums.length === 0 
  ? 'won'
  : secondsLeft === 0 ? 'lost' : 'active';

  // const resetGame = () => {
  //   setStars(utils.random(1, 9));
  //   setAvailableNums(utils.range(1, 9));
  //   setCandidateNums([]);
  // }

  const numberStatus = (number) => {
    if(!availableNums.includes(number)){
      return 'used';
    }
    if(candidateNums.includes(number)){
      return candidatesAreWrong ? 'wrong': 'candidate';
    }
    return 'available';

  };

const onNumberClick = (number, currentStatus) => {
  // currentStatus => newStatus
  if(gameStatus !== 'active' || currentStatus == 'used'){
    return;
  }
  // candidateNums

  const newCandidateNums = 
    currentStatus === 'available'
      ? candidateNums.concat(number)
      : candidateNums.filter(cn => cn !== number);

  setGameState(newCandidateNums);

};

  return(
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {gameStatus !== 'active' ? (
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus}/>
          ): (
            <StarDisplay count={stars}/>
          )}
        </div>
        <div className="right">
          {utils.range(1, 9).map(num =>
            <PlayNumber 
            key={num} 
            status={numberStatus(num)}
            number = {num}
            onClick={onNumberClick}
            />
            )}
        </div>
      </div>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
}

const StarMatch = () => {
  const [gameId, setGameId] = useState(1);
  return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)}/>;
}

// Color Theme
const colors = {
  available: 'lightgray',
  used: 'lightgreen',
  wrong: 'lightcoral',
  candidate: 'deepskyblue',
};

// Math science
const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  },
};

export default StarMatch;
