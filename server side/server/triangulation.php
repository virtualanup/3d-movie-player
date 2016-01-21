<?php
	
	function triangulate($fnFace)
	{
		$retFArr=array();
		if(sizeof($fnFace->vertices)<=3)
		{
			$retFArr[]=$fnFace;
		}
		else
		{
			
			for($i=0;$i<sizeof($fnFace->vertices)-1;$i++)
			{
				unset($tempArr);
				$tempArr=new Face();
				$tempArr->vertices[0]=$fnFace->vertices[0];
				$tempArr->vertices[1]=$fnFace->vertices[$i];
				$tempArr->vertices[2]=$fnFace->vertices[$i+1];
				
				$tempArr->indArr[0]=$fnFace->indArr[0];
				$tempArr->indArr[1]=$fnFace->indArr[$i];
				$tempArr->indArr[2]=$fnFace->indArr[$i+1];
				//for normals
				$tempArr->indNArr[0]=$fnFace->indNArr[0];
				$tempArr->indNArr[1]=$fnFace->indNArr[$i];
				$tempArr->indNArr[2]=$fnFace->indNArr[$i+1];
				
				$tempArr->indTArr[0]=$fnFace->indTArr[0];
				$tempArr->indTArr[1]=$fnFace->indTArr[$i];
				$tempArr->indTArr[2]=$fnFace->indTArr[$i+1];
				
				$retFArr[]=$tempArr;
				
			}
			
		}
		return $retFArr;
		
	}

?>