"""Isolated regression tests: no real database, provider, or GitHub calls."""
import base64
import importlib.util
import json
import os
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import MagicMock, patch

db = types.ModuleType('psycopg2')
db.connect = MagicMock()
extras = types.ModuleType('psycopg2.extras')
extras.RealDictCursor = object
http = types.ModuleType('requests')
http.post = MagicMock()
http.get = MagicMock()
http.put = MagicMock()
seo = types.ModuleType('prerender_html')
seo.get_seo_html = lambda: '<html>public</html>'
with patch.dict(sys.modules, {'psycopg2': db, 'psycopg2.extras': extras, 'requests': http, 'prerender_html': seo}):
    spec = importlib.util.spec_from_file_location('tested_handler', Path(__file__).with_name('index.py'))
    api = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(api)

TOKEN = 'test-only-' + 'x' * 40

def event(method='GET', params=None, body=None, headers=None):
    return {'httpMethod': method, 'queryStringParameters': params, 'headers': headers,
            'body': json.dumps(body) if body is not None else None}

class AuthBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'ADMIN_API_TOKEN': TOKEN, 'DATABASE_URL': 'test-only'})
        self.env.start()
        self.addCleanup(self.env.stop)
        db.connect.reset_mock()
        self.cursor = MagicMock()
        self.cursor.fetchall.return_value = []
        self.connection = MagicMock()
        self.connection.cursor.return_value = self.cursor
        db.connect.return_value = self.connection
        http.put.reset_mock()

    def assert_denied(self, request, status=401):
        result = api.handler(request, None)
        self.assertEqual(result['statusCode'], status)
        self.assertFalse(result['isBase64Encoded'])
        self.assertEqual(result['headers']['Content-Type'], 'application/json')
        db.connect.assert_not_called()
        http.put.assert_not_called()

    def test_all_admin_operations_rejected_before_io(self):
        for action in ['update', 'add', 'delete', 'sync_csv', 'unknown']:
            with self.subTest(action=action):
                self.assert_denied(event('POST', body={'action': action, 'id': 1}))
        for params in [{'admin': '1'}, {'action': 'analytics_overview'}, {'action': 'analytics_errors'}]:
            self.assert_denied(event(params=params, headers={'User-Agent': 'Googlebot'}))

    def test_query_body_collision_and_base64_do_not_bypass_gate(self):
        self.assert_denied(event('POST', {'action': 'ask_ai'}, {'action': 'delete'}))
        request = event('POST', body={})
        request['body'] = base64.b64encode(b'{"action":"sync_csv"}').decode()
        request['isBase64Encoded'] = True
        self.assert_denied(request)

    def test_missing_or_short_server_secret_fails_closed(self):
        for token in ['', 'short']:
            with patch.dict(os.environ, {'ADMIN_API_TOKEN': token}):
                self.assert_denied(event(params={'admin': '1'}), 503)

    def test_bad_credentials_and_header_shapes(self):
        for value in ['', 'Bearer wrong', f'Basic {TOKEN}', f'Bearer {TOKEN} extra']:
            self.assert_denied(event(params={'admin': '1'}, headers={'AUTHORIZATION': value}))

    def test_legitimate_admin_read_and_mutation(self):
        headers = {'AUTHORIZATION': f'bEaReR {TOKEN}'}
        result = api.handler(event(params={'admin': '1'}, headers=headers), None)
        self.assertEqual(result['statusCode'], 200)
        self.assertEqual(json.loads(result['body']), [])
        db.connect.reset_mock()
        result = api.handler(event('POST', body={'action': 'delete', 'id': 4}, headers=headers), None)
        self.assertEqual(result['statusCode'], 200)
        self.connection.commit.assert_called_once()
        self.cursor.execute.assert_called_with('DELETE FROM t_p937713_bmw_coding_site.bmw_chiptuning WHERE id = %s', (4,))

    def test_public_variants_only_select_published_records(self):
        result = api.handler(event(params={'action': 'variants'}), None)
        self.assertEqual(result['statusCode'], 200)
        self.assertIn("WHERE status = '1'", self.cursor.execute.call_args.args[0])
        self.assertIn('stage2_price', self.cursor.execute.call_args.args[0])

    def test_public_lookup_and_consultation_remain_anonymous(self):
        self.cursor.fetchone.return_value = None
        result = api.handler(event(params={'action': 'get_error', 'code': 'P0171'}), None)
        self.assertEqual(result['statusCode'], 200)
        self.assertEqual(json.loads(result['body']), {'found': False})
        for encoded in [False, True]:
            request = event('POST', {'action': 'ask_ai'}, {'question': 'Что делать?', 'code': 'P0171'})
            if encoded:
                request['body'] = base64.b64encode(request['body'].encode()).decode()
                request['isBase64Encoded'] = True
            result = api.handler(request, None)
            self.assertEqual(result['statusCode'], 200)
            self.assertIn('answer', json.loads(result['body']))

    def test_authorized_analytics_remains_available(self):
        self.cursor.fetchone.return_value = None
        request = event(params={'action': 'analytics_overview'}, headers={'authorization': f'Bearer {TOKEN}'})
        result = api.handler(request, None)
        self.assertEqual(result['statusCode'], 200)
        self.assertEqual(json.loads(result['body'])['today_visits'], 0)

    def test_options_preserves_preflight_without_auth(self):
        result = api.handler(event('OPTIONS', {'admin': '1'}), None)
        self.assertEqual(result['statusCode'], 200)
        db.connect.assert_not_called()

    def test_malformed_body_is_rejected_before_database(self):
        request = event('POST')
        request['body'] = '[]'
        self.assert_denied(request, 400)

if __name__ == '__main__':
    unittest.main()
