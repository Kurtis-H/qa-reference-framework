// k6 performance smoke test: a short, light load that fails the build if the API slows down.
// Run: k6 run perf/smoke.js            (defaults to the secure instance)
//      BASE_URL=http://localhost:8000 k6 run perf/smoke.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8001';

export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      stages: [
        { duration: '10s', target: 10 }, // ramp up to 10 virtual users
        { duration: '20s', target: 10 }, // hold
        { duration: '5s', target: 0 }, // ramp down
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // under 1% errors
    'http_req_duration{name:search}': ['p(95)<300'], // 95% of searches under 300ms
    'http_req_duration{name:order}': ['p(95)<300'],
    checks: ['rate>0.99'],
  },
};

export function setup() {
  const res = http.post(`${BASE_URL}/api/login`, JSON.stringify({ username: 'alice', password: 'alice123' }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'login ok': (r) => r.status === 200 });
  return { token: res.json('token') };
}

export default function (data) {
  group('browse products', () => {
    const res = http.get(`${BASE_URL}/api/products?q=key`, { tags: { name: 'search' } });
    check(res, {
      'search 200': (r) => r.status === 200,
      'search has results': (r) => r.json().length > 0,
    });
  });

  group('view own order', () => {
    const res = http.get(`${BASE_URL}/api/orders/1`, {
      headers: { Authorization: `Bearer ${data.token}` },
      tags: { name: 'order' },
    });
    check(res, { 'order 200': (r) => r.status === 200 });
  });

  sleep(1);
}

export function handleSummary(data) {
  return { 'reports/k6-summary.json': JSON.stringify(data, null, 2), stdout: textSummary(data) };
}

function textSummary(data) {
  const m = data.metrics;
  const p95 = (name) => m[name]?.values?.['p(95)']?.toFixed(1) ?? 'n/a';
  return [
    '',
    `requests:      ${m.http_reqs.values.count}`,
    `error rate:    ${(m.http_req_failed.values.rate * 100).toFixed(2)}%`,
    `search p95:    ${p95('http_req_duration{name:search}')} ms`,
    `order p95:     ${p95('http_req_duration{name:order}')} ms`,
    '',
  ].join('\n');
}
