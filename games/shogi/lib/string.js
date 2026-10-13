function nullToUndef(str){
	if(str == '' || str == null){
		return undefined;
	} 
	return str;
}

function undefToNull(str){
	if(typeof str == "undefined" || str == null){
		return '';
	}
	return str;
}


function addPc(str){
	return '%' + str + '%';
}