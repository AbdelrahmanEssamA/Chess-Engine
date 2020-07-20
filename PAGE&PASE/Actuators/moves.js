//most valible victims
var MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
var MvvLvaScores = new Array(14 * 14);
function InitMvvLva() {
	var Attacker;
	var Victim;
	for(Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
		for(Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
			MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - (MvvLvaValue[Attacker]/100);
		}
	}

}

function MoveExists(move) {

	GenerateMoves();
	var i;
	var moveFound = NOMOVE;
	for(i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {

		moveFound = GameBoard.moveList[i];
		if(MakeMove(moveFound) == BOOL.FALSE) {
			continue;
		}
		TakeMove();
		if(move == moveFound) {
			return BOOL.TRUE;
		}
	}
	return BOOL.FALSE;
}
function MOVE(from, to, captured, promoted, flag) {
	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function AddCaptureMove(move) {
	GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move;
	GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]]  =
	MvvLvaScores[CAPTURED(move) * 14 + GameBoard.pieces[FromSquare(move)]] + 1000000;
    GameBoard.moveListStart[GameBoard.ply+1]++;
}
function AddQuietMove(move) {
	GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move;
	GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]] = 0;
	GameBoard.moveListStart[GameBoard.ply+1]++;
}
function AddEnPassantMove(move) {
	GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move;
	GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 105 + 1000000;
	GameBoard.moveListStart[GameBoard.ply+1]++;
}

function WhitePawnCaptureMove(from, to, cap) {
	if(RanksBrd[from]==RANKS.RANK_7) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
	}
	else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}
function BlackPawnCaptureMove(from, to, cap) {
	if(RanksBrd[from]==RANKS.RANK_2) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
	}
	else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}

function WhitePawnQuietMove(from, to) {
	if(RanksBrd[from]==RANKS.RANK_7) {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wQ,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wR,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wB,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wN,0));
	}
	else {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));
	}
}
function BlackPawnQuietMove(from, to) {
	if(RanksBrd[from]==RANKS.RANK_2) {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bQ,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bR,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bB,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bN,0));
	}
	else {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));
	}
}

function GenerateMoves() {
	GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply];
	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var target;
	var dir;
	if(GameBoard.side == COLOURS.WHITE) {
		pceType = PIECES.wP;

		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];
			if(GameBoard.pieces[sq + 10] == PIECES.EMPTY) {
				WhitePawnQuietMove(sq, sq+10);
				if(RanksBrd[sq] == RANKS.RANK_2 && GameBoard.pieces[sq + 20] == PIECES.EMPTY) {
					AddQuietMove( MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MoveFlagPS ));
				}
			}

			if(SquareOffboard(sq + 9) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq+9]] == COLOURS.BLACK) {
				WhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq+9]);
			}

			if(SquareOffboard(sq + 11) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq+11]] == COLOURS.BLACK) {
				WhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq+11]);
			}

			if(GameBoard.enPassant != SQUARES.NO_SQ) {
				if(sq + 9 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}

				if(sq + 11 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}
			}

		}

		if(GameBoard.castlePerm & CASTLEBIT.WKCA) {
			if(GameBoard.pieces[SQUARES.F1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G1] == PIECES.EMPTY) {
				if(SquareAttacked(SQUARES.F1, COLOURS.BLACK) == BOOL.FALSE && SquareAttacked(SQUARES.E1, COLOURS.BLACK) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MoveFlagCA ));
				}
			}
		}

		if(GameBoard.castlePerm & CASTLEBIT.WQCA) {
			if(GameBoard.pieces[SQUARES.D1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.B1] == PIECES.EMPTY) {
				if(SquareAttacked(SQUARES.D1, COLOURS.BLACK) == BOOL.FALSE && SquareAttacked(SQUARES.E1, COLOURS.BLACK) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MoveFlagCA ));
				}
			}
		}

	}
	else {
		pceType = PIECES.bP;
		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];
			if(GameBoard.pieces[sq - 10] == PIECES.EMPTY) {
				BlackPawnQuietMove(sq, sq-10);
				if(RanksBrd[sq] == RANKS.RANK_7 && GameBoard.pieces[sq - 20] == PIECES.EMPTY) {
					AddQuietMove( MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MoveFlagPS ));
				}
			}

			if(SquareOffboard(sq - 9) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq-9]] == COLOURS.WHITE) {
				BlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq-9]);
			}

			if(SquareOffboard(sq - 11) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq-11]] == COLOURS.WHITE) {
				BlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq-11]);
			}

			if(GameBoard.enPassant != SQUARES.NO_SQ) {
				if(sq - 9 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}

				if(sq - 11 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}
			}
		}
		if(GameBoard.castlePerm & CASTLEBIT.BKCA) {
			if(GameBoard.pieces[SQUARES.F8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G8] == PIECES.EMPTY) {
				if(SquareAttacked(SQUARES.F8, COLOURS.WHITE) == BOOL.FALSE && SquareAttacked(SQUARES.E8, COLOURS.WHITE) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MoveFlagCA ));
				}
			}
		}

		if(GameBoard.castlePerm & CASTLEBIT.BQCA) {
			if(GameBoard.pieces[SQUARES.D8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.B8] == PIECES.EMPTY) {
				if(SquareAttacked(SQUARES.D8, COLOURS.WHITE) == BOOL.FALSE && SquareAttacked(SQUARES.E8, COLOURS.WHITE) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MoveFlagCA ));
				}
			}
		}
	}

	pceIndex = LoopNonSlideIndex[GameBoard.side];
	pce = NonSlidePiece[pceIndex++];

	while (pce != 0) {
		for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

			for(i = 0; i < DirNum[pce]; i++) {
				dir = PceDir[pce][i];
				target = sq + dir;

				if(SquareOffboard(target) == BOOL.TRUE) {
					continue;
				}

				if(GameBoard.pieces[target] != PIECES.EMPTY) {
					if(PieceColor[GameBoard.pieces[target]] != GameBoard.side) {
						AddCaptureMove( MOVE(sq, target, GameBoard.pieces[target], PIECES.EMPTY, 0 ));
					}
				}
				else {
					AddQuietMove( MOVE(sq, target, PIECES.EMPTY, PIECES.EMPTY, 0 ));
				}
			}
		}
		pce = NonSlidePiece[pceIndex++];
	}

	pceIndex = LoopSlideIndex[GameBoard.side];
	pce = SlidePiece[pceIndex++];

	while(pce != 0) {
		for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

			for(i = 0; i < DirNum[pce]; i++) {
				dir = PceDir[pce][i];
				target = sq + dir;

				while( SquareOffboard(target) == BOOL.FALSE ) {

					if(GameBoard.pieces[target] != PIECES.EMPTY) {
						if(PieceColor[GameBoard.pieces[target]] != GameBoard.side) {
							AddCaptureMove( MOVE(sq, target, GameBoard.pieces[target], PIECES.EMPTY, 0 ));
						}
						break;
					}
					AddQuietMove( MOVE(sq, target, PIECES.EMPTY, PIECES.EMPTY, 0 ));
					target += dir;
				}
			}
		}
		pce = SlidePiece[pceIndex++];
	}
}
function GenerateCaptures() {
	GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply];

	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var target;
	var dir;

	if(GameBoard.side == COLOURS.WHITE) {
		pceType = PIECES.wP;

		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];

			if(SquareOffboard(sq + 9) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq+9]] == COLOURS.BLACK) {
				WhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq+9]);
			}

			if(SquareOffboard(sq + 11) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq+11]] == COLOURS.BLACK) {
				WhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq+11]);
			}

			if(GameBoard.enPassant != SQUARES.NO_SQ) {
				if(sq + 9 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}

				if(sq + 11 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}
			}

		}

	}
	else {
		pceType = PIECES.bP;

		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];

			if(SquareOffboard(sq - 9) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq-9]] == COLOURS.WHITE) {
				BlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq-9]);
			}

			if(SquareOffboard(sq - 11) == BOOL.FALSE && PieceColor[GameBoard.pieces[sq-11]] == COLOURS.WHITE) {
				BlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq-11]);
			}

			if(GameBoard.enPassant != SQUARES.NO_SQ) {
				if(sq - 9 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}

				if(sq - 11 == GameBoard.enPassant) {
					AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MoveFlagEP ) );
				}
			}
		}
	}

	pceIndex = LoopNonSlideIndex[GameBoard.side];
	pce = NonSlidePiece[pceIndex++];

	while (pce != 0) {
		for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				target = sq + dir;

				if(SquareOffboard(target) == BOOL.TRUE) {
					continue;
				}

				if(GameBoard.pieces[target] != PIECES.EMPTY) {
					if(PieceColor[GameBoard.pieces[target]] != GameBoard.side) {
						AddCaptureMove( MOVE(sq, target, GameBoard.pieces[target], PIECES.EMPTY, 0 ));
					}
				}
			}
		}
		pce = NonSlidePiece[pceIndex++];
	}

	pceIndex = LoopSlideIndex[GameBoard.side];
	pce = SlidePiece[pceIndex++];

	while(pce != 0) {
		for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				target = sq + dir;

				while( SquareOffboard(target) == BOOL.FALSE ) {

					if(GameBoard.pieces[target] != PIECES.EMPTY) {
						if(PieceColor[GameBoard.pieces[target]] != GameBoard.side) {
							AddCaptureMove( MOVE(sq, target, GameBoard.pieces[target], PIECES.EMPTY, 0 ));
						}
						break;
					}
					target += dir;
				}
			}
		}
		pce = SlidePiece[pceIndex++];
	}
}
