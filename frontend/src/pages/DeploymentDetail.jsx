import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import yaml from 'js-yaml';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function DeploymentDetail() {
  const { id } = useParams();
  const { data: deployment, error, isLoading } = useSWR(
    `http://localhost:8000/app/deployments/${id}/`,
    fetcher,
    { refreshInterval: 2000 }
  );

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">Loading deployment...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-background text-destructive">Failed to load deployment</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/app/${deployment?.app}`} className="p-2 hover:bg-muted rounded-md transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Deployment of {deployment?.app?.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Status: {deployment?.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl grid gap-6">
        {/* Helm Values */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-medium mb-6">Helm Values Applied</h2>
            {deployment?.helm_values && Object.keys(deployment.helm_values).length > 0 ? (
              <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {deployment.helm_values ? yaml.dump(yaml.load(deployment.helm_values)) : 'No helm values provided.'}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground">No helm values provided.</div>
            )}
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-medium mb-6">Deployment Logs</h2>
            {deployment?.logs ? (
              <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {deployment.logs}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground">No logs available.</div>
            )}
          </CardContent>
        </Card>

        {/* Error Messages */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-medium mb-6">Error Messages</h2>
            {deployment?.error_messages ? (
              <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-red-600">
                {deployment.error_messages}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground">No error messages.</div>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardContent className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Created</div>
              <div className="text-sm">{deployment?.created_at && new Date(deployment.created_at).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
