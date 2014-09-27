<?php
	$reserved = array("a", "as");
	chdir("../");
	$cwd = getcwd();
	if(isset($_POST['opendir'])){
		echo json_encode(getDir($_POST['opendir']));
	}else if(isset($_POST['newpage'])){
		$pageArr = explode("/", $_POST['newpage']);
		$name = array_pop($pageArr);
		$parent = implode("/", $pageArr)."/";
		mkdir($cwd.$_POST['newpage']);
		$data = "{\"title\":\"".$name."\", \"desc\":\"no description\", \"savestatus\":\"published\", \"path\": \"".$_POST['newpage']."\"}";
		file_put_contents($cwd.$_POST['newpage']."/h.json", $data);
		echo json_encode(getDir($parent));
	}else if(isset($_POST['movepages'])){
		$data = json_decode($_POST['movepages']);
		$fromto = array();
		foreach($data->from as $toMove){
			$to = $data->to.array_pop(explode("/", $toMove));
			if(file_exists($cwd.$to)) error($to);
			array_push($fromto, array($cwd.$toMove, $cwd.$to));
		}
		echo json_encode($fromto);
	}
	function error($message){
		echo "{\"error\":\"$message\"}";
		exit;
	}
	function getDir($path){
		$cwd = getcwd();
		$reserved = array("a", "as");
		$dirPath = $cwd.$path;
		if(!is_dir($dirPath)) error("no such directory");
		$dirs = array_filter(glob($dirPath."*"), 'is_dir');
		$children = array();
		foreach($dirs as $dir){
			$dirn = substr($dir, strlen($dirPath), strlen($dir));
			if(!in_array($dirn, $reserved)){ 
				array_push($children, json_decode(file_get_contents("$dir/h.json")));
			}
		}
		$output["parent"] = json_decode(file_get_contents("$dirPath/h.json"));
		$output["children"] = $children;
		return $output;
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
?>