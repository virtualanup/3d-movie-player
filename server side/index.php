<?php
	ob_start();
	include_once('server/parser.php');
	$frameId=(int)$_GET["frame"];
	$filename=$_GET["file"];
	
	if(empty($frameId)||empty($filename))
	{
		exit("Insufficient Constraints");
	}
	$objRoot="model/".$filename."/obj/";
	$renderedRoot="model/".$filename."/rendered/";
	$objFrame=$filename."_".$frameId.".obj";
	$jsFrame=$filename."_".$frameId.".js";
	if(file_exists($renderedRoot.$jsFrame))
	{
		header('Content-type:application/javascript');
		echo file_get_contents($renderedRoot.$jsFrame);
	}
	else
	{
		
	
		$output=parse($objRoot.$objFrame);
		//open file for writing
		$fh = fopen($renderedRoot.$jsFrame, 'w') or die("can't open file");
		$vertexArr=$output["vertexArr"];//array for all vertices
		$vertexNormalsArr2=$output["vertexNormalsArr"];//array for all normals for vertices
		$vertexNormalsArr=$output["avgNormalized"];//array for all normals for vertices
		$vertexTextureArr=$output["vertexTextureArr"];//array for all texture for vertices
		$faceArr=$output["faceArr"];//array for all faces(maybe more important 4 u
		$tFArr=$output["tFArr"];//array for all faces triangkes
		
		
		
		header('Content-type:application/javascript');
		echo "myobj = new GPSObject();\n";
		fwrite($fh, "myobj = new GPSObject();\n");
		
		echo "myobj.createSpace(".sizeof($vertexArr).",".sizeof($tFArr).");\n";
		fwrite($fh,"myobj.createSpace(".sizeof($vertexArr).",".sizeof($tFArr).");\n");
		
		for($i=0;$i<sizeof($vertexArr);$i++)
		{
			echo "myobj.v[".$i."]=vec4.fromValues(".$vertexArr[$i]->x.",".$vertexArr[$i]->y.",".$vertexArr[$i]->z.",1);"."\n";
			fwrite($fh,"myobj.v[".$i."]=vec4.fromValues(".$vertexArr[$i]->x.",".$vertexArr[$i]->y.",".$vertexArr[$i]->z.",1);"."\n");
			
			echo "myobj.n[".$i."]=vec4.fromValues(".$vertexNormalsArr[$i]->i.",".$vertexNormalsArr[$i]->j.",".$vertexNormalsArr[$i]->k.",1);"."\n";
			fwrite($fh,"myobj.v[".$i."]=vec4.fromValues(".$vertexNormalsArr[$i]->i.",".$vertexNormalsArr[$i]->j.",".$vertexNormalsArr[$i]->k.",1);"."\n");
			
			//echo "myobj.t[".$i."]=vec4.fromValues(".$vertexTextureArr[$i]->x.",".$vertexTextureArr[$i]->y.",".$vertexTextureArr[$i]->z.",1);"."\n";
			//fwrite($fh,"myobj.v[".$i."]=vec4.fromValues(".$vertexTextureArr[$i]->x.",".$vertexTextureArr[$i]->y.",".$vertexTextureArr[$i]->z.",1);"."\n");
		}

		for($i=0;$i<sizeof($tFArr);$i++)
		{
			echo "myobj.f[".$i."]=vec3.fromValues(";
			fwrite($fh,"myobj.f[".$i."]=vec3.fromValues(");
			for($j=0;$j<sizeof($tFArr[$i]->indArr)-1;$j++)
			{
				echo $tFArr[$i]->indArr[$j].",";
				fwrite($fh,$tFArr[$i]->indArr[$j].",");
			}
			echo $tFArr[$i]->indArr[sizeof($tFArr[$i]->indArr)-1].");\n";
			fwrite($fh,$tFArr[$i]->indArr[sizeof($tFArr[$i]->indArr)-1].");\n");
			echo "myobj.c[".$i."] = new Color(255,0,0);\n";
			fwrite($fh,"myobj.c[".$i."] = new Color(255,0,0);\n");
		}
		fclose($fh);
	}
	ob_flush();
?>    
        