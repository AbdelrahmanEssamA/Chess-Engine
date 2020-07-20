/*Abdelrahman Essam 155295
  Marwan Mohamed 152282*/
function ParseMove(from, to) {

	GenerateMoves();

	var Move = NOMOVE;
	var PromPce = PIECES.EMPTY;
	var found = BOOL.FALSE;

	for(index = GameBoard.moveListStart[GameBoard.ply];
							index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
		Move = GameBoard.moveList[index];
		if(FromSquare(Move) == from && ToSquare(Move) == to) {
			PromPce = PROMOTED(Move);
			if(PromPce != PIECES.EMPTY) {
				if( (PromPce == PIECES.wQ && GameBoard.side == COLOURS.WHITE) ||
					(PromPce == PIECES.bQ && GameBoard.side == COLOURS.BLACK) ) {
					found = BOOL.TRUE;
					break;
				}
				continue;
			}
			found = BOOL.TRUE;
			break;
		}
	}

	if(found != BOOL.FALSE) {
		if(MakeMove(Move) == BOOL.FALSE) {
			return NOMOVE;
		}
		TakeMove();
		return Move;
	}

	return NOMOVE;
}
function MakeUserMove() {

	if(UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {
		console.log("User Move:" + PrSq(UserMove.from) + PrSq(UserMove.to));

		var parsed = ParseMove(UserMove.from,UserMove.to);

		if(parsed != NOMOVE) {
			MakeMove(parsed);
			PrintBoard();
            MoveGUIPiece(parsed);
            CheckAndSet();
            $("#GameStatus").text("Computer Turn");
            PreSearch();

		}

		DeSelectSq(UserMove.from);
		DeSelectSq(UserMove.to);

		UserMove.from = SQUARES.NO_SQ;
		UserMove.to = SQUARES.NO_SQ;
	}
}
