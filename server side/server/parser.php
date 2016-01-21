<?php
	include_once('classes.php');
	include_once('triangulation.php');
	include_once('avgNormals.php');
	function parse($filename)
	{
		$file = fopen($filename, "r") or exit("Unable to open file!");
		//$file = fopen("airboat.obj", "r") or exit("Unable to open file!");

		//Output a line of the file until the end is reached
		//array setups
			
			$vertexArr=array();//array for all vertices
			$vertexNormalsArr=array();//array for all normals for vertices
			$vertexTextureArr=array();//array for all texture for vertices
			$faceArr=array();//array for all faces(maybe more important 4 u
			$tFArr=array();//array for all faces triangles
			$tAvgNArr=array();//array for all faces triangles
		//end of array setups
		
		while(!feof($file))
		{
			$str= trim(fgets($file));
			$data=preg_split('/\s+/', $str);
			$command=$data[0];
			unset($data[0]);
			$data = array_values($data);
			if($command=='#')
			{
				continue;
			}
			else
			{
				if($command=='v')
				{
					$ver=new Vertex();
					$ver->x=$data[0];
					$ver->y=$data[1];
					$ver->z=$data[2];
					$vertexArr[]=$ver;
				}
				
				if($command=='vn')
				{
					$ver=new VertexNormals();
					$ver->i=$data[0];
					$ver->j=$data[1];
					$ver->k=$data[2];
					$vertexNormalsArr[]=$ver;
				}
				
				if($command=='vt')
				{
					$ver=new TexVertices();
					$ver->u=$data[0];
					$ver->v=$data[1];
					$ver->w=$data[2];
					$vertexTextureArr[]=$ver;
				}
				if($command=='f')
				{
					$fcvar=array();
					unset($fcvar);
					$fcvar=array();
					$fcnar=array();
					unset($fcnar);
					$fcnar=array();
					$fctar=array();
					unset($fctar);
					$fctar=array();
					
					unset($fciar);
					$fciar=array();
					$faces=new Face();
					
					foreach($data as $fcs)
					{					
						if(strpos($fcs, "/") == false)
						{
							
							$data2[0]=$fcs;
						}
						else
						{
							$data2=explode('/',$fcs);
							//print_r($data2);
						}
						
						$fcvar[]=$vertexArr[$data2[0]-1];
						$fciar[]=$data2[0]-1;
						if(isset($data2[1]))
						{
							$fcnar[]=$data2[1]-1;
						}
						if(isset($data2[2]))
						{
							$fctar[]=$data2[2]-1;
						}
					}
					$faces->vertices=$fcvar;
					$faces->indTArr=$fctar;
					$faces->indNArr=$fcnar;
					$faces->indArr=$fciar;
					$faceArr[]=$faces;
				}
			}
			
		}
		//print_r($faceArr);
		fclose($file);
		//triangulate
		//triangulate
		for($i=0;$i<sizeof($faceArr);$i++)
		{
			$tFArr=array_merge($tFArr,triangulate($faceArr[$i]));
		}
		$avgNormalized1=avgNormals($vertexNormalsArr,$tFArr);
		$avgNormalized=array();
		for($i=0;$i<sizeof($vertexArr);$i++)
		{
			
			$avgNormalized[$i]=new VertexNormals();
			$avgNormalized[$i]->i=$avgNormalized1[$i]->x;
			$avgNormalized[$i]->j=$avgNormalized1[$i]->y;
			$avgNormalized[$i]->k=$avgNormalized1[$i]->z;
			
		}
		//prepare return array
		
		$toReturn=array("vertexArr"=>$vertexArr, "vertexNormalsArr"=>$vertexNormalsArr,"vertexTextureArr"=>$vertexTextureArr,"faceArr"=>$faceArr,"tFArr"=>$tFArr, "avgNormalized"=>$avgNormalized);
		return $toReturn;
	}	
?>