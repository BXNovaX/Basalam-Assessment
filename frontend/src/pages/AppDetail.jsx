import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import EditAppModal from '@/components/EditAppModal';
import DeleteAppModal from '@/components/DeleteAppModal';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AppDetail() {
  const { id } = useParams();
  const { data: app, error, isLoading } = useSWR(
    `http://localhost:8000/app/${id}/`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Loading application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-destructive">Failed to load application</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                to="/"
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{app?.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Application details and configuration
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <EditAppModal app={app} />
              <DeleteAppModal app={app} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid gap-6">
          {/* Configuration */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium mb-6">Configuration</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Namespace</div>
                    <div className="text-sm">{app?.namespace}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Container Image</div>
                    <div className="text-sm">{app?.image}</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Replicas</div>
                    <div className="text-2xl font-semibold">{app?.replicas}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Port</div>
                    <div className="text-2xl font-semibold">{app?.port}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          {app?.environment_variables && Object.keys(app.environment_variables).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-medium mb-6">Environment Variables</h2>
                <div className="space-y-2">
                  {Object.entries(app.environment_variables).map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <span className="font-medium">{key}:</span>
                      <span className="text-muted-foreground break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium mb-6">Timeline</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Created</div>
                  <div className="text-sm">
                    {app?.created_at && new Date(app.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Last Updated</div>
                  <div className="text-sm">
                    {app?.updated_at && new Date(app.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}