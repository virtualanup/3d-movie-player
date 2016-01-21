/*
  Engine for the 3d player
  by anup pokhrel
*/
//color is just a wrapper class for RGB(A) color
function Color(r = 0, g = 0, b = 0, a = 255) {
    this.red = r;
    this.blue = b;
    this.green = g;
    this.alpha = a;
}

Color.prototype.setColor = function (r, g, b, a = 255) {
    this.red = r;
    this.blue = b;
    this.green = g;
    this.alpha = a;
    return;
}

Color.prototype.copyto = function (dest) {
    dest.red = this.red;
    dest.blue = this.blue;
    dest.green = this.green;
    dest.alpha = this.alpha;
    return;
}

Color.prototype.printvalue = function (name = "") {
    console.log(name + "'s value : " + this.red.toString() + "," + this.green.toString() + "," + this.blue.toString() + "," + this.alpha.toString());
    return;
}

Color.prototype.getColorCode = function () {
    return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
}


function LightSource(position,intensity,engine)
{
    this.engine = engine;
    this.position = position;
    this.intensity = intensity;
    this.zbuffer = new Array(this.engine.canvas.width * this.engine.canvas.height);

    //create a view matrix
    this.viewmat = mat4.create();
    //modify the view matrix to view from the light position
    //first param is the light pos, second param is lookat point (ie origin) and the third point doesn't matter (probably)
    mat4.GPSlookAt(this.viewmat, this.position, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

}


/*
  this represents the current state of the engine like the color being used,
  etc (more can be added later)
*/
function State() {
    this.color = new Color(0, 0, 0);
}

State.prototype.copyto = function (dest) {
    this.color.copyto(dest.color);
    return;
}


//this is the graphics engine that calculates the points
function GPSEngine(canvas, buffercanvas) {
    this.canvas = canvas;
    this.context2d = this.canvas.getContext('2d');

    this.bcanvas = buffercanvas;
    this.bcontext2d = this.bcanvas.getContext('2d');
    //as a precautionary measure, resize the buffer canvas to match the
    //actual canvas
    this.bcanvas.height = this.canvas.height;
    this.bcanvas.width = this.canvas.width;


    this.state = new State();
    this.states = [];
    this.statetop = -1;

    this.projmat = mat4.create();
    mat4.identity(this.projmat);

    this.viewmat = mat4.create();
    mat4.identity(this.viewmat); //load identity in the view matrix

    this.modelmat = mat4.create();
    mat4.identity(this.modelmat);

    this.pipelinemat = mat4.create(); //model*view*proj resultant

    this.projstack = [];
    this.modelstack = [];

    this.projtop = -1;
    this.modeltop = -1;

    this.lights = [];

    this.lightnumber = 0;
     //init
    //load default view for the engine
    this.loadDefaultView();


    this.zcorrectionfactor = 70;
    this.showshadow = false;

}

GPSEngine.prototype.setCanvas = function (canvas) {
    this.canvas = canvas;
    this.context2d = this.canvas.getContext('2d');
}

GPSEngine.prototype.addLight = function (lightpos, intensity) {

    this.lights[this.lightnumber] = new LightSource(lightpos,intensity,this);
    this.lightnumber += 1;
}

GPSEngine.prototype.lightsCount = function()
{
    return this.lightnumber;
}

GPSEngine.prototype.selectLightSource = function(id)
{
    //this will select the ith light source as the current buffer and will calculate z buffer for the curret light source
    this.lightid = id;
    this.zbuffer =  this.lights[id].zbuffer;
    for (var i = 0; i < this.canvas.width * this.canvas.height; i++)
        this.zbuffer[i] = 10000;

    // /this.printMatrix(this.lights[id].viewmat,"View matrix");


    this.viewmat = mat4.clone(this.lights[id].viewmat);
    //this.printMatrix(this.viewmat,"View matrix2");
}

GPSEngine.prototype.selectScreen = function()
{
    //This will select the final display as the output. Intensity will be calculated in this mode and shadow values will also be calculated.
    this.lightid = -1;
    this.zbuffer = this.mainzbuffer;
    this.viewmat = mat4.create();
}

GPSEngine.prototype.loadDefaultView = function () {
    //Load the default view for the scene
    mat4.identity(this.modelmat);
    //load perspective view

    //.78 rad ~ 45 deg
    mat4.GPSperspective(this.projmat, 0.78, this.canvas.width / this.canvas.height, -100, 100);

    //load default camera position in the view matrix
    mat4.GPSlookAt(this.viewmat, vec3.fromValues(0, 0, -60), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0))

}

GPSEngine.prototype.printMatrix = function (matr, name) {

    var mat = "Value of " + name + " ";
    for (var i = 0; i < 16; i++)
        mat += matr[i].toString() + ",";
    console.log(mat);
}

GPSEngine.prototype.calculateResMat = function () {
    //recalculate the resultant matrix (for pipeline processing)
    //model*view*projection matrix

    //this.printMatrix(this.viewmat, "View");
    //this.printMatrix(this.projmat, "Projection");
    //this.printMatrix(this.modelmat, "Model");

    mat4.copy(this.pipelinemat, this.modelmat);
    mat4.multiply(this.pipelinemat, this.viewmat, this.pipelinemat);
    mat4.multiply(this.pipelinemat, this.projmat, this.pipelinemat);

    this.invpipelinemat = mat4.create();
    mat4.invert(this.invpipelinemat,this.pipelinemat);

    //calculate the resultant matrix for each light source if the mode isn't shadow calculation mode
    if(this.lightid < 0)
    {
        //calculate the resultant matrix of each light source
        for(var i = 0; i  < this.lightnumber; i++)
        {
            this.lights[i].resultant = mat4.create();

            mat4.copy(this.lights[i].resultant, this.modelmat);

            mat4.multiply(this.lights[i].resultant, this.lights[i].viewmat ,this.lights[i].resultant);

            mat4.multiply(this.lights[i].resultant, this.projmat, this.lights[i].resultant);

            //this.printMatrix(this.lights[i].resultant," resultant matrix");
        }
    }

    //this.printMatrix(this.pipelinemat, "Resultant");
    return;
};

GPSEngine.prototype.pipeline = function (point,debug = false) {
    //the point is vertex point, with coord, worldcoord and normal compontnts


    //first of all, find and store the world coordinate
    vec4.transformMat4(point.worldcoord, point.coord, this.modelmat);

    //similarly, calculate the world coordinate for the normal vector
    vec4.transformMat4(point.normal, point.normal, this.modelmat);

    //this will calculate the final projection point by passing the point through graphics pipeline
    vec4.transformMat4(point.coord, point.coord, this.pipelinemat);

    if(debug)
        console.log("After transformation ",vec4.str(point.coord));

    point.coord[0] = point.coord[0] / point.coord[3];
    point.coord[1] = point.coord[1] / point.coord[3];
    //point[2]=point[2]/point[3];
    if(debug)
        console.log("After coord adjust ",vec4.str(point.coord));
    //now scale the x and y parameters to match the canvas
    if(debug)
        console.log(point.coord[1] ,this.canvas.height);
    point.coord[0] = point.coord[0] * this.canvas.width + this.canvas.width / 2.0;
    point.coord[1] = -point.coord[1] * this.canvas.height + this.canvas.height / 2.0;
    //the following line changes the z coordinate to larger range so that round off error
    //is eliminated while calculating the z buffer
    point.coord[2] = point.coord[2] * this.zcorrectionfactor;

    return point;
};


GPSEngine.prototype.applyInverse = function(coord,debug = false)
{
    if(debug)
        console.log("Got for inverse calc",vec4.str(coord));

    if(debug)
            console.log(coord[1] ,this.canvas.height);

    coord[2] = coord[2] / this.zcorrectionfactor;
    coord[1] = (this.canvas.height / 2.0 -coord[1] ) / this.canvas.height;
    coord[0] = (coord[0] - this.canvas.width / 2.0 ) / this.canvas.width;

    if(debug)
        console.log("before coord adjust ",vec4.str(coord));

    coord[0] = coord[0] * coord[3];
    coord[1] = coord[1] * coord[3];

    if(debug)
        console.log("Before transformation",vec4.str(coord));
     //to obtain the original world position of the point, reverse transform the point
    vec4.transformMat4(coord, coord, this.invpipelinemat);

}

var testdone = false;

GPSEngine.prototype.testInverse = function()
{
    if(testdone)
        return;
    testdone = true;

    console.log("Test suite for inverse matrix calculation");
    var pointa = {
            coord: vec4.fromValues(1,0,5,1,1),
            normal: vec4.fromValues(1,0,5,1,1),
            worldcoord: vec4.create(),
            texcoord : vec4.fromValues(1,0,5,1,1)
        };

    console.log("Original vector is ",vec4.str(pointa.coord));
    this.pipeline(pointa,true);
    //vec4.transformMat4(pointa.coord, pointa.coord, this.pipelinemat);
    console.log("After pipeline ",vec4.str(pointa.coord));
    this.applyInverse(pointa.coord,true);
    //vec4.transformMat4(pointa.coord, pointa.coord, this.invpipelinemat);
    console.log("Back to normal is ",vec4.str(pointa.coord));
}

GPSEngine.prototype.drawPixel = function (x, y, z = 0, intensity = 1,pixelval,correctfactor) {
    //intensity = Math.max( Math.min( 1,intensity),0);
    //make sure that the pixel is inside the boundary
    if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height)
        return;

    var zindex = (x + y * this.canvas.width);

    //check value for z index
    if (this.zbuffer[zindex] < z)
        return;
    else
        this.zbuffer[zindex] = z;

    //if light id is >=0 then it means we are calculating the points just to calculate the shadow. we shouldnot print the output
    if(this.lightid >= 0)
        return;
    //reverse transform the coordinate and find if the pixel is a shadow value
    var coord = vec4.fromValues(x,y,z,correctfactor);

    this.applyInverse(coord);

    //now transform the vector according to all light sources
    var shadow = 1.0;
    if(this.showshadow)
    {
        for(var i=0 ; i < this.lightsCount() ; i++)
        {
            //console.log("here");
            var tempc = vec4.create();
            //transform according to the resultant matrix of the light source
            vec4.transformMat4(tempc, coord, this.lights[i].resultant);
            tempc[2] = tempc[2] * this.zcorrectionfactor; //this was corrected while calculating the z buffer

            tempc[0] = tempc[0] / tempc[3];
            tempc[1] = tempc[1] / tempc[3];
            //point[2]=point[2]/point[3];

            //now scale the x and y parameters to match the canvas
            tempc[0] = tempc[0] * this.canvas.width + this.canvas.width / 2.0;
            tempc[1] = -tempc[1] * this.canvas.height + this.canvas.height / 2.0;
            //check using z buffer, if the current point lies inside a shadow
            var x = tempc[0];
            var y = tempc[1];

            //console.log("x=",x," and y=",y);
            if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height)
                continue;

            //console.log("z are ",this.lights[i].zbuffer[ Math.round(x) + Math.round(y) * this.canvas.width].toString()+" and "+tempc[2].toString());

            if(this.lights[i].zbuffer[ Math.round(x) + Math.round(y) * this.canvas.width] < (tempc[2]-5))
                shadow *= 0.6;
            //if it lies, multiply shadow by 0.7 to penailze as shadow.
        }
    }

    var index = zindex * 4;

    //console.log(intensity.toString());
    intensity = intensity * shadow;
    //pixelval = new Color(255,0,0);
    this.imagebuffer.data[index] = pixelval.red*intensity;
    this.imagebuffer.data[index + 1] = pixelval.green * intensity;
    this.imagebuffer.data[index + 2] = pixelval.blue * intensity;
    this.imagebuffer.data[index + 3] = pixelval.alpha;
}

/*
  draw a point (for debugging) or a polygon(seperated into triangle finally)
*/
GPSEngine.prototype.drawPoint = function (x, y, z) {
    this.calculateResMat();
    var position = vec4.fromValues(x, y, z, 1);
    this.pipeline(position);
    this.drawPixel(Math.round(position[0]), Math.round(position[1]),2);

    //console.log(vec4.str(position));
};

GPSEngine.prototype.swapBigger = function (upper, lower) {
    //if the upper is below the lower, then swap them
    if (upper[1] < lower[1]) {
        var temp = upper;
        upper = lower;
        lower = temp;
    }
}

GPSEngine.prototype.between0n1 = function (value) {
    return Math.max(0.0, Math.min(value, 1.0));
}
GPSEngine.prototype.scanLine = function (data, a, b, c, d) {

    var ageragecorrectionfactor = (a.coord[3]+b.coord[3]+c.coord[3])/3.0;

    var grada = (a.coord[1] != b.coord[1]) ? (data.currenty - a.coord[1]) / (b.coord[1] - a.coord[1]) : 1;
    var gradb = (c.coord[1] != d.coord[1]) ? (data.currenty - c.coord[1]) / (d.coord[1] - c.coord[1]) : 1;

    grada = Math.max(0.0, Math.min(grada, 1.0));
    gradb = Math.max(0.0, Math.min(gradb, 1.0));


    var startx = Math.round(a.coord[0] + (b.coord[0] - a.coord[0]) * grada);
    var endx = Math.round(c.coord[0] + (d.coord[0] - c.coord[0]) * gradb);

    var startz = a.coord[2] + (b.coord[2] - a.coord[2]) * grada;
    var endz = c.coord[2] + (d.coord[2] - c.coord[2]) * gradb;

    var snl = 0;
    var enl = 0;
    var su = 0;
    var eu = 0;

    var sv = 0;
    var ev = 0;

    //no need to worry about texture and intensity calculations while it is a light sourcce

    if(this.lightid < 0)
    {
        snl = data.ndotla + (data.ndotlb - data.ndotla) * grada;
        enl = data.ndotlc + (data.ndotld - data.ndotlc) * grada;

        su = a.texcoord[0] + (b.texcoord[0] - a.texcoord[0]) * grada;
        eu = c.texcoord[0] + (d.texcoord[0] - c.texcoord[0]) * gradb;

        sv = a.texcoord[1] + (b.texcoord[1] - a.texcoord[1]) * grada;
        ev = c.texcoord[1] + (d.texcoord[1] - c.texcoord[1]) * gradb;
    }

    var yval = Math.round(data.currenty);

    for (var x = startx; x < Math.round(endx); x++) {
        var gradz = (x - startx) / (endx - startx);
        gradz = Math.max(0.0, Math.min(gradz, 1.0));
        var z = startz + (endz - startz) * gradz;
        //console.log(data.nlanglea.toString());
        var intensity = 0;

        var u = 0;
        var v = 0;

         if(this.lightid < 0)
        {
            intensity = snl + (enl - snl) * gradz;

            u = su + (eu-su)*gradz;
            v = sv + (ev-sv)*gradz;
        }

        pixelval = this.drawingobject.getPixel(u,v,1024);
        //console.log(a.coord[3].toString()+" "+b.coord[3].toString()+" "+c.coord[3].toString()+" "+ageragecorrectionfactor);

        this.drawPixel(x, yval, Math.round(z), intensity,pixelval,ageragecorrectionfactor);
    }
}


GPSEngine.prototype.getPhongIntensity = function (vertex, normal, lightpos) {
    //both the vertex and the light position are in the world coordinates.

    var intensity = 0.0;

    var ld = vec4.create();

    vec4.subtract(ld, lightpos, vertex);

    //console.log(vec4.str(normal));
    //vec4.normalize(ld,ld);
    //vec4.normalize(normal,normal);

    var temp1 = vec3.fromValues(normal[0], normal[1], normal[2]);
    var temp2 = vec3.fromValues(ld[0], ld[1], ld[2]);

    //vector towards eye (0,0,0) from vertex
    var temp3 = vec3.fromValues(vertex[0],vertex[1],vertex[2]);

    vec3.normalize(temp1, temp1);
    vec3.normalize(temp2, temp2);
    vec3.normalize(temp3, temp3);

    //normal[3] = 0;//it is supposed to be 3 dim . vector. It is made 0 so that it doesn't affect the dot product
    //console.log(vec3.str(temp1));

    //diffuse
    intensity += 0.7 * Math.max(0, vec3.dot(temp1, temp2));

    intensity += 0.1 * Math.pow(Math.max(0, vec3.dot(temp3,temp2)),600.0);

    intensity = Math.min(Math.max(0,intensity),1);

    return intensity;
}

GPSEngine.prototype.getIntensity = function (vertex, normal) {
    var intensity = 0.0;

    intensity += 0.1;//ambient light

    for (var i = 0; i < this.lightnumber; i++) {
        intensity +=  this.getPhongIntensity(vertex, normal, this.lights[i].position);
    }
    //intensity *= 0.8;
    return intensity;
}
var atemp = false;

GPSEngine.prototype.drawTriangle = function (veca, vecb, vecc) {
    //first of all, project the vertex to get points
    this.calculateResMat();

    this.pipeline(veca);
    this.pipeline(vecb);
    this.pipeline(vecc);
    if(veca.coord[2] < 0 || vecb.coord[2]<0 || vecc.coord[2]<0)
        return;

    //sort the vector vertex in proper order
    //we sort the triangle vertices in peoper order so that veca is at top followed by vecb and vecc
    if (veca.coord[1] > vecb.coord[1]) {
        var temp = veca;
        veca = vecb;
        vecb = temp;
    }
    if (vecb.coord[1] > vecc.coord[1]) {
        var temp = vecb;
        vecb = vecc;
        vecc = temp;
    }
    if (veca.coord[1] > vecb.coord[1]) {
        var temp = veca;
        veca = vecb;
        vecb = temp;
    }


    //var lightpos = vec4.fromValues(20, 0, -40, 0);

    //vec4.transformMat4(lightpos, lightpos, this.modelmat);

    //var nlangle = this.getCosAngle(centerpoint, averagenormal, lightpos);
    var nlangle1 = 0;
    var nlangle2 = 0;
    var nlangle3 = 0;

    //if lightid is < 0 then it means real drawing. Not just for shadow
    //console.log(this.lightid);
    if(this.lightid < 0)
    {
        nlangle1 = this.getIntensity(veca.worldcoord, veca.normal);
        nlangle2 = this.getIntensity(veca.worldcoord, vecb.normal);
        nlangle3 = this.getIntensity(veca.worldcoord, vecc.normal);
    }
    //console.log(nlangle);
    //console.log(nlangle.toString())
    var data = {};

    //now calculate the inverse slope of the lines.
    //also make sure there is no division by 0
    var m12, m13;

    if (vecb.coord[1] > veca.coord[1])
        m12 = (vecb.coord[0] - veca.coord[0]) / (vecb.coord[1] - veca.coord[1]);
    else
        m12 = 0;

    if (vecc.coord[1] > veca.coord[1])
        m13 = (vecc.coord[0] - veca.coord[0]) / (vecc.coord[1] - veca.coord[1]);
    else
        m13 = 0;

    if (m12 > m13) {
        for (var y = Math.round(veca.coord[1]); y <= vecc.coord[1]; y++) {
            data.currenty = y;

            if (y < vecb.coord[1]) {
                data.ndotla = nlangle1;
                data.ndotlb = nlangle3;
                data.ndotlc = nlangle1;
                data.ndotld = nlangle2;
                this.scanLine(data, veca, vecc, veca, vecb);
            } else {
                data.ndotla = nlangle1;
                data.ndotlb = nlangle3;
                data.ndotlc = nlangle2;
                data.ndotld = nlangle3;
                this.scanLine(data, veca, vecc, vecb, vecc);
            }
        }
    } else {
        for (var y = Math.round(veca.coord[1]); y <= vecc.coord[1]; y++) {
            data.currenty = y;

            if (y < vecb.coord[1]) {
                data.ndotla = nlangle1;
                data.ndotlb = nlangle2;
                data.ndotlc = nlangle1;
                data.ndotld = nlangle3;
                this.scanLine(data, veca, vecb, veca, vecc);
            } else {
                data.ndotla = nlangle2;
                data.ndotlb = nlangle3;
                data.ndotlc = nlangle1;
                data.ndotld = nlangle3;
                this.scanLine(data, vecb, vecc, veca, vecc);
            }
        }
    }
}


GPSEngine.prototype.drawObject = function (object) {
    //run through each edges
    //push the color in the stack
    this.drawingobject = object;
    this.pushState();
    for (var i = 0; i < object.nf; i++)
    {

        var pointa = {
            coord: vec4.clone(object.v[object.f[i][0]]),
            normal: vec4.clone(object.n[object.f[i][0]]),
            worldcoord: vec4.create(),
            texcoord : vec4.clone(object.vt[object.t[i][0]])
        };

        var pointb = {
            coord: vec4.clone(object.v[object.f[i][1]]),
            normal: vec4.clone(object.n[object.f[i][1]]),
            worldcoord: vec4.create(),
            texcoord : vec4.clone(object.vt[object.t[i][1]])
        };

        var pointc = {
            coord: vec4.clone(object.v[object.f[i][2]]),
            normal: vec4.clone(object.n[object.f[i][2]]),
            texcoord : vec4.clone(object.vt[object.t[i][2]]),
            worldcoord: vec4.create()
        };

        //channge the color
        this.state.color = new Color(100, 100, 100); //object.c[i];

        //if(this.lightid < 0)
        //   this.testInverse();//for debugging

        this.drawTriangle(pointa, pointb, pointc);
    }
    this.popState();
};


GPSEngine.prototype.pushState = function () {
    //push the color information (and others?) into stack
    this.statetop++;
    this.states[this.statetop] = new State();
    this.state.copyto(this.states[this.statetop]);
};

GPSEngine.prototype.popState = function () {
    //push the color information (and others?) into stack
    if (this.statetop == -1)
        console.log("State Stack out of bound!");
    else {
        this.state = this.states[this.statetop];
        this.statetop--;
    }
};

GPSEngine.prototype.pushModelMat = function () {
    //push the model matrix onto stack
    this.modeltop++;
    newmodel = mat4.create();
    mat4.copy(newmodel, this.modelmat); //copy the projection matrix
    this.modelstack[this.modeltop] = newmodel;
};

GPSEngine.prototype.popModelMat = function () {
    //pop the model matrix from stack
    if (this.modeltop == -1)
        console.log("Model Stack out of bound!");
    else {
        this.modelmat = this.modelstack[this.modeltop];
        this.modeltop--;
    }
};


GPSEngine.prototype.pushProjMat = function () {
    //push the projection matrix onto stack
    this.projtop++;
    newproj = mat4.create();
    mat4.copy(newproj, this.projmat); //copy the projection matrix
    this.projstack[this.projtop] = newproj;
};

GPSEngine.prototype.popProjMat = function () {
    //pop the model Projection matrix  from stack
    if (this.projtop == -1)
        console.log("Projection Stack out of bound!");
    else {
        this.projmat = this.projstack[this.projtop];
        this.projtop--;
    }
};


GPSEngine.prototype.swapBuffers = function () {
    //swap buffers places the newly created image buffer in the canvas
    //Directly drawing in the canvas might be slow. This method is faster


    //this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height); //clear the buffer canvas

    //copy the content from image buffer to the drawing buffer
    this.context2d.putImageData(this.imagebuffer, 0, 0);
};

GPSEngine.prototype.startDraw = function () {
    //clear the image buffer with emptyness (the content of the second buffer)
    this.imagebuffer = this.bcontext2d.getImageData(0, 0, this.canvas.width, this.canvas.height);
    //clear out the z buffer
    this.mainzbuffer = new Array(this.canvas.width * this.canvas.height);
    for (var i = 0; i < this.canvas.width * this.canvas.height; i++)
        this.mainzbuffer[i] = 10000;

}
