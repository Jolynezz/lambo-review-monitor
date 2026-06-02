'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface ProvinceDatum {
  name: string;
  value: number;
}

interface ChinaMapProps {
  data: ProvinceDatum[];
  topNames: string[];
}

let mapRegistered = false;

export default function ChinaMap({ data, topNames }: ChinaMapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let chart: echarts.ECharts | null = null;
    let disposed = false;

    async function render() {
      if (!mapRegistered) {
        const res = await fetch('/china.json');
        const geo = await res.json();
        echarts.registerMap('china', geo);
        mapRegistered = true;
      }
      if (disposed || !el) return;

      chart = echarts.init(el, undefined, { renderer: 'canvas' });
      const maxVal = Math.max(1, ...data.map((d) => d.value));

      chart.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: '#1A1516',
          borderColor: '#1A1516',
          textStyle: { color: '#FBF9F9', fontFamily: 'Noto Serif SC, serif', fontSize: 13 },
          formatter: (p: { name: string; value?: number }) =>
            `${p.name}<br/><span style="color:#E63B41;font-weight:700">差评 ${p.value || 0} 条</span>`,
        },
        visualMap: {
          min: 0,
          max: maxVal,
          left: 24,
          bottom: 24,
          text: ['多', '少'],
          calculable: true,
          itemWidth: 12,
          itemHeight: 110,
          inRange: { color: ['#FAEDED', '#E89A9D', '#D8232A', '#8E1117'] },
          textStyle: { color: '#574E50', fontFamily: 'Noto Serif SC, serif', fontSize: 12 },
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: false,
            zoom: 1.18,
            scaleLimit: { min: 1, max: 4 },
            label: { show: false, color: '#1A1516', fontSize: 9, fontFamily: 'Noto Serif SC, serif' },
            itemStyle: {
              areaColor: '#F4EFEF',
              borderColor: '#FFFFFF',
              borderWidth: 0.8,
            },
            emphasis: {
              label: { show: true, color: '#FFFFFF', fontSize: 11 },
              itemStyle: { areaColor: '#A4151B', borderColor: '#FFFFFF' },
            },
            select: { disabled: true },
            data: data.map((d) => {
              const isTop = topNames.includes(d.name);
              return isTop
                ? {
                    name: d.name,
                    value: d.value,
                    label: { show: true, color: '#FFFFFF', fontWeight: 700, fontSize: 11 },
                    itemStyle: { borderColor: '#FFFFFF', borderWidth: 1.4 },
                  }
                : { name: d.name, value: d.value };
            }),
          },
        ],
      });
    }

    render();

    const onResize = () => chart?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      disposed = true;
      window.removeEventListener('resize', onResize);
      chart?.dispose();
    };
  }, [data, topNames]);

  return <div ref={ref} style={{ width: '100%', height: 400 }} />;
}
