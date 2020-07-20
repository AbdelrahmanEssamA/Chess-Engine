/*Abdelrahman Essam 155295
  Marwan Mohamed 152282*/
$(function() {
    $("#SetFen").click(function () {
	       var fenStr = $("#fenIn").val();
	       NewGame(fenStr);
     });
     $('#SearchButton').click( function () {
     	GameController.PlayerSide = GameController.side ^ 1;
     	PreSearch();
     });
     $('#NewGameButton').click( function () {
       NewGame(START_FEN);
     });
     $('#visionTest').click( function () {
       var f = Math.floor(Math.random () * 7 + 0);
       var r = Math.floor(Math.random() * 7 + 0);
       var test = (FileChar[f] + RankChar[r]);
       console.log(test);
       $('#testFiled').text (test);
     });
});
function ClearAllPieces() {
	$(".Piece").remove();
}

function PrMove(move) {
	var MvStr;

	var ff = FilesBrd[FromSquare(move)];
	var rf = RanksBrd[FromSquare(move)];
	var ft = FilesBrd[ToSquare(move)];
	var rt = RanksBrd[ToSquare(move)];

	MvStr = FileChar[ff] + RankChar[rf] + FileChar[ft] + RankChar[rt];

	var promoted = PROMOTED(move);

	if(promoted != PIECES.EMPTY) {
		var pchar = 'q';
		if(PieceKnight[promoted] == BOOL.TRUE) {
			pchar = 'n';
		}
        else if(PieceRookQueen[promoted] == BOOL.TRUE && PieceBishopQueen[promoted] == BOOL.FALSE)  {
			pchar = 'r';
		}
        else if(PieceRookQueen[promoted] == BOOL.FALSE && PieceBishopQueen[promoted] == BOOL.TRUE)   {
			pchar = 'b';
		}
		MvStr += pchar;
	}
	return MvStr;
}
function PrintMoveList() {

	var i;
	var move;
	var num = 1;
	console.log('MoveList:');

	for(i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply+1]; ++i) {
		move = GameBoard.moveList[i];
		console.log('Move:' + num + ':' + PrintMove(move));
		num++;
	}
}
function NewGame(fenStr) {
	ParseFen(fenStr);
	PrintBoard();
	SetInitialBoardPieces();
}
function SetInitialBoardPieces() {

	var sq;
	var sq120;
	var file,rank;
	var rankName;
	var fileName;
	var imageString;
	var pieceFileName;
	var pce;
	ClearAllPieces();
	for(sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = GameBoard.pieces[sq120];
		file = FilesBrd[sq120];
		rank = RanksBrd[sq120];
		if(pce >= PIECES.wP && pce <= PIECES.bK) {
			rankName = "rank" + (rank+1);
			fileName = "file" + (file+1);
			pieceFileName = "pics/" + SideChar[PieceColor [pce]] + PceChar[pce].toUpperCase() + ".png";
			imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
			$("#Board").append(imageString);
		}
	}

}

function SetSqSelected(sq) {
	$('.Square').each( function(index) {
		if( (RanksBrd[sq] == 7 - Math.round($(this).position().top/60) ) &&
				FilesBrd[sq] == Math.round($(this).position().left/60) ) {
				$(this).addClass('SqSelected');
		}
	} );
}
function SetVaqSelected(sq) {
	$('.Vsquare').each( function(index) {
		if( (RanksBrd[sq] == 7 - Math.round($(this).position().top/60) ) &&
				FilesBrd[sq] == Math.round($(this).position().left/60) ) {
				$(this).addClass('SqSelected');
		}
	} );
}

function ClickedSquare(pageX, pageY) {
	console.log('ClickedSquare() at ' + pageX + ',' + pageY);
	var position = $('#Board').position();
	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);
	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);

	var file = Math.floor((pageX-workedX) / 60);
	var rank = 7 - Math.floor((pageY-workedY) / 60);

	var sq = FilesRanks2Sqr(file,rank);

	console.log('Clicked sq:' + PrSq(sq));

	SetSqSelected(sq);
    return(sq);
}
function DeSelectSq(sq) {
	$('.Square').each( function(index) {
		if( (RanksBrd[sq] == 7 - Math.round($(this).position().top/60) ) &&
				FilesBrd[sq] == Math.round($(this).position().left/60) ) {
				$(this).removeClass('SqSelected');
		}
	} );
}

function DeSelectVSq(sq) {
	$('.Vsquare').each( function(index) {
		if( (RanksBrd[sq] == 7 - Math.round($(this).position().top/60) ) &&
				FilesBrd[sq] == Math.round($(this).position().left/60) ) {
				$(this).removeClass('SqSelected');
		}
	} );
}
function ClickedVsquare(pageX, pageY) {
	console.log('ClickedSquare() at ' + pageX + ',' + pageY);
	var position = $('#VisionBoard').position();
	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);
	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);

	var file = Math.floor((pageX-workedX) / 60);
	var rank = 7 - Math.floor((pageY-workedY) / 60);

	var sq = FilesRanks2Sqr(file,rank);
    sqValue =  PrSq(sq);
	console.log('Clicked sq:' +sqValue);

	SetVaqSelected(sq);
    if (sqValue == $('#testFiled').text() ){
         $('#testFiled').text('Correct');
    }
    else {
         $('#testFiled').text('Wrong');
    }
    DeSelectVSq(sq);
    return(sq)
}
function DeSelectSq(sq) {
	$('.Square').each( function(index) {
		if( (RanksBrd[sq] == 7 - Math.round($(this).position().top/60) ) &&
				FilesBrd[sq] == Math.round($(this).position().left/60) ) {
				$(this).removeClass('SqSelected');
		}
	} );
}

$(document).on('click','.Piece', function (e) {
	console.log('Piece Click');

	if(UserMove.from == SQUARES.NO_SQ) {
		UserMove.from = ClickedSquare(e.pageX, e.pageY);
	} else {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
	}

	MakeUserMove();

});
$(document).on('click','.Square', function (e) {
	console.log('Square Click');
	if(UserMove.from != SQUARES.NO_SQ) {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
		MakeUserMove();
	}

});
$(document).on('click','.Vsquare', function (e) {
	ClickedVsquare(e.pageX,e.pageY);

});

function PieceIsOnSquare(sq, top, left){

	if( (RanksBrd[sq] == 7 - Math.round(top/60) ) &&
		FilesBrd[sq] == Math.round(left/60) ) {
		return BOOL.TRUE;
	}
	return BOOL.FALSE;
}
function RemoveGUIPiece(sq) {
	$('.Piece').each( function(index) {
		if(PieceIsOnSquare(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).remove();
		}
	} );
}
function AddGUIPiece(sq, pce) {

	var file = FilesBrd[sq];
	var rank = RanksBrd[sq];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	var pieceFileName = "pics/" + SideChar[PieceColor[pce]] + PceChar[pce].toUpperCase() + ".png";
	var	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
	$("#Board").append(imageString);
}
function MoveGUIPiece(move) {
    var x = document.getElementById("moveAudio");
	var from = FromSquare(move);
	var to = ToSquare(move);
    //enPassant
	if(move & MoveFlagEP) {
        console.log('a7a');
		var epRemove;
		if(GameBoard.side == COLOURS.BLACK) {
			epRemove = to - 10;
		}
        else {
			epRemove = to + 10;
		}
		RemoveGUIPiece(epRemove);
	}
    //capture normally
    else if(CAPTURED(move)) {
		RemoveGUIPiece(to);
	}

	var file = FilesBrd[to];
	var rank = RanksBrd[to];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);

	$('.Piece').each( function(index) {
		if(PieceIsOnSquare(from, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).removeClass();
			$(this).addClass("Piece " + rankName + " " + fileName);
		}
	} );

	if(move & MoveFlagCA) {
		switch(to) {
			case SQUARES.G1: RemoveGUIPiece(SQUARES.H1); AddGUIPiece(SQUARES.F1, PIECES.wR); break;
			case SQUARES.C1: RemoveGUIPiece(SQUARES.A1); AddGUIPiece(SQUARES.D1, PIECES.wR); break;
			case SQUARES.G8: RemoveGUIPiece(SQUARES.H8); AddGUIPiece(SQUARES.F8, PIECES.bR); break;
			case SQUARES.C8: RemoveGUIPiece(SQUARES.A8); AddGUIPiece(SQUARES.D8, PIECES.bR); break;
		}
	}
     else if (PROMOTED(move)) {
		RemoveGUIPiece(to);
		AddGUIPiece(to, PROMOTED(move));
	}

    x.play();
}
function DrawMaterial() {

	if (GameBoard.pceNum[PIECES.wP]!=0 || GameBoard.pceNum[PIECES.bP]!=0)
        return BOOL.FALSE;
	if (GameBoard.pceNum[PIECES.wQ]!=0 || GameBoard.pceNum[PIECES.bQ]!=0 ||	GameBoard.pceNum[PIECES.wR]!=0 || GameBoard.pceNum[PIECES.bR]!=0)
        return BOOL.FALSE;
	if (GameBoard.pceNum[PIECES.wB] > 1 || GameBoard.pceNum[PIECES.bB] > 1) {
        return BOOL.FALSE;
    }
    if (GameBoard.pceNum[PIECES.wN] > 1 || GameBoard.pceNum[PIECES.bN] > 1)
    {
        return BOOL.FALSE;
    }

	if (GameBoard.pceNum[PIECES.wN]!=0 && GameBoard.pceNum[PIECES.wB]!=0) {
        return BOOL.FALSE;
    }
	if (GameBoard.pceNum[PIECES.bN]!=0 && GameBoard.pceNum[PIECES.bB]!=0) {
        return BOOL.FALSE;
    }
	return BOOL.TRUE;
}
function ThreeFoldRep() {
	var i = 0, r = 0;

	for(i = 0; i < GameBoard.hisPly; ++i) {
		if (GameBoard.history[i].posKey == GameBoard.posKey) {
		    r++;
		}
	}
	return r;
}
//for Draw
function CheckResult() {
    var x = document.getElementById("drawAudio");
	if(GameBoard.fiftyMove >= 100) {
		 $("#GameStatus").text("GAME DRAWN : fifty move rule");
         x.play();
		 return BOOL.TRUE;
	}

	if (ThreeFoldRep() >= 2) {
     	$("#GameStatus").text("GAME DRAWN :3-fold repetition");
        x.play();
     	return BOOL.TRUE;
    }

	if (DrawMaterial() == BOOL.TRUE) {
     	$("#GameStatus").text("GAME DRAWN :insufficient material to mate");
        x.play();
     	return BOOL.TRUE;
    }

    GenerateMoves();

    var MoveNum = 0;
	var found = 0;

	for(MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum)  {

        if ( MakeMove(GameBoard.moveList[MoveNum]) == BOOL.FALSE)  {
            continue;
        }
        found++;
		TakeMove();
		break;
    }

	if(found != 0) return BOOL.FALSE;

	var InCheck = SquareAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side],0)], GameBoard.side^1);
    var x = document.getElementById("winAudio");
    var y = document.getElementById("loseAudio");

	if(InCheck == BOOL.TRUE) {
		if(GameBoard.side == COLOURS.WHITE) {
            y.play();
	      $("#GameStatus").text("GAME OVER You Lose");
	      return BOOL.TRUE;
        }
        else {
	      $("#GameStatus").text("You Win");
          x.play();
	      return BOOL.TRUE;
        }
	}
    else {
		$("#GameStatus").text("GAME DRAWN {stalemate}");
        return BOOL.TRUE;
	}

	return BOOL.FALSE;
}
//USer lost?
function CheckAndSet() {
	if(CheckResult() == BOOL.TRUE) {
		GameController.GameOver = BOOL.TRUE;
	}
    else {
		GameController.GameOver = BOOL.FALSE;
		$("#GameStatus").text('Guest Turn');

	}
}
function PreSearch() {
	if(GameController.GameOver == BOOL.FALSE) {
		AgentController.thinking = BOOL.TRUE;
		setTimeout( function() { StartSearch(); }, 400 );
	}
}
function StartSearch() {

	AgentController.depth = MAXDEPTH;
	var t = $.now();
	var tt = $('#ThinkTimeChoice').val();
	AgentController.time = parseInt(tt) * 1000;
	SearchPosition();

	MakeMove(AgentController.best);
	MoveGUIPiece(AgentController.best);
	CheckAndSet();
}
//Performance Measure.
function UpdateDOMStats(dom_depth) {

	$("#DepthOut").text("Depth: " + dom_depth);
	$("#NodesOut").text("Nodes: " + AgentController.nodes);
	$("#TimeOut").text("Time: " + (($.now()-AgentController.start)/1000).toFixed(1) + "s");
	$("#BestOut").text("BestMove: " + PrMove(AgentController.best));
}

// tic tac toe
function SwitchTurn(clickedBox){
	if (typeof XOgameBoard[clickedBox.target.id] == 'number')
    {
		turnController(clickedBox.target.id, UserPlayer)
		if (!checkWin(XOgameBoard, UserPlayer) && !emptySquares().length == 0)
        {
            turnController(minimax(XOgameBoard, AgentPlayer).index, AgentPlayer);
        }
        else if(emptySquares().length == 0)
           {
               for (var i = 0; i < boxes.length; i++)
                {
                    boxes[i].removeEventListener('click', SwitchTurn, false);
                }
            document.querySelector(".endMessage .text").innerHTML = "Draw Game";
           }
	}
}

function turnController(BoxID, player){
    var x = document.getElementById("winAudio");
    var y = document.getElementById("loseAudio");
	XOgameBoard[BoxID] = player;
	document.getElementById(BoxID).innerText = player;
	var Winner = checkWin(XOgameBoard, player)
	if (Winner)
        {
            for (var i = 0; i < boxes.length; i++)
            {
                boxes[i].removeEventListener('click', SwitchTurn, false);
            }
            if(Winner.player == UserPlayer)
                {
                    document.querySelector(".endMessage .text").innerHTML = "You won"
                    x.play();
                  return BOOL.TRUE;
                }
            else
            {
                document.querySelector(".endMessage .text").innerHTML = "You Lost";
                y.play();   
            }
        }
}

function checkWin(Gboard, player){
     if (
         (XOgameBoard[0] == player && XOgameBoard[1] == player && XOgameBoard[2] == player) ||
         (XOgameBoard[3] == player && XOgameBoard[4] == player && XOgameBoard[5] == player) ||
         (XOgameBoard[6] == player && XOgameBoard[7] == player && XOgameBoard[8] == player) ||
         (XOgameBoard[0] == player && XOgameBoard[3] == player && XOgameBoard[6] == player) ||
         (XOgameBoard[1] == player && XOgameBoard[4] == player && XOgameBoard[7] == player) ||
         (XOgameBoard[2] == player && XOgameBoard[5] == player && XOgameBoard[8] == player) ||
         (XOgameBoard[0] == player && XOgameBoard[4] == player && XOgameBoard[8] == player) ||
         (XOgameBoard[2] == player && XOgameBoard[4] == player && XOgameBoard[6] == player)
        )
         {
             return player;
         }
}

function emptySquares(){
    var emptySq=[];
    for(var i = 0; i < XOgameBoard.length; i++)
        {
            if(typeof XOgameBoard[i] == 'number')
                {
                    emptySq.push(XOgameBoard[i]);
                }
        }
    return emptySq;
}
