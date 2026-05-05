# Inter-Service Authentication

## Architecture

```
Embeds (Cloud Run Gen1) ──HTTP──▶ Browser Service (Cloud Run Gen2)
```

Embeds sends commands to browser-service. This must be authenticated — no public access to browser-service.

## Recommended: Cloud Run IAM

Cloud Run natively supports IAM-based service-to-service auth:

### Setup (Terraform)

```hcl
# Browser service — require authentication
resource "google_cloud_run_v2_service" "browser_service" {
  name     = "browser-service"
  location = var.region

  template {
    # ... container config ...
  }

  # Do NOT add allUsers invoker — service is private
}

# Grant embeds permission to invoke browser-service
resource "google_cloud_run_v2_service_iam_member" "embeds_invokes_browser" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.browser_service.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.embeds_service_account}"
}
```

### Client (Embeds — Effect Service)

```typescript
import { Effect } from "effect";

export class BrowserServiceClient extends Effect.Service<BrowserServiceClient>()(
  "BrowserServiceClient",
  {
    effect: Effect.gen(function* () {
      const baseUrl = process.env.BROWSER_SERVICE_URL;

      // Cloud Run automatically provides identity token for service-to-service
      const getAuthToken = () =>
        Effect.tryPromise(() =>
          fetch(
            `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${baseUrl}`,
            { headers: { "Metadata-Flavor": "Google" } },
          ).then((r) => r.text()),
        );

      return {
        executeCommand: (sessionId: string, command: string) =>
          Effect.gen(function* () {
            const token = yield* getAuthToken();
            return yield* Effect.tryPromise(() =>
              fetch(`${baseUrl}/sessions/${sessionId}/execute`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ command }),
              }),
            );
          }),
      };
    }),
  },
) {}
```

### How It Works

1. Embeds fetches an **identity token** from the metadata server (automatic in Cloud Run)
2. Token is scoped to browser-service's URL as audience
3. Browser-service validates the token automatically (Cloud Run IAM enforcement)
4. No secrets needed — IAM handles auth via service account identity

## Fallback: Shared Secret

For local development or when Cloud Run IAM isn't available:

```typescript
// Browser service middleware
const authMiddleware = (req: Request) => {
  const token = req.headers.get("X-Service-Token");
  if (token !== process.env.SERVICE_AUTH_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
};
```

```bash
# Set same secret in both services
# embeds .env.local
BROWSER_SERVICE_TOKEN=dev-secret-token

# browser-service .env.local
SERVICE_AUTH_TOKEN=dev-secret-token
```

## Auth Middleware Pattern (Effect)

```typescript
import { Effect } from "effect";

const validateServiceAuth = (request: Request) =>
  Effect.gen(function* () {
    // In Cloud Run: IAM handles this automatically
    // In dev: check shared secret
    if (process.env.NODE_ENV === "development") {
      const token = request.headers.get("X-Service-Token");
      if (token !== process.env.SERVICE_AUTH_TOKEN) {
        return yield* Effect.fail(
          new UnauthorizedError({ service: "browser-service" }),
        );
      }
    }
    // In production: Cloud Run IAM already validated before request reaches us
  });
```
