import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import AddAppModal from '@/components/AddAppModal';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AppsList() {
  const { data: apps, error, isLoading } = useSWR('http://localhost:8000/app/', fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-destructive">Failed to load applications</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your Kubernetes deployments
              </p>
            </div>
            <AddAppModal />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {(!apps || apps.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <h2 className="text-lg font-medium mb-2">No applications yet</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Get started by creating your first application deployment.
              </p>
              <AddAppModal />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="block group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-foreground/20 cursor-pointer">
                  <CardContent className="p-6">
                    {/* App Name and Namespace */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-base group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {app.namespace}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {app.replicas} {app.replicas === 1 ? 'replica' : 'replicas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Image</div>
                        <div className="text-sm truncate">
                          {app.image}
                        </div>
                      </div>

                      {/* Port */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Port</div>
                          <div className="text-sm font-medium">{app.port}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Created</div>
                          <div className="text-sm">
                            {new Date(app.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Last updated {new Date(app.updated_at).toLocaleDateString()}
                      </span>
                      <svg
                        className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}