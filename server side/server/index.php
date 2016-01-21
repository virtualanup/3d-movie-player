<?php
	include_once('server/parser.php');
	$frameId=(id)$_get['frame'];
	$filename=$_get['file'];
	
	
	$output=parse($filename."obj");
	$vertexArr=$output["vertexArr"];//array for all vertices
	$vertexNormalsArr=$output["vertexNormalsArr"];//array for all normals for vertices
	$vertexTextureArr=$output["vertexTextureArr"];//array for all texture for vertices
	$faceArr=$output["faceArr"];//array for all faces(maybe more important 4 u
	$tFArr=$output["tFArr"];//array for all faces triangkes
	
?>
<!DOCTYPE html>
<html>
    <head>
    <meta charset="utf-8">
        <title>
            gps:DDDplayer
        </title>
        <link rel="stylesheet" href="css/sunny/jquery-ui-1.10.4.custom.css">
        <link rel="stylesheet" href="css/style.css">
		  <!-- libraries -->
        <script src="libs/jquery-2.1.0.min.js"></script>
        <script src="libs/jquery-ui-1.10.4.custom.min.js"></script>
        <script src="libs/gl-matrix.js"></script>
    </head>

    <body>
	<div id="body">

        <h1 id="h1"> gps:DDDplayer </h1>        

        <div class="control" id="control1">
        <div class="controlcontent">
            <h2>Options</h2>
            <p>
            Some options for the Video playing
            </p>            
        </div>
        </div>  

        <div id="draw">
            <canvas id="myCanvas">
            </canvas>           
        </div>  
        
        <div class="control" id="control2">
        <div class="controlcontent">
            <h2>Debugging / Info</h2>
            <p>
            Mousepos:
            </p>
            <canvas id="mybufferCanvas">
            </canvas>
        </div>
        </div>      
        
        <div id="below">
            <div class="uncollapse">&nbsp;</div>
            <div id="control3">
            <div id="playbutton"></div>
            <div id="playslider"></div>     
            <div class="uncollapse">.</div>         
            </div>
        </div>  
        
        
      
        
        
        <!-- our javascript in sequence-->
        <script>var gpsplay = false;</script>
        <script src="0gpsutils.js"></script>    
        <script src="1engine.js"></script>
        <script src="10object.js"></script> 
		<script type="text/javascript">
			var angle = 0;
			myobj = new GPSObject();
		
			myobj.createSpace(<?php echo sizeof($vertexArr).",".sizeof($tFArr)?>);
			<?php
				//render vertices and faces
				for($i=0;$i<sizeof($vertexArr);$i++)
				{
					echo "myobj.v[".$i."]=vec4.fromValues(".$vertexArr[$i]->x.",".$vertexArr[$i]->y.",".$vertexArr[$i]->z.",1);"."\n";
				}
			
			
				for($i=0;$i<sizeof($tFArr);$i++)
				{
					echo "myobj.f[".$i."]=vec3.fromValues(";
					for($j=0;$j<sizeof($tFArr[$i]->indArr)-1;$j++)
					{
						echo $tFArr[$i]->indArr[$j].",";
					}
					echo $tFArr[$i]->indArr[sizeof($tFArr[$i]->indArr)-1].");\n";
					echo "var rand = Math.min(200,Math.max(0,Math.random()*200));\n";
					echo "myobj.c[".$i."] = new Color(255,0,0);\n";
				}
					
			?>
			function display()
            {
                if(!gpsplay)
                    return;
                angle +=0.1;

                //do everything in seperate color to identify frames
                engine = new GPSEngine(document.getElementById("myCanvas"),document.getElementById("mybufferCanvas"));
                //load default view for the engine
                engine.loadDefaultView();

                temp = mat4.create();

                //set the color
                engine.state.color.setColor(0,100,0);

                engine.startDraw();

                //rotate by some angle
                mat4.rotate(engine.modelmat,engine.modelmat,angle,vec3.fromValues(0,1,0));

                                
                    //draw the cube
                    engine.drawObject(myobj);

                    //engine.drawLine(0,0,0,10,10,0);

                engine.swapBuffers();
                requestAnimationFrame(display);
			}

			
		</script>
        
        <script src="7events.js"></script>  
        <script src="9init.js"></script>
    </div>
    <div id="footer">
    gps production | &copy; 2014
    </div>
    </body>
</html>
