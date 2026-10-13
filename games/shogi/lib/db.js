var DB = {};

DB.init = function() {
	if (window.confirm('履歴をすべてリセットします、よろしいですか？')) {
		DB.load();
	}
};
 
DB.load = function() {
	// history
	alasql('DROP TABLE IF EXISTS history;');
	alasql('CREATE TABLE history(id INT IDENTITY, koma STRING, ra INT, rb INT, ta INT, tb INT, change STRING, komataked STRING, boxname STRING, uboxname STRING);');
	var phistory = alasql.promise('SELECT MATRIX * FROM CSV("data/history.csv", {headers: true})').then(function(rows) { 
		for (var i = 0; i < rows.length; i++) {
			alasql('INSERT INTO history VALUES(?,?,?,?,?,?,?,?,?,?);', rows[i]);
		}
	});

	// Reload page
	Promise.all([ phistory ]).then(function() {
		window.location.reload(true);
	});
};

alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// connect to database in local storage
try {
	alasql('ATTACH localStorage DATABASE SHOGI;');
	alasql('USE SHOGI;');	
} catch (e) {
	alasql('CREATE localStorage DATABASE SHOGI;');
	alasql('ATTACH localStorage DATABASE SHOGI;');
	alasql('USE SHOGI;');
	DB.load();
}

