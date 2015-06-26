
var gl;
var shaderProgram;
var num = 36;
var t = 0;
var cells = new Array(num);

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var vertexBuffer;
var uvBuffer;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    // console.log(str);
    
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders(frag) {
    var fragmentShader = getShader(gl, frag);
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.uni_t = gl.getUniformLocation(shaderProgram, "t");
    shaderProgram.uni_cells = gl.getUniformLocation(shaderProgram, "cells");
}

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var vertexBuffer;
var uvBuffer;

function initBuffers() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var vertices = [
         0.0,  0.0,  0.0,
         gl.viewportWidth, 0.0,  0.0,
         0.0,  gl.viewportHeight,  0.0,
         gl.viewportWidth, gl.viewportHeight,  0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexBuffer.itemSize = 3;
    vertexBuffer.numItems = 4;
    
    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    var uvs = [
         0.0, 0.0,
         1.0, 0.0,
         0.0, 1.0,
         1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    uvBuffer.itemSize = 2;
    uvBuffer.numItems = 4;
}


function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.ortho(0, gl.viewportWidth, 0, gl.viewportHeight, 0, 10, pMatrix);

    mat4.identity(mvMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, uvBuffer.itemSize, gl.FLOAT, false, 0, 0);
            
    gl.uniform1f(shaderProgram.uni_t, t);
    gl.uniform1fv(shaderProgram.uni_cells, cells);

    setMatrixUniforms();
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexBuffer.numItems);
}

function tick() {
    requestAnimFrame(tick);

    t += 1.0/60;

    for (var i = 0; i < num; i++){
        cells[i*2+0] = Math.cos(t/num*i) * (0.5) + (0.5);
        cells[i*2+1] = Math.sin(t/num*i) * (0.5) + (0.5);
    }

    drawScene();
}


function webGLStart() {
    var canvas = document.getElementById("glcanvas");
    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    //tick();
    requestAnimFrame(tick);
}

function perpixel(shader, canvas, userTick)
{
    initGL(canvas);
    initShaders(shader);
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //tick();
    requestAnimFrame(tick);
}

