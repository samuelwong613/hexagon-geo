/*
  MIT License

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/



/**
 * 
 * This is a pure js function to generate a set of coords of a hexagon in 3D.
 * 
 * You may use it to generate 2D hexagon by eliminate the z coord.
 * If your project using Y-axis as height, you may manipulate the output or rotate the hexagon.
 * 
 * Enjoy.
 * 
 */
  


/**
 * Constance of param - textureFit
 */
export const COVER = 'COVER';
export const CONTAIN = 'CONTAIN';
export const FILL = 'FILL';



/**
 * Main generator
 * 
 * @param {number}    size            - the length of hexagon edge
 * @param {integer}   segment         - the segment level
 * @param {number}    rotateAngle     - rotation of hexagon
 * @param {string}    textureFit      - how to fit the texture
 * 
 * @returns {object}
 * @returns {object.vertices}         - 3D vertices, start with center(0,0) and end with the outermost  
 * @returns {object.indices}          - indices of the front face
 * @returns {object.invertIndices}    - indices of the back face
 * @returns {object.normals}          - normals
 * @returns {object.uvs}              - UVs for texture
 */
export default function(size, segment, rotateAngle, textureFit){
  var param = check(size, segment, rotateAngle, textureFit);
  if (!param) return;
  size = param.size;
  segment = param.segment;
  rotateAngle = param.rotateAngle;
  textureFit = param.textureFit;

  var vertices = [0, 0, 0], indices = [];
  for (var lv = 1; lv <= segment; lv++)
    generateGeoLv(vertices, indices, size, lv, segment);

  if (rotateAngle !== 0)
    rotateAll(vertices, rotateAngle);

  var uvs = computeUV(vertices, textureFit);
  var invertedIndices = computeInvertedIndices(indices);
  var normals = vertices.map(function(a,idx){ return idx%3 === 2 ? 1 : 0; });

  return {
    vertices,
    indices,
    invertedIndices,
    normals,
    uvs,
  }
}



/**
 * Rotate the vertices by angle, used for vertical hexagon
 * 
 * @param {array}     vertices        - vertices, which will be manipulated
 * @param {number}    angle           - rotation angle in radian
 */
export function rotateAll(vertices, angle){
  if (!(vertices instanceof Array) || (vertices.length % 3 !== 0)){
    console.error(`hexagon-geo: rotateAll: vertices is invalid, ${vertices}`);
    return null;
  }
  if (typeof angle !== 'number'){
    console.error(`hexagon-geo: rotateAll: angle must be a number, instead of ${typeof angle} with value ${angle}`);
    return false;
  }

  for (var i=0; i<vertices.length; i+=3){
    var vertix = [vertices[i], vertices[i+1]];
    vertix = rotateVector(vertix, angle);
    vertices[i] = vertix[0];
    vertices[i+1] = vertix[1];
  }
}



/**
 * Compute the UV mapping by vertices position
 * 
 * @param {array}     vertices        - vertices used for compute UV
 * @param {string}    textureFit      - strategy of texture fitting, either COVER, CONTAIN or FILL
 * 
 * @returns {array}                   - UVs for texture
 */
export function computeUV(vertices, textureFit){
  if (!(vertices instanceof Array) || (vertices.length % 3 !== 0)){
    console.error(`hexagon-geo: computeUV: vertices is invalid, ${vertices}`);
    return null;
  }
  if (typeof textureFit !== 'string' || [COVER, CONTAIN, FILL].every(function(type){ return type !== textureFit })){
    console.error(`hexagon-geo: computeUV: textureFit must be either '${COVER}', '${CONTAIN}' or '${FILL}', instead of ${typeof textureFit} with value ${textureFit}`);
    return null;
  }

  var lv = Math.floor(Math.sqrt((vertices.length/3-1) / 3));
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (var i=1; i<=6; i++){
    var id = vertices.length/3 - lv*i;
    var x = vertices[id*3], y = vertices[id*3+1];
    if (x < minX)       minX = x;
    else if (x > maxX)  maxX = x;
    if (y < minY)       minY = y;
    else if (y > maxY)  maxY = y;
  }
  var width = maxX - minX, height = maxY - minY;
  width  = textureFit === COVER? Math.max(width, height) : textureFit === CONTAIN? Math.min(width, height) : width;
  height = textureFit === COVER? Math.max(width, height) : textureFit === CONTAIN? Math.min(width, height) : height;

  var uvs = [];
  for (var i=0; i<vertices.length; i+=3){
    var x = vertices[i], y = vertices[i+1];
    uvs.push( (x + width/2)/width, (y + height/2)/height );
  }
  return uvs;
}



/**
 * Invert indices for back face 
 * 
 * @param {array}     indices         - used for compute the inverted indices
 * 
 * @returns {array}                   - a new array contain the inverted indices
 */
export function computeInvertedIndices(indices){
  if (!(indices instanceof Array) || (indices.length % 3 !== 0)){
    console.error(`hexagon-geo: computeInvertedIndices: indices is invalid, ${indices}`);
    return null;
  }

  var invertedIndices = [];
  for (var i=0; i<indices.length; i+= 3)
    invertedIndices.push(indices[i], indices[i+2], indices[i+1]);
  return invertedIndices;
}



/*********************************************************************************************************************************
 ***                                                   Private Function                                                        ***
 *********************************************************************************************************************************/



// Parameter checking
function check(size, segment, rotateAngle, textureFit){
  size            = size === undefined ?              10      : size;
  segment         = segment === undefined ?           1       : segment;
  rotateAngle     = rotateAngle === undefined ?       0       : rotateAngle;
  textureFit      = textureFit === undefined ?        COVER   : textureFit;

  if (typeof size !== 'number' || size <= 0){
    console.error(`hexagon-geo: size must be a positive number, instead of ${typeof size} with value ${size}`);
    return false;
  }
  if (typeof segment !== 'number' || segment <= 0 || !Number.isInteger(segment)){
    console.error(`hexagon-geo: segment must be a positive integer, instead of ${typeof segment} with value ${segment}`);
    return false;
  }
  if (typeof rotateAngle !== 'number'){
    console.error(`hexagon-geo: rotateAngle must be a number, instead of ${typeof rotateAngle} with value ${rotateAngle}`);
    return false;
  }
  if (typeof textureFit !== 'string' || [COVER, CONTAIN, FILL].every(function(type){ return type !== textureFit })){
    console.error(`hexagon-geo: textureFit must be either '${COVER}', '${CONTAIN}' or '${FILL}', instead of ${typeof textureFit} with value ${textureFit}`);
    return false;
  }
  return {size, segment, rotateAngle, textureFit};
}

// Point Sum-up
function sumVector(a, b){
  return [ a[0]+b[0], a[1]+b[1] ];
}

// Point Rotation
function rotateVector(point, angle){
  var sin = Math.sin(angle), cos = Math.cos(angle);
  return [
    point[0] * cos - point[1] * sin, 
    point[0] * sin + point[1] * cos
  ];
}

// Summation
function s(n){ 
  return (n * (n+1))/2;
};

const DEGREE_60 = Math.PI/3;
// Create a lv of vertices and indices
function generateGeoLv(vertices, indices, size, lv, segment){
  var low = lv-1;
  var lvAmount = lv * 6, lowAmount = low * 6;
  var lowShift = Math.max(0, 6*s(lv-2))+1, lvShift = Math.max(0, 6*s(lv-1))+1;

  for (var i=0; i<6; i++){
    var pointShift = rotateVector([-size/segment, 0], (i+3) * -DEGREE_60);
    var point = rotateVector([-size*lv/segment, 0], (i+1) * -DEGREE_60);
    vertices.push(...point, 0);
    indices.push(
      (i*lv) % lvAmount + lvShift,   ((i*low) % lowAmount + lowShift || 0),    (i*lv+1) % lvAmount + lvShift
    );      

    for (var j=0; j<lv-1; j++){
      point = sumVector(point,pointShift);
      vertices.push(...point, 0);

      indices.push(
        (i*lv+j+1) % lvAmount + lvShift,     (i*low+j)   % lowAmount + lowShift,     (i*low+j+1) % lowAmount + lowShift,
        (i*lv+j+1) % lvAmount + lvShift,     (i*low+j+1) % lowAmount + lowShift,     (i*lv+j+2)  % lvAmount  + lvShift,
      );
    }
  }
}