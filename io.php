<pre><?php
	$reserved = array("a", "as");
	chdir("../");
	$cwd = getcwd();
	if(isset($_GET['opendir'])){
		$dirPath = "$cwd".$_GET['opendir'];
		if(!is_dir($dirPath)) error("no such directory");
		$dirs = array_filter(glob($dirPath."*"), 'is_dir');
		$output = array();
		foreach($dirs as $dir){
			$dirn = substr($dir, strlen($cwd.$_GET['opendir']), strlen($dir));
			if(!in_array($dirn, $reserved)){ 
				$info["name"] = $dirn;
				$info["data"] = file_get_contents("$dir/data.json");
				array_push($output, $info);
			}
		}
		echo json_encode($output);
	}
	function error($message){
		echo $message;
		exit;
	}
?>