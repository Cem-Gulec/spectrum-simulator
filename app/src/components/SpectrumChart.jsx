import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
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

  return (
    <section className="chart-card">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        >
          <CartesianGrid stroke="#223545" strokeWidth={1} />

          <ReferenceLine y={0} stroke="#7f93a3" strokeWidth={1.5} />

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
            }}
          />

          <YAxis 
            domain={[minLimit, maxLimit]}
            stroke="#7f93a3"           
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toFixed(4)}
            label={{
              value: "Absorbance",
              angle: -90,
              position: "insideLeft",
              dx: -30,
              fill: "#91a6b8",
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