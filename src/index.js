import React from "react"
import ReactDOM from "react-dom"
import "./index.css"

function Square(props){
    return (
        <button
            className="square"
            onClick={props.onClick}
            style={props.highlight ? { backgroundColor: "pink"} : {}}
        >
        {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        const highlight = !!(this.props.highlights && this.props.highlights.indexOf(i) > -1);
        return (<Square value={this.props.squares[i]}
                        onClick={()=>this.props.onClick(i)}
                        key={i}
                        highlight={highlight}
                />);
    }

    renderSquares(start, end) {
        const num_array = [];
        const obj_array = [];
        for (let i = start;i <= end; i++){
            num_array[num_array.length] = i;
        }
        num_array.map((j) => {
            obj_array.push(this.renderSquare(j));
            return false;
        });
        return obj_array
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquares(0, 2)}
                </div>
                <div className="board-row">
                    {this.renderSquares(3, 5)}
                </div>
                <div className="board-row">
                    {this.renderSquares(6, 8)}
                </div>
            </div>
    );
    }
}

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                },
            ],
            step_number: 0,
        };
    }

    handleClick(i){
        let refreshed_history;
        if (this.state.step_number + 1 < this.state.history.length){
            refreshed_history = this.state.history.slice(0, this.state.step_number + 1);
        } else {
            refreshed_history  = this.state.history.slice();
        }
        const new_squares = refreshed_history[refreshed_history.length - 1].squares.slice();
        if (calculate_winner(new_squares) || new_squares[i]){
            return false
        }
        new_squares[i] = nextCharacter(new_squares);
        const new_history = refreshed_history.slice();
        new_history.push({squares: new_squares});
        const new_step_number = this.state.step_number + 1;
        this.setState({
            history: new_history,
            step_number: new_step_number,
        })
    }

    jump_to(move) {
        this.setState({
            step_number: move,
            }
        )
    }

    changed_location(after_step_number) {
        if (after_step_number < 1){
            return "";
        } else {
            const original_squares = this.state.history[after_step_number - 1].squares;
            const current_squares = this.state.history[after_step_number].squares;
            for (let i = 0; i < original_squares.length; i++){
                if (current_squares[i] !== original_squares[i]){
                    return "col=" + Math.floor(i / 3) + ", row=" + i % 3;
                }
            }
        }
    }


    render() {
        const current_squares = this.state.history[this.state.step_number].squares;
        const winner = calculate_winner(current_squares)
            ? current_squares[calculate_winner(current_squares)[0]]
            : null;
        const win_highlight = winner ? calculate_winner(current_squares) : null;

        const moves = this.state.history.map((step, move) => {
            const description = move ?
                "Go to move # " + move :
                "Go to game start";
            /* Display the location for each move in the format (col, row) in the move history list. */
            let last_location = this.changed_location(move);
            return (
                <li key={move}>
                    {/*Bold the currently selected item in the move list.*/}
                    <button style={this.state.step_number === move ? {fontWeight : "bold"} : {}}
                            onClick={() => this.jump_to(move)}>{description}</button>
                    {last_location}
                </li>
            )
        });

        let status;
        if (!!winner){
            status = 'Winner: ' + winner;
        } else if (this.state.step_number === 9){
            status = "Draw. Try again!";
        } else {
            status = "Next player: " + nextCharacter(current_squares);
        }

        return (
            <div className="game">
            <div className="game-board">
            <Board onClick={i=>this.handleClick(i)}
                   squares={current_squares}
                   highlights={win_highlight}
            />
            </div>
            <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
            </div>
            </div>
        );
    }
}

function calculate_winner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let line of lines) {
        const [a, b, c] = line;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
            return line
        }
    }
    return null;
}

function countCharacters(squares){
    let counter = 0;
    squares.map(i=>(i&&counter++));
    return counter
}

function nextCharacter(squares){
    let existing_character = countCharacters(squares);
    return existing_character % 2 ? "O" : "X"
}

// ========================================

ReactDOM.render(
<Game />,
    document.getElementById('root')
);
