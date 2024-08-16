import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import dayjs from 'dayjs';

interface GenerateChartProps {
    data: any[];
}

const GenerateChart: React.FC<GenerateChartProps> = ({ data }) => {
    const seriesData = data.map((record: any) => new Date(record.date));
    const seriesDistanceStart = data.map((record: any) => record.distance_start);
    const seriesDistanceStop = data.map((record: any) => record.distance_stop);
    const seriesDistanceDiff = data.map((record: any) => record.distance_diff);

    return (<>
        <p className='fw-bold'>Travel breakdown</p>

        <LineChart className='MuiChartsAxis-left'
            xAxis={[
                {
                    data: seriesData,
                    tickInterval: seriesData,
                    valueFormatter: (date) => dayjs(date).format("YYYY-MM-DD")
                }
            ]}
            yAxis={[
                { id: 'start', scaleType: 'linear' },
                { id: 'finish', scaleType: 'linear' },
                { id: 'diff', scaleType: 'linear' },
            ]}
            series={[
                {
                    yAxisId: 'start',
                    label: "Start",
                    data: seriesDistanceStart,
                    valueFormatter: (value) => (value == null ? 'NaN' : value.toString()),
                },
                {
                    yAxisId: 'finish',
                    label: "Finish",
                    data: seriesDistanceStop,
                    valueFormatter: (value) => (value == null ? 'NaN' : value.toString())
                },
                {
                    yAxisId: 'diff',
                    label: "Travel",
                    data: seriesDistanceDiff,
                    valueFormatter: (value) => (value == null ? 'NaN' : value.toString())
                },
            ]}
            width={700}
            height={300}
            margin={{ left: 65, right: 10 }}
            grid={{ vertical: true, horizontal: true }}
        />

        <p className='fw-bold'>Travel distance</p>

        <BarChart
            xAxis={[{
                scaleType: 'band',
                data: seriesData,
                valueFormatter: (date) => dayjs(date).format("YYYY-MM-DD")
            }]}
            series={[{
                label: "Distance (KM)",
                data: seriesDistanceDiff
            }]}
            width={700}
            height={300}
            margin={{ left: 65, right: 10 }}
            barLabel="value"
        />
    </>);
};

export default GenerateChart;