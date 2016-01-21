/*
Object file to represent a 3d model object
*/
/*
both the vertices and faces are 3d vector. vertices are coordinates and
faces are the three vertices interconnected to form a traingle
*/
function GPSObject() {
    //store the vertices and faces
    //short names for easier access like obj.v[3]=vec3.fromvalues(1,1,2);
    this.v = [];
    this.f = [];
    this.n = [];
    this.c = []; //the colors table. The number of colors is same as the number of faces.
    //this is later changed into texture table
    this.nv = 0;
    this.nf = 0;
    this.vt = [];
    this.t = [];
    //TODO: other parameters like texture coordinates and texture data
}
GPSObject.prototype.loadTexture = function(textureid)
{
   var c = document.getElementById("temptexturecanvas");
   var ctx = c.getContext("2d");
   var img = document.getElementById(textureid);
   c.width = img.width;
   c.height = img.height;
   ctx.drawImage(img,0,0);
   this.imgData = ctx.getImageData(0,0,c.width,c.height);
}


GPSObject.prototype.getPixel = function(ubz,vbz,z)
{
    //return new Color(255,0,0,255);
    var u = Math.round((1-vbz)*this.imgData.height);
    var v = Math.round((ubz)*this.imgData.width);

    //console.log(u.toString()+" - u and "+v.toString()+" - v"+this.imgData.width.toString());
    var r = this.imgData.data[ u*(this.imgData.width * 4)+ v*4 + 0];
    var g = this.imgData.data[ u*(this.imgData.width * 4)+ v*4 + 1];
    var b = this.imgData.data[ u*(this.imgData.width * 4)+ v*4 + 2];
    var a = this.imgData.data[ u*(this.imgData.width * 4)+ v*4 + 3];

    

    return new Color(r,g,b,a);
}

GPSObject.prototype.createSpace = function (verticesnum, facesnum) {
    this.v = new Array(verticesnum);
    this.f = new Array(facesnum);
    this.c = new Array(facesnum);

    this.nv = verticesnum;
    this.nf = facesnum;
}
