import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";

function generateTicks(start, end, step) {
  const ticks = [];

  for (let value = start; value <= end; value += step) {
    ticks.push(value);
  }

  return ticks;
}

function SpectrumChart({ data, minLimit, maxLimit }) {
  if (!data || data.length === 0) {
    return <section className="chart-card" />;
  }

  const minWavenumber = data[0].wavenumber;
  const maxWavenumber = data[data.length - 1].wavenumber;
  const xTicks = generateTicks(minWavenumber, maxWavenumber, 100);

  const range = maxLimit - minLimit;
  const padding = range * 0.05; // 5% extra space
  const roundedMinLimit = Math.floor((minLimit - padding) * 1000) / 1000;
  const roundedMaxLimit = Math.ceil((maxLimit + padding) * 100) / 100;

  return (
    <section className="chart-card">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: "#10202d",
              border: "1px solid #3f586c",
              borderRadius: "6px",
              color: "#d8e7f4",
            }}
            labelStyle={{
              color: "#91a6b8",
              fontWeight: 700,
            }}
            formatter={(value) => value.toFixed(5)}
          />
          
          <CartesianGrid stroke="#223545" strokeWidth={1} />

          <ReferenceLine 
            y={0} 
            stroke="#7f93a3" 
            strokeWidth={1.5} 
            label = {{
              value: "0",
              position: "left",
              fill: "#91a6b8"
            }}
          />

          <XAxis
            dataKey="wavenumber"
            stroke="#7f93a3"
            ticks={xTicks}
            axisLine={false}
            tickLine={{
              strokeWidth: 0.5,
            }}
            label={{
              value: "Wavenumber [cm⁻¹]",
              position: "insideBottom",
              offset: -20,
              fill: "#91a6b8",
              fontSize: 20,
              fontWeight: 800,
            }}
          />

          <YAxis 
            domain={[roundedMinLimit, roundedMaxLimit]}
            stroke="#7f93a3"           
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toFixed(4)}
            label={{
              value: "Absorbance",
              angle: -90,
              position: "insideLeft",
              dx: -30,
              dy: 50,
              fill: "#91a6b8",
              fontSize: 20,
              fontWeight: 800,
            }}
          />

          <Line
            type="monotone"
            dataKey="absorbance"
            stroke="#ff2f7d"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

export default SpectrumChart;