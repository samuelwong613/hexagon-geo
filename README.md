
# hexagon-geo

This is a 3D hexagon plane generator. You may input the size, segment, rotation and texture fitting strategy.
It will finally generate a set of vertices (3D coord), with origin at `[0,0,0]`.

## Installation
```
npm install hexagon-geo --save
```

## Usage

### Basic
We use [three.js](https://threejs.org/) as the 3D rendering library for this example.
```javascript
import hexagonGeoGenerator from 'hexagon-geo';

const HEX_SIZE = 10;
const HEX_SEGMENT = 3;

export default class HexagonGeo extends THREE.BufferGeometry {
  constructor(){
    super();

    let {vertices, indices, uvs, invertedIndices, normals} = hexagonGeoGenerator(HEX_SIZE, HEX_SEGMENT);
    this.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    this.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    this.setIndex(indices);
  }
}
```
#### Segment = 3
![BasicSegement3](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/basic3.png?raw=true)
#### Segment = 10 
![BasicSegement10](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/basic10.png?raw=true)

### Rotation
You may rotate the hexagon to get vertical hexagon or whatever you want.
```javascript
hexagonGeoGenerator(HEX_SIZE, HEX_SEGMENT, Math.PI/4);
```
![Rotation](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/rotation.png?raw=true)

### Texture Fitting Strategy
There are three strategy for texture fitting (UVs).

##### Texture (512 x 512)
![Texture](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/texture.jpg?raw=true)
```javascript
hexagonGeoGenerator(HEX_SIZE, HEX_SEGMENT, 0, "COVER");				// Default
```
![TextureCover](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/textureCover.png?raw=true)
```javascript
hexagonGeoGenerator(HEX_SIZE, HEX_SEGMENT, 0, "CONTAIN");
```
![TextureContain](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/textureContain.png?raw=true)
```javascript
hexagonGeoGenerator(HEX_SIZE, HEX_SEGMENT, 0, "FILL");
```
![TextureFill](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/textureFill.png?raw=true)

### Texture with rotation
You may figure out that the texture won't follow the rotation, as we rotate the hexagon before calculate the UVs.
If you wish to achieve other effect, you may rotate it afterward as the [Advance Usage](#Advance).
```javascript
hexagonGeoGenerator(HEX_SIZE, HEX_SEGMENT, Math.PI/4);
```
![TextureRotation](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/textureRotation.png?raw=true)

## API

* #### hexagonGeoGenerator ( size, segment, rotateAngle, textureFit )
Param        | Type      | Description                                                    | Default
------------ | ----------|----------------------------------------------------------------|----------
size         | number    | Edge length of the hexagon                                     | 10
segment      | integer   | The level of subdivision                                       | 1
rotateAngle  | number    | Rotation                                                       | 0
textureFit   | string    | Texture fitting strategy, `COVER`, `CONTAIN` or `FILL` only    | COVER

Returns      | Type      | Description                  
------------ | ----------|-----------------------------
vertices     | number[]  | The 3D coord of vertices  
indices      | integer[] | The index of front faces    
invertIndices| integer[] | The index of back faces          
normals      | number[]  | Normals
uvs          | number[]  | UVs for texture mapping


* #### rotateAll ( vertices, angle )
Param        | Type      | Description               
------------ | ----------|-----------------------------
vertices     | number[]  | The 3D coord of vertices, **which will be manipulated** 
angle        | number    | Rotation angle in radian

* #### computeUV ( vertices, textureFit ) : UVs
Param        | Type      | Description               
------------ | ----------|-----------------------------
vertices     | number[]  | The 3D coord of vertices
textureFit   | string    | Texture fitting strategy, `COVER`, `CONTAIN` or `FILL` only

* #### computeInvertedIndices ( indices ) : invertedIndices
Param        | Type      | Description               
------------ | ----------|-----------------------------
indices      | number[]  | The indexing of vertices for faces

## Advance Usage <a name="Advance"></a>

### Texture with rotation
You may rotate the hexagon to achieve other texture pattern.
```javascript
import  hexagonGeoGenerator, {rotateAll} from  './node_modules/hexagon-geo/index.js';
...

let {vertices, indices, uvs, normals} = hexagonGeoGenerator(HEX_SIZE, HEX_SEGMENT, -Math.PI/7);
rotateAll(vertices, Math.PI/7);
```
![TextureAdvanceRotation](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/textureAdvanceRotation.png?raw=true)

### 2D Rendering
Although it designed for 3D plane, it also can be used for 2D.
```javascript
const OFFSET = [150,150];
let {vertices, indices} = hexagonGeoGenerator(120, 3);

for (let  i=0; i<indices.length; i+=3){
  let points = [indices[i], indices[i+1], indices[i+2]];	// 3 point for a triangle
  points = points.map( pointIndex  => [ 
    vertices[pointIndex*3] + OFFSET[0], 		// x
    vertices[pointIndex*3+1] + OFFSET[1]		// y
  ]); 

  ctx.moveTo(...points[0]);
  ctx.beginPath();
  points.forEach(point  => ctx.lineTo(...point))
  ctx.closePath();
  ctx.fillStyle = i%6===0? '#fff' : '#000';
  ctx.fill();
}
```
![2D](https://github.com/samuelwong613/hexagon-geo/blob/master/githubImage/2d.png?raw=true)

## License
* MIT License
