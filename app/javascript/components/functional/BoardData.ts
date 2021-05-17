import { string } from "prop-types";

const BOARD_WIDTH = 9;
const SQUARE_WIDTH = 3;
const BOARD_SQUARES = 81;
export interface ChangeOutput {
    type: string,
    index: number,
    number: number,
    blockers: number[], 
}
export interface HeapSolutionIteration {
        type: string,
        index: number,
        number: number,
}
export interface HeapEntry {
    numOptions: number
    index: number
}
export interface SolutionSteps {
    index: number,
    guessIndex: number,
    number: number,
    stepTaken: string,
    puzzleIsSolved: boolean

}
export interface Choices {
    index: number,
    guessIndex: number
}
export interface BoardObject {
    boardData: number[];
    confirmedSquares: boolean[];
    boardHeapIndex: number[];
    boardBlocks: number[][];
    boardNumOptions: number[];
    solveOrder: HeapEntry[];
    heapSize: number;
    puzzleRuleSet: string;
}
export interface puzzleSolution {

}
export default class BoardData{
    boardData: number[];
    confirmedSquares: boolean[];
    boardHeapIndex: number[];
    boardBlocks: number[][];
    boardNumOptions: number[];
    solveOrder: HeapEntry[];
    heapSize: number;
    puzzleRuleSet: string;
    constructor()
    {
        this.boardData = Array(BOARD_SQUARES).fill(-1)
        this.confirmedSquares = Array(BOARD_SQUARES).fill(false)

        this.boardHeapIndex  = Array(4*BOARD_SQUARES);
        this.boardBlocks = Array(BOARD_SQUARES).fill(0).map(row => Array(BOARD_WIDTH).fill(0));
        this.boardNumOptions = Array(4*BOARD_SQUARES).fill(9);
        this.heapSize = 4*BOARD_SQUARES;
        this.solveOrder = Array<HeapEntry>(4*BOARD_SQUARES).fill({numOptions: 9, index: 0})
        this.puzzleRuleSet = "Classic"
        for(let i=0; i<this.boardNumOptions.length; i++)
        {
            this.solveOrder[i] = {
                numOptions: 9,
                index: i,
            }
            this.boardHeapIndex[i] = i;
        }    
    }   
    //takes an array of numbers or empty squares and adds the correct number to the corresponding square
    addData(data: string[])
    {
        for(let i=0; i<BOARD_SQUARES; i++)
        {
            if(data[i]!== ".")
            {
                const number= +data[i]-1;
                const output = this.addEntry(i, number);
                if(output.type === "Success")
                {
                    this.confirmedSquares[i] = true;
                }
            }
        }    
    }

    addDataHash(boardObject: BoardObject)
    {
        this.boardData = boardObject.boardData
        this.confirmedSquares = boardObject.confirmedSquares
        this.boardHeapIndex  = boardObject.boardHeapIndex
        this.boardBlocks = boardObject.boardBlocks
        this.boardNumOptions = boardObject.boardNumOptions
        this.solveOrder = boardObject.solveOrder
        this.heapSize = boardObject.heapSize
        this.puzzleRuleSet = boardObject.puzzleRuleSet
    }
    
    //getters

    getNumberAtIndex(index: number): number
    {
        return this.boardData[index];
    }

    isPlacableClassicSudoku(currentIndex: number, currentNumber: number, testIndex: number, testNumber: number): boolean
    {
        var currentSquare = this.indexToSquare(currentIndex);
        var currentCol = this.indexToCol(currentIndex);
        var currentRow = this.indexToRow(currentIndex);

        var testSquare = this.indexToSquare(testIndex);
        var testCol = this.indexToCol(testIndex);
        var testtRow = this.indexToRow(testIndex);

        if(currentCol==testCol && currentNumber == testNumber)
        {
            return false;
        }
        if(currentRow==testtRow && currentNumber == testNumber)
        {
            return false;
        }
        if(currentSquare==testSquare && currentNumber == testNumber)
        {
            return false;
        }
        return true;

    }

    isPlaceableCrossSudoku(currentIndex: number, currentNumber: number, testIndex:number, testNumber:number)
    {
        if(!this.isPlacableClassicSudoku(currentIndex, currentNumber, testIndex, testNumber))
        {
            return false;
        }

        if(this.indexToCol(currentIndex)-this.indexToRow(currentIndex)===0 && this.indexToCol(testIndex)-this.indexToRow(testIndex)===0)//determines if both entries are on the up and right diagonal
        {
            return false;
        }
        
        if(this.indexToCol(currentIndex)-this.indexToRow(currentIndex)===0 && this.indexToCol(testIndex)-this.indexToRow(testIndex)===0)//determines if both entries are on the down and right diagonal
        {
            return false;
        }
        return true;

    }
    
    isPlacableMiracleSudoku(currentIndex: number, currentNumber: number, testIndex:number , testNumber:number): boolean
    {
        return false;
    }

    isPlacable(currentIndex: number, currentNumber: number, testIndex: number, testNumber: number)
    {
        switch(this.puzzleRuleSet){
            case "Classic":
                return this.isPlacableClassicSudoku(currentIndex, currentNumber, testIndex, testNumber);
                break;
            case "Cross":
                return this.isPlacableClassicSudoku(currentIndex, currentNumber, testIndex, testNumber);
                break;
            case "Miracle":
                return this.isPlacableClassicSudoku(currentIndex, currentNumber, testIndex, testNumber);
                break;
            default:
                return this.isPlacableClassicSudoku(currentIndex, currentNumber, testIndex, testNumber);
                break;
        }
    }

    //for a given index and number, returns if it conflicts with a given square based on current board state
    conflictOnBoard(index: number, number: number, targetIndex: number): boolean
    {
        return !this.isPlacable(index, number, targetIndex, this.boardData[targetIndex]);

    }

    addEntry(index: number, number: number):ChangeOutput
    {
        if(this.boardBlocks[index][number]>0)//placement not allowed on this square
        {
            let out: ChangeOutput =
            {
                type: "Failure",
                index: index,
                number: number,
                blockers: [],
            }
            for(let i=0; i<BOARD_SQUARES; i++)
            {
                if(this.conflictOnBoard(index, number, i))
                {
                    out.blockers.push(i)
                }

            }
            return out;
        }
        if(this.boardData[index]!==-1)
        {
            this.deleteEntry(index);
        }

        for(let i=0; i<BOARD_SQUARES; i++)
        {
            if(!this.isPlacable(index, number, i, number) && index!=i)
            {
                if(this.boardBlocks[i][number]==0)//we are adding the first blocking square for this index and number
                {
                    this.updateBoardNumOptions(i, -1);

                    var currentSquareIndex = this.getSquareHeapIndex(i, number);
                    var currentColIndex = this.getColHeapIndex(i, number);
                    var currentRowIndex = this.getRowHeapIndex(i, number);

                    this.updateBoardNumOptions(currentSquareIndex, -1);
                    this.updateBoardNumOptions(currentColIndex, -1);
                    this.updateBoardNumOptions(currentRowIndex, -1);
                }
                this.boardBlocks[i][number]++;//indicate new squares that now cannot be placed in
            }
        }

        var addedSquareIndex = this.getSquareHeapIndex(index, number);
        var addedColIndex = this.getColHeapIndex(index, number);
        var addedRowIndex = this.getRowHeapIndex(index, number);

        //remove one from each number that could be placed in the placed square
        for(var i=0; i<BOARD_WIDTH; i++)
        {
            if(this.boardBlocks[index][i]==0 && i!=number)
            {
                this.updateBoardNumOptions(addedSquareIndex-number+i, -1);
                this.updateBoardNumOptions(addedColIndex-number+i, -1);
                this.updateBoardNumOptions(addedRowIndex-number+i, -1);

            }
        }

        for(var i=0; i<BOARD_WIDTH; i++)//indicate that there is a blocker for each number in the square that is being placed in
        {
            this.boardBlocks[index][i]++; 
        }


        this.deleteHeapIndex(this.boardHeapIndex[index]);
        this.deleteHeapIndex(this.boardHeapIndex[addedSquareIndex]);
        this.deleteHeapIndex(this.boardHeapIndex[addedColIndex]);
        this.deleteHeapIndex(this.boardHeapIndex[addedRowIndex]);

        this.boardData[index] = number;    
        this.heapify();
        const out =
        {
            type: "Success",
            index: index,
            number: number,
            blockers: [],
        }

        return out;
    }


    deleteEntry(index: number): string
    {
        let number = this.boardData[index];
        if(this.confirmedSquares[index])
        {
            return "Deletion Unsuccessful Confirmed Square"
        }
        if(this.boardData[index]!=-1)
        {
            
            for(let i=0; i<BOARD_SQUARES; i++)
            {
                if(this.isPlacable(index, number, i, number) && index!=i)
                {
                    if(this.boardBlocks[i][number]==1)// we are removing the only blocking square for this index, 
                    {
                        this.updateBoardNumOptions(i, 1);

                        let currentSquareIndex = this.getSquareHeapIndex(i, number);
                        let currentColIndex = this.getColHeapIndex(i, number);
                        let currentRowIndex = this.getRowHeapIndex(i, number);

                        this.updateBoardNumOptions(currentSquareIndex, 1);
                        this.updateBoardNumOptions(currentColIndex, 1);
                        this.updateBoardNumOptions(currentRowIndex, 1);

                    }        
                    this.boardBlocks[i][number]--;
                }
            }

            for(let i=0; i<BOARD_WIDTH; i++)//indicate that a blocker is removed for each number in the square that is being placed in
            {
                this.boardBlocks[index][i]--;
            }

            let addedSquareIndex = this.getSquareHeapIndex(index, number);
            let addedColIndex = this.getColHeapIndex(index, number);
            let addedRowIndex = this.getRowHeapIndex(index, number);

            for(let i=0; i<BOARD_WIDTH; i++)
            {
                if(this.boardBlocks[index][i]===0 && i!==number)
                {
                    this.updateBoardNumOptions(addedSquareIndex-number+i, 1);
                    this.updateBoardNumOptions(addedColIndex-number+i, 1);
                    this.updateBoardNumOptions(addedRowIndex-number+i, 1);
                }
            }

            this.boardData[index] = -1;   
            this.heapPush(index);
            this.heapPush(addedSquareIndex);
            this.heapPush(addedColIndex);
            this.heapPush(addedRowIndex);

            this.heapify();
        }
        return "Deletion Successful"

    }


    updateBoardNumOptions(index: number, change: number): void
    {
        this.boardNumOptions[index]+=change;
        var heapIndex = this.boardHeapIndex[index];
        this.solveOrder[heapIndex].numOptions = this.boardNumOptions[index];
    }
    solvePuzzle(): SolutionSteps[]
    {
        this.resetPuzzle();
        let choices: Choices[] = [];
        let solutionSteps:  SolutionSteps[] = [];
        let guessIndex = 0;
        while(true)
        {
            let nextStep = this.iterateHeapSolution(guessIndex);
            let index = nextStep.index;
            let number = nextStep.number;
            let returnType = nextStep.type;
            let addToSolutionSteps: SolutionSteps
            switch(returnType)
            {
                case 'Placement Successful':
                    this.addEntry(index, number);
                    choices.push({index, guessIndex});
                    addToSolutionSteps = 
                    {
                        index: index,
                        guessIndex: guessIndex,
                        number: number,
                        stepTaken: 'Added',
                        puzzleIsSolved: false,

                    }
                    guessIndex = 0;
                    if(this.puzzleIsSolved())
                    {
                        addToSolutionSteps.puzzleIsSolved = true;
                        solutionSteps.push(addToSolutionSteps);
                        let lastChoice = choices.pop();
                        if(lastChoice!== undefined)
                        {
                            index = lastChoice.index;
                            this.deleteEntry(index);
                            guessIndex = lastChoice.guessIndex+1;  
                            addToSolutionSteps = 
                            {
                                index: index,
                                guessIndex: guessIndex,
                                number: number,
                                stepTaken: 'Removed',
                                puzzleIsSolved: true
                            }  
                            solutionSteps.push(addToSolutionSteps);
                        }
    
                    }
                    else
                    {
                        solutionSteps.push(addToSolutionSteps);
                    }
                    break;
                case 'Placement Failed':
                    guessIndex++;
                    break;
                case 'Out of options for current path':
                    let lastChoice = choices.pop();
                    if(lastChoice === undefined)
                    {
                        return solutionSteps;
                    }
                    index = lastChoice.index;
                    this.deleteEntry(index);
                    addToSolutionSteps = 
                    {
                        index: index,
                        guessIndex: guessIndex,
                        number: 0,
                        stepTaken: 'Removed',
                        puzzleIsSolved: true
                    }

                    solutionSteps.push(addToSolutionSteps);
                    guessIndex = lastChoice.guessIndex + 1;
                    if(choices.length === 0)
                    {
                        return solutionSteps;
                    }
                    break;
            }
        }
    }
    iterateHeapSolution(guessIndex: number): HeapSolutionIteration
    {
        let index = this.heapTop();
        let number = guessIndex;

        if(index>=3*BOARD_SQUARES)//choosing from the row with the fewest options for a given number
        {
            number = index%BOARD_WIDTH;
            let rowNumber = Math.floor((index%BOARD_SQUARES)/BOARD_WIDTH);
            index = rowNumber*BOARD_WIDTH+guessIndex;
        }
        else if(index>=2*BOARD_SQUARES)//choosing from the col with the fewest options for a given number
        {
            number = index%BOARD_WIDTH;
            let colNumber = Math.floor((index%BOARD_SQUARES)/BOARD_WIDTH);
            index = colNumber + BOARD_WIDTH*guessIndex;
        } 
        else if(index>=BOARD_SQUARES)//choosing from the square with the fewest options for a given number
        {
            number = index%BOARD_WIDTH;
            let squareNumber = Math.floor((index%BOARD_SQUARES)/BOARD_WIDTH);
            let squareIndex = SQUARE_WIDTH*(squareNumber%SQUARE_WIDTH) + BOARD_WIDTH*SQUARE_WIDTH*Math.floor(squareNumber/SQUARE_WIDTH);//index corresponding to first entry of that square
            let downIndex = Math.floor(guessIndex/SQUARE_WIDTH);//determines which column the square is in
            let rightIndex = guessIndex%SQUARE_WIDTH;

            index = squareIndex + rightIndex + downIndex*BOARD_WIDTH;
        }

        if(guessIndex>=BOARD_WIDTH)   
        {
            let out = 
            {
                type: 'Out of options for current path',
                index: index,
                number: number
            }
            return out;
        }
        else if(this.boardBlocks[index][number]==0)//placement is allowed
        {
            let out = 
            {
                type: 'Placement Successful',
                index: index,
                number: number
            }
            return out;
        }
        else
        {
            let out = 
            {
                type: 'Placement Failed',
                index: index,
                number: number
            }
            return out;
        }
    }

    resetPuzzle(): void
    {
        for(let i =0; i<BOARD_SQUARES; i++)
        {
            if(!this.confirmedSquares[i])
            {
                this.deleteEntry(i);
            }
        }
    }
    puzzleIsSolved():boolean
    {
        return this.heapSize === 0;
    }
    getSquareHeapIndex(index: number, number: number): number
    {
        return (BOARD_SQUARES+this.indexToSquare(index)*BOARD_WIDTH+number);
    }
    getColHeapIndex(index: number, number: number): number
    {
        return (2*BOARD_SQUARES+this.indexToCol(index)*BOARD_WIDTH+number);
    }
    getRowHeapIndex(index: number, number: number): number
    {
        return (3*BOARD_SQUARES+this.indexToRow(index)*BOARD_WIDTH+number);
    }

    indexToRow(index: number): number
    {
        return Math.floor(index/9);
    }

    indexToCol(index: number): number
    {
        return Math.floor(index%9);
    }

    indexToSquare(index: number): number
    {
        return Math.floor(index/(SQUARE_WIDTH)%SQUARE_WIDTH)+Math.floor(index/(BOARD_WIDTH*SQUARE_WIDTH))*SQUARE_WIDTH;
    }
    right(index: number): number
    {
        return 2*index+2;
    }

    left(index: number): number
    {
        return 2*index+1;
    }

    parent(index: number): number
    {
        return Math.floor((index-1)/2);
    }

    heapPush(index: number): void
    {
        this.heapSize++;
        var heapIndex = this.heapSize-1;
        this.solveOrder[heapIndex].numOptions = this.boardNumOptions[index];
        this.solveOrder[heapIndex].index = index;

        this.boardHeapIndex[index] = heapIndex;
        this.bubbleUp(heapIndex);
    }

    heapTop(): number
    {
        if(this.heapSize<=0)
        {
            var out = -1;
            return out;
        }
        return this.solveOrder[0].index;
    }

    heapPop(): number
    {
        if(this.heapSize<=0)
        {
            var out = -1;
            return out;
        }
        if(this.heapSize ==1)
        {
            this.heapSize--;
            return this.solveOrder[0].index;
        }
        var out = this.solveOrder[0].index;
        this.heapSwap(0, this.heapSize-1);
        this.heapSize--;
        this.bubbleDown(0);
        return out;

    }

    deleteHeapIndex(index: number): void
    {
        this.heapSwap(index, this.heapSize-1);
        this.heapSize--;
        this.bubbleDown(index);
    }

    bubbleDown(heapIndex: number): void
    {
        let leftIndex = this.left(heapIndex);
        let rightIndex = this.right(heapIndex);
        let child = heapIndex;

        let childValue = this.solveOrder[child].numOptions;
        let childBoardIndex = this.solveOrder[child].index;
        if(leftIndex < this.heapSize)
        {
            var leftValue = this.solveOrder[leftIndex].numOptions;
            var leftBoardIndex = this.solveOrder[leftIndex].index;
    
            if(leftValue < childValue)
            {
                child = leftIndex;
                childValue = leftValue;
                childBoardIndex = leftBoardIndex;
            } 
            else if(leftValue === childValue && leftBoardIndex < childBoardIndex)
            {
                child = leftIndex;
                childValue = leftValue;
                childBoardIndex = leftBoardIndex;    
            }
        }
        if(rightIndex < this.heapSize)
        {
            let rightValue = this.solveOrder[rightIndex].numOptions;
            let rightBoardIndex = this.solveOrder[rightIndex].index;
    
            if(rightValue < childValue)
            {
                child = rightIndex;
                childValue = rightValue;
                childBoardIndex = rightBoardIndex;
            } 
            else if(rightBoardIndex < childBoardIndex && rightValue === childValue)
            {
                child = rightIndex;
                childValue = rightValue;
                childBoardIndex = rightBoardIndex;    
            }
        }
        if(child!=heapIndex)
        {
            this.heapSwap(heapIndex, child);
            this.bubbleDown(child);
        }
    }

    bubbleUp(heapIndex: number): void// cal on index in heap
    {
        while(heapIndex!=0 && this.solveOrder[this.parent(heapIndex)].numOptions>this.solveOrder[heapIndex].index)
        {
            this.heapSwap(this.parent(heapIndex), heapIndex);
            heapIndex=this.parent(heapIndex);
        }
    }

    heapSwap(parentHeapIndex: number, childHeapIndex: number): void
    {
        var parentboardIndex = this.solveOrder[parentHeapIndex].index;
        var childboardIndex = this.solveOrder[childHeapIndex].index;

        var temp = this.solveOrder[parentHeapIndex];
        this.solveOrder[parentHeapIndex] = this.solveOrder[childHeapIndex];
        this.solveOrder[childHeapIndex] = temp;

        this.boardHeapIndex[parentboardIndex] = childHeapIndex;
        this.boardHeapIndex[childboardIndex] = parentHeapIndex;

    }

    heapify(): void
    {

        for(var i=this.heapSize; i>=0; i--)
        {
            this.bubbleDown(i);
        }
    }
}