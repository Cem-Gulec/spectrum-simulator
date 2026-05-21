import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

function SpectrumChart({ data }) {
  return (
    <section className="chart-card">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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