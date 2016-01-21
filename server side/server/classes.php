<?php
		class Vertex
	{
		public $x=0;
		public $y=0;
		public $z=0;
	}
	
	class Face
	{
		public $vertices=array();
		public $indArr=array();
		public $indTArr=array();
		public $indNArr=array();
	}
	
	class VertexNormals
	{
		public $i=0;
		public $j=0;
		public $k=0;
	}
	
	class TexVertices
	{
		public $u=0;
		public $v=0;
		public $w=0;
	}
	
	class vec3
	{
		public $x=0;
		public $y=0;
		public $z=0;
		public $mag=1.0;
		function add($other)
		{
			$this->x=$this->x+$other->x;
			$this->y=$this->y+$other->y;
			$this->z=$this->z+$other->z;
		}
		
		function mag()
		{
			$this->mag=sqrt($this->x*$this->x+$this->y*$this->y+$this->z*$this->z);
		}
		
		function unitize()
		{
			$this->mag();
			$this->x=($this->x)/$this->mag;
			$this->y=($this->y)/$this->mag;
			$this->z=($this->z)/$this->mag;
		}
	}

?>