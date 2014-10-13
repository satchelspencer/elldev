<?php
	$reserved = array("a", "as");
	chdir("../");
	$cwd = getcwd();
	if(isset($_POST['opendir'])){
		echo json_encode(getDir($_POST['opendir']));
	}else if(isset($_POST['openassetdir'])){
		echo json_encode(getAssetDir($_POST['openassetdir']));
	}else if(isset($_POST['newpage'])){
		$pageArr = explode("/", $_POST['newpage']);
		$name = array_pop($pageArr);
		$parent = implode("/", $pageArr)."/";
		mkdir($cwd.$_POST['newpage']);
		$data = "{\"title\":\"".$name."\", \"desc\":\" - \", \"published\":\"true\", \"path\": \"".$_POST['newpage']."\"}\n{}";
		file_put_contents($cwd.$_POST['newpage']."/data", $data);
		echo json_encode(getDir($parent));
	}else if(isset($_POST['newfolder'])){
		$dirArr = explode("/", $_POST['newfolder']);
		array_pop($dirArr);
		$parent = implode("/", $dirArr)."/";
		mkdir($cwd."/as".$_POST['newfolder']);
		echo json_encode(getAssetDir($parent));
	}else if(isset($_POST['movepages'])){
		$data = json_decode($_POST['movepages']);
		$fromto = array();
		foreach($data->from as $toMove){
			$to = $data->to.array_pop(explode("/", $toMove));
			if(file_exists($cwd.$to)) error($to);
			array_push($fromto, array($toMove, $to));
		}
		foreach($fromto as $ft){
			rename($cwd.$ft[0], $cwd.$ft[1]);
			$header = json_decode(getHead($cwd.$ft[1]."/data"));
			$header->path = $ft[1];
			writeHead($cwd.$ft[1]."/data", json_encode($header));
		}
		echo json_encode($data->to);
	}else if(isset($_POST['moveassets'])){
		$data = json_decode($_POST['moveassets']);
		foreach($data->from as $toMove){
			$to = $data->to.array_pop(explode("/", $toMove));
			if(file_exists($cwd."/as".$to)) error($to);
			rename($cwd."/as".$toMove, $cwd."/as".$to);
		}
		echo json_encode($data->to);
	}else if(isset($_POST['delete'])){
		$data = json_decode($_POST['delete']);
		foreach($data as $torm) removeDir($cwd.$torm);
	}else if(isset($_POST['deleteasset'])){
		$data = json_decode($_POST['deleteasset']);
		foreach($data as $torm){
			$item = $cwd."/as".$torm;
			is_dir($item)?removeDir($item):unlink($item);
		}
	}else if(isset($_FILES['file'])){
		$to = $cwd."/as".$_POST['path'].basename($_FILES['file']['name']);
		if(file_exists($to)) error($to);
		move_uploaded_file($_FILES['file']['tmp_name'], $to);
	}else if(isset($_POST['uploadquery'])){
		if(file_exists($cwd."/as".$_POST['uploadquery'])) error($_POST['uploadquery']." already exists");
		$max = min(return_bytes(ini_get('post_max_size')), return_bytes(ini_get('upload_max_filesize')));
		if($_POST['size'] >= $max) error(basename($_POST['uploadquery'])." is too large");
	}else if(isset($_GET['dl'])){
		$file = $cwd."/as".$_GET['dl'];
		header('Content-Description: File Transfer');
	    header('Content-Type: application/octet-stream');
	    header('Content-Disposition: attachment; filename='.basename($file));
	    header('Expires: 0');
	    header('Cache-Control: must-revalidate');
	    header('Pragma: public');
	    header('Content-Length: ' . filesize($file));
	    readfile($file);
	    exit;
	}
	function error($message){
		echo "{\"error\":\"$message\"}";
		exit;
	}
	function getHead($file){
		$f = fopen($file, 'r');
		$head = fgets($f);
		fclose($f);
		return $head;
	}
	function writeHead($file, $str){
		$lines = file($file);
		$lines[0] = $str;
		file_put_contents($file, implode("\n", $lines));
	}
	function getBody($file){
		return preg_replace('/^.+\n/', '', file_get_contents($file));
	}
	function writeBody($file, $str){
		$lines = file($file);
		$head = $lines[0];
		file_put_contents($file, $head."\n".$str);
	}
	function getDir($path){
		$reserved = array("a", "as");
		$dirPath = getcwd().$path;
		if(!is_dir($dirPath)) error("no such directory");
		$dirs = array_filter(glob($dirPath."*"), 'is_dir');
		$children = array();
		foreach($dirs as $dir){
			$dirn = substr($dir, strlen($dirPath), strlen($dir));
			if(!in_array($dirn, $reserved)){ 
				array_push($children, json_decode(getHead("$dir/data")));
			}
		}
		$output["parent"] = json_decode(getHead("$dirPath/data"));
		$output["children"] = $children;
		return $output;
	}
	function getAssetDir($path){
		$dirPath = getcwd()."/as".$path;
		if(!is_dir($dirPath)) error("no such directory");
		$filesdirs = array_diff(scandir($dirPath), array('..', '.'));
		$out = array();
		foreach($filesdirs as $filedir){
			$data["type"] = is_dir($dirPath.$filedir)?"dir":"file";
			$data["name"] = $filedir;
			array_push($out, $data);
		}
		return $out;
	}
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
	function return_bytes($val) {
	    $val = trim($val);
	    $last = strtolower($val[strlen($val)-1]);
	    switch($last) {
	        case 'g': $val *= 1024;
	        case 'm': $val *= 1024;
	        case 'k': $val *= 1024;
	    }
	    return $val;
	}

?>