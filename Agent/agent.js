/*Abdelrahman Essam 155295
  Marwan Mohamed 152282*/
var AgentController = {};
AgentController.nodes;
AgentController.fh;
AgentController.fhf;
AgentController.depth;
AgentController.time;
AgentController.start;
AgentController.stop;
AgentController.best;
AgentController.thinking;

function PickNextMove(MoveNum) {

	var i = 0;
	var bestScore = -1;
	var bestNum = MoveNum;
	for(i = MoveNum; i < GameBoard.moveListStart[GameBoard.ply+1]; ++i) {
		if(GameBoard.moveScores[i] > bestScore) {
			bestScore = GameBoard.moveScores[i];
			bestNum = i;
		}
	}
	if(bestNum != MoveNum) {
		var temp = 0;
		temp = GameBoard.moveScores[MoveNum];
		GameBoard.moveScores[MoveNum] = GameBoard.moveScores[bestNum];
		GameBoard.moveScores[bestNum] = temp;

		temp = GameBoard.moveList[MoveNum];
		GameBoard.moveList[MoveNum] = GameBoard.moveList[bestNum];
		GameBoard.moveList[bestNum] = temp;
	}
}
function ClearPvTable() {

	for(i = 0; i < PVENTRIES; i++) {
			GameBoard.PvTable[i].move = NOMOVE;
			GameBoard.PvTable[i].posKey = 0;
	}
}
function CheckUp() {
	if (( $.now() - AgentController.start ) > AgentController.time) {
		AgentController.stop = BOOL.TRUE;
	}
}
function IsRepetition() {

	var i = 0;
	for(i = GameBoard.hisPly - GameBoard.fiftyMove; i < GameBoard.hisPly - 1; ++i) {
		if(GameBoard.posKey == GameBoard.history[i].posKey) {
			return BOOL.TRUE;
		}
	}

	return BOOL.FALSE;
}
function Quiescence(alpha, beta) {

	if ((AgentController.nodes & 2047) == 0) {
		CheckUp();
	}

	AgentController.nodes++;

	if( (IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply != 0) {
		return 0;
	}

	if(GameBoard.ply > MAXDEPTH -1) {
		return EvalPosition();
	}

	var Score = EvalPosition();

	if(Score >= beta) {
		return beta;
	}

	if(Score > alpha) {
		alpha = Score;
	}

	GenerateCaptures();

	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	var Move = NOMOVE;

	for(MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {

		PickNextMove(MoveNum);

		Move = GameBoard.moveList[MoveNum];

		if(MakeMove(Move) == BOOL.FALSE) {
			continue;
		}
		Legal++;
		Score = -Quiescence( -beta, -alpha);

		TakeMove();

		if(AgentController.stop == BOOL.TRUE) {
			return 0;
		}

		if(Score > alpha) {
			if(Score >= beta) {
				if(Legal == 1) {
					AgentController.fhf++;
				}
				AgentController.fh++;
				return beta;
			}
			alpha = Score;
			BestMove = Move;
		}
	}

	if(alpha != OldAlpha) {
		StorePvMove(BestMove);
	}

	return alpha;

}
// min-max (negamax)
function AlphaBeta(alpha, beta, depth) {


	if(depth <= 0) {
		return Quiescence(alpha, beta);
	}

	if ((AgentController.nodes & 2047) == 0) {
		CheckUp();
	}

	AgentController.nodes++;

	if( (IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply != 0) {
		return 0;
	}

	if(GameBoard.ply > MAXDEPTH -1) {
		return EvalPosition();
	}

	var InCheck = SquareAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side],0)], GameBoard.side^1);
	if(InCheck == BOOL.TRUE)  {
		depth++;
	}

	var Score = -INFINITE;
	GenerateMoves();
	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	var Move = NOMOVE;
	var PvMove = ProbePvTable();
	if(PvMove != NOMOVE) {
		for(MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {
			if(GameBoard.moveList[MoveNum] == PvMove) {
				GameBoard.moveScores[MoveNum] = 2000000;
				break;
			}
		}
	}

	for(MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {
		PickNextMove(MoveNum);
		Move = GameBoard.moveList[MoveNum];
		if(MakeMove(Move) == BOOL.FALSE) {
			continue;
		}
		Legal++;
		Score = -AlphaBeta( -beta, -alpha, depth-1);

		TakeMove();

		if(AgentController.stop == BOOL.TRUE) {
			return 0;
		}

		if(Score > alpha) {
			if(Score >= beta) {
				if(Legal == 1) {
					AgentController.fhf++;
				}
				AgentController.fh++;
				if((Move & MoveFlagCapture) == 0) {
					GameBoard.searchKillers[MAXDEPTH + GameBoard.ply] =
						GameBoard.searchKillers[GameBoard.ply];
					GameBoard.searchKillers[GameBoard.ply] = Move;
				}
				return beta;
			}
			if((Move & MoveFlagCapture) == 0) {
				GameBoard.searchHistory[GameBoard.pieces[FromSquare(Move)] * BRD_CELL_NUM + ToSquare(Move)]
						 += depth * depth;
			}
			alpha = Score;
			BestMove = Move;
		}
	}

	if(Legal == 0) {
		if(InCheck == BOOL.TRUE) {
			return -MATE + GameBoard.ply;
		}
		else {
			return 0;
		}
	}

	if(alpha != OldAlpha) {
		StorePvMove(BestMove);
	}

	return alpha;
}
function ClearForSearch() {

	var i = 0;
	for(i = 0; i < 14 * BRD_CELL_NUM; ++i) {
		GameBoard.searchHistory[i] = 0;
	}

	for(i = 0; i < 3 * MAXDEPTH; ++i) {
		GameBoard.searchKillers[i] = 0;
	}

	ClearPvTable();
	GameBoard.ply = 0;
	AgentController.nodes = 0;
	AgentController.fh = 0;
	AgentController.fhf = 0;
	AgentController.start = $.now();
	AgentController.stop = BOOL.FALSE;
}
function SearchPosition() {

	var bestMove = NOMOVE;
	var bestScore = -INFINITE;
	var currentDepth = 0;
	var line;
	var PvNum;
	var c;
	ClearForSearch();

	for( currentDepth = 1; currentDepth <= AgentController.depth; ++currentDepth) {

		bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth);

		if(AgentController.stop == BOOL.TRUE) {
			break;
		}

		bestMove = ProbePvTable();
		line = 'D:' + currentDepth + ' Best:' + PrMove(bestMove) + ' Score:' + bestScore +
				' nodes:' + AgentController.nodes;

		PvNum = GetPvLine(currentDepth);
		line += ' Pv:';
		for( c = 0; c < PvNum; ++c) {
			line += ' ' + PrMove(GameBoard.PvArray[c]);
		}
		if(currentDepth!=1) {
			line += (" Ordering:" + ((AgentController.fhf/AgentController.fh)*100).toFixed(2) + "%");
		}
		console.log(line);

	}

	AgentController.best = bestMove;
	AgentController.thinking = BOOL.FALSE;
	UpdateDOMStats(currentDepth);
}


//Tic tac toe
//heuristic function
function minimax(newBoard, player)
{
	var PossibleMoves = emptySquares();
    //player won
	if (checkWin(newBoard, UserPlayer))
    {
		return {score: -1};
	}
    //agent won
    else if (checkWin(newBoard, AgentPlayer))
    {
		return {score: 1};
	}
    //draw
    else if (PossibleMoves.length === 0)
    {
		return {score: 0};
	}

	var moves = [];
	for (var i = 0; i < PossibleMoves.length; i++)
    {
		var obj = {};
		obj.index = newBoard[PossibleMoves[i]];
		newBoard[PossibleMoves[i]] = player;
        //calculating score for possible moves
		if (player == AgentPlayer)
        {
			var result = minimax(newBoard, UserPlayer);
			obj.score = result.score;
		}
        else if(player === UserPlayer)
        {
			var result = minimax(newBoard, AgentPlayer);
			obj.score = result.score;
		}

		newBoard[PossibleMoves[i]] = obj.index;
		moves.push(obj);
	}
	var nextPlay;
	if(player === AgentPlayer)
    {
		var topPoints = -100;
		for(var i = 0; i < moves.length; i++)
        {
			if (moves[i].score > topPoints)
            {
				topPoints = moves[i].score;
				nextPlay = i;
			}
		}
	}
    else if(player === UserPlayer)
    {
		var topPoints = 100;
		for(var i = 0; i < moves.length; i++)
        {
			if (moves[i].score < topPoints)
            {
				topPoints = moves[i].score;
				nextPlay = i;
			}
		}
	}

	return moves[nextPlay];
}
