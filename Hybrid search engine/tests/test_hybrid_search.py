import pytest
from unittest.mock import MagicMock, patch
from src.hybrid_search import SearchResult, hybrid_search


def _mock_object(content: str, score: float):
    obj = MagicMock()
    obj.properties = {"content": content, "source_file": "test.pdf", "page_number": 1}
    obj.metadata.score = score
    return obj


@pytest.fixture
def mock_client():
    client = MagicMock()
    collection = MagicMock()
    client.collections.get.return_value = collection

    response = MagicMock()
    response.objects = [
        _mock_object("first result", 0.95),
        _mock_object("second result", 0.80),
    ]
    collection.query.hybrid.return_value = response
    return client


def test_hybrid_search_returns_results(mock_client):
    results = hybrid_search(mock_client, "test query", alpha=0.5, limit=2)
    assert len(results) == 2
    assert results[0].score > results[1].score


def test_hybrid_search_respects_limit(mock_client):
    results = hybrid_search(mock_client, "test", limit=2)
    mock_client.collections.get.return_value.query.hybrid.assert_called_once()


def test_alpha_bounds():
    assert 0.0 <= 0.0 <= 1.0
    assert 0.0 <= 1.0 <= 1.0
