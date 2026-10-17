"""
API для получения данных о чип-тюнинге BMW из базы данных + Prerendering для SEO ботов
"""
import json
import hmac
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import base64
import requests
from datetime import datetime
from prerender_html import get_seo_html

def get_cors_headers(origin=None):
    """Возвращает стандартные CORS заголовки"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET').upper()
    headers = {str(key).lower(): value for key, value in (event.get('headers') or {}).items()}
    origin = headers.get('origin') or headers.get('Origin')
    
    # === PRERENDERING ДЛЯ SEO БОТОВ ===
    user_agent = headers.get('user-agent', '').lower()
    bot_keywords = ['yandex', 'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 
                    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp']
    is_bot = any(keyword in user_agent for keyword in bot_keywords)
    
    # Если бот запрашивает корень (без action параметра) — отдаём HTML
    params = event.get('queryStringParameters') or {}
    if is_bot and method == 'GET' and not params.get('action') and not params.get('admin'):
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
                'X-Robots-Tag': 'index, follow'
            },
            'body': get_seo_html(),
            'isBase64Encoded': False
        }
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(origin),
            'body': '',
            'isBase64Encoded': False
        }
    
    # Получаем параметры запроса
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
    # Enforce access before any database or GitHub operation. Only ask_ai is a public POST.
    body = {}
    if method == 'POST':
        try:
            raw_body = event.get('body') or '{}'
            if event.get('isBase64Encoded'):
                raw_body = base64.b64decode(raw_body, validate=True).decode('utf-8')
            body = json.loads(raw_body)
            if not isinstance(body, dict):
                raise ValueError('Expected object')
        except (ValueError, TypeError, UnicodeError):
            return {'statusCode': 400, 'headers': get_cors_headers(origin),
                    'body': json.dumps({'error': 'Invalid JSON body'}), 'isBase64Encoded': False}

    protected = (params.get('admin') == '1'
                 or action in ('analytics_overview', 'analytics_errors')
                 or (method == 'POST' and action != 'ask_ai'))
    # An administrative body cannot be disguised with ?action=ask_ai.
    protected = protected or body.get('action') in ('update', 'add', 'delete', 'sync_csv')
    if protected:
        expected = os.environ.get('ADMIN_API_TOKEN', '')
        if len(expected) < 32:
            return {'statusCode': 503, 'headers': get_cors_headers(origin),
                    'body': json.dumps({'error': 'Admin access is not configured'}), 'isBase64Encoded': False}
        authorization = str(headers.get('authorization') or '').split()
        supplied = authorization[1] if len(authorization) == 2 and authorization[0].lower() == 'bearer' else ''
        if not hmac.compare_digest(supplied.encode('utf-8'), expected.encode('utf-8')):
            return {'statusCode': 401, 'headers': get_cors_headers(origin),
                    'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}

    try:
        # Подключение к БД
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # === ANALYTICS HANDLING ===
        if action == 'analytics_overview':
            # Общая статистика для админки
            stats = {}
            
            # Всего визитов за последние 30 дней
            cursor.execute("""
                SELECT COUNT(*) as total_visits
                FROM site_visits
                WHERE created_at >= NOW() - INTERVAL '30 days'
            """)
            result = cursor.fetchone()
            stats['total_visits_30d'] = result['total_visits'] if result else 0
            
            # Визиты за сегодня
            cursor.execute("""
                SELECT COUNT(*) as today_visits
                FROM site_visits
                WHERE created_at >= CURRENT_DATE
            """)
            result = cursor.fetchone()
            stats['today_visits'] = result['today_visits'] if result else 0
            
            # Популярные коды ошибок (топ-10)
            cursor.execute("""
                SELECT code, title, search_count, category, severity
                FROM error_codes
                ORDER BY search_count DESC
                LIMIT 10
            """)
            stats['popular_errors'] = [dict(row) for row in cursor.fetchall()]
            
            # Поиски кодов за последние 7 дней
            cursor.execute("""
                SELECT COUNT(*) as total_searches
                FROM error_code_searches
                WHERE created_at >= NOW() - INTERVAL '7 days'
            """)
            result = cursor.fetchone()
            stats['error_searches_7d'] = result['total_searches'] if result else 0
            
            # График визитов за последние 14 дней
            cursor.execute("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as visits
                FROM site_visits
                WHERE created_at >= NOW() - INTERVAL '14 days'
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            """)
            visits_data = cursor.fetchall()
            stats['visits_chart'] = [
                {'date': row['date'].isoformat(), 'visits': row['visits']}
                for row in visits_data
            ]
            
            # Разбивка по устройствам за последние 30 дней
            cursor.execute("""
                SELECT 
                    device_type,
                    COUNT(*) as count
                FROM site_visits
                WHERE created_at >= NOW() - INTERVAL '30 days'
                  AND device_type IS NOT NULL
                GROUP BY device_type
            """)
            stats['devices'] = [dict(row) for row in cursor.fetchall()]
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': get_cors_headers(origin),
                'body': json.dumps(stats, ensure_ascii=False, default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'analytics_errors':
            # Детальная статистика по кодам ошибок
            cursor.execute("""
                SELECT 
                    code,
                    title,
                    category,
                    severity,
                    search_count
                FROM error_codes
                WHERE search_count > 0
                ORDER BY search_count DESC
                LIMIT 100
            """)
            errors = [dict(row) for row in cursor.fetchall()]
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'errors': errors}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # === ERROR CODES HANDLING ===
        if action == 'get_popular_errors':
            cursor.execute("""
                SELECT id, code, title, description, severity, category, search_count
                FROM error_codes
                ORDER BY search_count DESC, id
                LIMIT 20
            """)
            errors = cursor.fetchall()
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': get_cors_headers(origin),
                'body': json.dumps([dict(e) for e in errors], ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif action == 'get_error':
            code = params.get('code', '').upper()
            if not code:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(origin),
                    'body': json.dumps({'error': 'Code required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                SELECT id, code, title, description, severity, common_causes, 
                       symptoms, solutions, related_systems, category
                FROM error_codes
                WHERE UPPER(code) = %s
            """, (code,))
            error = cursor.fetchone()
            
            # Log search
            user_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
            user_agent = headers.get('user-agent', '')
            cursor.execute("""
                INSERT INTO error_code_searches (code, found, user_ip, user_agent)
                VALUES (%s, %s, %s, %s)
            """, (code, error is not None, user_ip, user_agent))
            
            if error:
                cursor.execute("UPDATE error_codes SET search_count = search_count + 1 WHERE id = %s", (error['id'],))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            if error:
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(origin),
                    'body': json.dumps({'found': True, 'error': dict(error)}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(origin),
                    'body': json.dumps({'found': False}),
                    'isBase64Encoded': False
                }
        
        elif action == 'ask_ai' and method == 'POST':
            question = body.get('question', '').lower()
            code = body.get('code', '')
            
            # Simple fallback responses
            fallback_answers = {
                'можно': f"При ошибке {code} рекомендуется обратиться в сервис для диагностики. Продолжать движение можно только в крайнем случае.",
                'сколько': "Стоимость ремонта определяется после диагностики. Запишитесь на проверку — специалисты назовут точную цену.",
                'срочно': "Рекомендуем не откладывать визит в сервис, чтобы избежать более серьёзных последствий."
            }
            
            answer = next((v for k, v in fallback_answers.items() if k in question), 
                         f"Для точного ответа необходима диагностика. Запишитесь в наш сервис для полной проверки BMW.")
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'answer': answer}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # === CHIPTUNING DATA ===
        # Админка - GET запрос с admin=1
        if method == 'GET' and (params.get('admin') == '1' or action == 'variants'):
            query = """
                SELECT 
                    id,
                    model_name,
                    series,
                    body_type,
                    engine_code,
                    article_code,
                    stock_power,
                    stock_torque,
                    stage1_power,
                    stage1_torque,
                    stage1_price,
                    stage2_power,
                    stage2_torque,
                    stage2_price,
                    stage_type,
                    is_restyling,
                    status,
                    show_stage2,
                    firmware_type
                FROM t_p937713_bmw_coding_site.bmw_chiptuning
                ORDER BY id
            """
            if action == 'variants' and params.get('admin') != '1':
                query = query.replace('ORDER BY id', "WHERE status = '1' ORDER BY id")
            cursor.execute(query)
            records = cursor.fetchall()

            result = []
            for r in records:
                result.append({
                    'id': r['id'],
                    'model_name': r['model_name'],
                    'series': r['series'],
                    'body_type': r['body_type'],
                    'engine_code': r['engine_code'],
                    'article_code': r['article_code'],
                    'stock': {
                        'power': r['stock_power'],
                        'torque': r['stock_torque']
                    },
                    'stage1': {
                        'power': r['stage1_power'],
                        'torque': r['stage1_torque'],
                        'price': r['stage1_price']
                    },
                    'stage2': {
                        'power': r['stage2_power'],
                        'torque': r['stage2_torque'],
                        'price': r['stage2_price']
                    } if r['stage2_power'] and r['stage2_torque'] else None,
                    'stage_type': r['stage_type'],
                    'is_restyling': r['is_restyling'],
                    'status': r['status'],
                    'show_stage2': r['show_stage2'],
                    'firmware_type': r['firmware_type'] or '30I'
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': get_cors_headers(origin),
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # POST запросы для админки
        if method == 'POST':
            action = body.get('action')
            
            if action == 'update':
                record_id = body.get('id')
                data = body.get('data')
                
                query = """
                    UPDATE t_p937713_bmw_coding_site.bmw_chiptuning
                    SET 
                        model_name = %s,
                        series = %s,
                        body_type = %s,
                        engine_code = %s,
                        article_code = %s,
                        stock_power = %s,
                        stock_torque = %s,
                        stage1_power = %s,
                        stage1_torque = %s,
                        stage1_price = %s,
                        stage2_power = %s,
                        stage2_torque = %s,
                        stage2_price = %s,
                        stage_type = %s,
                        is_restyling = %s,
                        status = %s,
                        show_stage2 = %s,
                        firmware_type = %s
                    WHERE id = %s
                """
                cursor.execute(query, (
                    data['model_name'],
                    data['series'],
                    data['body_type'],
                    data['engine_code'],
                    data['article_code'],
                    data['stock_power'],
                    data['stock_torque'],
                    data['stage1_power'],
                    data['stage1_torque'],
                    data['stage1_price'],
                    data['stage2_power'],
                    data['stage2_torque'],
                    data.get('stage2_price'),
                    data['stage_type'],
                    data['is_restyling'],
                    data['status'],
                    data['show_stage2'],
                    data.get('firmware_type', '30I'),
                    record_id
                ))
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(origin),
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add':
                data = body.get('data')
                
                query = """
                    INSERT INTO t_p937713_bmw_coding_site.bmw_chiptuning
                    (model_name, series, body_type, engine_code, article_code,
                     stock_power, stock_torque, stage1_power, stage1_torque, stage1_price,
                     stage2_power, stage2_torque, stage2_price, stage_type, is_restyling, status, show_stage2, firmware_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """
                cursor.execute(query, (
                    data['model_name'],
                    data['series'],
                    data['body_type'],
                    data['engine_code'],
                    data['article_code'],
                    data['stock_power'],
                    data['stock_torque'],
                    data['stage1_power'],
                    data['stage1_torque'],
                    data['stage1_price'],
                    data.get('stage2_power'),
                    data.get('stage2_torque'),
                    data.get('stage2_price'),
                    data.get('stage_type', 'St.1'),
                    data.get('is_restyling', False),
                    data.get('status', '1'),
                    data.get('show_stage2', False),
                    data.get('firmware_type', '30I')
                ))
                new_id = cursor.fetchone()[0]
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(origin),
                    'body': json.dumps({'success': True, 'id': new_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'delete':
                record_id = body.get('id')
                query = "DELETE FROM t_p937713_bmw_coding_site.bmw_chiptuning WHERE id = %s"
                cursor.execute(query, (record_id,))
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(origin),
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'sync_csv':
                # Экспорт всех данных в CSV
                query = """
                    SELECT 
                        model_name, series, body_type, engine_code, article_code,
                        stock_power, stock_torque,
                        stage1_power, stage1_torque, stage1_price,
                        stage2_power, stage2_torque,
                        stage_type, is_restyling, status
                    FROM t_p937713_bmw_coding_site.bmw_chiptuning
                    ORDER BY id
                """
                cursor.execute(query)
                records = cursor.fetchall()
                cursor.close()
                conn.close()
                
                # Формируем CSV
                csv_lines = ['model_name,series,body_type,engine_code,article_code,stock_power,stock_torque,stage1_power,stage1_torque,stage1_price,stage2_power,stage2_torque,stage_type,is_restyling,status']
                for r in records:
                    csv_lines.append(f"{r['model_name']},{r['series']},{r['body_type']},{r['engine_code']},{r['article_code']},{r['stock_power']},{r['stock_torque']},{r['stage1_power']},{r['stage1_torque']},{r['stage1_price']},{r['stage2_power'] or ''},{r['stage2_torque'] or ''},{r['stage_type']},{int(r['is_restyling'])},{r['status']}")
                
                csv_content = '\n'.join(csv_lines)
                
                # Отправка в GitHub
                github_token = os.environ.get('GITHUB_TOKEN')
                if not github_token:
                    return {
                        'statusCode': 200,
                        'headers': get_cors_headers(origin),
                        'body': json.dumps({'updated': len(records), 'added': 0, 'message': 'CSV created but GITHUB_TOKEN not configured'}),
                        'isBase64Encoded': False
                    }
                
                # GitHub API
                repo_owner = os.environ.get('GITHUB_REPO_OWNER', 'Scorboc')
                repo_name = os.environ.get('GITHUB_REPO_NAME', 'bmw-coding-site')
                file_path = 'data/chiptuning.csv'
                
                # Получаем SHA файла (если существует)
                get_url = f'https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{file_path}'
                headers = {
                    'Authorization': f'token {github_token}',
                    'Accept': 'application/vnd.github.v3+json'
                }
                
                sha = None
                try:
                    get_response = requests.get(get_url, headers=headers)
                    if get_response.status_code == 200:
                        sha = get_response.json()['sha']
                except:
                    pass
                
                # Создаём/обновляем файл
                content_base64 = base64.b64encode(csv_content.encode()).decode()
                commit_data = {
                    'message': f'Auto-sync chiptuning data - {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
                    'content': content_base64,
                    'branch': 'main'
                }
                
                if sha:
                    commit_data['sha'] = sha
                
                try:
                    put_response = requests.put(get_url, headers=headers, json=commit_data)
                    if put_response.status_code in [200, 201]:
                        return {
                            'statusCode': 200,
                            'headers': get_cors_headers(origin),
                            'body': json.dumps({'updated': len(records), 'added': 0, 'message': 'Successfully synced to GitHub'}),
                            'isBase64Encoded': False
                        }
                    else:
                        return {
                            'statusCode': 200,
                            'headers': get_cors_headers(origin),
                            'body': json.dumps({'updated': 0, 'added': 0, 'message': f'GitHub sync failed: {put_response.status_code}'}),
                            'isBase64Encoded': False
                        }
                except Exception as e:
                    return {
                        'statusCode': 200,
                        'headers': get_cors_headers(origin),
                        'body': json.dumps({'updated': 0, 'added': 0, 'message': f'GitHub sync error: {str(e)}'}),
                        'isBase64Encoded': False
                    }
        
        # Обычные GET запросы
        action = params.get('action', 'list')
        series = params.get('series', '')
        body_type = params.get('body_type', '')
        
        # Нормализуем название серии: уже приходит в правильном формате из фронтенда
        series_normalized = series
        
        if action == 'bodies':
            # Получить список кузовов для серии
            query = """
                SELECT DISTINCT body_type
                FROM t_p937713_bmw_coding_site.bmw_chiptuning
                WHERE series = %s AND status = '1'
                ORDER BY body_type
            """
            cursor.execute(query, (series_normalized,))
            records = cursor.fetchall()
            result = [r['body_type'] for r in records]
            
        elif action == 'engines':
            # Получить список двигателей для серии и кузова
            query = """
                SELECT 
                    model_name,
                    series,
                    body_type,
                    engine_code,
                    stock_power,
                    stock_torque,
                    stage1_power,
                    stage1_torque,
                    stage1_price,
                    stage2_power,
                    stage2_torque,
                    stage2_price,
                    stage_type,
                    show_stage2
                FROM t_p937713_bmw_coding_site.bmw_chiptuning
                WHERE series = %s AND body_type = %s AND status = '1'
                ORDER BY stock_power ASC
            """
            cursor.execute(query, (series_normalized, body_type))
            records = cursor.fetchall()
            
            result = []
            for record in records:
                result.append({
                    'model_name': record['model_name'],
                    'series': record['series'],
                    'body_type': record['body_type'],
                    'engine_code': record['engine_code'],
                    'stock': {
                        'power': record['stock_power'],
                        'torque': record['stock_torque']
                    },
                    'stage1': {
                        'power': record['stage1_power'],
                        'torque': record['stage1_torque'],
                        'price': record['stage1_price']
                    },
                    'stage2': {
                        'power': record['stage2_power'],
                        'torque': record['stage2_torque'],
                        'price': record['stage2_price']
                    } if record['stage2_power'] and record['stage2_torque'] and record['show_stage2'] and record['stage2_price'] is not None else None,
                    'stage_type': record['stage_type']
                })
        else:
            # Список всех серий
            query = """
                SELECT DISTINCT series
                FROM t_p937713_bmw_coding_site.bmw_chiptuning
                WHERE status = '1'
                ORDER BY series
            """
            cursor.execute(query)
            records = cursor.fetchall()
            result = [r['series'] for r in records]
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(origin),
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
