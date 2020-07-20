/*Abdelrahman Essam 155295
  Marwan Mohamed 152282*/
function ClearPiece(sq) {

	var pce = GameBoard.pieces[sq];
	var col = PieceColor[pce];
	var i;
	var t_pceNum = -1;

	HashPiece(pce, sq);

	GameBoard.pieces[sq] = PIECES.EMPTY;
	GameBoard.material[col] -= PieceVal[pce];

	for(i = 0; i < GameBoard.pceNum[pce]; ++i) {
		if(GameBoard.pList[PCEINDEX(pce,i)] == sq) {
			t_pceNum = i;
			break;
		}
	}

	GameBoard.pceNum[pce]--;
	GameBoard.pList[PCEINDEX(pce, t_pceNum)] = GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])];

}
function AddPiece(sq, pce) {

	var col = PieceColor[pce];

	HashPiece(pce, sq);

	GameBoard.pieces[sq] = pce;
	GameBoard.material[col] += PieceVal[pce];
	GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])] = sq;
	GameBoard.pceNum[pce]++;

}
function MovePiece(from, to) {

	var i = 0;
	var pce = GameBoard.pieces[from];

	HashPiece(pce, from);
	GameBoard.pieces[from] = PIECES.EMPTY;

	HashPiece(pce,to);
	GameBoard.pieces[to] = pce;

	for(i = 0; i < GameBoard.pceNum[pce]; ++i) {
		if(GameBoard.pList[PCEINDEX(pce,i)] == from) {
			GameBoard.pList[PCEINDEX(pce,i)] = to;
			break;
		}
	}

}
function MakeMove(move) {

	var from = FromSquare(move);
    var to = ToSquare(move);
    var side = GameBoard.side;

	GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;

	if( (move & MoveFlagEP) != 0) {
		if(side == COLOURS.WHITE) {
			ClearPiece(to-10);
		}
		 else {
			ClearPiece(to+10);
		}
	}
	 else if( (move & MoveFlagCA) != 0) {
		switch(to) {
			case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
			break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
			break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
			break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
			break;
            default: break;
		}
	}

	if(GameBoard.enPassant != SQUARES.NO_SQ)
		HashEnPassant();
	HashCastle();
	GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPassant = GameBoard.enPassant;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;

    GameBoard.castlePerm &= CastlePerm[from];
    GameBoard.castlePerm &= CastlePerm[to];
    GameBoard.enPassant = SQUARES.NO_SQ;
    HashCastle();

    var captured = CAPTURED(move);
    GameBoard.fiftyMove++;
    if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }
    GameBoard.hisPly++;
	GameBoard.ply++;

	if(PiecePawn[GameBoard.pieces[from]] == BOOL.TRUE) {
        GameBoard.fiftyMove = 0;
        if( (move & MoveFlagPS) != 0) {
            if(side==COLOURS.WHITE) {
                GameBoard.enPassant=from+10;
            } else {
                GameBoard.enPassant=from-10;
            }
            HashEnPassant();
        }
    }

    MovePiece(from, to);

    var prPce = PROMOTED(move);
    if(prPce != PIECES.EMPTY)   {
        ClearPiece(to);
        AddPiece(to, prPce);
    }

    GameBoard.side ^= 1;
    HashSide();

    if(SquareAttacked(GameBoard.pList[PCEINDEX(Kings[side],0)], GameBoard.side))  {
         TakeMove();
    	return BOOL.FALSE;
    }

    return BOOL.TRUE;
}
function TakeMove() {

	GameBoard.hisPly--;
    GameBoard.ply--;

    var move = GameBoard.history[GameBoard.hisPly].move;
	var from = FromSquare(move);
    var to = ToSquare(move);

    if(GameBoard.enPassant != SQUARES.NO_SQ)
		HashEnPassant();
    HashCastle();

    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPassant = GameBoard.history[GameBoard.hisPly].enPassant;

    if(GameBoard.enPassant != SQUARES.NO_SQ)
		HashEnPassant();
    HashCastle();

    GameBoard.side ^= 1;
    HashSide();

    if( (MoveFlagEP & move) != 0) {
        if(GameBoard.side == COLOURS.WHITE) {
            AddPiece(to-10, PIECES.bP);
        }
		else {
            AddPiece(to+10, PIECES.wP);
        }
    }
	else if( (MoveFlagCA & move) != 0) {
        switch(to) {
        	case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }

    MovePiece(to, from);

    var captured = CAPTURED(move);
    if(captured != PIECES.EMPTY) {
        AddPiece(to, captured);
    }

    if(PROMOTED(move) != PIECES.EMPTY)   {
        ClearPiece(from);
        AddPiece(from, (PieceColor[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
}
