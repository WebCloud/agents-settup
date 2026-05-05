# Cloud Run for Browser Service

## Why Gen2

Cloud Run Gen2 uses **microVMs** (not gVisor containers like Gen1). This matters for Chrome:

| Feature              | Gen1 (gVisor)                      | Gen2 (microVM)     |
| -------------------- | ---------------------------------- | ------------------ |
| Syscall support      | Limited (gVisor intercepts)        | Full Linux kernel  |
| Chrome compatibility | Breaks sandbox, some APIs          | Full compatibility |
| Process isolation    | User-space kernel                  | Hardware VM        |
| `/dev/shm`           | Limited                            | Full support       |
| Performance          | Overhead from syscall interception | Near-native        |

Chrome requires full syscall support — Gen1's gVisor sandbox conflicts with Chrome's own sandbox.

## Service Configuration

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: browser-service
  annotations:
    run.googleapis.com/execution-environment: gen2 # microVM, not gVisor
    run.googleapis.com/cpu-throttling: "false" # CPU always allocated (Chrome needs it)
    run.googleapis.com/startup-cpu-boost: "true" # Extra CPU during cold start
spec:
  template:
    spec:
      containerConcurrency: 1 # ONE browser session per instance
      timeoutSeconds: 600 # 10 min max (matches agent session timeout)
      containers:
        - image: ${IMAGE_URL}
          ports:
            - containerPort: 8080
          resources:
            limits:
              memory: 4Gi # Chrome (~1.5GB) + app (~256MB) + agent-browser daemon (~128MB) + headroom
              cpu: "2" # Chrome needs cores for rendering + JS
          startupProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 2
            failureThreshold: 15 # 30s max startup (Chrome cold start is slow)
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            periodSeconds: 30
            failureThreshold: 3
```

## Key Decisions

### `containerConcurrency: 1`

One browser per instance. Chrome is memory-heavy (~1.5GB baseline). Running multiple sessions risks OOM kills and cross-session interference.

### `cpu-throttling: "false"`

Chrome needs CPU even when not handling HTTP requests (page rendering, JS execution). Without this, Cloud Run throttles CPU between requests.

### Memory: 4Gi

- Chrome headless: ~1-1.5GB baseline, spikes to 2GB+ on heavy pages
- Bun app server: ~128-256MB
- agent-browser daemon: ~64-128MB
- Headroom for spikes: ~1GB

### `startup-cpu-boost`

Chrome cold start downloads browser binary, launches processes, initializes. Extra CPU during startup reduces cold start from ~8s to ~3s.

## Scaling

```yaml
metadata:
  annotations:
    autoscaling.knative.dev/minScale: "1" # Keep 1 warm instance to avoid cold starts
    autoscaling.knative.dev/maxScale: "20" # Max concurrent browser sessions
```

One warm instance means the first user gets instant response. Max 20 = 20 concurrent browser sessions = ~80GB memory across fleet.
