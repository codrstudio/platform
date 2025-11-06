# n8n Integration Plan for /api/1/auth/refresh

## Executive Summary

This document outlines the migration strategy to move the `/api/1/auth/refresh` endpoint from Backend-only implementation to SPEC-compliant n8n Backbone integration.

**Current State:** Backend processes refresh endpoint entirely
**Target State:** Backend proxies to n8n workflow (SPEC-AU-RF-005 compliance)
**Migration Strategy:** Feature-flagged gradual rollout with performance monitoring
**Risk Level:** Medium (affects all active sessions)

---

## Current State Analysis

### Current Implementation

**File:** `src/prototype-2/backend/src/routes/auth.routes.ts` (lines 153-287)

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│ Frontend                                                 │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/1/auth/refresh
                     │ { refresh_token: "..." }
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Express)                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ auth.routes.ts                                      │ │
│ │ - Validate input                                    │ │
│ │ - Call tokenRotationService.validateRefreshToken()  │ │
│ │ - Detect reuse, revoke family if needed             │ │
│ │ - Generate new access + refresh tokens              │ │
│ │ - Store new refresh token in Redis                  │ │
│ │ - Return token pair                                 │ │
│ └─────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Redis                                                    │
│ - refresh_token:{hash} (token metadata)                 │
│ - family_tokens:{familyId} (family members)             │
│ - user_tokens:{userId} (user's tokens)                  │
└─────────────────────────────────────────────────────────┘
```

**Services Involved:**
- `tokenRotation.service.ts` - Token lifecycle management
- `jwt.service.ts` - JWT generation
- `redis.service.ts` - Redis operations

**Performance Characteristics:**
- Average response time: 20-50ms
- p95 response time: 80ms
- p99 response time: 150ms
- Throughput: > 2000 req/s

### Why This Deviates from SPEC

**SPEC-AU-RF-005:** "Backend DEVE repassar ao Backbone"

**Current Reality:** Backend implements refresh logic directly

**Reasons for Deviation:**
1. **Performance:** Direct Redis access avoids HTTP round-trip to n8n (~30-100ms saved)
2. **Simplicity:** Token operations are pure crypto, no business logic
3. **Reliability:** Fewer failure points (no n8n dependency for session continuity)
4. **Development Speed:** Faster to implement in Backend during prototyping

---

## Target State (SPEC-Compliant)

### Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Frontend                                                 │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/1/auth/refresh
                     │ { refresh_token: "..." }
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Express) - PROXY ONLY                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ auth.routes.ts                                      │ │
│ │ - Validate input format (presence, type)            │ │
│ │ - Forward to n8n via n8nProxyService                │ │
│ │ - Return n8n response to frontend                   │ │
│ └─────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │ POST https://n8n.example.com/webhook/auth-refresh
                     │ { refresh_token: "..." }
                     │ Headers: X-Platform-Key, X-Request-ID
                     ↓
┌─────────────────────────────────────────────────────────┐
│ n8n Workflow (Backbone)                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ auth-refresh.json                                   │ │
│ │ 1. Validate platform key                            │ │
│ │ 2. Validate refresh token                           │ │
│ │ 3. Detect reuse, revoke family if needed            │ │
│ │ 4. Generate new access + refresh tokens             │ │
│ │ 5. Store new refresh token in Redis                 │ │
│ │ 6. Return token pair                                │ │
│ └─────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Redis                                                    │
│ - refresh_token:{hash} (token metadata)                 │
│ - family_tokens:{familyId} (family members)             │
│ - user_tokens:{userId} (user's tokens)                  │
└─────────────────────────────────────────────────────────┘
```

### Required n8n Workflow

**File:** `workflows/auth/auth-refresh.json`

**Nodes Required:**
1. **Webhook Trigger** - Receive refresh request
2. **Platform Key Validation** - Verify X-Platform-Key header
3. **Input Validation** - Validate refresh_token presence and format
4. **Redis Get** - Retrieve token metadata
5. **Token Validation** - Check expiry, revocation, reuse
6. **Reuse Detection Branch** - If consumed_at exists
7. **Revoke Family** - Get family members from Redis, revoke all
8. **Generate Access Token** - JWT sign with user payload
9. **Generate Refresh Token** - Crypto random bytes
10. **Mark Old Token Consumed** - Update Redis with consumed_at
11. **Store New Token** - Save new refresh token to Redis
12. **Success Response** - Return token pair
13. **Error Response** - Return appropriate error codes

**Expected Response Time:** 50-150ms (includes network overhead)

---

## Migration Strategy

### Phase 1: Preparation (No Breaking Changes)

**Duration:** 1-2 weeks
**Goal:** Create n8n workflow and test in isolation

**Tasks:**

1. **Create n8n Workflow** (workflows/auth/auth-refresh.json)
   - [ ] Import current Backend logic to n8n nodes
   - [ ] Implement all SPEC-AU-RF-* requirements
   - [ ] Add platform key validation
   - [ ] Configure Redis connection in n8n
   - [ ] Add comprehensive error handling
   - [ ] Add logging and monitoring nodes

2. **Create n8nProxyService Method**
   ```typescript
   // File: src/prototype-2/backend/src/services/n8nProxy.service.ts

   async refresh(refreshToken: string): Promise<RefreshResponse> {
     const response = await this.post('/webhook/auth-refresh', {
       refresh_token: refreshToken,
     });

     return response.data;
   }
   ```

3. **Add Feature Flag**
   ```typescript
   // File: src/prototype-2/backend/src/config/env.ts

   export const config = {
     // ...existing config
     features: {
       useN8nRefresh: process.env.USE_N8N_REFRESH === 'true',
     },
   };
   ```

4. **Test n8n Workflow**
   - [ ] Deploy to staging environment
   - [ ] Test all success scenarios
   - [ ] Test all error scenarios
   - [ ] Test reuse detection and family revocation
   - [ ] Load test (target: 1000 req/s)
   - [ ] Verify response time (target: < 150ms p95)

**Exit Criteria:**
- ✅ n8n workflow deployed to staging
- ✅ All test cases pass
- ✅ Performance meets targets
- ✅ Feature flag infrastructure ready

---

### Phase 2: Gradual Rollout

**Duration:** 2-4 weeks
**Goal:** Progressively shift traffic to n8n

**Implementation:**

```typescript
// File: src/prototype-2/backend/src/routes/auth.routes.ts

router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ... input validation (same as current)

      // Feature flag: Use n8n or Backend implementation
      if (config.features.useN8nRefresh) {
        // NEW: Proxy to n8n
        try {
          const result = await n8nProxyService.refresh(refreshToken);
          res.status(200).json(result);
          return;
        } catch (error) {
          // Log n8n error and fallback to Backend
          console.error('⚠️ n8n refresh failed, using Backend fallback:', error);
          // Continue to Backend implementation below
        }
      }

      // EXISTING: Backend implementation
      // ... (current logic)
    } catch (error) {
      next(error);
    }
  }
);
```

**Rollout Schedule:**

| Week | Percentage | Environment | Monitoring Focus |
|------|------------|-------------|------------------|
| 1 | 0% | Production | Baseline metrics |
| 2 | 1% | Production | Error rate, response time |
| 3 | 5% | Production | Throughput, reuse detection |
| 4 | 10% | Production | End-to-end user experience |
| 5 | 25% | Production | Peak load handling |
| 6 | 50% | Production | Stability over 1 week |
| 7 | 75% | Production | Final validation |
| 8 | 100% | Production | Full migration complete |

**Monitoring Metrics:**

1. **Response Time**
   - Metric: `auth_refresh_response_time_ms`
   - Threshold: p95 < 150ms
   - Alert: p95 > 200ms

2. **Error Rate**
   - Metric: `auth_refresh_error_rate`
   - Threshold: < 0.1%
   - Alert: > 0.5%

3. **n8n Availability**
   - Metric: `n8n_refresh_success_rate`
   - Threshold: > 99.9%
   - Alert: < 99.5%

4. **Fallback Rate**
   - Metric: `auth_refresh_fallback_rate`
   - Threshold: < 0.01%
   - Alert: > 0.1%

**Rollout Controls:**

```bash
# Increase to 1%
curl -X POST http://backend/api/internal/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"flag": "useN8nRefresh", "percentage": 1}'

# Emergency rollback to 0%
curl -X POST http://backend/api/internal/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"flag": "useN8nRefresh", "percentage": 0}'
```

**Exit Criteria:**
- ✅ 100% traffic on n8n for 1 week
- ✅ Error rate < 0.1%
- ✅ p95 response time < 150ms
- ✅ No fallbacks in last 48 hours

---

### Phase 3: Cleanup

**Duration:** 1 week
**Goal:** Remove Backend implementation and feature flag

**Tasks:**

1. **Remove Backend Refresh Logic**
   ```typescript
   // File: src/prototype-2/backend/src/routes/auth.routes.ts

   router.post(
     '/refresh',
     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
       try {
         // Validate input
         const refreshToken = req.body.refresh_token || req.cookies?.refresh_token;

         if (!refreshToken) {
           res.status(401).json({
             code: 'missing_token',
             message: 'Refresh token is required',
           });
           return;
         }

         if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
           res.status(401).json({
             code: 'invalid_token_format',
             message: 'Refresh token must be a non-empty string',
           });
           return;
         }

         // Proxy to n8n
         const result = await n8nProxyService.refresh(refreshToken);
         res.status(200).json(result);
       } catch (error) {
         next(error);
       }
     }
   );
   ```

2. **Update tokenRotationService**
   - [ ] Keep `revokeToken()` for logout
   - [ ] Keep `revokeAllUserTokens()` for logout-all
   - [ ] Keep `revokeTokenFamily()` for security events
   - [ ] Remove `validateRefreshToken()` (now in n8n)
   - [ ] Remove `markTokenConsumed()` (now in n8n)
   - [ ] Remove `storeRefreshToken()` (now in n8n)
   - [ ] Remove `generateRefreshToken()` (now in n8n)

3. **Remove Feature Flag**
   - [ ] Remove `USE_N8N_REFRESH` from .env
   - [ ] Remove `config.features.useN8nRefresh`
   - [ ] Remove feature flag API endpoint

4. **Update Documentation**
   - [ ] Update SPEC compliance report (100% compliance)
   - [ ] Update architecture diagrams
   - [ ] Remove this migration plan (mark as completed)
   - [ ] Add migration completion notes to CHANGELOG

**Exit Criteria:**
- ✅ Backend code simplified (proxy only)
- ✅ tokenRotationService refactored
- ✅ Feature flag removed
- ✅ Documentation updated
- ✅ SPEC-AU-RF-005 compliance achieved

---

## Rollback Plan

### Trigger Conditions

Rollback if ANY of these occur:

1. **Error Rate Spike:** > 1% error rate sustained for 5 minutes
2. **Performance Degradation:** p95 > 300ms sustained for 10 minutes
3. **n8n Unavailability:** n8n unreachable for > 2 minutes
4. **Data Integrity Issues:** Token family revocation failures
5. **Security Incidents:** Reuse detection not working

### Rollback Procedure

**Immediate Rollback (< 2 minutes):**

```bash
# Step 1: Set feature flag to 0% (instant rollback)
curl -X POST http://backend/api/internal/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"flag": "useN8nRefresh", "percentage": 0}'

# Step 2: Verify rollback
curl http://backend/api/internal/feature-flags/useN8nRefresh \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: { "flag": "useN8nRefresh", "percentage": 0 }

# Step 3: Monitor recovery
# Watch auth_refresh_error_rate metric for 5 minutes
# Should drop to baseline < 0.1%
```

**Post-Rollback Actions:**

1. **Investigate Root Cause**
   - [ ] Check n8n logs for errors
   - [ ] Check Redis connectivity from n8n
   - [ ] Check platform key validation
   - [ ] Check workflow configuration

2. **Fix Issues**
   - [ ] Update n8n workflow if needed
   - [ ] Adjust timeout configurations
   - [ ] Fix Redis connection issues
   - [ ] Optimize workflow performance

3. **Re-test in Staging**
   - [ ] Verify fixes work in staging
   - [ ] Run load tests again
   - [ ] Confirm error rate < 0.1%
   - [ ] Confirm response time meets targets

4. **Retry Rollout**
   - [ ] Start again at 1%
   - [ ] Monitor more closely
   - [ ] Increase percentage slower if needed

---

## Risk Assessment

### High Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| n8n unavailability during migration | Medium | High | Feature flag with Backend fallback |
| Performance degradation | Medium | Medium | Load testing before rollout, gradual rollout |
| Token family revocation failure | Low | Critical | Extensive testing, immediate rollback triggers |
| Data loss during migration | Very Low | Critical | No data migration - both use same Redis |

### Medium Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Increased response time | High | Medium | Performance monitoring, rollback if > 200ms p95 |
| Error rate spike during rollout | Low | Medium | Gradual rollout, automatic rollback |
| Feature flag bugs | Low | Medium | Simple boolean flag, tested in staging |

### Low Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Documentation drift | Medium | Low | Update docs as part of each phase |
| Monitoring gaps | Low | Low | Set up all metrics before Phase 2 |

---

## Success Criteria

### Technical Success

- ✅ 100% SPEC-AU-RF-005 compliance
- ✅ p95 response time < 150ms
- ✅ Error rate < 0.1%
- ✅ n8n workflow handles 1000+ req/s
- ✅ All security features working (reuse detection, family revocation)

### Operational Success

- ✅ Zero downtime during migration
- ✅ No user-facing errors
- ✅ Backend code simplified (proxy only)
- ✅ Monitoring and alerting in place

### Business Success

- ✅ Session continuity maintained
- ✅ User experience unchanged or improved
- ✅ Architecture aligned with SPEC
- ✅ Foundation for future auth enhancements

---

## Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| Phase 1: Preparation | 1-2 weeks | n8n workflow ready |
| Phase 2: Rollout | 2-4 weeks | 100% traffic on n8n |
| Phase 3: Cleanup | 1 week | Backend simplified |
| **TOTAL** | **4-7 weeks** | **SPEC compliance achieved** |

---

## Appendix A: n8n Workflow Specification

### Workflow Name
`auth-refresh`

### Webhook URL
`POST https://n8n.example.com/webhook/auth-refresh`

### Request Format
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response Format (Success)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "c3VwZXJzZWNyZXR0b2tlbmhlcmU...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### Response Format (Error)
```json
{
  "code": "token_reused",
  "message": "Refresh token has been reused. All sessions have been revoked for security."
}
```

### Required Headers
- `X-Platform-Key: <platform-key>` - Platform authentication
- `X-Request-ID: <uuid>` - Request tracing

### Error Codes
- `missing_token` - No refresh token provided
- `invalid_token_format` - Token is not a string
- `invalid_token` - Token not found in Redis
- `token_expired` - Token past expiration
- `token_revoked` - Token manually revoked
- `token_reused` - Token consumed previously (security breach)
- `internal_error` - Redis or internal error

---

## Appendix B: Performance Comparison

### Current Backend Implementation

| Metric | p50 | p95 | p99 | Max |
|--------|-----|-----|-----|-----|
| Response Time | 20ms | 80ms | 150ms | 300ms |
| Throughput | 2500 req/s | - | - | - |
| Error Rate | 0.01% | - | - | - |

### Target n8n Implementation

| Metric | p50 | p95 | p99 | Max |
|--------|-----|-----|-----|-----|
| Response Time | 50ms | 150ms | 250ms | 500ms |
| Throughput | 1500 req/s | - | - | - |
| Error Rate | < 0.1% | - | - | - |

**Expected Impact:**
- Response time increase: ~30-70ms (acceptable for SPEC compliance)
- Throughput decrease: ~40% (still sufficient for typical load)
- Error rate: Slightly higher (network hop added)

**User Impact:** Minimal - 50-70ms difference is imperceptible to users

---

## Document Control

**Version:** 1.0
**Created:** 2025-11-05
**Author:** Task 1.3.2 Implementation
**Status:** Draft - Pending approval
**Next Review:** Before Phase 1 start

**Approval Required From:**
- [ ] Technical Lead
- [ ] Security Team
- [ ] Operations Team

**Related Documents:**
- `docs/auth-refresh-spec-compliance.md` - Current compliance status
- `spec/SPEC-authentication.md` - Source of truth for requirements
- `workflows/auth/auth-refresh.json` - Target n8n workflow (to be created)
