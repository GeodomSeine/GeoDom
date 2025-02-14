import pytest
from fastapi.testclient import TestClient
from main import app 

client = TestClient(app)

@pytest.mark.asyncio
async def test_get_amont_aval_valid():
    response = client.get("/amont_aval/dataviz_orgeval_carbone/7070/7087")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "id_hyd" in data
    assert "pk" in data
    assert isinstance(data["id_hyd"], list)
    assert isinstance(data["pk"], list)

@pytest.mark.asyncio
async def test_get_amont_aval_invalid_program():
    response = client.get("/amont_aval/invalid_program/1/2")
    assert response.status_code == 500
    # assert "Unable to fetch PKs" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_amont_aval_invalid_id_hyd():
    response = client.get("/amont_aval/dataviz_orgeval_carbone/999999/2")
    assert response.status_code == 500
    # assert "Unable to fetch PKs" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_amont_aval_no_data_found():
    response = client.get("/amont_aval/dataviz_orgeval_carbone/1/999999")
    assert response.status_code == 500
    # assert "Unable to fetch PKs" in response.json()["detail"]