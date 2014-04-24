<?php
	if(isset($_POST['p'])){
		echo ".";
		exit;
	}
	chdir('../');
	function removeDir($dir){
		$children = scandir($dir);
		foreach($children as $child) if($child[0] != "."){
			if(is_dir($dir."/".$child)) removeDir($dir."/".$child);
			else unlink($dir."/".$child);
		}
		rmdir($dir);
	}
	function sizeConv($bytes, $decimals = 3) {
  		$sz = array("bytes", "Kb", "Mb", "Gb", "Tb", "Pb");
  		$factor = floor((strlen($bytes)-1)/3);
 		return sprintf("%.{$decimals}f",$bytes/pow(1024, $factor))." ".@$sz[$factor];
	}
	if(isset($_POST['list'])){
		$files = scandir(getcwd().$_POST['list']);
		foreach($files as $i => $ar) if($ar == "data.json" || $ar == "index.html" || $ar[0] == "." || (strlen($ar) == 1 && $_POST['list'] == "/")) unset($files[$i]);
		$out = array("cwd" => getcwd(), "files" => $files);
		echo json_encode(array_values($files));
		exit;
	}else if(isset($_POST['np'])){
		mkdir(getcwd().$_POST['np'], 0777);
		exit;
	}else if(isset($_POST['del'])){
		$del = substr($_POST['del'], 1);
		chdir($_SERVER['DOCUMENT_ROOT']);
		if(!is_dir($del)) unlink($del);
		else removeDir($del);
		exit;
	}else if(isset($_POST['info'])){
		echo sizeConv(filesize(getcwd().$_POST['info'])).",".date("m d Y H:i", filemtime(getcwd().$_POST['info']));
		exit;
	}else if(isset($_POST['newname'])){
		rename(getcwd().$_POST['oldname'], getcwd().$_POST['newname']);
		exit;
	}else if(isset($_FILES['file'])){
		move_uploaded_file($_FILES['file']['tmp_name'],  getcwd().$_POST['path'].basename($_FILES['file']['name']));
		exit;
	}
?>