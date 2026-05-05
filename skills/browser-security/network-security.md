# Network Security (SSRF Prevention)

## Threat: Server-Side Request Forgery

Chrome in our container can fetch any URL. An attacker-controlled page or a malicious agent instruction could make Chrome request:

- `http://169.254.169.254/` — GCP metadata server (exposes service account tokens)
- `http://10.x.x.x/` — Internal VPC services
- `http://localhost:9222/` — CDP endpoint itself (recursive attack)

## Defense Layer 1: Chrome Resolver Rules

Built into Chrome launch flags — DNS-level blocking:

```
--host-resolver-rules=MAP 169.254.169.254 ~NOTFOUND, MAP metadata.google.internal ~NOTFOUND
```

This makes Chrome's DNS resolver return NXDOMAIN for metadata endpoints. Works even if page JS tries to fetch these URLs.

**Limitation**: Only blocks hostname resolution. Direct IP access (e.g., `http://169.254.169.254/`) in page HTML is NOT blocked by this flag — that's why we need VPC firewall rules.

## Defense Layer 2: VPC Firewall Rules

Terraform rules that block egress from the Cloud Run VPC connector:

```hcl
# Block metadata endpoint
resource "google_compute_firewall" "deny_metadata" {
  name    = "browser-service-deny-metadata"
  network = "default"

  deny {
    protocol = "tcp"
  }

  direction          = "EGRESS"
  destination_ranges = ["169.254.169.254/32"]
  target_tags        = ["browser-service"]
  priority           = 100
}

# Block private IP ranges (RFC 1918)
resource "google_compute_firewall" "deny_private_ips" {
  name    = "browser-service-deny-private"
  network = "default"

  deny {
    protocol = "tcp"
  }

  direction = "EGRESS"
  destination_ranges = [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
  ]
  target_tags = ["browser-service"]
  priority    = 200
}
```

## Defense Layer 3: agent-browser Domain Allowlist

Application-level restriction on navigation:

```bash
export AGENT_BROWSER_ALLOWED_DOMAINS="*.target-site.com,target-site.com"
```

This blocks navigation AND sub-resource requests (CSS, JS, images, WebSocket, EventSource) to non-allowed domains. Strictest layer — only allows the specific site the agent should be browsing.

## Combined Defense Matrix

| Attack                             | Resolver Rules     | VPC Firewall | Domain Allowlist                     |
| ---------------------------------- | ------------------ | ------------ | ------------------------------------ |
| `http://169.254.169.254/`          | Blocked (hostname) | Blocked (IP) | Blocked                              |
| `http://10.0.0.1/internal`         | Not blocked        | Blocked      | Blocked                              |
| `http://metadata.google.internal/` | Blocked            | Blocked      | Blocked                              |
| Malicious external redirect        | Not blocked        | Not blocked  | Blocked (if target not in allowlist) |
| WebSocket to internal IP           | Not blocked        | Blocked      | Blocked                              |

## Verification Commands

```bash
# From inside container, as chrome user:
# Should fail (metadata)
curl -s http://169.254.169.254/computeMetadata/v1/ && echo "FAIL: metadata accessible" || echo "PASS"

# Should fail (private IP)
curl -s http://10.0.0.1/ && echo "FAIL: private IP accessible" || echo "PASS"

# Should succeed (public internet)
curl -s https://example.com && echo "PASS: internet works" || echo "FAIL"
```
