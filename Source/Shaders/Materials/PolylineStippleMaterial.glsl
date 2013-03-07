uniform float stippleWidth;
uniform float gapWidth;

varying vec2 v_segmentTextureCoordinates;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    
    vec2 st = v_segmentTextureCoordinates;
    float pixelSize = czm_pixelSize * abs(materialInput.positionToEyeEC.z);
    
    float sWidth = stippleWidth * pixelSize;
    float gWidth = gapWidth * pixelSize;
    float width = sWidth + gWidth;
    float numSegments = floor(st.s / width);
    float edge = numSegments * width + sWidth;
    float b = step(edge, st.s);
    
    vec4 color = mix(vec4(1.0, 1.0, 0.0, 1.0), vec4(0.0), b);
    
    material.diffuse = color.rgb;
    material.alpha = color.a;
    
    return material;
}
