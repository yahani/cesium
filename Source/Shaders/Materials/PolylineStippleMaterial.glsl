#extension GL_OES_standard_derivatives : enable // TODO check for support
precision highp float;

uniform float stippleWidth;
uniform float gapWidth;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    
    vec2 st = materialInput.st;
    
    float dF = fwidth(st.s);
    float sWidth = stippleWidth * dF;
    float gWidth = gapWidth * dF;
    float width = sWidth + gWidth;
    float numSegments = floor(st.s / width);
    float b = step(numSegments * width + sWidth, st.s);
    
    vec4 color = mix(vec4(1.0, 1.0, 0.0, 1.0), vec4(0.0), b);
    
    material.diffuse = color.rgb;
    material.alpha = color.a;
    
    return material;
}
