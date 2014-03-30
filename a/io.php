<?php
	if(isset($_POST['list'])){
		chdir('../');	
		$files = scandir(getcwd().$_POST['list']);
		foreach($files as $i => $ar) if($ar == "data.json" || $ar == "index.html" || $ar[0] == "." || ($ar == "a" && $_POST['list'] == "/")) unset($files[$i]);
		$out = array("cwd" => getcwd(), "files" => $files);
		echo json_encode(array_values($files));
		exit;
	}else if(isset($_POST['np'])){
		chdir('../');	
		mkdir(getcwd().$_POST['np'], 0755);
		echo "aight";
		exit;
	}
?>