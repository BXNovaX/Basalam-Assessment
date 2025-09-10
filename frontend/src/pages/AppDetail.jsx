import { useParams, Link, useNavigate } from 'react-router-dom';

import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import EditAppModal from '@/components/EditAppModal';
import DeleteAppModal from '@/components/DeleteAppModal';
import AppStatus from '@/components/AppStatus';
import { useState } from 'react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AppDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: app, error, isLoading, mutate } = useSWR(
    `http://localhost:8000/app/${id}/`,
    fetcher
  );
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const response = await fetch(`http://localhost:8000/app/${id}/deploy/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const deployment = await response.json();

      if (deployment?.id) {
        navigate(`/deployments/${deployment.id}`);
      }

      mutate();
    } catch (err) {
      console.error('Deployment failed', err);
    } finally {
      setDeploying(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        Loading application...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-destructive">
        Failed to load application
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-muted rounded-md transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
                {app?.name} <AppStatus appId={app.id} />
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Application details and configuration
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <EditAppModal app={app} />
            <DeleteAppModal app={app} />
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {deploying ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 grid gap-6 max-w-4xl">
        {/* Configuration Card */}
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

        {/* Deployments List */}
        {app?.deployments?.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium mb-6">Deployments</h2>
              <ul className="space-y-2">
                {app.deployments.map((dep) => (
                  <li key={dep.id} className="flex justify-between items-center border p-3 rounded-md">
                    <div>
                      <span className="font-medium">{new Date(dep.created_at).toLocaleString()}</span>
                      <span className="ml-2 text-sm text-muted-foreground">- {dep.status}</span>
                    </div>
                    <Link
                      to={`/deployments/${dep.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
