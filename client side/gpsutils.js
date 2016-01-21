/*
 * GPSutils.js
 *
 * Functions for the GPS Engine
 */
function getaRandom(min, max) {
    return Math.random() * (max - min) + min;
}

mat4.GPSperspective = function (out, fovy, aspect, near, far) {
    var tan = 1.0 / Math.tan(fovy / 2);
    out[0] = tan / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = tan;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = -far / (near - far);
    out[11] = 1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near) / (near - far);
    out[15] = 0;
    return out;
};

mat4.GPSlookAt = function (out, eye, center, up) {
    //create the lookat matrix
    var zaxis = vec3.create();
    var xaxis = vec3.create();
    var yaxis = vec3.create();

    vec3.subtract(zaxis, center, eye);
    vec3.normalize(zaxis, zaxis);
    var xaxis = vec3.create();

    vec3.cross(xaxis, up, zaxis);
    vec3.normalize(xaxis, xaxis);

    vec3.cross(yaxis, zaxis, xaxis);
    vec3.normalize(yaxis, yaxis);

    var ex = -vec3.dot(xaxis, eye);
    var ey = -vec3.dot(yaxis, eye);
    var ez = -vec3.dot(zaxis, eye);

    out[0] = xaxis[0];
    out[1] = yaxis[0];
    out[2] = zaxis[0];
    out[3] = 0;

    out[4] = xaxis[1];
    out[5] = yaxis[1];
    out[6] = zaxis[1];
    out[7] = 0;

    out[8] = xaxis[2];
    out[9] = yaxis[2];
    out[10] = zaxis[2];
    out[11] = 0;

    out[12] = ex;
    out[13] = ey;
    out[14] = ez;
    out[15] = 1;


    return out;
}
