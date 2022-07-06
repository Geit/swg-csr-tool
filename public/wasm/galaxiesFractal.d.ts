
/// <reference types="emscripten" />

enum ColormapType
{
    Parula, Heat, Jet, Turbo, Hot, Gray, Magma, Inferno, Plasma, Viridis, Cividis, Github
};

interface GenerateHeatmapReturnType {
  highestX: number;
  highestY: number;
  highestValue: number;
  heatmapImageData: ImageData;
}

export interface FractalModule extends EmscriptenModule {

  generateHeatmap(
    seed: number,
    scaleX: number,
    scaleY: number,
    bias: number,
    gain: number,
    combinationRule: number,
    frequency: number,
    amplitude: number,
    octave: number,
    sampleDensity = 32,
    heatmapType = ColormapType.Heat
  ): GenerateHeatmapReturnType;

  getValueAtPosition(
    seed: number,
    scaleX: number,
    scaleY: number,
    bias: number,
    gain: number,
    combinationRule: number,
    frequency: number,
    amplitude: number,
    octave: number,
    x: number,
    y: number
  ): number;
}

declare var moduleFactory: EmscriptenModuleFactory<FractalModule>;

export default moduleFactory;
