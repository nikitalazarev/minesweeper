import React, {Component} from 'react';
import './App.css';
const _:any = require('underscore')

interface Pos{
  row: number,
  col: number
}
interface Cell{ 
  id: number,
  pos: {
    row: number,
    col: number
  },
  isMine: boolean,
  cellsAround: Cell[],
  minesAround: null | number,
  state: string,
}

interface State{
  cellsMount: {
    row: number,
    col: number,
  },
  minesMount: number,
  result: {isWin: boolean, open: boolean},
  winTitles: [string, string],
  cells: Cell[][]
}

class App extends Component<any, State> {
  constructor(props:any) {
    super(props);
    this.state = {
      cellsMount: {
        row: 8,
        col: 10,
      },
      minesMount: 10,
      result: {isWin: false, open: false},
      winTitles: ['YOU WIN!', 'GAME OVER'],
      cells: new Array<Array<Cell>>()
    };

    this.openCell = this.openCell.bind(this)
    this.markCell = this.markCell.bind(this)
    this.restart = this.restart.bind(this)
  }

  openCell(pos: Pos):void {
    const updatedCells = this.state.cells.map( (el: Cell[]) => el);

    if(updatedCells[pos.row][pos.col].state !== 'mark'){
      updatedCells[pos.row][pos.col].state = 'open';

      if(updatedCells[pos.row][pos.col].isMine){
        updatedCells.map( (el: Cell[]) => {
          el.map( (cell: Cell) => {
            if(cell.isMine){
              cell.state = 'open mine inactive'
            }else{
              cell.state = `${cell.state} inactive`
            }
          })
        })
      }else{
        const openedEmpty:number[]  = [];
        for(let i = 0; i < updatedCells.length; i++){
          for(let j = 0; j < updatedCells[i].length; j++){
            if(updatedCells[i][j].cellsAround 
              && updatedCells[i][j].minesAround === 0 
              && updatedCells[i][j].state === 'open' 
              && !openedEmpty.includes(updatedCells[i][j].id)){
                updatedCells[i][j].cellsAround.map( (cell: Cell) => {
                  cell.state = 'open';
                })
                openedEmpty.push(updatedCells[i][j].id);
                i = 0;
                j = 0;
            }
          }
        }
      }

      this.setState({cells: updatedCells});
      this.checkResult('open',updatedCells);
    }
  }

  markCell(pos: Pos):void {
    const updatedCells = this.state.cells.map( (el: Cell[]) => el);

    if(updatedCells[pos.row][pos.col].state === 'close'){
      updatedCells[pos.row][pos.col].state = 'mark';
    }else if(updatedCells[pos.row][pos.col].state === 'mark'){
      updatedCells[pos.row][pos.col].state = 'close'
    }

    this.setState({cells: updatedCells});
    this.checkResult('mark',updatedCells);
  }

  checkResult(action: string, updatedCells: Cell[][]):void {
    if(action === 'mark'){
      let rightMarked = 0;
      let wrongMarked = 0;
      updatedCells.map( (el: Cell[]) => {
        el.map( (cell: Cell) => {
          if(cell.state === 'mark'){
            if(cell.isMine){
              rightMarked++;
            }else{
              wrongMarked++;
            }
          }
        })
      });

      const isWin:boolean = (rightMarked === this.state.minesMount && !wrongMarked) ? true : false

      if(isWin){
        updatedCells.map( (el: Cell[]) => {
          el.map( (cell: Cell) => {
            cell.state = cell.state + ' inactive'
          })
        })
      }

      if(isWin){
        this.setState({cells: updatedCells, result: {isWin, open: true}})
      }
    }
    if(action === 'open'){
      let isWin:boolean = true;
      updatedCells.map( (el: Cell[]) => {
        el.map( (cell: Cell) => {
          if(cell.state === 'open mine inactive'){
            isWin = false
          }
        })
      })

      if(!isWin){
        this.setState({result: {isWin, open: true}})
      }
    }
  }

  restart():void {
    const {
      minesMount,
      cellsMount,
    } = this.state;

    
    const arr:number[] = _.shuffle(_.range(cellsMount.row * cellsMount.col));
    const minesCells:number[] = _.range(minesMount).map( (el:number) => arr[el] );

    let cells:Cell[][] = new Array<Array<Cell>>();
    let cellCounter:number = 0;
    for(let i = 0; i < cellsMount.row; i++){
      cells[i] = new Array<Cell>();
      for(let j = 0; j < cellsMount.col; j++){
        const cell:Cell = {
          id: cellCounter,
          pos: {
            row: i,
            col: j
          },
          isMine: minesCells.includes(cellCounter),
          cellsAround: new Array<Cell>(),
          minesAround: null,
          state: 'close',
        }
        cells[i].push(cell);
        cellCounter++;
      }
    }

    cells.map((el:Cell[]) => {
      el.map((cell:Cell) => {
        if(!cell.isMine){
            let koef:number = -1;
            let minesCounter:number = 0;
            for(let i = 0; i < 3; i++){
              if(cells[cell.pos.row - 1] && cells[cell.pos.row - 1][cell.pos.col + koef]){
                cell.cellsAround.push(cells[cell.pos.row - 1][cell.pos.col + koef])
                if(cells[cell.pos.row - 1][cell.pos.col + koef].isMine){
                  minesCounter++;
                }
              }
              if(cells[cell.pos.row + 1] && cells[cell.pos.row + 1][cell.pos.col + koef]){
                cell.cellsAround.push(cells[cell.pos.row + 1] && cells[cell.pos.row + 1][cell.pos.col + koef]);
                if(cells[cell.pos.row + 1][cell.pos.col + koef].isMine){
                  minesCounter++;
                }
              }
              koef++;
            }
            koef = -1;
            for(let i = 0; i < 2; i++){
              if(cells[cell.pos.row][cell.pos.col + koef]){
                cell.cellsAround.push(cells[cell.pos.row][cell.pos.col + koef])
                if(cells[cell.pos.row][cell.pos.col + koef].isMine){
                  minesCounter++;
                }
              }
              koef = 1;
            }
            cell.minesAround = minesCounter;
        }
      })
    })

    this.setState({cells: cells, result: {isWin: this.state.result.isWin, open: false}});   
  }

  componentDidMount():void {
    const {
      minesMount,
      cellsMount
    } = this.state;

    
    const arr:number[] = _.shuffle(_.range(cellsMount.row * cellsMount.col));
    const minesCells:number[] = _.range(minesMount).map( (el:number) => arr[el] );

    let cells:Cell[][] = new Array<Array<Cell>>();
    let cellCounter = 0;
    for(let i = 0; i < cellsMount.row; i++){
      cells[i] = new Array<Cell>();
      for(let j = 0; j < cellsMount.col; j++){
        const cell = {
          id: cellCounter,
          pos: {
            row: i,
            col: j
          },
          isMine: minesCells.includes(cellCounter),
          cellsAround: new Array<Cell>(),
          minesAround: null,
          state: 'close',
        }
        cells[i].push(cell);
        cellCounter++;
      }
    }

    cells.map((el:Cell[]) => {
      el.map((cell:Cell) => {
        if(!cell.isMine){
          let koef:number = -1;
          let minesCounter:number = 0;
          for(let i = 0; i < 3; i++){
            if(cells[cell.pos.row - 1] && cells[cell.pos.row - 1][cell.pos.col + koef]){
              cell.cellsAround.push(cells[cell.pos.row - 1][cell.pos.col + koef])
              if(cells[cell.pos.row - 1][cell.pos.col + koef].isMine){
                minesCounter++;
              }
            }
            if(cells[cell.pos.row + 1] && cells[cell.pos.row + 1][cell.pos.col + koef]){
              cell.cellsAround.push(cells[cell.pos.row + 1] && cells[cell.pos.row + 1][cell.pos.col + koef]);
              if(cells[cell.pos.row + 1][cell.pos.col + koef].isMine){
                minesCounter++;
              }
            }
            koef++;
          }
          koef = -1;
          for(let i = 0; i < 2; i++){
            if(cells[cell.pos.row][cell.pos.col + koef]){
              cell.cellsAround.push(cells[cell.pos.row][cell.pos.col + koef])
              if(cells[cell.pos.row][cell.pos.col + koef].isMine){
                minesCounter++;
              }
            }
            koef = 1;
          }
          cell.minesAround = minesCounter;
        }
      })
    })

    this.setState({cells: cells});
  }

  render() {
    const {
      result,
      cells
    } = this.state;

    return (
      <div className="App">
        <Result
          result = {result}
        />
        <div className = 'tableCells'>
        <TableCells 
          cells = {cells}
          openCell = {this.openCell}
          markCell = {this.markCell}
        />
        <Button 
          onClick = {this.restart}
          children = {'restart'}
          className = {'button-restart'}
        />
        </div>
      </div>
    );
  }
}

interface TableCellsProps {
  cells: Cell[][],
  openCell:(pos:Pos) => void,
  markCell:(pos:Pos) => void
}

const TableCells = ({
  cells,
  openCell,
  markCell
}:TableCellsProps) => {
  let tableCells = cells.map((el:Cell[], i:number) => {
      let cellsArr = el.map((cell:Cell, j:number) => {
        let content:string | null = null;
        if(cell.isMine){
          content = '*'
        }else if(cell.minesAround){
          content = `${cell.minesAround}`
        }
          return  (
            <div 
              className = {`cell ${cell.state}`}
              key = {`cell-${cell.id}`}
              onClick = { () => openCell(cell.pos)}
              onContextMenu = { (e:React.MouseEvent) => {
                e.preventDefault();
                return markCell(cell.pos);
              }}
            >
              <div className = 'value'>
                {content}
              </div>
            </div>
            )
      });
      return (
        <div className = 'cellsRow' key={`cellsRow-${i}`}>{cellsArr}</div>
        )
    })
    return (<>{tableCells}</>)
}

interface ButtonProps{
  onClick:(e:React.MouseEvent) => void,
  className: string,
  children: React.ReactNode
}

const Button = ({ onClick, className = '', children }:ButtonProps) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </button>


interface ResultProps{
  result: {isWin: null | boolean, open: boolean}
}
const Result = ({result}:ResultProps) =>{
  let title:string = result.isWin ? 'YOU WIN!' : 'GAME OVER';
  let titleState:string = result.open ? 'result open' : 'result close';
  return (
    <div
      className = {titleState}
    >{title}</div>
    )
}

export default App;
