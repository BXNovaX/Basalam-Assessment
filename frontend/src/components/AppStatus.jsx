import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AppStatus({ appId }) {
  const { data, error } = useSWR(`http://localhost:8000/app/${appId}/status/`, fetcher);

  if (error) return <span className="text-red-600 text-xs">Error</span>;
  if (!data) return <span className="text-muted-foreground text-xs">Loading...</span>;

  return (
    <span
      className={`text-xs font-medium ${
        data.running ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {data.running ? 'Running' : 'Not Running'}
    </span>
  );
}
