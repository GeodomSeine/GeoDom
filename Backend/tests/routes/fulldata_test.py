import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Corps de requête normal
valid_body = {
   "program":"dataviz_orgeval_carbone",
   "scenarios":[
      1,
      2
   ],
   "variables":[
      "flow"
   ]
}
# Corps de requête avec des champs manquants
invalid_body_missing_fields = {
    "program": "dataviz_orgeval_carbone",
    "scenarios": [1, 2]
    # "variables" manquant
}

# Corps de requête avec une variable inexistante
invalid_body_invalid_variable = {
    "program": "dataviz_orgeval_carbone",
    "scenarios": [1, 2],
    "variables": ["invalid_variable"]
}

# Corps de requête avec des scénarios qui ne retournent aucune donnée
no_data_body = {
    "program": "dataviz_orgeval_carbone",
    "scenarios": [999],  # Scénario inexistant
    "variables": ["flow"]
}

@pytest.mark.asyncio
async def test_get_fulldata_valid():
    """
    Teste une requête valide avec un corps correct.
    """
    response = client.post("/fulldata", json=valid_body)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    # Vérifiez que les données sont correctement formatées
    for strahler, value in data.items():
        assert "data" in value
        for entry in value["data"]:
            assert "decade" in entry
            assert "flow_p5" in entry
            assert "flow_p50" in entry
            assert "flow_p90" in entry

@pytest.mark.asyncio
async def test_get_fulldata_missing_fields():
    """
    Teste une requête avec des champs manquants.
    """
    response = client.post("/fulldata", json=invalid_body_missing_fields)
    assert response.status_code == 400
    assert response.json()["detail"] == "Missing required fields: program, scenarios, variables."

@pytest.mark.asyncio
async def test_get_fulldata_invalid_variable():
    """
    Teste une requête avec une variable inexistante.
    """
    response = client.post("/fulldata", json=invalid_body_invalid_variable)
    assert response.status_code == 400
    assert response.json()["detail"] == "Variable 'invalid_variable' does not exist in the table."

@pytest.mark.asyncio
async def test_get_fulldata_no_data_found():
    """
    Teste une requête avec des scénarios qui ne retournent aucune donnée.
    """
    response = client.post("/fulldata", json=no_data_body)
    assert response.status_code == 404
    assert "No data found" in response.json()["detail"]