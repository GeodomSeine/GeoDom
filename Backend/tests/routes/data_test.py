import pytest
from fastapi.testclient import TestClient
from main import app  # Assurez-vous que votre application FastAPI est importée correctement

client = TestClient(app)

# Corps de requête valide
valid_body = {
    "program": "dataviz_orgeval_carbone",
    "scenarios": [1, 2, 3],
    "variables": ["flow"],
    "pk": [
        {
            "code_bas": "1",
            "id_obj": 197,
            "strahler": 2,
            "pk": 3,
            "obj_ord_pk": "197_2_3",
            "ordered_pk": 1
        },
        {
            "code_bas": "1",
            "id_obj": 197,
            "strahler": 2,
            "pk": 4,
            "obj_ord_pk": "197_2_4",
            "ordered_pk": 2
        }
    ]
}

# Corps de requête invalide (manque des champs obligatoires)
invalid_body_missing_fields = {
    "program": "dataviz_orgeval_carbone",
    "scenarios": [1, 2, 3],
    # "variables" manquant
    "pk": [
        {
            "code_bas": "1",
            "id_obj": 197,
            "strahler": 2,
            "pk": 3,
            "obj_ord_pk": "197_2_3",
            "ordered_pk": 1
        }
    ]
}

# Corps de requête invalide (variable inexistante)
invalid_body_invalid_variable = {
    "program": "dataviz_orgeval_carbone",
    "scenarios": [1, 2, 3],
    "variables": ["invalid_variable"],
    "pk": [
        {
            "code_bas": "1",
            "id_obj": 197,
            "strahler": 2,
            "pk": 3,
            "obj_ord_pk": "197_2_3",
            "ordered_pk": 1
        }
    ]
}

# Corps de requête avec des scénarios qui ne retournent aucune donnée
no_data_body = {
    "program": "dataviz_orgeval_carbone",
    "scenarios": [2],  # Scénario inexistant
    "variables": ["flow"],
    "pk": [
        {
            "code_bas": "1",
            "id_obj": 197,
            "strahler": 2,
            "pk": 3,
            "obj_ord_pk": "197_2_3",
            "ordered_pk": 1
        }
    ]
}

def test_get_data_valid():
    response = client.post("/data", json=valid_body)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    # Vérifiez que les données sont correctement formatées
    for obj_ord_pk, value in data.items():
        assert "data" in value
        for entry in value["data"]:
            assert "decade" in entry
            assert "flow_p5" in entry
            assert "flow_p50" in entry
            assert "flow_p90" in entry

def test_get_data_missing_fields():
    response = client.post("/data", json=invalid_body_missing_fields)
    assert response.status_code == 400
    assert response.json()["detail"] == "Missing required fields: program, scenarios, variables, pk."

def test_get_data_invalid_variable():
    response = client.post("/data", json=invalid_body_invalid_variable)
    assert response.status_code == 400
    assert response.json()["detail"] == "Variable 'invalid_variable' does not exist in the table."

def test_get_data_no_data_found():
    response = client.post("/data", json=valid_body)
    assert response.status_code == 404
    assert "No data found" in response.json()["detail"]