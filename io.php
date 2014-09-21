<?php
	$reserved = array("a", "as");
	chdir("../");
	$cwd = getcwd();
	if(isset($_POST['opendir'])){
		$dirPath = "$cwd".$_POST['opendir'];
		if(!is_dir($dirPath)) error("no such directory");
		$dirs = array_filter(glob($dirPath."*"), 'is_dir');
		$children = array();
		foreach($dirs as $dir){
			$dirn = substr($dir, strlen($cwd.$_POST['opendir']), strlen($dir));
			if(!in_array($dirn, $reserved)){ 
				array_push($children, json_decode(file_get_contents("$dir/data.json")));
			}
		}
		$output["parent"] = json_decode(file_get_contents("$dirPath/data.json"));
		$output["children"] = $children;
		echo json_encode($output);
	}
	function error($message){
		echo $message;
		exit;
	}
?>