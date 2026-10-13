/**
 * This file add SHOGI pieces to initial postions
 */

//on the SHOGI board
$('#tbody-board tr:eq(0) td:eq(0)').append('<img title=\"kyousha1a\" src=\"img\\kyousha1a.png\">');
$('#tbody-board tr:eq(0) td:eq(1)').append('<img title=\"keima1a\" src=\"img\\keima1a.png\">');
$('#tbody-board tr:eq(0) td:eq(2)').append('<img title=\"gin1a\" src=\"img\\gin1a.png\">');
$('#tbody-board tr:eq(0) td:eq(3)').append('<img title=\"kin1\" src=\"img\\kin1.png\">');
$('#tbody-board tr:eq(0) td:eq(4)').append('<img title=\"ou1\" src=\"img\\ou1.png\">');
$('#tbody-board tr:eq(0) td:eq(5)').append('<img title=\"kin1\" src=\"img\\kin1.png\">');
$('#tbody-board tr:eq(0) td:eq(6)').append('<img title=\"gin1a\" src=\"img\\gin1a.png\">');
$('#tbody-board tr:eq(0) td:eq(7)').append('<img title=\"keima1a\" src=\"img\\keima1a.png\">');
$('#tbody-board tr:eq(0) td:eq(8)').append('<img title=\"kyousha1a\" src=\"img\\kyousha1a.png\">');

$('#tbody-board tr:eq(1) td:eq(1)').append('<img title=\"hisha1a\" src=\"img\\hisha1a.png\">');
$('#tbody-board tr:eq(1) td:eq(7)').append('<img title=\"kaku1a\" src=\"img\\kaku1a.png\">');

for (var i=0;i<9;i++){
	$('#tbody-board tr:eq(2) td:eq('+i+')').append('<img title=\"hu1a\" src=\"img\\hu1a.png\">');
}

$('#tbody-board tr:eq(8) td:eq(0)').append('<img title=\"kyousha0a\" src=\"img\\kyousha0a.png\">');
$('#tbody-board tr:eq(8) td:eq(1)').append('<img title=\"keima0a\" src=\"img\\keima0a.png\">');
$('#tbody-board tr:eq(8) td:eq(2)').append('<img title=\"gin0a\" src=\"img\\gin0a.png\">');
$('#tbody-board tr:eq(8) td:eq(3)').append('<img title=\"kin0\" src=\"img\\kin0.png\">');
$('#tbody-board tr:eq(8) td:eq(4)').append('<img title=\"ou0\" src=\"img\\ou0.png\">');
$('#tbody-board tr:eq(8) td:eq(5)').append('<img title=\"kin0\" src=\"img\\kin0.png\">');
$('#tbody-board tr:eq(8) td:eq(6)').append('<img title=\"gin0a\" src=\"img\\gin0a.png\">');
$('#tbody-board tr:eq(8) td:eq(7)').append('<img title=\"keima0a\" src=\"img\\keima0a.png\">');
$('#tbody-board tr:eq(8) td:eq(8)').append('<img title=\"kyousha0a\" src=\"img\\kyousha0a.png\">');

$('#tbody-board tr:eq(7) td:eq(7)').append('<img title=\"hisha0a\" src=\"img\\hisha0a.png\">');
$('#tbody-board tr:eq(7) td:eq(1)').append('<img title=\"kaku0a\" src=\"img\\kaku0a.png\">');

for (var i=0;i<9;i++){
	$('#tbody-board tr:eq(6) td:eq('+i+')').append('<img title=\"hu0a\" src=\"img\\hu0a.png\">');
}

//on the tsumi SHOGI board
