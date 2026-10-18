def test_health_endpoint(client):
    response = client.get('/')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'TalentFit Backend'

def test_test_endpoint(client):
    response = client.get('/test')
    assert response.status_code == 200
    assert response.get_json()['message'] == 'Test successful!'

def test_analyze_without_jd(client):
    response = client.post('/analyze')
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_settings_without_auth(client):
    response = client.get('/settings')
    assert response.status_code == 401
