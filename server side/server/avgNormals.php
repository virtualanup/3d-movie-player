<?php
	function avgNormals($NormalsArr, $faces)
	{		
		
		$indAvg=array();
		foreach ($faces as $face)
		{
			for($i=0;$i<3;$i++)
			{
				$verIndices=$face->indArr[$i];
				if(isset($indAvg[$verIndices]))
				{
					$temp=new Vec3();
					$temp->x=$NormalsArr[$face->indNArr[$i]]->i;
					//print_r($NormalsArr[$face->indNArr[$i]]);
					$temp->y=$NormalsArr[$face->indNArr[$i]]->j;
					$temp->z=$NormalsArr[$face->indNArr[$i]]->k;
					$indAvg[$verIndices]->add($temp);
				}
				else
				{
					$indAvg[$verIndices]=new Vec3();
					$indAvg[$verIndices]->x=$NormalsArr[$face->indNArr[$i]]->i;
					$indAvg[$verIndices]->y=$NormalsArr[$face->indNArr[$i]]->j;
					$indAvg[$verIndices]->z=$NormalsArr[$face->indNArr[$i]]->k;
					
					
				}
				
			}
		}
		foreach($indAvg as $indd)
		{
			$indd->unitize();
		}
		//print_r ($indAvg);
		return $indAvg;
	}
?>