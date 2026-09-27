/** Repack embedded, opaque PNG textures as web-sized JPEGs without changing GLB geometry. */
import {readFile,writeFile} from 'node:fs/promises'
import sharp from 'sharp'

const [source,target]=process.argv.slice(2)
if(!source||!target||source===target)throw new Error('Pass distinct source.glb and target.glb paths')

const file=await readFile(source)
if(file.toString('ascii',0,4)!=='glTF'||file.readUInt32LE(4)!==2)throw new Error('Expected glTF 2.0 GLB')
const jsonLength=file.readUInt32LE(12)
const json=JSON.parse(file.subarray(20,20+jsonLength).toString('utf8'))
const binHeader=20+jsonLength
if(file.toString('ascii',binHeader+4,binHeader+8)!=='BIN\0')throw new Error('Expected one binary chunk')
const binary=file.subarray(binHeader+8,binHeader+8+file.readUInt32LE(binHeader))
const imageViews=new Map((json.images||[]).filter(image=>image.bufferView!==undefined).map(image=>[image.bufferView,image]))
const segments=[]
let offset=0
for(const [index,view] of json.bufferViews.entries()){
  const image=imageViews.get(index)
  let payload=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength)
  if(image?.mimeType==='image/png'){
    const meta=await sharp(payload).metadata()
    if(!meta.hasAlpha&&Math.max(meta.width,meta.height)>512){
      const converted=await sharp(payload).resize({width:2048,height:2048,fit:'inside',withoutEnlargement:true}).jpeg({quality:90,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer()
      console.log(`${image.name||index}: ${payload.length} -> ${converted.length} bytes`)
      payload=converted
      image.mimeType='image/jpeg'
    }
  }
  offset=(offset+3)&~3
  view.byteOffset=offset
  view.byteLength=payload.length
  segments.push({offset,payload})
  offset+=payload.length
}
const binLength=(offset+3)&~3
json.buffers[0].byteLength=binLength
const jsonBytes=Buffer.from(JSON.stringify(json))
const paddedJsonLength=(jsonBytes.length+3)&~3
const output=Buffer.alloc(12+8+paddedJsonLength+8+binLength)
output.write('glTF',0,'ascii')
output.writeUInt32LE(2,4)
output.writeUInt32LE(output.length,8)
output.writeUInt32LE(paddedJsonLength,12)
output.write('JSON',16,'ascii')
jsonBytes.copy(output,20)
output.fill(0x20,20+jsonBytes.length,20+paddedJsonLength)
const nextBinHeader=20+paddedJsonLength
output.writeUInt32LE(binLength,nextBinHeader)
output.write('BIN\0',nextBinHeader+4,'ascii')
for(const {offset:at,payload} of segments)payload.copy(output,nextBinHeader+8+at)
await writeFile(target,output)
console.log(`Wrote ${target}: ${file.length} -> ${output.length} bytes`)
