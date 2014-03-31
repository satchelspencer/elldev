<?php
	chdir('../');
	function removeDir($dir){
		$children = scandir($dir);
		foreach($children as $child) if($child[0] != "."){
			if(is_dir($dir."/".$child)) removeDir($dir."/".$child);
			else unlink($dir."/".$child);
		}
		rmdir($dir);
	}
	if(isset($_POST['list'])){
		$files = scandir(getcwd().$_POST['list']);
		foreach($files as $i => $ar) if($ar == "data.json" || $ar == "index.html" || $ar[0] == "." || ($ar == "a" && $_POST['list'] == "/")) unset($files[$i]);
		$out = array("cwd" => getcwd(), "files" => $files);
		echo json_encode(array_values($files));
		exit;
	}else if(isset($_POST['np'])){
		mkdir(getcwd().$_POST['np'], 0777);
		exit;
	}
	else if(isset($_POST['del'])){
		$del = substr($_POST['del'], 1);
		chdir($_SERVER['DOCUMENT_ROOT']);
		if(!is_dir($del)) unlink($del);
		else removeDir($del);
		exit;
	}
?>