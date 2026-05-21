import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function generateTicks(start, end, step) {
  const ticks = [];

  for (let value = start; value <= end; value += step) {
    ticks.push(value);
  }

  return ticks;
}

function SpectrumChart({ data }) {
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

          <XAxis
            dataKey="wavenumber"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={xTicks}
            stroke="#7f93a3"
          />

          <YAxis stroke="#7f93a3" />

          <Line
            type="monotone"
            dataKey="absorbance"
            stroke="#ff2f7d"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

export default SpectrumChart;