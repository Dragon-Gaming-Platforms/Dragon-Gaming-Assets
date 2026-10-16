//駒の配列
//玉側の駒
var koma0=['kyousha0a','keima0a','gin0a','kin0','ou0','hisha0a','kaku0a','hu0a','kyousha0b','keima0b','gin0b','hisha0b','kaku0b','hu0b'];
//成る
var koma0a=['kyousha0a','keima0a','gin0a','hisha0a','kaku0a','hu0a'];
var koma0b=['kyousha0b','keima0b','gin0b','hisha0b','kaku0b','hu0b'];

//王側の駒
var koma1=['kyousha1a','keima1a','gin1a','kin1','ou1','hisha1a','kaku1a','hu1a','kyousha1b','keima1b','gin1b','hisha1b','kaku1b','hu1b'];
//成る
var koma1a=['kyousha1a','keima1a','gin1a','hisha1a','kaku1a','hu1a'];
var koma1b=['kyousha1b','keima1b','gin1b','hisha1b','kaku1b','hu1b'];


//使う変数定義
var koma;//初めてクリックした駒、背景は青ではないもの
var komatable;//駒のいるテーブル
var komalocation;//駒のtdの位置
var a,b;//komaのTDの段、筋
var turn = 0;//先手玉か後手王かのターン
var komataked;//取られる駒、背景は青いもの
var komatakedlocation;//取られる駒の位置、移動先の位置
var ta,tb;//取られる駒の段筋
var komaget;//boxに入れる駒
var komacheck = [];//駒が行けるマス、配列
var basertable;//詰んできた駒の元のtable
var count = 0;

//駒がクリックされたら

$('#tbody-board').on('click','img',function(){
	if ($(this).parents('td').css('background-color')!='rgb(153, 217, 234)'){//背景が青でない、移動元の駒
		koma = $(this).attr('title');//駒名
		komatable = $(this).parents('table').attr('id');//駒の位置はboxかboardか
		
		if (komatable == 'tbody-board'){//board上の駒、駒の移動ルールに従い移動する
			a = $('#tbody-board tr').index($(this).parents('tr'));//段
			b = $('#tbody-board tr:eq('+a+') td').index($(this).parents('td'));//筋
			komalocation = $('#tbody-board tr:eq('+a+') td:eq('+b+')');
		}
		
		
		$('td').css('background','rgb(239, 228, 176)');//前まで変えた背景色を全部リセット
		$(this).parents('td').css('background','rgb(237, 28, 36)');//クリックした駒の背景を赤に
		
		if (turn==0){//玉側
			if (koma=='kyousha0a'){
				kyousha0a();
			} else if (koma == 'keima0a' ){	
				keima0a();
			} else if (koma == 'gin0a' ){	
				gin0a();
			} else if (koma == 'kin0'){
				kin0();
			} else if (koma == 'ou0'){
				ou0();
			} else if (koma == 'hisha0a'){
				hisha0a();
			} else if (koma == 'kaku0a'){
				kaku0a();
			} else if (koma == 'hu0a'){
				hu0a();
			} else if (koma=='kyousha0b'){
				kyousha0b();
			} else if (koma == 'keima0b' ){	
				keima0b();
			} else if (koma == 'gin0b' ){	
				gin0b();
			} else if (koma == 'hisha0b'){
				hisha0b();
			} else if (koma == 'kaku0b'){
				kaku0b();
			} else if (koma == 'hu0b'){
					hu0b();
			} 
		} else if (turn==1){//王側
			if (koma=='kyousha1a'){
				kyousha1a();
			} else if (koma == 'keima1a' ){	
				keima1a();
			} else if (koma == 'gin1a' ){	
				gin1a();
			} else if (koma == 'kin1'){
				kin1();
			} else if (koma == 'ou1'){
				ou1();
			} else if (koma == 'hisha1a'){
				hisha1a();
			} else if (koma == 'kaku1a'){
				kaku1a();
			} else if (koma == 'hu1a'){
				hu1a();
			} else if (koma=='kyousha1b'){
				kyousha1b();
			} else if (koma == 'keima1b' ){	
				keima1b();
			} else if (koma == 'gin1b' ){	
				gin1b();
			} else if (koma == 'hisha1b'){
				hisha1b();
			} else if (koma == 'kaku1b'){
				kaku1b();
			} else if (koma == 'hu1b'){
				hu1b();
			} 
		}
	}
})

//箱から打つ
$('#tbody-box0').on('click','img',function(){
	if ($(this).parents('td').css('background-color')!='rgb(153, 217, 234)'){//背景が青でない、移動元の駒
		koma = $(this).attr('title');//駒名
		komatable = $(this).parents('table').attr('id');//駒の位置はboxかboardか

		if (komatable == 'tbody-board'){//board上の駒、駒の移動ルールに従い移動する
			a = $('#tbody-board tr').index($(this).parents('tr'));//段
			b = $('#tbody-board tr:eq('+a+') td').index($(this).parents('td'));//筋
			komalocation = $('#tbody-board tr:eq('+a+') td:eq('+b+')');
		}

		$('td').css('background','rgb(239, 228, 176)');//前まで変えた背景色を全部リセット
		$(this).parents('td').css('background','rgb(237, 28, 36)');//クリックした駒の背景を赤に

		if (turn==0){//玉側
			if (koma=='kyousha0a'){
				kyousha0a();
			} else if (koma == 'keima0a' ){	
				keima0a();
			} else if (koma == 'gin0a' ){	
				gin0a();
			} else if (koma == 'kin0'){
				kin0();
			} else if (koma == 'ou0'){
				ou0();
			} else if (koma == 'hisha0a'){
				hisha0a();
			} else if (koma == 'kaku0a'){
				kaku0a();
			} else if (koma == 'hu0a'){
				hu0a();
			} else if (koma=='kyousha0b'){
				kyousha0b();
			} else if (koma == 'keima0b' ){	
				keima0b();
			} else if (koma == 'gin0b' ){	
				gin0b();
			} else if (koma == 'hisha0b'){
				hisha0b();
			} else if (koma == 'kaku0b'){
				kaku0b();
			} else if (koma == 'hu0b'){
					hu0b();
			} 
		} else if (turn==1){//王側
			if (koma=='kyousha1a'){
				kyousha1a();
			} else if (koma == 'keima1a' ){	
				keima1a();
			} else if (koma == 'gin1a' ){	
				gin1a();
			} else if (koma == 'kin1'){
				kin1();
			} else if (koma == 'ou1'){
				ou1();
			} else if (koma == 'hisha1a'){
				hisha1a();
			} else if (koma == 'kaku1a'){
				kaku1a();
			} else if (koma == 'hu1a'){
				hu1a();
			} else if (koma=='kyousha1b'){
				kyousha1b();
			} else if (koma == 'keima1b' ){	
				keima1b();
			} else if (koma == 'gin1b' ){	
				gin1b();
			} else if (koma == 'hisha1b'){
				hisha1b();
			} else if (koma == 'kaku1b'){
				kaku1b();
			} else if (koma == 'hu1b'){
				hu1b();
			} 
		}
	}
})

$('#tbody-box1').on('click','img',function(){
	if ($(this).parents('td').css('background-color')!='rgb(153, 217, 234)'){//背景が青でない、移動元の駒
		koma = $(this).attr('title');//駒名
		komatable = $(this).parents('table').attr('id');//駒の位置はboxかboardか
		
		if (komatable == 'tbody-board'){//board上の駒、駒の移動ルールに従い移動する
			a = $('#tbody-board tr').index($(this).parents('tr'));//段
			b = $('#tbody-board tr:eq('+a+') td').index($(this).parents('td'));//筋
			komalocation = $('#tbody-board tr:eq('+a+') td:eq('+b+')');
		}
		
		
		$('td').css('background','rgb(239, 228, 176)');//前まで変えた背景色を全部リセット
		$(this).parents('td').css('background','rgb(237, 28, 36)');//クリックした駒の背景を赤に
		
		if (turn==0){//玉側
			if (koma=='kyousha0a'){
				kyousha0a();
			} else if (koma == 'keima0a' ){	
				keima0a();
			} else if (koma == 'gin0a' ){	
				gin0a();
			} else if (koma == 'kin0'){
				kin0();
			} else if (koma == 'ou0'){
				ou0();
			} else if (koma == 'hisha0a'){
				hisha0a();
			} else if (koma == 'kaku0a'){
				kaku0a();
			} else if (koma == 'hu0a'){
				hu0a();
			} else if (koma=='kyousha0b'){
				kyousha0b();
			} else if (koma == 'keima0b' ){	
				keima0b();
			} else if (koma == 'gin0b' ){	
				gin0b();
			} else if (koma == 'hisha0b'){
				hisha0b();
			} else if (koma == 'kaku0b'){
				kaku0b();
			} else if (koma == 'hu0b'){
					hu0b();
			} 
		} else if (turn==1){//王側
			if (koma=='kyousha1a'){
				kyousha1a();
			} else if (koma == 'keima1a' ){	
				keima1a();
			} else if (koma == 'gin1a' ){	
				gin1a();
			} else if (koma == 'kin1'){
				kin1();
			} else if (koma == 'ou1'){
				ou1();
			} else if (koma == 'hisha1a'){
				hisha1a();
			} else if (koma == 'kaku1a'){
				kaku1a();
			} else if (koma == 'hu1a'){
				hu1a();
			} else if (koma=='kyousha1b'){
				kyousha1b();
			} else if (koma == 'keima1b' ){	
					keima1b();
			} else if (koma == 'gin1b' ){	
				gin1b();
			} else if (koma == 'hisha1b'){
				hisha1b();
			} else if (koma == 'kaku1b'){
				kaku1b();
			} else if (koma == 'hu1b'){
				hu1b();
			} 
		}
	}
})

//駒の動き
//香車
function kyousha0a(){
	if (komatable=='tbody-box0'){//駒はbox0にある
	for (var i=1; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある
		//動ける位置
			for (var i=0; i<a; i++ ){
				if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').length==0){
					$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
					break;
				} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
					$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
					break;
				}
			}
	}
}

//成香
function kyousha0b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}	
	
//桂馬
function keima0a(){
	if (komatable=='tbody-box0'){//駒はbox0にある
	for (var i=2; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		if (b!=0){
			komacheck = [
			$('#tbody-board tr:eq('+(a-2)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a-2)+') td:eq('+(b+1)+')')
			];
		} else {
			komacheck = [$('#tbody-board tr:eq('+(a-2)+') td:eq('+(b+1)+')')]
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	}
}

//成桂
function keima0b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}

//銀将
function gin0a(){
	if (komatable=='tbody-box0'){//駒はbox0にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	}
}

//成銀
function gin0b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}	

//歩兵
function hu0a(){
	if (komatable=='tbody-box0'){//駒はbox0にある
		for (var i=1; i<9; i++) {
			$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
		
		
		for (var j=0; j<9; j++) {
			nest:{
		
				for (var i=1; i<9; i++){
					if ($('#tbody-board tr:eq('+i+') td:eq('+j+')').children('img').attr('title')=="hu0a"){
						for (var x=1;x<9;x++){
							$('#tbody-board tr:eq('+x+') td:eq('+j+')').css('background','rgb(239, 228, 176)');
						}
						break nest;
					}
				}	
					
			}
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
			if(($('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')').children('img').length==0)||koma0.indexOf($('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')').children('img').attr('title'))==-1){
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} 
		
	}
}

//と金
function hu0b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}	

//飛車
function hisha0a(){
	if (komatable=='tbody-box0'){//駒はbox0にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		//上
		for (var i=0; i<a; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//下
		for (var i=(a+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左
		for (var i=0; i<b; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右
		for (var i=(b+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
	}
}

//竜王
function hisha0b(){
		//動ける位置
		//上
		for (var i=0; i<a; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//下
		for (var i=(a+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左
		for (var i=0; i<b; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右
		for (var i=(b+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//周り4つ
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
}

//角行
function kaku0a(){
	if (komatable=='tbody-box0'){//駒はbox0にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		//左上　a-1 b-1 a-2 b-2  a-i b-i
		for (var i=0; i<a&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左下 a+1 b-1 a+2 b-2 a+i b-i
		for (var i=0; i<(9-a)&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右上 a-1 b+1 a-2 b+2 a-i b+i
		for (var i=0; i<a&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右下 a+1 b+1  a+2 b+2  a+i b+i
		for (var i=0; i<(9-a)&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
	}
}

//竜馬
function kaku0b(){
		//動ける位置
		//左上　a-1 b-1 a-2 b-2  a-i b-i
		for (var i=0; i<a&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左下 a+1 b-1 a+2 b-2 a+i b-i
		for (var i=0; i<(9-a)&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右上 a-1 b+1 a-2 b+2 a-i b+i
		for (var i=0; i<a&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右下 a+1 b+1  a+2 b+2  a+i b+i
		for (var i=0; i<(9-a)&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma0.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//周り4つ
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
		
}

//金将
function kin0(){
	if (komatable=='tbody-box0'){//駒はbox0にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	}	
}

//玉将
function ou0(){
	//動ける位置
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma0.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	
}


//王側 1
//香車
function kyousha1a(){
	if (komatable=='tbody-box1'){//駒はbox1にある
	for (var i=0; i<8; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある
		//動ける位置
			for (var i=0; i<(9-a); i++ ){
				if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+b+')').children('img').length==0){
					$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
					break;
				} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
					$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
					break;
				}
			}
	}
}

//成香
function kyousha1b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}	
	
//桂馬
function keima1a(){
	if (komatable=='tbody-box1'){//駒はbox1にある
	for (var i=0; i<7; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		if (b!=0){
			komacheck = [
			$('#tbody-board tr:eq('+(a+2)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+2)+') td:eq('+(b+1)+')')
			];
		} else {
			komacheck = [$('#tbody-board tr:eq('+(a+2)+') td:eq('+(b+1)+')')]
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	}
}

//成桂
function keima1b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}	

//銀将
function gin1a(){
	if (komatable=='tbody-box1'){//駒はbox1にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	}
}

//成銀
function gin1b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}	

//歩兵
function hu1a(){
	if (komatable=='tbody-box1'){//駒はbox1にある
		for (var i=0; i<8; i++) {
			$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
		
		
		for (var j=0; j<9; j++) {
			nest:{
		
				for (var i=0; i<8; i++){
					if ($('#tbody-board tr:eq('+i+') td:eq('+j+')').children('img').attr('title')=="hu1a"){
						for (var x=0;x<8;x++){
							$('#tbody-board tr:eq('+x+') td:eq('+j+')').css('background','rgb(239, 228, 176)');
						}
						break nest;
					}
				}	
					
			}
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
			if(($('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')').children('img').length==0)||koma1.indexOf($('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')').children('img').attr('title'))==-1){
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} 
		
	}
}

//と金
function hu1b(){
	//動ける位置
	if (a!=0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a!=0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
			];
	} else if (a==0&&b!=0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	} else if (a==0&&b==0){
		komacheck = [
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
			$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
			$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
			];
	}
	
	for (var i=0; i<komacheck.length; i++){
		if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
			komacheck[i].css('background','rgb(153, 217, 234)');
		} 
	}
}	

//飛車
function hisha1a(){
	if (komatable=='tbody-box1'){//駒はbox1にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		//上
		for (var i=0; i<a; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//下
		for (var i=(a+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左
		for (var i=0; i<b; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右
		for (var i=(b+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
	}
}

//竜王
function hisha1b(){
		//動ける位置
		//上
		for (var i=0; i<a; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//下
		for (var i=(a+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').length==0){
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+i+') td:eq('+b+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+i+') td:eq('+b+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左
		for (var i=0; i<b; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右
		for (var i=(b+1); i<9; i++ ){
			if($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').length==0){
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+i+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+a+') td:eq('+i+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//周り4つ
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
}

//角行
function kaku1a(){
	if (komatable=='tbody-box1'){//駒はbox1にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		//左上　a-1 b-1 a-2 b-2  a-i b-i
		for (var i=0; i<a&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左下 a+1 b-1 a+2 b-2 a+i b-i
		for (var i=0; i<(9-a)&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右上 a-1 b+1 a-2 b+2 a-i b+i
		for (var i=0; i<a&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右下 a+1 b+1  a+2 b+2  a+i b+i
		for (var i=0; i<(9-a)&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
	}
}

//竜馬
function kaku1b(){
		//動ける位置
		//左上　a-1 b-1 a-2 b-2  a-i b-i
		for (var i=0; i<a&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//左下 a+1 b-1 a+2 b-2 a+i b-i
		for (var i=0; i<(9-a)&&i<b; i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b-1-i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右上 a-1 b+1 a-2 b+2 a-i b+i
		for (var i=0; i<a&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a-1-i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//右下 a+1 b+1  a+2 b+2  a+i b+i
		for (var i=0; i<(9-a)&&i<(9-b); i++ ){
			if($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').length==0){
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))!=-1){//自分の駒
				break;
			} else if (koma1.indexOf($('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').children('img').attr('title'))==-1){//相手の駒
				$('#tbody-board tr:eq('+(a+1+i)+') td:eq('+(b+1+i)+')').css('background','rgb(153, 217, 234)');
				break;
			}
		}
		
		//周り4つ
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+a+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+a+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
		
}

//金将
function kin1(){
	if (komatable=='tbody-box1'){//駒はbox1にある
	for (var i=0; i<9; i++) {
				$('#tbody-board tr:eq('+i+') td:not(:has(img))').css('background','rgb(153, 217, 234)');
		}
	} else if (komatable == 'tbody-board'){//駒はboardにある

		//動ける位置
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	}	
}

//王将
function ou1(){
	//動ける位置
		if (a!=0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a!=0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a-1)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b!=0){
			komacheck = [
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b-1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		} else if (a==0&&b==0){
			komacheck = [
				$('#tbody-board tr:eq('+(a)+') td:eq('+(b+1)+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+b+')'),
				$('#tbody-board tr:eq('+(a+1)+') td:eq('+(b+1)+')')
				];
		}
		
		for (var i=0; i<komacheck.length; i++){
			if((komacheck[i].children('img').length==0)||koma1.indexOf(komacheck[i].children('img').attr('title'))==-1){
				komacheck[i].css('background','rgb(153, 217, 234)');
			} 
		}
	
}

	
//////////////////////////////////マスがクリックされた、移動、取る、打つの動作
$('#tbody-board').on('click','td',function(){
		//background-color 237, 28, 36　のtdのlocationはboard? box?
	if ($(this).css('background-color')=='rgb(153, 217, 234)'){//移動できるマスなの？
		var redtd ='';
		var ra,rb = '';
		
		nest:{//赤背景の駒がboardにいるか
			for (ra=0;ra<9;ra++){
				for (rb=0;rb<9;rb++){
					if ($('#tbody-board tr:eq('+ra+') td:eq('+rb+')').css('background-color')=='rgb(237, 28, 36)'){
						redtd = $('#tbody-board tr:eq('+ra+') td:eq('+rb+')');
						break nest;
					}
				}
			}
		}
		
		if (redtd){//boardにいる
			var dra = ra;
			var drb = rb;
			var dkoma = koma;
			
			//取れる駒がある
			if ($(this).children('img').length!=0){
				komataked = $(this).children('img').attr('title'); //取られる駒を記録	
				
				var dkomataked = komataked;
				
				//勝ち
				if(komataked=="ou0"){
					alert('後手が勝ちました！');
				} else if (komataked=="ou1"){
					alert('先手が勝ちました！');
				}
				
				if (koma0.indexOf(komataked)!=-1){
					var x = (koma0.indexOf(komataked));
					komaget = koma1[x];//getした駒
					
					//成った駒を元の駒に戻す
					if (koma1b.indexOf(komaget)!=-1){
						var x = (koma1b.indexOf(komaget));
						komaget = koma1a[x];
					}
					
					//box1に入れる
					nest:{
						for (var i=0;i<4;i++){
							for (var j=0;j<5;j++){
								if ($('#tbody-box1 tr:eq('+i+') td:eq('+j+')').children('img').length==0){
									$('#tbody-box1 tr:eq('+i+') td:eq('+j+')').append('<img title=\"'+komaget+'\" src=\"img\\'+komaget+'.png\">');
									var dboxname = 'box1';
									break nest;
								}
							}
						}
					}	
				} else {
					var x = (koma1.indexOf(komataked));
					komaget = koma0[x];//getした駒
					
					//成った駒を元の駒に戻す
					if (koma0b.indexOf(komaget)!=-1){
						var x = (koma0b.indexOf(komaget));
						komaget = koma0a[x];
					}
					
					//box0に入れる
					nest:{
						for (var i=0;i<4;i++){
							for (var j=0;j<5;j++){
								if ($('#tbody-box0 tr:eq('+i+') td:eq('+j+')').children('img').length==0){
									$('#tbody-box0 tr:eq('+i+') td:eq('+j+')').append('<img title=\"'+komaget+'\" src=\"img\\'+komaget+'.png\">');
									var dboxname = 'box0';
									break nest;
								}
							}
						}
					}	
				} 
			}
			
				ta = $('#tbody-board tr').index($(this).parents('tr'));//段
				tb = $('#tbody-board tr:eq('+ta+') td').index($(this));//筋
				komatakedlocation = $('#tbody-board tr:eq('+ta+') td:eq('+tb+')');//移動先の位置
				
				var dta = ta;
				var dtb = tb;
				
				//新位置TD子要素children　消す
				komatakedlocation.empty();
				
				//元のkomaのtdの子要素childrenを消す
				komalocation.empty();
				
				//成るかどうか
				//玉側
				if (koma0.indexOf(koma)!=-1){
					if (koma0a.indexOf(koma)!=-1){//成れるか？
						if ((koma=="hu0a"||koma=="kyousha0a")&&(ta==0)){
							koma = koma0b[koma0a.indexOf(koma)];
							var dchange = koma;
						} else if (koma=="keima0a"&&ta<2){
							koma = koma0b[koma0a.indexOf(koma)];
							var dchange = koma;
						} else if (ta<3||ra<3){
							if (window.confirm('成りますか？')){
								koma = koma0b[koma0a.indexOf(koma)];
								var dchange = koma;
							}
						} 
					}
				} else {//王側
					if (koma1a.indexOf(koma)!=-1){//成れるか？
						if ((koma=="hu1a"||koma=="kyousha1a")&&(ta==8)){
							koma = koma1b[koma1a.indexOf(koma)];
							var dchange = koma;
						} else if (koma=="keima1a"&&ta>6){
							koma = koma1b[koma1a.indexOf(koma)];
							var dchange = koma;
						} else if (ta>5||ra>5){
								if (window.confirm('成りますか？')){
									koma = koma1b[koma1a.indexOf(koma)];
									var dchange = koma;
								}
							}
					}
				}
				
				//新位置TDにappend koma
				komatakedlocation.append('<img title=\"'+koma+'" src=\"img\\'+koma+'.png\">');
				
				
				//履歴記録
				var checkhistoryid = alasql('SELECT * FROM history WHERE id = ?',[count]);
				
				
				if (checkhistoryid.length == 0){
					//INSERT INTO
					var writehistory = 'INSERT INTO history(id, koma, ra, rb, ta, tb, change, komataked, boxname ) VALUES(?,?,?,?,?,?,?,?,?)';
					alasql(writehistory,[count, dkoma, dra, drb, dta, dtb, dchange, dkomataked, dboxname]);
				} else {
					//UPDATE
					var writehistory = 'UPDATE history SET koma = ?, ra = ?, rb = ?, ta = ?, tb = ?, change = ?, komataked = ?, boxname = ? WHERE id = ?';
					alasql(writehistory,[dkoma, dra, drb, dta, dtb, dchange, dkomataked, dboxname, count]);
					//DELETE FROM
					alasql('DELETE FROM history WHERE id > ?',[ count ]);
				}
				
				//td backgroundを全部239 228 176
				$('td').css('background','rgb(239, 228, 176)');
				
		} else {//background-color 237, 28, 36　のtdがほか（BOX）にいる
				ta = $('#tbody-board tr').index($(this).parents('tr'));//段
				tb = $('#tbody-board tr:eq('+ta+') td').index($(this));//筋
				komatakedlocation = $('#tbody-board tr:eq('+ta+') td:eq('+tb+')');//移動先の位置
				
				var dta=ta;
				var dtb=tb;
				
				//boxから元の駒を特定　redtd
				if (turn==0){//先手、box0から調べる
					nest:{
						for (ra=0;ra<5;ra++){
							for (rb=0;rb<4;rb++){
								if ($('#tbody-box0 tr:eq('+ra+') td:eq('+rb+')').css('background-color')=='rgb(237, 28, 36)'){
									redtd = $('#tbody-box0 tr:eq('+ra+') td:eq('+rb+')');
									var dra = ra;
									var drb = rb;
									var duboxname = 'box0';
									break nest;
								}
							}
						}
					}
				} else if (turn==1){//後手、box1から
					nest:{
						for (ra=0;ra<5;ra++){
							for (rb=0;rb<4;rb++){
								if ($('#tbody-box1 tr:eq('+ra+') td:eq('+rb+')').css('background-color')=='rgb(237, 28, 36)'){
									redtd = $('#tbody-box1 tr:eq('+ra+') td:eq('+rb+')');
									var dra = ra;
									var drb = rb;
									var duboxname = 'box1';
									break nest;
								}
							}
						}
					}
				}
				
				//元のkomaのtdの子要素childrenを消す
				redtd.empty();
				
				dkoma = koma;
				
				//新位置TDにappend koma
				komatakedlocation.append('<img title=\"'+koma+'" src=\"img\\'+koma+'.png\">');
				
				
				//履歴記録
				var checkhistoryid = alasql('SELECT * FROM history WHERE id = ?',[count]);
				
				
				if (checkhistoryid.length == 0){
					//INSERT INTO
					var writehistory = 'INSERT INTO history(id, koma, ra, rb, ta, tb, uboxname ) VALUES(?,?,?,?,?,?,?)';
					alasql(writehistory,[count, dkoma, dra, drb, dta, dtb, duboxname]);
				} else {
					//UPDATE
					var writehistory = 'UPDATE history SET koma = ?, ra = ?, rb = ?, ta = ?, tb = ?, uboxname = ? WHERE id = ?';
					alasql(writehistory,[dkoma, dra, drb, dta, dtb, duboxname, count]);
					//DELETE FROM
					alasql('DELETE FROM history WHERE id > ?',[ count ]);
				}
				
				
				//td backgroundを全部239 228 176
				$('td').css('background','rgb(239, 228, 176)');
					
				
		}
		
		//移動、取る、打つ完了
		
		//詰み判断
		a = ta;
		b = tb;
		basertable = komatable;
		komatable = 'tbody-board';
		
		//komaの青範囲内にouいるか？
			if (koma=='kyousha0a'){
				kyousha0a();
			} else if (koma == 'keima0a' ){	
				keima0a();
			} else if (koma == 'gin0a' ){	
				gin0a();
			} else if (koma == 'kin0'){
				kin0();
			} else if (koma == 'ou0'){
				ou0();
			} else if (koma == 'hisha0a'){
				hisha0a();
			} else if (koma == 'kaku0a'){
				kaku0a();
			} else if (koma == 'hu0a'){
				hu0a();
			} else if (koma=='kyousha0b'){
				kyousha0b();
			} else if (koma == 'keima0b' ){	
				keima0b();
			} else if (koma == 'gin0b' ){	
				gin0b();
			} else if (koma == 'hisha0b'){
				hisha0b();
			} else if (koma == 'kaku0b'){
				kaku0b();
			} else if (koma == 'hu0b'){
				hu0b();
			}  else if  (koma=='kyousha1a'){
				kyousha1a();
			} else if (koma == 'keima1a' ){	
				keima1a();
			} else if (koma == 'gin1a' ){	
				gin1a();
			} else if (koma == 'kin1'){
				kin1();
			} else if (koma == 'ou1'){
				ou1();
			} else if (koma == 'hisha1a'){
				hisha1a();
			} else if (koma == 'kaku1a'){
				kaku1a();
			} else if (koma == 'hu1a'){
				hu1a();
			} else if (koma=='kyousha1b'){
				kyousha1b();
			} else if (koma == 'keima1b' ){	
				keima1b();
			} else if (koma == 'gin1b' ){	
				gin1b();
			} else if (koma == 'hisha1b'){
				hisha1b();
			} else if (koma == 'kaku1b'){
				kaku1b();
			} else if (koma == 'hu1b'){
				hu1b();
			} 
		
				
		//ouが青背景？
		if ($('[title=ou0]').parents('td').css('background-color')=='rgb(153, 217, 234)'||$('[title=ou1]').parents('td').css('background-color')=='rgb(153, 217, 234)'){
			tsumi();
		}
		
		

		//手数+1
		count ++;
		$('#count').val(count);
		
		$('#before').attr('disabled',false);
		$('#after').attr('disabled',true);
		
		//td backgroundを全部239 228 176
		$('td').css('background','rgb(239, 228, 176)');
		
		//turn変え
		if (turn==0){
			turn=1;
			$('#1').css('color','rgb(237, 28, 36)');
			$('#0').css('color','rgb(153, 217, 234)');
		} else {
			turn=0;
			$('#0').css('color','rgb(237, 28, 36)');
			$('#1').css('color','rgb(153, 217, 234)');
		}
		
		koma ='';//初めてクリックした駒、背景は青ではないもの
		komatable ='';//駒のいるテーブル
		komalocation ='';//駒のtdの位置
		a,b='';//komaのTDの段、筋
		komataked='';//取られる駒、背景は青いもの
		komatakedlocation='';//取られる駒の位置
		ta,tb='';//取られる駒の段筋
		komaget='';//boxに入れる駒		
	}
	
});

//beforeボタン
before = function (){
	var bhistorys = alasql('SELECT * FROM history WHERE id = ?', [ parseInt(count)-1 ]);
	var bkoma = bhistorys[0].koma;
	var bra = bhistorys[0].ra;
	var brb = bhistorys[0].rb;
	var bta = bhistorys[0].ta;
	var btb = bhistorys[0].tb;
	var bchange = bhistorys[0].change;
	var bkomataked = bhistorys[0].komataked;
	var bboxname = bhistorys[0].boxname;
	var buboxname = bhistorys[0].uboxname;
	
	//turn変え
	if ($('#1').css('color')=='rgb(153, 217, 234)'){
		turn=1;
		$('#1').css('color','rgb(237, 28, 36)');
		$('#0').css('color','rgb(153, 217, 234)');
	} else {
		turn=0;
		$('#0').css('color','rgb(237, 28, 36)');
		$('#1').css('color','rgb(153, 217, 234)');
	}
	
	if (buboxname){//BOXから打つ
		$('#tbody-'+buboxname+' tr:eq('+bra+') td:eq('+brb+')').append('<img title=\"'+bkoma+'\" src=\"img\\'+bkoma+'.png\">');
		//ta tb empty
		$('#tbody-board tr:eq('+bta+') td:eq('+btb+')').empty();
		
		//手数-1
		count--;
		$('#count').val(count);
	} else {
		//元の位置ra rbにkoma生成
		$('#tbody-board tr:eq('+bra+') td:eq('+brb+')').append('<img title=\"'+bkoma+'\" src=\"img\\'+bkoma+'.png\">');
		
		//ta tb empty
		$('#tbody-board tr:eq('+bta+') td:eq('+btb+')').empty();
		
		//手数-1
		count--;
		$('#count').val(count);
		
		
		if (bkomataked){
			//ta tb bkomataked
			$('#tbody-board tr:eq('+bta+') td:eq('+btb+')').append('<img title=\"'+bkomataked+'\" src=\"img\\'+bkomataked+'.png\">');
			
			//成った駒を戻す
			if (koma0b.indexOf(bkomataked)!=-1){
				var x = (koma0b.indexOf(bkomataked));
				bkomataked = koma0a[x];
			} else if (koma1b.indexOf(bkomataked)!=-1){
				var x = (koma1b.indexOf(bkomataked));
				bkomataked = koma1a[x];
			}
			
			//自分の駒にする
			if (koma0.indexOf(bkomataked)!=-1){
				var x = (koma0.indexOf(bkomataked));
				bkomataked = koma1[x];
			} else if (koma1.indexOf(bkomataked)!=-1){
				var x = (koma1.indexOf(bkomataked));
				bkomataked = koma0[x];
			}
			
				//boxから削除
				nest:{
					for (var i=0;i<4;i++){
						for (var j=0;j<5;j++){
							if ($('#tbody-'+bboxname+' tr:eq('+i+') td:eq('+j+')').children('img').attr('title')==bkomataked){
								$('#tbody-'+bboxname+' tr:eq('+i+') td:eq('+j+')').empty();
								break nest;
							}
						}
					}
				}	
			
			
		}
	}
	//0 before disabled
	if ($('#count').val()==0){
		$('#before').attr('disabled',true);
	}
	
	$('#after').attr('disabled',false);
	$('td').css('background','rgb(239, 228, 176)');
}

//afterボタン
after = function (){
	var ahistorys = alasql('SELECT * FROM history WHERE id = ?', [ parseInt(count) ]);
	var akoma = ahistorys[0].koma;
	var ara = ahistorys[0].ra;
	var arb = ahistorys[0].rb;
	var ata = ahistorys[0].ta;
	var atb = ahistorys[0].tb;
	var achange = ahistorys[0].change;
	var akomataked = ahistorys[0].komataked;
	var aboxname = ahistorys[0].boxname;
	var auboxname = ahistorys[0].uboxname;
	
	//turn変え
	if ($('#1').css('color')=='rgb(153, 217, 234)'){
		turn=1;
		$('#1').css('color','rgb(237, 28, 36)');
		$('#0').css('color','rgb(153, 217, 234)');
	} else {
		turn=0;
		$('#0').css('color','rgb(237, 28, 36)');
		$('#1').css('color','rgb(153, 217, 234)');
	}
	
	if (auboxname){//BOXから打つ
		$('#tbody-'+auboxname+' tr:eq('+ara+') td:eq('+arb+')').empty();
		//ta tb empty
		$('#tbody-board tr:eq('+ata+') td:eq('+atb+')').append('<img title=\"'+akoma+'\" src=\"img\\'+akoma+'.png\">');
		
		//手数+1
		count++;
		$('#count').val(count);
	} else {//board移動
		//元の位置ra rbをempty
		$('#tbody-board tr:eq('+ara+') td:eq('+arb+')').empty();
		
		//ta tb empty
		$('#tbody-board tr:eq('+ata+') td:eq('+atb+')').empty();
		
		//手数+1
		count++;
		$('#count').val(count);
		

		//append('<img title=\"'+bkoma+'\" src=\"img\\'+bkoma+'.png\">')
		
		if(achange){
			//成るのappend
			$('#tbody-board tr:eq('+ata+') td:eq('+atb+')').append('<img title=\"'+achange+'\" src=\"img\\'+achange+'.png\">');
		} else {
			$('#tbody-board tr:eq('+ata+') td:eq('+atb+')').append('<img title=\"'+akoma+'\" src=\"img\\'+akoma+'.png\">');
		}
		
		if (akomataked){//取った駒ある
			//成った駒を戻す
			if (koma0b.indexOf(akomataked)!=-1){
				var x = (koma0b.indexOf(akomataked));
				akomataked = koma0a[x];
			} else if (koma1b.indexOf(akomataked)!=-1){
				var x = (koma1b.indexOf(akomataked));
				akomataked = koma1a[x];
			}
			
			//自分の駒にする
			if (koma0.indexOf(akomataked)!=-1){
				var x = (koma0.indexOf(akomataked));
				akomataked = koma1[x];
			} else if (koma1.indexOf(akomataked)!=-1){
				var x = (koma1.indexOf(akomataked));
				akomataked = koma0[x];
			}
			
			//boxにappend
			nest:{
				for (var i=0;i<4;i++){
					for (var j=0;j<5;j++){
						if ($('#tbody-'+aboxname+' tr:eq('+i+') td:eq('+j+')').children('img').length==0){
							$('#tbody-'+aboxname+' tr:eq('+i+') td:eq('+j+')').append('<img title=\"'+akomataked+'\" src=\"img\\'+akomataked+'.png\">');
							break nest;
						}
					}
				}
			}
			
			
		}
	}	
	
	//max after disabled
	if ($('#count').val() == alasql('SELECT MAX(id) AS id FROM history ')[0].id+1){
		$('#after').attr('disabled',true);
	} else {
		$('#after').attr('disabled',false);
	}
	
	$('#before').attr('disabled',false);
	$('td').css('background','rgb(239, 228, 176)');
}

function tsumi(){
	var cescape=0;//逃げる
	var ctake=0;//取る
	var cstop=0;//塞ぐ
	var oulocation;//王の位置
	var nowoulocation;//試しに王を置く位置
	var basekoma = koma;//詰んできた駒
	var baselocation = komatakedlocation;//詰んできた駒の位置
	
	if ($('[title=ou0]').parents('td').css('background-color')=='rgb(153, 217, 234)'){ //玉詰んだ
		
		//td backgroundを全部239 228 176
		$('td').css('background','rgb(239, 228, 176)');
		
		//玉ou0位置確認
				nestoulocation:{
					for (a=0;a<9;a++){
						for (b=0;b<9;b++){
							if ($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title')=='ou0'){
								oulocation = $('#tbody-board tr:eq('+a+') td:eq('+b+')');
								break nestoulocation;
							}
						}
					}
				}
		
	//玉ou0逃げる
		
		nestescape:{
			ou0();	//玉ou0がいける位置
				
			for (a=0;a<9;a++){
				for (b=0;b<9;b++){
					if ($('#tbody-board tr:eq('+a+') td:eq('+b+')').css('background-color')=='rgb(153, 217, 234)'){//玉ou0いける位置を紫に
						$('#tbody-board tr:eq('+a+') td:eq('+b+')').css('background-color','rgb(163, 73, 164)');
					}
				}
			}
			
			//玉ou0移動してみる
			for (var ai=0;ai<9;ai++){
				for (var aj=0;aj<9;aj++){
					if ($('#tbody-board tr:eq('+ai+') td:eq('+aj+')').css('background-color')=='rgb(163, 73, 164)'){//玉ou0いける紫の位置
						//元の王を消す
						oulocation.empty();
						
						//今の位置に敵駒あるか
						if ($('#tbody-board tr:eq('+ai+') td:eq('+aj+')').children('img').attr('title')){//ある
							var outake = $('#tbody-board tr:eq('+ai+') td:eq('+aj+')').children('img').attr('title');//その駒記録
						}else{outake=''}
						
						//今の位置消す
						$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').empty();
						
						//今の位置に玉ou0 append
						$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').append('<img title=\"ou0\" src=\"img\\ou0.png\">');
						
						for (a=0;a<9;a++){//王側のすべての駒を特定し、いけるすべての位置を青
							for (b=0;b<9;b++){
								komatable = 'tbody-board';
								if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
									koma = $('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
									
									if (koma=='kyousha1a'){
										kyousha1a();
									} else if (koma == 'keima1a' ){	
										keima1a();
									} else if (koma == 'gin1a' ){	
										gin1a();
									} else if (koma == 'kin1'){
										kin1();
									} else if (koma == 'ou1'){
										ou1();
									} else if (koma == 'hisha1a'){
										hisha1a();
									} else if (koma == 'kaku1a'){
										kaku1a();
									} else if (koma == 'hu1a'){
										hu1a();
									} else if (koma=='kyousha1b'){
										kyousha1b();
									} else if (koma == 'keima1b' ){	
										keima1b();
									} else if (koma == 'gin1b' ){	
										gin1b();
									} else if (koma == 'hisha1b'){
										hisha1b();
									} else if (koma == 'kaku1b'){
										kaku1b();
									} else if (koma == 'hu1b'){
										hu1b();
									} 
								}
							}
						}
						
						//玉ou0取られるか
						
						if ($('#tbody-board tr:eq('+ai+') td:eq('+aj+')').css('background-color')!='rgb(153, 217, 234)'){//玉ou0のいるマスが青ではない！生きた
									
							cescape = 1;
									
							//元に戻す
							//今の王を消す
							$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').empty();
							
							if (outake){
								//今の位置に元の駒outake append
								$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').append('<img title=\"'+outake+'\" src=\"img\\'+outake+'.png\">');
							}
							//元の位置に玉ou0を append
							oulocation.append('<img title=\"ou0\" src=\"img\\ou0.png\">');
							break nestescape;
						}else {
							//取られた	　元に戻す　玉が取った駒も戻す	
						
							//今の王を消す
							$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').empty();
						
							if (outake){//今の位置に元の駒outake append
								$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').append('<img title=\"'+outake+'\" src=\"img\\'+outake+'.png\">');
							}
							//元の位置に玉ou0を append
							oulocation.append('<img title=\"ou0\" src=\"img\\ou0.png\">');
						}
					}
				}
			}
		}	
		
		//逃げる、調べ終わり、td backgroundを全部239 228 176
		$('td').css('background','rgb(239, 228, 176)');
		
		//その駒を取る
		nesttake:{
			for (a=0;a<9;a++){//玉側のすべての駒を特定し、いけるすべての位置を青
				for (b=0;b<9;b++){
					komatable = 'tbody-board';
					if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
						koma = $('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
						
						if (koma=='kyousha0a'){
							kyousha0a();
						} else if (koma == 'keima0a' ){	
							keima0a();
						} else if (koma == 'gin0a' ){	
							gin0a();
						} else if (koma == 'kin0'){
							kin0();
						} else if (koma == 'hisha0a'){
							hisha0a();
						} else if (koma == 'kaku0a'){
							kaku0a();
						} else if (koma == 'hu0a'){
							hu0a();
						} else if (koma=='kyousha0b'){
							kyousha0b();
						} else if (koma == 'keima0b' ){	
							keima0b();
						} else if (koma == 'gin0b' ){	
							gin0b();
						} else if (koma == 'hisha0b'){
							hisha0b();
						} else if (koma == 'kaku0b'){
							kaku0b();
						} else if (koma == 'hu0b'){
							hu0b();
						} 
					}
				}
			}
			
			//その駒取られるか
			
			if (baselocation.css('background-color')=='rgb(153, 217, 234)'){//komaのいるマスが//青だ！取れる
				ctake = 1;
				break nesttake;
			}
		}
		
		//取る、調べ終わり、td backgroundを全部239 228 176
		$('td').css('background','rgb(239, 228, 176)');
		
		//道を塞ぐ　詰んできた駒が1王側の香車、　飛車、　竜王、　角行、　竜馬
		neststop:{
			if	((basekoma=='kyousha1a')||(basekoma=='hisha1a')||(basekoma=='hisha1b')||(basekoma=='kaku1a')||(basekoma=='kaku1b')){
				//location再現して　tr td取る
				baselocation.css('background-color','rgb(1, 1, 1)');
						
				nestsearchbaselocation:{
					for (var basea=0;basea<9;basea++){
						for (var baseb=0;baseb<9;baseb++){
							if ($('#tbody-board tr:eq('+basea+') td:eq('+baseb+')').css('background-color')=='rgb(1, 1, 1)'){
								break nestsearchbaselocation;
							}
						}
					}
				}
				
				baselocation.css('background-color','rgb(239, 228, 176)');
				
				oulocation.css('background-color','rgb(1, 1, 1)');
				
				nestsearchoulocation:{
					for (var oua=0;oua<9;oua++){
						for (var oub=0;oub<9;oub++){
							if ($('#tbody-board tr:eq('+oua+') td:eq('+oub+')').css('background-color')=='rgb(1, 1, 1)'){
								break nestsearchoulocation;
							}
						}
					}
				}
				
				oulocation.css('background-color','rgb(239, 228, 176)');
				
				
				var countcheckstop=0;//紫のマスを計数
				
				if ((basekoma=='kyousha1a')&&(oua-basea>1)){//香車 上から下、　王a　> 香車a 2
					//間のマスを紫に
					for (var road=(basea+1);road<oua;road++){
						$('#tbody-board tr:eq('+road+') td:eq('+oub+')').css('background-color','rgb(163, 73, 164)');
						countcheckstop++;
					}
				} else if (basekoma=='hisha1a'||basekoma=='hisha1b'){//飛車　竜王
					if (oua-basea>1&&oub==baseb){//上
						//間のマスを紫に
						for (var road=(basea+1);road<oua;road++){
							$('#tbody-board tr:eq('+road+') td:eq('+oub+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else if (basea-oua>1&&oub==baseb){ //下
						//間のマスを紫に
						for (var road=(oua+1);road<basea;road++){
							$('#tbody-board tr:eq('+road+') td:eq('+oub+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else if (oub-baseb>1&&oua==basea){ //左
						//間のマスを紫に
						for (var road=(baseb+1);road<oub;road++){
							$('#tbody-board tr:eq('+oua+') td:eq('+road+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else if (baseb-oub>1&&oua==basea){ //右
						//間のマスを紫に
						for (var road=(oub+1);road<baseb;road++){
							$('#tbody-board tr:eq('+oua+') td:eq('+road+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else { //直接食べれる　塞げない　break
						break neststop;
					}
				} else if (basekoma=='kaku1a'||basekoma=='kaku1b'){//角行　竜馬
					if(oua-basea>1&&oub-baseb>1){//左上
						for (var roadi=1;roadi<(oua-basea);roadi++){
							$('#tbody-board tr:eq('+(basea+roadi)+') td:eq('+(baseb+roadi)+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else if(oua-basea>1&&baseb-oub>1){//右上
						for (var roadi=1;roadi<(oua-basea);roadi++){
							$('#tbody-board tr:eq('+(basea+roadi)+') td:eq('+(baseb-roadi)+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else if(basea-oua>1&&oub-baseb>1){//左下
						for (var roadi=1;roadi<(basea-oua);roadi++){
							$('#tbody-board tr:eq('+(basea-roadi)+') td:eq('+(baseb+roadi)+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else if(basea-oua>1&&baseb-oub>1){//右下
						for (var roadi=1;roadi<(basea-oua);roadi++){
							$('#tbody-board tr:eq('+(basea-roadi)+') td:eq('+(baseb-roadi)+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else { //直接食べれる　塞げない　break
						break neststop;
					}
				}
			
				
				
				
				for (a=0;a<9;a++){//盤上の玉側のすべての駒を特定し、いけるすべての位置を青
					for (b=0;b<9;b++){
						komatable = 'tbody-board';
						if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
							koma = $('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
							
							if (koma=='kyousha0a'){
								kyousha0a();
							} else if (koma == 'keima0a' ){	
								keima0a();
							} else if (koma == 'gin0a' ){	
								gin0a();
							} else if (koma == 'kin0'){
								kin0();
							} else if (koma == 'hisha0a'){
								hisha0a();
							} else if (koma == 'kaku0a'){
								kaku0a();
							} else if (koma == 'hu0a'){
								hu0a();
							} else if (koma=='kyousha0b'){
								kyousha0b();
							} else if (koma == 'keima0b' ){	
								keima0b();
							} else if (koma == 'gin0b' ){	
								gin0b();
							} else if (koma == 'hisha0b'){
								hisha0b();
							} else if (koma == 'kaku0b'){
								kaku0b();
							} else if (koma == 'hu0b'){
								hu0b();
							} 
						}
					}
				}
				
				//box0にあるすべての駒のいける位置
				for (a=0;a<4;a++){//box0内の玉側のすべての駒を特定し、いけるすべての位置を青
					for (b=0;b<5;b++){
						komatable = 'tbody-box0';
						if (koma0.indexOf($('#tbody-box0 tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
							koma = $('#tbody-box0 tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
							
							if (koma=='kyousha0a'){
								kyousha0a();
							} else if (koma == 'keima0a' ){	
								keima0a();
							} else if (koma == 'gin0a' ){	
								gin0a();
							} else if (koma == 'kin0'){
								kin0();
							} else if (koma == 'hisha0a'){
								hisha0a();
							} else if (koma == 'kaku0a'){
								kaku0a();
							} else if (koma == 'hu0a'){
								hu0a();
							} else if (koma=='kyousha0b'){
								kyousha0b();
							} else if (koma == 'keima0b' ){	
								keima0b();
							} else if (koma == 'gin0b' ){	
								gin0b();
							} else if (koma == 'hisha0b'){
								hisha0b();
							} else if (koma == 'kaku0b'){
								kaku0b();
							} else if (koma == 'hu0b'){
								hu0b();
							} 
						}
					}
				}
				
					
				//紫を計数
				var countpurple=0;
				
				for (var checkstopa=0;checkstopa<9;checkstopa++){
					for(var checkstopb=0;checkstopb<9;checkstopb++){
						if($('#tbody-board tr:eq('+checkstopa+') td:eq('+checkstopb+')').css('background-color')=='rgb(163, 73, 164)'){
							countpurple++;
						}
					}
				}
				
				if (countcheckstop!=countpurple){
					cstop=1;
				}
			}
		
		
			//塞ぐ、調べ終わり、td backgroundを全部239 228 176
			$('td').css('background','rgb(239, 228, 176)');
		}
		
		
		if (cescape!=1&&ctake!=1&&cstop!=1){
			if (basekoma=='hu1a'&&basertable=='tbody-box1'){
				alert('打ち歩詰め、反則負けです')
			} else {
				alert('詰みました');
			}
		}
		
	} else if ($('[title=ou1]').parents('td').css('background-color')=='rgb(153, 217, 234)'){//王詰んだ
			
			//td backgroundを全部239 228 176
			$('td').css('background','rgb(239, 228, 176)');
			
			//王ou1位置確認
					nestoulocation:{
						for (a=0;a<9;a++){
							for (b=0;b<9;b++){
								if ($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title')=='ou1'){
									oulocation = $('#tbody-board tr:eq('+a+') td:eq('+b+')');
									break nestoulocation;
								}
							}
						}
					}
			
		//王ou1逃げる
			
			nestescape:{
				ou1();	//玉ou0がいける位置
					
				for (a=0;a<9;a++){
					for (b=0;b<9;b++){
						if ($('#tbody-board tr:eq('+a+') td:eq('+b+')').css('background-color')=='rgb(153, 217, 234)'){//王ou1いける位置を紫に
							$('#tbody-board tr:eq('+a+') td:eq('+b+')').css('background-color','rgb(163, 73, 164)');
						}
					}
				}
				
				//王ou1移動してみる
				for (var ai=0;ai<9;ai++){
					for (var aj=0;aj<9;aj++){
						if ($('#tbody-board tr:eq('+ai+') td:eq('+aj+')').css('background-color')=='rgb(163, 73, 164)'){//王ou1いける紫の位置
							//元の王を消す
							oulocation.empty();
							
							//今の位置に敵駒あるか
							if ($('#tbody-board tr:eq('+ai+') td:eq('+aj+')').children('img').attr('title')){//ある
								var outake = $('#tbody-board tr:eq('+ai+') td:eq('+aj+')').children('img').attr('title');//その駒記録
							}else{outake=''}
							
							//今の位置消す
							$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').empty();
							
							//今の位置に王ou1 append
							$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').append('<img title=\"ou1\" src=\"img\\ou1.png\">');
							
							for (a=0;a<9;a++){//玉側のすべての駒を特定し、いけるすべての位置を青
								for (b=0;b<9;b++){
									komatable = 'tbody-board';
									if (koma0.indexOf($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
										koma = $('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
										
										if (koma=='kyousha0a'){
											kyousha0a();
										} else if (koma == 'keima0a' ){	
											keima0a();
										} else if (koma == 'gin0a' ){	
											gin0a();
										} else if (koma == 'kin0'){
											kin0();
										} else if (koma == 'ou0'){
											ou0();
										} else if (koma == 'hisha0a'){
											hisha0a();
										} else if (koma == 'kaku0a'){
											kaku0a();
										} else if (koma == 'hu0a'){
											hu0a();
										} else if (koma=='kyousha0b'){
											kyousha0b();
										} else if (koma == 'keima0b' ){	
											keima0b();
										} else if (koma == 'gin0b' ){	
											gin0b();
										} else if (koma == 'hisha0b'){
											hisha0b();
										} else if (koma == 'kaku0b'){
											kaku0b();
										} else if (koma == 'hu0b'){
											hu0b();
										} 
									}
								}
							}
							
							//王ou1取られるか
							
							if ($('#tbody-board tr:eq('+ai+') td:eq('+aj+')').css('background-color')!='rgb(153, 217, 234)'){//王ou1のいるマスが青ではない！生きた
										
								cescape = 1;
										
								//元に戻す
								//今の王を消す
								$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').empty();
								
								if (outake){
									//今の位置に元の駒outake append
									$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').append('<img title=\"'+outake+'\" src=\"img\\'+outake+'.png\">');
								}
								//元の位置に王ou1を append
								oulocation.append('<img title=\"ou1\" src=\"img\\ou1.png\">');
								break nestescape;
							}else {
								//取られた	　元に戻す　王が取った駒も戻す	
							
								//今の王を消す
								$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').empty();
							
								if (outake){//今の位置に元の駒outake append
									$('#tbody-board tr:eq('+ai+') td:eq('+aj+')').append('<img title=\"'+outake+'\" src=\"img\\'+outake+'.png\">');
								}
								//元の位置に王ou1を append
								oulocation.append('<img title=\"ou1\" src=\"img\\ou1.png\">');
							}
						}
					}
				}
			}	
			
			//逃げる、調べ終わり、td backgroundを全部239 228 176
			$('td').css('background','rgb(239, 228, 176)');
			
			//その駒を取る
			nesttake:{
				for (a=0;a<9;a++){//王側のすべての駒を特定し、いけるすべての位置を青
					for (b=0;b<9;b++){
						komatable = 'tbody-board';
						if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
							koma = $('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
							
							if (koma=='kyousha1a'){
								kyousha1a();
							} else if (koma == 'keima1a' ){	
								keima1a();
							} else if (koma == 'gin1a' ){	
								gin1a();
							} else if (koma == 'kin1'){
								kin1();
							} else if (koma == 'hisha1a'){
								hisha1a();
							} else if (koma == 'kaku1a'){
								kaku1a();
							} else if (koma == 'hu1a'){
								hu1a();
							} else if (koma=='kyousha1b'){
								kyousha1b();
							} else if (koma == 'keima1b' ){	
								keima1b();
							} else if (koma == 'gin1b' ){	
								gin1b();
							} else if (koma == 'hisha1b'){
								hisha1b();
							} else if (koma == 'kaku1b'){
								kaku1b();
							} else if (koma == 'hu1b'){
								hu1b();
							} 
						}
					}
				}
				
				//その駒取られるか
				
				if (baselocation.css('background-color')=='rgb(153, 217, 234)'){//komaのいるマスが//青だ！取れる
					ctake = 1;
					break nesttake;
				}
			}
			
			//取る、調べ終わり、td backgroundを全部239 228 176
			$('td').css('background','rgb(239, 228, 176)');
			
			//道を塞ぐ　詰んできた駒が0玉側の香車、　飛車、　竜王、　角行、　竜馬
			neststop:{
				if	((basekoma=='kyousha0a')||(basekoma=='hisha0a')||(basekoma=='hisha0b')||(basekoma=='kaku0a')||(basekoma=='kaku0b')){
					//location再現して　tr td取る
					baselocation.css('background-color','rgb(1, 1, 1)');
							
					nestsearchbaselocation:{
						for (var basea=0;basea<9;basea++){
							for (var baseb=0;baseb<9;baseb++){
								if ($('#tbody-board tr:eq('+basea+') td:eq('+baseb+')').css('background-color')=='rgb(1, 1, 1)'){
									break nestsearchbaselocation;
								}
							}
						}
					}
					
					baselocation.css('background-color','rgb(239, 228, 176)');
					
					oulocation.css('background-color','rgb(1, 1, 1)');
					
					nestsearchoulocation:{
						for (var oua=0;oua<9;oua++){
							for (var oub=0;oub<9;oub++){
								if ($('#tbody-board tr:eq('+oua+') td:eq('+oub+')').css('background-color')=='rgb(1, 1, 1)'){
									break nestsearchoulocation;
								}
							}
						}
					}
					
					oulocation.css('background-color','rgb(239, 228, 176)');
					
					
					var countcheckstop=0;//紫のマスを計数
					
					if ((basekoma=='kyousha0a')&&(oua-basea>1)){//香車 上から下、　王a　> 香車a 2
						//間のマスを紫に
						for (var road=(basea+1);road<oua;road++){
							$('#tbody-board tr:eq('+road+') td:eq('+oub+')').css('background-color','rgb(163, 73, 164)');
							countcheckstop++;
						}
					} else if (basekoma=='hisha0a'||basekoma=='hisha0b'){//飛車　竜王
						if (oua-basea>1&&oub==baseb){//上
							//間のマスを紫に
							for (var road=(basea+1);road<oua;road++){
								$('#tbody-board tr:eq('+road+') td:eq('+oub+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else if (basea-oua>1&&oub==baseb){ //下
							//間のマスを紫に
							for (var road=(oua+1);road<basea;road++){
								$('#tbody-board tr:eq('+road+') td:eq('+oub+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else if (oub-baseb>1&&oua==basea){ //左
							//間のマスを紫に
							for (var road=(baseb+1);road<oub;road++){
								$('#tbody-board tr:eq('+oua+') td:eq('+road+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else if (baseb-oub>1&&oua==basea){ //右
							//間のマスを紫に
							for (var road=(oub+1);road<baseb;road++){
								$('#tbody-board tr:eq('+oua+') td:eq('+road+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else { //直接食べれる　塞げない　break
							break neststop;
						}
					} else if (basekoma=='kaku0a'||basekoma=='kaku0b'){//角行　竜馬
						if(oua-basea>1&&oub-baseb>1){//左上
							for (var roadi=1;roadi<(oua-basea);roadi++){
								$('#tbody-board tr:eq('+(basea+roadi)+') td:eq('+(baseb+roadi)+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else if(oua-basea>1&&baseb-oub>1){//右上
							for (var roadi=1;roadi<(oua-basea);roadi++){
								$('#tbody-board tr:eq('+(basea+roadi)+') td:eq('+(baseb-roadi)+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else if(basea-oua>1&&oub-baseb>1){//左下
							for (var roadi=1;roadi<(basea-oua);roadi++){
								$('#tbody-board tr:eq('+(basea-roadi)+') td:eq('+(baseb+roadi)+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else if(basea-oua>1&&baseb-oub>1){//右下
							for (var roadi=1;roadi<(basea-oua);roadi++){
								$('#tbody-board tr:eq('+(basea-roadi)+') td:eq('+(baseb-roadi)+')').css('background-color','rgb(163, 73, 164)');
								countcheckstop++;
							}
						} else { //直接食べれる　塞げない　break
							break neststop;
						}
					}
				
					
					
					
					for (a=0;a<9;a++){//盤上の王側のすべての駒を特定し、いけるすべての位置を青
						for (b=0;b<9;b++){
							komatable = 'tbody-board';
							if (koma1.indexOf($('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
								koma = $('#tbody-board tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
								
								if (koma=='kyousha1a'){
									kyousha1a();
								} else if (koma == 'keima1a' ){	
									keima1a();
								} else if (koma == 'gin1a' ){	
									gin1a();
								} else if (koma == 'kin1'){
									kin1();
								} else if (koma == 'hisha1a'){
									hisha1a();
								} else if (koma == 'kaku1a'){
									kaku1a();
								} else if (koma == 'hu1a'){
									hu1a();
								} else if (koma=='kyousha1b'){
									kyousha1b();
								} else if (koma == 'keima1b' ){	
									keima1b();
								} else if (koma == 'gin1b' ){	
									gin1b();
								} else if (koma == 'hisha1b'){
									hisha1b();
								} else if (koma == 'kaku1b'){
									kaku1b();
								} else if (koma == 'hu1b'){
									hu1b();
								} 
							}
						}
					}
					
					//box0にあるすべての駒のいける位置
					for (a=0;a<4;a++){//box0内の玉側のすべての駒を特定し、いけるすべての位置を青
						for (b=0;b<5;b++){
							komatable = 'tbody-box1';
							if (koma1.indexOf($('#tbody-box1 tr:eq('+a+') td:eq('+b+')').children('img').attr('title'))!=-1){
								koma = $('#tbody-box1 tr:eq('+a+') td:eq('+b+')').children('img').attr('title');
								
								if (koma=='kyousha1a'){
									kyousha1a();
								} else if (koma == 'keima1a' ){	
									keima1a();
								} else if (koma == 'gin1a' ){	
									gin1a();
								} else if (koma == 'kin1'){
									kin1();
								} else if (koma == 'hisha1a'){
									hisha1a();
								} else if (koma == 'kaku1a'){
									kaku1a();
								} else if (koma == 'hu1a'){
									hu1a();
								} else if (koma=='kyousha1b'){
									kyousha1b();
								} else if (koma == 'keima1b' ){	
									keima1b();
								} else if (koma == 'gin1b' ){	
									gin1b();
								} else if (koma == 'hisha1b'){
									hisha1b();
								} else if (koma == 'kaku1b'){
									kaku1b();
								} else if (koma == 'hu1b'){
									hu1b();
								} 
							}
						}
					}
					
						
					//紫を計数
					var countpurple=0;
					
					for (var checkstopa=0;checkstopa<9;checkstopa++){
						for(var checkstopb=0;checkstopb<9;checkstopb++){
							if($('#tbody-board tr:eq('+checkstopa+') td:eq('+checkstopb+')').css('background-color')=='rgb(163, 73, 164)'){
								countpurple++;
							}
						}
					}
					
					if (countcheckstop!=countpurple){
						cstop=1;
					}
				}
			
			
				//塞ぐ、調べ終わり、td backgroundを全部239 228 176
				$('td').css('background','rgb(239, 228, 176)');
			}
			
			
			if (cescape!=1&&ctake!=1&&cstop!=1){
				if (basekoma=='hu0a'&&basertable=='tbody-box0'){
					alert('打ち歩詰め、反則負けです')
				} else {
					alert('詰みました');
				}
			}
			
		}
}


//edit詰将棋編集モード
var editmodel = 0;
var komaedit;
edit = function (){
	if (editmodel==0){
		$('td').css('background-color','rgb(239, 228, 176)');
		$('#tbody-editbox').attr('hidden',false);
		$('#tbody-board tr td').empty();
		$('#tbody-box0 tr td').empty();
		$('#tbody-box1 tr td').empty();
		
		$('#tbody-board').attr('id','tbody-boardedit');
		$('#tbody-box0').attr('id','tbody-box0edit');
		$('#tbody-box1').attr('id','tbody-box1edit');
		
		$('#tbody-editbox').on('click','img',function(){
			komaedit = $(this).attr('title');//駒名
			
		
				if (komaedit=='ou00'){
					komaedit='ou0';
				} else if (komaedit=='ou10'){
					komaedit='ou1';
				}
			
				
			$('td').css('background','rgb(239, 228, 176)');//前まで変えた背景色を全部リセット
			$(this).parents('td').css('background','rgb(237, 28, 36)');//クリックした駒の背景を赤に
		});
		
		
		$('#tbody-boardedit').on('click','td',function(){
			$('#tbody-editbox tr td').css('background-color','rgb(239, 228, 176)');
			
			if (komaedit){
				$(this).append('<img title=\"'+komaedit+'\" src=\"img\\'+komaedit+'.png\">');
			}
			
			komaedit ='';
		});
		
		
		$('#tbody-box0edit').on('click','td',function(){
			$('#tbody-editbox tr td').css('background-color','rgb(239, 228, 176)');
			
			if (komaedit){
				$(this).append('<img title=\"'+komaedit+'\" src=\"img\\'+komaedit+'.png\">');
			}
			komaedit ='';
		});
		

		
		$('#tbody-box1edit').on('click','td',function(){
			$('#tbody-editbox tr td').css('background-color','rgb(239, 228, 176)');
			
			if (komaedit){
				$(this).append('<img title=\"'+komaedit+'\" src=\"img\\'+komaedit+'.png\">');
			}
			komaedit ='';
		});
		
		
		editmodel = 1;
		count=0;
		$('#count').val(count);
		turn=0;
		$('#0').css('color','rgb(237, 28, 36)');
		$('#1').css('color','rgb(153, 217, 234)');
	} else {
		$('td').css('background-color','rgb(239, 228, 176)');
		$('#tbody-editbox').attr('hidden',true);
		
		komaedit='';
		
		
		$('#tbody-boardedit').attr('id','tbody-board');
		$('#tbody-box0edit').attr('id','tbody-box0');
		$('#tbody-box1edit').attr('id','tbody-box1');
		
		
		editmodel = 0;
	
	}
	
}

deleteedit = function (){
	nest:{//赤背景の駒がboardにいるか
		for (var deletera=0;deletera<9;deletera++){
			for (var deleterb=0;deleterb<9;deleterb++){
				if ($('#tbody-boardedit tr:eq('+deletera+') td:eq('+deleterb+')').css('background-color')=='rgb(237, 28, 36)'){
					$('#tbody-boardedit tr:eq('+deletera+') td:eq('+deleterb+')').empty();
					$('#tbody-box0edit tr:eq('+deletera+') td:eq('+deleterb+')').css('background','rgb(239, 228, 176)');
					break nest;
				}
			}
		}
	}
	
	nestbox0:{//赤背景の駒がboardにいるか
		for (var deletera=0;deletera<4;deletera++){
			for (var deleterb=0;deleterb<5;deleterb++){
				if ($('#tbody-box0edit tr:eq('+deletera+') td:eq('+deleterb+')').css('background-color')=='rgb(237, 28, 36)'){
					$('#tbody-box0edit tr:eq('+deletera+') td:eq('+deleterb+')').empty();
					$('#tbody-box0edit tr:eq('+deletera+') td:eq('+deleterb+')').css('background','rgb(239, 228, 176)');
					break nestbox0;
				}
			}
		}
	}

	nestbox1:{//赤背景の駒がboardにいるか
		for (var deletera=0;deletera<4;deletera++){
			for (var deleterb=0;deleterb<5;deleterb++){
				if ($('#tbody-box1edit tr:eq('+deletera+') td:eq('+deleterb+')').css('background-color')=='rgb(237, 28, 36)'){
					$('#tbody-box1edit tr:eq('+deletera+') td:eq('+deleterb+')').empty();
					$('#tbody-box0edit tr:eq('+deletera+') td:eq('+deleterb+')').css('background','rgb(239, 228, 176)');
					break nestbox1;
				}
			}
		}
	}


}

alldelete = function (){
	$('#tbody-boardedit tr td').empty();
	$('#tbody-box0edit tr td').empty();
	$('#tbody-box1edit tr td').empty();
	
	$('td').css('background','rgb(239, 228, 176)');
}

