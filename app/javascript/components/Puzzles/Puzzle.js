import React, {useState, useEffect, Fragment} from 'react'
import axios from 'axios'
import * as Input from '../functional/InputUtility'
import {useSelector, useDispatch} from 'react-redux'
import {useSpring, animated} from 'react-spring'
import BoardData from '../functional/BoardData'
import Board from '../Board/Board'
import styled from 'styled-components'
import ADD_TO_BOARD_SUCESSFUL from '../ActionCreators';
import sudokuStore from '../../store'
import { func } from 'prop-types'


const BOARD_WIDTH = 9;
const SQUARE_WIDTH = 3;
const BOARD_SQUARES = 81;
    const ColumnWrappers = styled.div`
      float:left;
      margin-left: 20px;
    `
    const SideBar = styled.div`
      width: 200px;

    `
    const PuzzleButton = styled.button`
      width: 100%;
      margin-top: 8px;
    `

    const Puzzle = (props) =>{
      console.log(`/api/v1${props.match.url}`)
      sudokuStore.dispatch(Input.fetchBoardData(`/api/v1${props.match.url}`));
      return (
          <PuzzleInner/>
      )
    }
    const PuzzleInner = (props) =>{
        const dispatch = useDispatch();
        const stateData = useSelector(state => state.boardDataReducer).data;
        const puzzleData = useSelector(state => state.puzzleDataReducer).puzzleData;

        const currentSelectionIndex = useSelector(state => state.selectionReducer).index;
        const solvePuzzleHandler = Input.solvePuzzle(stateData);           

        const handleKeyDown = (e) => {dispatch(Input.processKeyPress(e, stateData, currentSelectionIndex))};
        
        React.useEffect(() => {
            document.addEventListener('keydown',handleKeyDown)
            return function cleanup() {
              document.removeEventListener('keydown',handleKeyDown);
            };
          });

        
          const handleKeyUp = (event) => {
            document.addEventListener('keydown', handleKeyDown, {once: true});
          };
        
        
         return (
             <Fragment>
                <ColumnWrappers>
                  <Board/>  
                </ColumnWrappers>
                <ColumnWrappers>
                  <SideBar>
                    <h2>Rules</h2>
                    <p>{puzzleData}</p>
                    <PuzzleButton type="button" onClick = {()=>solvePuzzleHandler(stateData)} className="btn btn-primary" > Solve Puzzle</PuzzleButton>
                    <PuzzleButton type="button" onClick = {()=>solvePuzzleHandler(stateData)} className="btn btn-primary" > Reset Puzzle</PuzzleButton>

                  </SideBar>
                </ColumnWrappers>

             </Fragment>
         )
         }

export default Puzzle