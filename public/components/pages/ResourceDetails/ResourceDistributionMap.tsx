import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiRange, EuiSelect, EuiText } from '@elastic/eui';

import createFractalModule from '../../../wasm/galaxiesFractal';
import mapConfigs from '../../PlanetWatcher/data/maps';

enum ColormapType2 {
  Parula,
  Heat,
  Jet,
  Turbo,
  Hot,
  Gray,
  Magma,
  Inferno,
  Plasma,
  Viridis,
  Cividis,
  Github,
}

const colorMapOptions = [
  { text: 'Parula', value: ColormapType2.Parula },
  { text: 'Heat', value: ColormapType2.Heat },
  { text: 'Jet', value: ColormapType2.Jet },
  { text: 'Turbo', value: ColormapType2.Turbo },
  { text: 'Hot', value: ColormapType2.Hot },
  { text: 'Gray', value: ColormapType2.Gray },
  { text: 'Magma', value: ColormapType2.Magma },
  { text: 'Inferno', value: ColormapType2.Inferno },
  { text: 'Plasma', value: ColormapType2.Plasma },
  { text: 'Viridis', value: ColormapType2.Viridis },
  { text: 'Cividis', value: ColormapType2.Cividis },
  { text: 'Github', value: ColormapType2.Github },
] as const;

interface ResourceDistributionMapProps {
  scene: string;
  seed: number;
  xScale: number;
  yScale: number;
  bias: number;
  gain: number;
  comboRule: number;
  frequency: number;
  amplitude: number;
  octaves: number;
}

const MIN_SAMPLE_DENSITY = 8;
const MAX_SAMPLE_DENSITY = 512;

const ResourceDistributionMap: React.FC<ResourceDistributionMapProps> = props => {
  const [mousePosition, setMousePosition] = useState<[x: number, y: number] | null>(null);
  const [fractalModule, setFractalModule] = useState<Awaited<ReturnType<typeof createFractalModule>> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colorMap, setColorMap] = useState<number>(ColormapType2.Heat);
  const [alpha, setAlpha] = useState<number>(0.9);
  const [heatmapQuality, setHeatmapQuality] = useState<number>(MAX_SAMPLE_DENSITY - 128);

  useEffect(() => {
    const fetchWasmModule = async () => {
      const fetchedFractalModule = await createFractalModule();

      setFractalModule(fetchedFractalModule);
    };

    fetchWasmModule();
  }, []);

  const mapConfig = mapConfigs.find(map => map.id === props.scene);

  const heatmapResults = useMemo(
    () =>
      fractalModule?.generateHeatmap(
        props.seed,
        props.xScale,
        props.yScale,
        props.bias,
        props.gain,
        props.comboRule,
        props.frequency,
        props.amplitude,
        props.octaves,
        MAX_SAMPLE_DENSITY + MIN_SAMPLE_DENSITY - heatmapQuality,
        colorMap
      ),
    [
      props.seed,
      props.xScale,
      props.yScale,
      props.bias,
      props.gain,
      props.comboRule,
      props.frequency,
      props.amplitude,
      props.octaves,
      heatmapQuality,
      colorMap,
      fractalModule,
    ]
  );

  useLayoutEffect(() => {
    const redraw = async () => {
      if (!canvasRef.current || !heatmapResults) return;

      const ctx = canvasRef.current.getContext('2d')!;
      const [backgroundImage, heatmapBitmap] = await Promise.all([
        new Promise<HTMLImageElement>(resolve => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = `https://swg-map-viewer.geit.uk/${mapConfig?.raster?.backgroundImage}`;
        }),
        createImageBitmap(heatmapResults.heatmapImageData),
      ]);

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.globalAlpha = 1.0;

      if (backgroundImage.complete && backgroundImage.naturalWidth)
        ctx.drawImage(backgroundImage, 0, 0, canvasRef.current.width, canvasRef.current.height);

      ctx.globalAlpha = alpha;
      ctx.drawImage(heatmapBitmap, 0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    redraw();
  }, [
    props.seed,
    props.xScale,
    props.yScale,
    props.bias,
    props.gain,
    props.comboRule,
    props.frequency,
    props.amplitude,
    props.octaves,
    alpha,
    mapConfig?.raster?.backgroundImage,
    heatmapResults,
  ]);

  const realMousePosition = useMemo(() => {
    if (!mousePosition) return null;

    return [mousePosition[0] * 16384 - 8192, 8192 - mousePosition[1] * 16384];
  }, [mousePosition]);

  const mousePositionValue = useMemo(() => {
    if (!realMousePosition) return null;

    return fractalModule?.getValueAtPosition(
      props.seed,
      props.xScale,
      props.yScale,
      props.bias,
      props.gain,
      props.comboRule,
      props.frequency,
      props.amplitude,
      props.octaves,
      realMousePosition[0],
      realMousePosition[1]
    );
  }, [
    fractalModule,
    props.seed,
    props.xScale,
    props.yScale,
    props.bias,
    props.gain,
    props.comboRule,
    props.frequency,
    props.amplitude,
    props.octaves,
    realMousePosition,
  ]);

  return (
    <EuiFlexGroup gutterSize="l">
      <EuiFlexItem grow={3}>
        <canvas
          ref={canvasRef}
          style={{ aspectRatio: '1/1', minHeight: '256px', height: 'auto', width: '100%', touchAction: 'none' }}
          onMouseMove={e => {
            const bounds = (e.target as HTMLCanvasElement).getBoundingClientRect();

            const offsetX = e.clientX - bounds.left;
            const offsetY = e.clientY - bounds.top;

            setMousePosition([offsetX / bounds.width, offsetY / bounds.height]);
          }}
          onTouchMove={e => {
            const bounds = (e.target as HTMLCanvasElement).getBoundingClientRect();

            const changedTouch = e.changedTouches[0];

            const offsetX = changedTouch.clientX - bounds.left;
            const offsetY = changedTouch.clientY - bounds.top;

            setMousePosition([offsetX / bounds.width, offsetY / bounds.height]);
          }}
          onMouseOut={() => setMousePosition(null)}
          width="2048"
          height="2048"
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow label="Color Map">
          <EuiSelect
            // @ts-expect-error it isnt mutable
            options={colorMapOptions}
            value={colorMap}
            onChange={e => {
              setColorMap(Number(e.target.value));
            }}
          />
        </EuiFormRow>
        <EuiFormRow label="Transparency">
          <EuiRange
            min={0.0}
            max={1.0}
            step={0.01}
            value={alpha}
            onChange={e => 'value' in e.target && setAlpha(Number(e.target.value))}
            showRange
          />
        </EuiFormRow>
        <EuiFormRow label="Heatmap Quality">
          <EuiRange
            min={MIN_SAMPLE_DENSITY}
            max={MAX_SAMPLE_DENSITY}
            step={4}
            value={heatmapQuality}
            onChange={e => 'value' in e.target && setHeatmapQuality(Number(e.target.value))}
            showRange
          />
        </EuiFormRow>
        {heatmapResults?.highestValue && (
          <EuiText>
            <code>
              <strong>High:</strong> {Math.round(heatmapResults.highestValue * 100)}% at {heatmapResults.highestX},{' '}
              {heatmapResults.highestY}
            </code>
          </EuiText>
        )}
        {realMousePosition && mousePositionValue && (
          <EuiText>
            <code>
              <strong>Mouse:</strong> {Math.round(mousePositionValue * 100)}% at {Math.round(realMousePosition[0])},{' '}
              {Math.round(realMousePosition[1])}
            </code>
          </EuiText>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ResourceDistributionMap;
